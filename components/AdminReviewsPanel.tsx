"use client";

import Link from "next/link";
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
  status: string;
  created_at: string;
};

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString("vi-VN");
  } catch {
    return value;
  }
}

export default function AdminReviewsPanel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "unanswered" | "answered">("all");
  const [draftReplies, setDraftReplies] = useState<Record<string, string>>({});

  async function loadReviews() {
    setLoading(true);
    setError("");

    const response = await fetch("/api/admin/reviews", {
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Không thể tải đánh giá.");
      setReviews([]);
      setLoading(false);
      return;
    }

    const reviewList: Review[] = data.reviews || [];
    setReviews(reviewList);

    const nextDrafts: Record<string, string> = {};
    reviewList.forEach((review) => {
      nextDrafts[review.id] = review.admin_reply || "";
    });

    setDraftReplies(nextDrafts);
    setLoading(false);
  }

  useEffect(() => {
    loadReviews();
  }, []);

  const filteredReviews = useMemo(() => {
    if (filter === "unanswered") {
      return reviews.filter((review) => !review.admin_reply);
    }

    if (filter === "answered") {
      return reviews.filter((review) => Boolean(review.admin_reply));
    }

    return reviews;
  }, [reviews, filter]);

  const stats = useMemo(() => {
    const total = reviews.length;
    const unanswered = reviews.filter((review) => !review.admin_reply).length;
    const average = total
      ? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / total
      : 0;

    return { total, unanswered, average };
  }, [reviews]);

  async function saveReply(reviewId: string) {
    setSavingId(reviewId);

    const response = await fetch(`/api/admin/reviews/${reviewId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        adminReply: draftReplies[reviewId] || "",
        status: "approved",
      }),
    });

    setSavingId("");

    if (!response.ok) {
      const data = await response.json();
      alert(data.error || "Không thể lưu phản hồi.");
      return;
    }

    await loadReviews();
  }

  async function deleteReview(review: Review) {
    const ok = window.confirm(
      `Xóa bình luận của "${review.customer_name || "Khách hàng"}" về sản phẩm "${
        review.product_name || review.product_slug
      }"?\n\nSau khi xóa, bình luận sẽ không còn hiện trên website.`
    );

    if (!ok) return;

    setDeletingId(review.id);

    const response = await fetch(`/api/admin/reviews/${review.id}`, {
      method: "DELETE",
    });

    setDeletingId("");

    if (!response.ok) {
      const data = await response.json();
      alert(data.error || "Không thể xóa bình luận.");
      return;
    }

    setReviews((current) => current.filter((item) => item.id !== review.id));
    setDraftReplies((current) => {
      const next = { ...current };
      delete next[review.id];
      return next;
    });
  }

  return (
    <div className="adminReviewsPanel">
      <section className="statsGrid">
        <div>
          <span>Tổng bình luận</span>
          <strong>{stats.total}</strong>
        </div>

        <div>
          <span>Chưa phản hồi</span>
          <strong>{stats.unanswered}</strong>
        </div>

        <div>
          <span>Điểm trung bình</span>
          <strong>{stats.average ? stats.average.toFixed(1) : "0.0"}★</strong>
        </div>
      </section>

      <section className="reviewBoard">
        <div className="boardHead">
          <div>
            <h2>Danh sách đánh giá</h2>
            <p>Admin có thể xem bình luận khách hàng, phản hồi hoặc xóa bình luận không phù hợp.</p>
          </div>

          <div className="filters">
            <button
              type="button"
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              Tất cả
            </button>

            <button
              type="button"
              className={filter === "unanswered" ? "active" : ""}
              onClick={() => setFilter("unanswered")}
            >
              Chưa trả lời
            </button>

            <button
              type="button"
              className={filter === "answered" ? "active" : ""}
              onClick={() => setFilter("answered")}
            >
              Đã trả lời
            </button>
          </div>
        </div>

        {loading ? (
          <div className="emptyBox">Đang tải đánh giá...</div>
        ) : error ? (
          <div className="emptyBox errorBox">{error}</div>
        ) : filteredReviews.length === 0 ? (
          <div className="emptyBox">Chưa có đánh giá phù hợp.</div>
        ) : (
          <div className="reviewList">
            {filteredReviews.map((review) => (
              <article className="reviewCard" key={review.id}>
                <div className="reviewTop">
                  <div>
                    <strong>{review.customer_name || "Khách hàng HMECHA"}</strong>
                    <p>
                      {review.customer_email || "Không có email"} ·{" "}
                      {review.customer_phone || "Không có SĐT"}
                    </p>
                  </div>

                  <div className="badges">
                    <span>{review.rating}★</span>
                    <span>{formatDate(review.created_at)}</span>
                    <Link href={`/${review.product_slug}`}>Xem sản phẩm</Link>
                  </div>
                </div>

                <div className="productLine">
                  <span>Sản phẩm</span>
                  <strong>{review.product_name || review.product_slug}</strong>
                </div>

                <div className="commentBox">{review.content}</div>

                <div className="replyBox">
                  <label>Phản hồi admin</label>
                  <textarea
                    rows={3}
                    value={draftReplies[review.id] || ""}
                    onChange={(event) =>
                      setDraftReplies((current) => ({
                        ...current,
                        [review.id]: event.target.value,
                      }))
                    }
                    placeholder="Nhập phản hồi của HMECHA cho khách hàng..."
                  />

                  <div className="actionRow">
                    <button
                      type="button"
                      onClick={() => saveReply(review.id)}
                      disabled={savingId === review.id || deletingId === review.id}
                    >
                      {savingId === review.id ? "Đang lưu..." : "Lưu phản hồi"}
                    </button>

                    <button
                      type="button"
                      className="deleteButton"
                      onClick={() => deleteReview(review)}
                      disabled={deletingId === review.id || savingId === review.id}
                    >
                      {deletingId === review.id ? "Đang xóa..." : "Xóa bình luận"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <style>{`
        .adminReviewsPanel {
          max-width: 1480px;
          margin: 0 auto;
          display: grid;
          gap: 24px;
        }

        .statsGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .statsGrid div,
        .reviewBoard {
          border: 1px solid rgba(0, 229, 255, 0.2);
          background: rgba(7, 12, 32, 0.84);
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.24);
        }

        .statsGrid div {
          padding: 22px;
          border-radius: 22px;
        }

        .statsGrid span {
          display: block;
          color: #9fb0d8;
          margin-bottom: 10px;
        }

        .statsGrid strong {
          color: #00e5ff;
          font-size: 30px;
        }

        .reviewBoard {
          border-radius: 24px;
          overflow: hidden;
        }

        .boardHead {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: flex-start;
          padding: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .boardHead h2 {
          margin: 0 0 8px;
          font-size: 30px;
        }

        .boardHead p {
          margin: 0;
          color: #9fb0d8;
        }

        .filters {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .filters button {
          min-height: 38px;
          padding: 0 14px;
          border-radius: 999px;
          border: 1px solid rgba(0, 229, 255, 0.22);
          background: rgba(255, 255, 255, 0.06);
          color: #dce6ff;
          font-weight: 800;
          cursor: pointer;
        }

        .filters button.active,
        .filters button:hover {
          color: #061020;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
        }

        .reviewList {
          display: grid;
          gap: 16px;
          padding: 20px;
        }

        .reviewCard,
        .emptyBox {
          padding: 18px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.055);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .emptyBox {
          margin: 20px;
          color: #b9c8ed;
        }

        .errorBox {
          color: #ff8aa5;
        }

        .reviewTop {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 14px;
        }

        .reviewTop strong {
          display: block;
          font-size: 18px;
        }

        .reviewTop p {
          margin: 6px 0 0;
          color: #9fb0d8;
        }

        .badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .badges span,
        .badges a {
          display: inline-flex;
          align-items: center;
          min-height: 32px;
          padding: 0 12px;
          border-radius: 999px;
          text-decoration: none;
          color: #fff;
          background: rgba(255, 255, 255, 0.08);
          font-size: 13px;
        }

        .productLine {
          display: grid;
          gap: 4px;
          margin-bottom: 12px;
        }

        .productLine span {
          color: #00e5ff;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .commentBox {
          padding: 14px;
          border-radius: 14px;
          color: #dce6ff;
          line-height: 1.7;
          background: rgba(0, 0, 0, 0.18);
          margin-bottom: 14px;
        }

        .replyBox {
          display: grid;
          gap: 10px;
        }

        .replyBox label {
          color: #00e5ff;
          font-weight: 900;
        }

        .replyBox textarea {
          width: 100%;
          resize: vertical;
          border-radius: 14px;
          border: 1px solid rgba(0, 229, 255, 0.22);
          background: rgba(5, 8, 22, 0.94);
          color: #fff;
          padding: 14px;
          font: inherit;
          outline: none;
        }

        .actionRow {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .actionRow button {
          min-height: 42px;
          padding: 0 18px;
          border: 0;
          border-radius: 12px;
          color: #061020;
          font-weight: 950;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
          cursor: pointer;
        }

        .actionRow button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .actionRow .deleteButton {
          color: #fff;
          background: linear-gradient(135deg, #ff477e, #d90429);
          box-shadow: 0 12px 28px rgba(217, 4, 41, 0.25);
        }

        @media (max-width: 850px) {
          .statsGrid {
            grid-template-columns: 1fr;
          }

          .boardHead,
          .reviewTop {
            flex-direction: column;
          }

          .badges {
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
}