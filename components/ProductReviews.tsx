"use client";

import { useEffect, useMemo, useState } from "react";

type Review = {
  id: string;
  product_slug: string;
  product_name: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  rating: number;
  content: string;
  admin_reply: string | null;
  created_at: string;
};

type ProductReviewsProps = {
  productId: string;
  productSlug: string;
  productName: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN");
}

function Stars({ value, large = false }: { value: number; large?: boolean }) {
  return (
    <span className={large ? "stars large" : "stars"} aria-label={`${value} sao`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={star <= value ? "active" : ""}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function ProductReviews({
  productId,
  productSlug,
  productName,
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [content, setContent] = useState("");
  const [filter, setFilter] = useState<"comment" | "5" | "4" | "3" | "2" | "1">("comment");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");

  async function loadReviews() {
    setLoading(true);

    const response = await fetch(
      `/api/reviews?productSlug=${encodeURIComponent(productSlug)}`,
      { cache: "no-store" }
    );

    const data = await response.json();
    setReviews(data.reviews || []);
    setLoading(false);
  }

  useEffect(() => {
    loadReviews();
  }, [productSlug]);

  const stats = useMemo(() => {
    const total = reviews.length;

    const counts = [5, 4, 3, 2, 1].map((star) => {
      const count = reviews.filter((review) => Number(review.rating) === star).length;
      const percent = total ? Math.round((count / total) * 100) : 0;

      return { star, count, percent };
    });

    const average = total
      ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / total
      : 0;

    return { total, counts, average };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    if (filter === "comment") return reviews.filter((review) => review.content.trim());
    return reviews.filter((review) => Number(review.rating) === Number(filter));
  }, [filter, reviews]);

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSending(true);
    setMessage("");

    const response = await fetch("/api/reviews", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId,
        productSlug,
        productName,
        rating,
        customerName,
        customerPhone,
        customerEmail,
        content,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Không thể gửi bình luận.");
      setSending(false);
      return;
    }

    setContent("");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setRating(5);
    setMessage("Đã gửi bình luận thành công.");
    setSending(false);
    await loadReviews();
  }

  return (
    <section className="hmechaReviews">
      <div className="reviewSummary">
        <div className="blockTitle">
          <i />
          <h2>Đánh giá về {productName}</h2>
        </div>

        <div className="summaryBody">
          <div className="scoreBox">
            <strong>{stats.average ? stats.average.toFixed(1) : "0.0"}</strong>
            <Stars value={Math.round(stats.average)} large />
            <p>{stats.total} người đã đánh giá</p>

            <button
              type="button"
              className="reviewCta"
              onClick={() => {
                document.getElementById("hmecha-review-form")?.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }}
            >
              Đánh giá sản phẩm
            </button>
          </div>

          <div className="ratingBars">
            {stats.counts.map((item) => (
              <div className="ratingRow" key={item.star}>
                <span>{item.star} ★</span>
                <div className="bar">
                  <i style={{ width: `${item.percent}%` }} />
                </div>
                <strong>{item.percent}%</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      <form id="hmecha-review-form" className="quickComment" onSubmit={submitReview}>
        <div className="blockTitle small">
          <i />
          <h3>Bình luận nhanh</h3>
        </div>

        <div className="ratingPick">
          <strong>Chọn đánh giá:</strong>

          <div className="starButtons">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={star <= rating ? "selected" : ""}
                onClick={() => setRating(star)}
                aria-label={`${star} sao`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className="fieldGrid">
          <input
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Nhập họ và tên"
          />

          <input
            value={customerPhone}
            onChange={(event) => setCustomerPhone(event.target.value)}
            placeholder="Nhập số điện thoại"
          />

          <input
            value={customerEmail}
            onChange={(event) => setCustomerEmail(event.target.value)}
            placeholder="Nhập email (Không bắt buộc)"
          />
        </div>

        <div className="commentRow">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Nhập nội dung bình luận"
            rows={2}
          />

          <button type="submit" className="sendButton" disabled={sending}>
            {sending ? "Đang gửi..." : "Gửi bình luận ➤"}
          </button>
        </div>

        {message && <p className="reviewMessage">{message}</p>}
      </form>

      <div className="filterBar">
        <span>Lọc đánh giá theo:</span>

        {[
          ["comment", "Bình luận"],
          ["5", "5 sao"],
          ["4", "4 sao"],
          ["3", "3 sao"],
          ["2", "2 sao"],
          ["1", "1 sao"],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={filter === value ? "active" : ""}
            onClick={() => setFilter(value as typeof filter)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="commentList">
        {loading ? (
          <div className="emptyComment">Đang tải bình luận...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="emptyComment">Chưa có bình luận phù hợp.</div>
        ) : (
          filteredReviews.map((review) => (
            <article className="commentItem" key={review.id}>
              <div className="customerLine">
                <div className="avatar">
                  {(review.customer_name || "H").slice(0, 1).toUpperCase()}
                </div>

                <div>
                  <strong>{review.customer_name || "Khách hàng HMECHA"}</strong>
                  <span>
                    <Stars value={Number(review.rating || 0)} /> · {formatDate(review.created_at)}
                  </span>
                </div>
              </div>

              <p>{review.content}</p>

              <button className="replyMini" type="button">
                Phản hồi
              </button>

              {review.admin_reply && (
                <div className="adminReply">
                  <div className="shopAvatar">H</div>

                  <div>
                    <strong>HMECHA</strong>
                    <p>{review.admin_reply}</p>
                  </div>
                </div>
              )}
            </article>
          ))
        )}
      </div>

      <style>{`
        .hmechaReviews {
          margin-top: 44px;
          padding: 26px 30px 30px;
          border-radius: 22px;
          background: #ffffff;
          color: #0f172a;
          border: 1px solid #e5e7eb;
          box-shadow: 0 22px 60px rgba(0, 0, 0, 0.20);
          font-family: Arial, "Helvetica Neue", sans-serif !important;
        }

        .hmechaReviews * {
          box-sizing: border-box;
        }

        .blockTitle {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 22px;
        }

        .blockTitle.small {
          margin-bottom: 18px;
        }

        .blockTitle i {
          width: 4px;
          height: 28px;
          border-radius: 99px;
          background: #00a889;
          flex: 0 0 auto;
        }

        .blockTitle h2,
        .blockTitle h3 {
          margin: 0;
          color: #0f172a;
          font-size: 19px;
          line-height: 1.35;
          font-weight: 800;
          letter-spacing: -0.2px;
        }

        .summaryBody {
          display: grid;
          grid-template-columns: 170px 1fr;
          gap: 28px;
          align-items: center;
          padding-bottom: 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .scoreBox {
          text-align: center;
          padding-right: 26px;
          border-right: 1px solid #e5e7eb;
        }

        .scoreBox strong {
          display: block;
          color: #020617;
          font-size: 42px;
          line-height: 1;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .stars {
          display: inline-flex;
          gap: 2px;
          color: #cbd5e1;
          font-size: 14px;
          line-height: 1;
          vertical-align: middle;
          background: transparent !important;
        }

        .stars.large {
          font-size: 18px;
        }

        .stars .active {
          color: #f59e0b;
        }

        .scoreBox p {
          margin: 8px 0 14px;
          color: #00846f;
          font-size: 14px;
        }

        .reviewCta,
        .sendButton {
          border: 0 !important;
          outline: 0 !important;
          color: #ffffff !important;
          background: #00a889 !important;
          box-shadow: none !important;
          font-family: inherit !important;
          cursor: pointer;
        }

        .reviewCta {
          width: 150px;
          min-height: 42px;
          padding: 0 14px;
          border-radius: 7px;
          font-size: 14px;
          font-weight: 800;
          line-height: 1.25;
        }

        .ratingBars {
          display: grid;
          gap: 13px;
        }

        .ratingRow {
          display: grid;
          grid-template-columns: 46px 1fr 44px;
          gap: 10px;
          align-items: center;
          color: #334155;
          font-size: 14px;
        }

        .ratingRow > span {
          color: #0f172a;
          white-space: nowrap;
        }

        .ratingRow strong {
          color: #334155;
          font-size: 14px;
          font-weight: 500;
          text-align: right;
        }

        .bar {
          height: 6px;
          border-radius: 999px;
          background: #eaf2fb;
          overflow: hidden;
        }

        .bar i {
          display: block;
          height: 100%;
          border-radius: 999px;
          background: #00a889;
        }

        .quickComment {
          padding-top: 26px;
          margin-bottom: 24px;
        }

        .ratingPick {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          color: #0f172a;
        }

        .ratingPick strong {
          font-size: 14px;
          font-weight: 800;
        }

        .starButtons {
          display: inline-flex;
          gap: 2px;
          align-items: center;
          background: transparent !important;
        }

        .starButtons button {
          appearance: none !important;
          -webkit-appearance: none !important;
          width: auto !important;
          height: auto !important;
          min-width: 0 !important;
          min-height: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
          border: 0 !important;
          border-radius: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
          color: #cbd5e1 !important;
          font-size: 24px !important;
          line-height: 1 !important;
          font-family: Arial, sans-serif !important;
          font-weight: 400 !important;
          cursor: pointer;
        }

        .starButtons button.selected {
          color: #f59e0b !important;
        }

        .fieldGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 8px;
          margin-bottom: 14px;
        }

        .fieldGrid input,
        .commentRow textarea {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 7px;
          background: #ffffff;
          color: #0f172a;
          padding: 14px 15px;
          outline: none;
          font: inherit;
          font-size: 15px;
        }

        .fieldGrid input::placeholder,
        .commentRow textarea::placeholder {
          color: #94a3b8;
        }

        .fieldGrid input:focus,
        .commentRow textarea:focus {
          border-color: #00a889;
          box-shadow: 0 0 0 3px rgba(0, 168, 137, 0.12);
        }

        .commentRow {
          display: grid;
          grid-template-columns: 1fr 150px;
          gap: 12px;
          align-items: stretch;
        }

        .commentRow textarea {
          resize: vertical;
          min-height: 48px;
        }

        .sendButton {
          min-height: 48px;
          padding: 0 18px;
          border-radius: 7px;
          font-size: 15px;
          font-weight: 800;
          white-space: normal;
          line-height: 1.2;
        }

        .reviewMessage {
          margin: 10px 0 0;
          color: #00846f;
          font-weight: 800;
          font-size: 14px;
        }

        .filterBar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 9px;
          margin: 8px 0 18px;
          color: #334155;
          font-size: 14px;
        }

        .filterBar button {
          appearance: none !important;
          -webkit-appearance: none !important;
          min-height: 34px !important;
          padding: 0 14px !important;
          border-radius: 999px !important;
          border: 1px solid #e2e8f0 !important;
          background: #ffffff !important;
          color: #334155 !important;
          box-shadow: none !important;
          font: inherit !important;
          font-size: 14px !important;
          cursor: pointer;
        }

        .filterBar button.active,
        .filterBar button:hover {
          color: #00a889 !important;
          border-color: #00a889 !important;
        }

        .commentList {
          display: grid;
          gap: 18px;
        }

        .commentItem {
          padding: 0 0 2px;
        }

        .customerLine {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .avatar,
        .shopAvatar {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 999px;
          color: #ffffff;
          background: #64748b;
          font-weight: 900;
          flex: 0 0 auto;
        }

        .shopAvatar {
          background: #00a889;
        }

        .customerLine strong {
          display: block;
          color: #0f172a;
          margin-bottom: 3px;
          font-weight: 800;
        }

        .customerLine span {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #64748b;
          font-size: 13px;
        }

        .commentItem > p {
          margin: 0 0 10px 54px;
          color: #334155;
          line-height: 1.7;
          font-size: 15px;
        }

        .replyMini {
          appearance: none !important;
          -webkit-appearance: none !important;
          margin-left: 54px;
          min-height: 30px !important;
          padding: 0 14px !important;
          border-radius: 999px !important;
          border: 1px solid #00a889 !important;
          background: #ffffff !important;
          color: #00a889 !important;
          box-shadow: none !important;
          font: inherit !important;
          font-size: 13px !important;
          font-weight: 700 !important;
          cursor: pointer;
        }

        .adminReply {
          display: flex;
          gap: 12px;
          margin: 14px 0 0 54px;
          padding: 16px;
          border-radius: 8px;
          background: #f8fafc;
        }

        .adminReply strong {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #0f172a;
          margin-bottom: 6px;
          font-weight: 800;
        }

        .adminReply strong::after {
          content: "QTV";
          padding: 2px 8px;
          border-radius: 999px;
          color: #ffffff;
          background: #00a889;
          font-size: 11px;
        }

        .adminReply p {
          margin: 0;
          color: #334155;
          line-height: 1.65;
          font-size: 14px;
        }

        .emptyComment {
          padding: 22px 24px;
          border-radius: 10px;
          background: #f8fafc;
          color: #64748b;
          font-size: 15px;
        }

        @media (max-width: 760px) {
          .hmechaReviews {
            padding: 18px;
          }

          .summaryBody,
          .fieldGrid,
          .commentRow {
            grid-template-columns: 1fr;
          }

          .scoreBox {
            border-right: 0;
            padding-right: 0;
            padding-bottom: 18px;
            border-bottom: 1px solid #e5e7eb;
          }

          .reviewCta {
            width: 100%;
          }

          .commentItem > p,
          .replyMini,
          .adminReply {
            margin-left: 0;
          }
        }
          .hmechaReviews {
  background:
    radial-gradient(circle at 8% 0%, rgba(124, 77, 255, 0.18), transparent 32%),
    radial-gradient(circle at 92% 8%, rgba(0, 229, 255, 0.13), transparent 30%),
    rgba(7, 12, 32, 0.92) !important;
  border: 1px solid rgba(0, 229, 255, 0.26) !important;
  color: #ffffff !important;
}

.blockTitle h2,
.blockTitle h3,
.ratingPick strong,
.ratingRow > span,
.customerLine strong {
  color: #ffffff !important;
}

.blockTitle i {
  background: linear-gradient(180deg, #00e5ff, #7c4dff) !important;
  box-shadow: 0 0 14px rgba(0, 229, 255, 0.45);
}

.scoreBox {
  border-right: 1px solid rgba(255,255,255,0.1) !important;
}

.scoreBox strong {
  color: #00e5ff !important;
  text-shadow: 0 0 18px rgba(0, 229, 255, 0.25);
}

.scoreBox p,
.reviewMessage {
  color: #9ff6ff !important;
}

.reviewCta,
.sendButton {
  background: linear-gradient(135deg, #7c4dff, #00e5ff) !important;
  color: #061020 !important;
  box-shadow: 0 0 18px rgba(0, 229, 255, 0.22) !important;
}

.reviewCta:hover,
.sendButton:hover {
  color: #ffffff !important;
  background: linear-gradient(135deg, #ff4fd8, #7c4dff) !important;
}

.fieldGrid input,
.commentRow textarea {
  background: rgba(5, 8, 22, 0.9) !important;
  border: 1px solid rgba(0, 229, 255, 0.22) !important;
  color: #ffffff !important;
}

.fieldGrid input::placeholder,
.commentRow textarea::placeholder {
  color: #8ea0ca !important;
}

.fieldGrid input:focus,
.commentRow textarea:focus {
  border-color: #00e5ff !important;
  box-shadow: 0 0 0 3px rgba(0, 229, 255, 0.14) !important;
}

.bar {
  background: rgba(255, 255, 255, 0.09) !important;
}

.bar i {
  background: linear-gradient(90deg, #7c4dff, #00e5ff) !important;
}

.filterBar {
  color: #c5d2f2 !important;
}

.filterBar button {
  background: rgba(5, 8, 22, 0.72) !important;
  color: #dce6ff !important;
  border: 1px solid rgba(0, 229, 255, 0.22) !important;
}

.filterBar button.active,
.filterBar button:hover {
  color: #061020 !important;
  border-color: #00e5ff !important;
  background: linear-gradient(135deg, #7c4dff, #00e5ff) !important;
}

.emptyComment {
  background: rgba(255,255,255,0.055) !important;
  color: #b9c8ed !important;
}

.commentItem > p {
  color: #dce6ff !important;
}

.replyMini {
  background: rgba(5, 8, 22, 0.72) !important;
  color: #00e5ff !important;
  border-color: rgba(0, 229, 255, 0.55) !important;
}

.avatar {
  background: linear-gradient(135deg, #7c4dff, #00e5ff) !important;
  color: #061020 !important;
}

.adminReply {
  background: rgba(0, 229, 255, 0.08) !important;
  border: 1px solid rgba(0, 229, 255, 0.16);
}

.adminReply strong,
.adminReply p {
  color: #dce6ff !important;
}

.stars .active,
.starButtons button.selected {
  color: #ffcf33 !important;
}

.starButtons button {
  color: #465371 !important;
}
      `}</style>
    </section>
  );
}