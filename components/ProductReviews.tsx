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

function getReviewRating(review: any) {
  const raw =
    review?.rating ??
    review?.stars ??
    review?.star ??
    review?.review_rating ??
    review?.score ??
    0;

  const value = Number(raw);
  if (!Number.isFinite(value)) return 0;

  return Math.round(value);
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
      const count = reviews.filter((review) => getReviewRating(review) === star).length;
      const percent = total ? Math.round((count / total) * 100) : 0;

      return { star, count, percent };
    });

    const average = total
      ? reviews.reduce((sum, review) => sum + getReviewRating(review), 0) / total
      : 0;

    return { total, counts, average };
  }, [reviews]);

  const filteredReviews = useMemo(() => {
    const comments = reviews.filter((review) =>
      String(review.content || "").trim().length > 0
    );

    if (filter === "comment") return comments;

    const selectedRating = Number(filter);
    return comments.filter((review) => getReviewRating(review) === selectedRating);
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
      <div className="reviewHeader">
        <div>
          <span className="eyebrow">Đánh giá sản phẩm</span>
          <h2>Khách hàng nói gì về sản phẩm này</h2>
        </div>

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
          Viết đánh giá
        </button>
      </div>

      <div className="reviewSummary">
        <div className="scoreBox">
          <strong>{stats.average ? stats.average.toFixed(1) : "0.0"}</strong>
          <Stars value={Math.round(stats.average)} large />
          <p>{stats.total} người đã đánh giá</p>
        </div>

        <div className="ratingBars">
          {stats.counts.map((item) => (
            <div className="ratingRow" key={item.star}>
              <span>{item.star} sao</span>
              <div className="bar">
                <i style={{ width: `${item.percent}%` }} />
              </div>
              <strong>{item.percent}%</strong>
            </div>
          ))}
        </div>
      </div>

      <form id="hmecha-review-form" className="quickComment" onSubmit={submitReview}>
        <div className="formTitle">
          <h3>Gửi bình luận của bạn</h3>
          <p>Chia sẻ cảm nhận để người mua sau chọn sản phẩm dễ hơn.</p>
        </div>

        <div className="ratingPick">
          <span>Chọn đánh giá</span>

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
            placeholder="Họ và tên"
          />

          <input
            value={customerPhone}
            onChange={(event) => setCustomerPhone(event.target.value)}
            placeholder="Số điện thoại"
          />

          <input
            value={customerEmail}
            onChange={(event) => setCustomerEmail(event.target.value)}
            placeholder="Email (không bắt buộc)"
          />
        </div>

        <div className="commentRow">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Nội dung bình luận"
            rows={3}
          />

          <button type="submit" className="sendButton" disabled={sending}>
            {sending ? "Đang gửi..." : "Gửi bình luận"}
          </button>
        </div>

        {message && <p className="reviewMessage">{message}</p>}
      </form>

      <div className="filterBar">
        <span>Lọc đánh giá:</span>

        {[
          ["comment", "Có bình luận"],
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
                    <Stars value={getReviewRating(review)} /> · {formatDate(review.created_at)}
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
          margin-top: 34px;
          padding: 26px;
          border-radius: 18px;
          background: #ffffff;
          color: #111827;
          border: 1px solid #e5e7eb;
          box-shadow: 0 12px 34px rgba(15, 23, 42, 0.08);
          font-family: Arial, "Helvetica Neue", sans-serif !important;
        }

        .hmechaReviews * {
          box-sizing: border-box;
          font-family: Arial, "Helvetica Neue", sans-serif !important;
        }

        .reviewHeader {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: center;
          margin-bottom: 22px;
          padding-bottom: 18px;
          border-bottom: 1px solid #edf0f3;
        }

        .eyebrow {
          display: inline-block;
          margin-bottom: 6px;
          color: #d32f2f;
          font-size: 13px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .reviewHeader h2 {
          margin: 0;
          color: #111827;
          font-size: 24px;
          line-height: 1.25;
          font-weight: 900;
          letter-spacing: -0.3px;
        }

        .reviewCta {
          min-width: 132px;
          min-height: 42px;
          padding: 0 18px;
          border: 0;
          border-radius: 10px;
          background: #d32f2f;
          color: #ffffff;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 8px 18px rgba(211, 47, 47, 0.18);
        }

        .reviewCta:hover {
          background: #b91c1c;
        }

        .reviewSummary {
          display: grid;
          grid-template-columns: 190px 1fr;
          gap: 26px;
          align-items: center;
          padding: 20px;
          border: 1px solid #edf0f3;
          border-radius: 14px;
          background: #fafafa;
          margin-bottom: 22px;
        }

        .scoreBox {
          text-align: center;
          padding-right: 24px;
          border-right: 1px solid #e5e7eb;
        }

        .scoreBox strong {
          display: block;
          color: #d32f2f;
          font-size: 46px;
          line-height: 1;
          font-weight: 950;
          margin-bottom: 8px;
        }

        .stars {
          display: inline-flex;
          gap: 2px;
          color: #d1d5db;
          font-size: 14px;
          line-height: 1;
          vertical-align: middle;
          background: transparent !important;
        }

        .stars.large {
          font-size: 19px;
        }

        .stars .active {
          color: #f59e0b;
        }

        .scoreBox p {
          margin: 8px 0 0;
          color: #6b7280;
          font-size: 14px;
        }

        .ratingBars {
          display: grid;
          gap: 12px;
        }

        .ratingRow {
          display: grid;
          grid-template-columns: 58px 1fr 46px;
          gap: 12px;
          align-items: center;
          color: #374151;
          font-size: 14px;
        }

        .ratingRow > span {
          color: #374151;
          white-space: nowrap;
          font-weight: 700;
        }

        .ratingRow strong {
          color: #6b7280;
          font-size: 13px;
          font-weight: 700;
          text-align: right;
        }

        .bar {
          height: 8px;
          border-radius: 999px;
          background: #e5e7eb;
          overflow: hidden;
        }

        .bar i {
          display: block;
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #ff5722, #d32f2f);
        }

        .quickComment {
          padding: 20px;
          border-radius: 14px;
          background: #fff8ed;
          border: 1px solid #ffe0b2;
          margin-bottom: 20px;
        }

        .formTitle {
          margin-bottom: 16px;
        }

        .formTitle h3 {
          margin: 0 0 4px;
          color: #111827;
          font-size: 18px;
          font-weight: 900;
        }

        .formTitle p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .ratingPick {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
          color: #374151;
        }

        .ratingPick span {
          font-size: 14px;
          font-weight: 800;
        }

        .starButtons {
          display: inline-flex;
          gap: 2px;
          align-items: center;
        }

        .starButtons button {
          appearance: none;
          width: auto;
          height: auto;
          padding: 0;
          border: 0;
          background: transparent !important;
          color: #d1d5db !important;
          font-size: 26px;
          line-height: 1;
          cursor: pointer;
          box-shadow: none !important;
        }

        .starButtons button.selected {
          color: #f59e0b !important;
        }

        .fieldGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 12px;
        }

        .fieldGrid input,
        .commentRow textarea {
          width: 100%;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          background: #ffffff;
          color: #111827;
          padding: 13px 14px;
          outline: none;
          font-size: 14px;
          line-height: 1.4;
        }

        .fieldGrid input::placeholder,
        .commentRow textarea::placeholder {
          color: #9ca3af;
        }

        .fieldGrid input:focus,
        .commentRow textarea:focus {
          border-color: #d32f2f;
          box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.12);
        }

        .commentRow {
          display: grid;
          grid-template-columns: 1fr 150px;
          gap: 12px;
          align-items: stretch;
        }

        .commentRow textarea {
          resize: vertical;
          min-height: 74px;
        }

        .sendButton {
          min-height: 52px;
          padding: 0 18px;
          border: 0;
          border-radius: 10px;
          background: #d32f2f;
          color: #ffffff;
          font-size: 14px;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 8px 18px rgba(211, 47, 47, 0.18);
        }

        .sendButton:hover {
          background: #b91c1c;
        }

        .sendButton:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .reviewMessage {
          margin: 10px 0 0;
          color: #15803d;
          font-weight: 800;
          font-size: 14px;
        }

        .filterBar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 9px;
          margin: 10px 0 20px;
          color: #374151;
          font-size: 14px;
        }

        .filterBar span {
          font-weight: 800;
          color: #374151;
        }

        .filterBar button {
          min-height: 34px;
          padding: 0 14px;
          border-radius: 999px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          color: #374151;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          box-shadow: none;
        }

        .filterBar button.active,
        .filterBar button:hover {
          color: #ffffff;
          border-color: #d32f2f;
          background: #d32f2f;
        }

        .commentList {
          display: grid;
          gap: 14px;
        }

        .commentItem {
          padding: 18px;
          border: 1px solid #edf0f3;
          border-radius: 14px;
          background: #ffffff;
        }

        .customerLine {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }

        .avatar,
        .shopAvatar {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 999px;
          color: #ffffff;
          background: #d32f2f;
          font-weight: 900;
          flex: 0 0 auto;
        }

        .shopAvatar {
          background: #111827;
        }

        .customerLine strong {
          display: block;
          color: #111827;
          margin-bottom: 4px;
          font-weight: 900;
        }

        .customerLine span {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #6b7280;
          font-size: 13px;
        }

        .commentItem > p {
          margin: 0 0 12px 54px;
          color: #374151;
          line-height: 1.7;
          font-size: 15px;
        }

        .replyMini {
          margin-left: 54px;
          min-height: 30px;
          padding: 0 14px;
          border-radius: 999px;
          border: 1px solid #f3b1b1;
          background: #fff5f5;
          color: #d32f2f;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
        }

        .replyMini:hover {
          color: #ffffff;
          background: #d32f2f;
          border-color: #d32f2f;
        }

        .adminReply {
          display: flex;
          gap: 12px;
          margin: 14px 0 0 54px;
          padding: 15px;
          border-radius: 12px;
          background: #f9fafb;
          border-left: 4px solid #d32f2f;
        }

        .adminReply strong {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #111827;
          margin-bottom: 6px;
          font-weight: 900;
        }

        .adminReply strong::after {
          content: "QTV";
          padding: 2px 8px;
          border-radius: 999px;
          color: #ffffff;
          background: #d32f2f;
          font-size: 11px;
        }

        .adminReply p {
          margin: 0;
          color: #374151;
          line-height: 1.65;
          font-size: 14px;
        }

        .emptyComment {
          padding: 22px 24px;
          border-radius: 12px;
          background: #f9fafb;
          border: 1px dashed #d1d5db;
          color: #6b7280;
          font-size: 15px;
        }

        @media (max-width: 760px) {
          .hmechaReviews {
            padding: 18px;
          }

          .reviewHeader {
            align-items: stretch;
            flex-direction: column;
          }

          .reviewCta {
            width: 100%;
          }

          .reviewSummary,
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

          .commentItem > p,
          .replyMini,
          .adminReply {
            margin-left: 0;
          }
        }
      `}</style>
    </section>
  );
}
