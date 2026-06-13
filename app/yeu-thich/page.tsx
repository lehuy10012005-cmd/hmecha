"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type WishlistItem = {
  id?: string;
  product_slug: string;
  product_name: string;
  product_price: number;
  product_image?: string | null;
  product_status?: string | null;
  product_brand?: string | null;
  product_category?: string | null;
};

function money(value: number) {
  return Number(value || 0).toLocaleString("vi-VN") + "₫";
}

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadWishlist() {
    setLoading(true);

    const response = await fetch("/api/account/wishlist", {
      cache: "no-store",
    });

    const data = await response.json().catch(() => ({}));

    if (response.status === 401) {
      setMessage("Bạn cần đăng nhập để xem sản phẩm yêu thích.");
      setItems([]);
      setLoading(false);
      return;
    }

    if (!response.ok) {
      setMessage(data.message || "Không tải được danh sách yêu thích.");
      setItems([]);
      setLoading(false);
      return;
    }

    setMessage("");
    setItems(data.items || []);
    setLoading(false);
  }

  async function removeItem(productSlug: string) {
    const response = await fetch("/api/account/wishlist", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ productSlug }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      alert(data.message || "Không xóa được sản phẩm yêu thích.");
      return;
    }

    setItems((current) => current.filter((item) => item.product_slug !== productSlug));
    window.dispatchEvent(new Event("hmecha-wishlist-updated"));
  }

  useEffect(() => {
    loadWishlist();
  }, []);

  return (
    <main className="wishlistPage">
      <Link href="/" className="backLink">
        ← Về trang chủ
      </Link>

      <section className="wishlistHero">
        <p>HMECHA WISHLIST</p>
        <h1>Sản phẩm yêu thích</h1>
        <span>Lưu lại những mẫu bạn quan tâm để xem lại và mua sau.</span>
      </section>

      <section className="wishlistBox">
        {loading ? (
          <div className="emptyBox">Đang tải danh sách yêu thích...</div>
        ) : message ? (
          <div className="emptyBox">
            <p>{message}</p>
            <Link href="/tai-khoan">Đăng nhập / Tài khoản</Link>
          </div>
        ) : items.length === 0 ? (
          <div className="emptyBox">
            <h2>Chưa có sản phẩm yêu thích</h2>
            <p>Hãy bấm biểu tượng trái tim ở sản phẩm bạn thích.</p>
            <Link href="/">Mua sắm ngay</Link>
          </div>
        ) : (
          <div className="wishlistGrid">
            {items.map((item) => (
              <article className="wishCard" key={item.product_slug}>
                {item.product_image ? (
                  <img src={item.product_image} alt={item.product_name} />
                ) : (
                  <div className="emptyImage">HM</div>
                )}

                <div>
                  <strong>{item.product_name}</strong>
                  <span>{money(item.product_price)}</span>
                  <small>
                    {item.product_brand || "HMECHA"} · {item.product_status || "Đang cập nhật"}
                  </small>
                </div>

                <div className="wishActions">
                  <Link href={`/${item.product_slug}`}>Xem chi tiết</Link>
                  <button type="button" onClick={() => removeItem(item.product_slug)}>
                    Bỏ yêu thích
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <style>{`
        .wishlistPage {
          min-height: 100vh;
          padding: 32px 18px 120px;
          color: #fff;
          background:
            radial-gradient(circle at 0% 0%, rgba(124, 77, 255, 0.18), transparent 30%),
            radial-gradient(circle at 100% 0%, rgba(0, 229, 255, 0.13), transparent 28%),
            #070b1d;
        }

        .backLink,
        .wishlistHero,
        .wishlistBox {
          max-width: 1280px;
          margin-left: auto;
          margin-right: auto;
        }

        .backLink {
          display: block;
          color: #00e5ff;
          text-decoration: none;
          font-weight: 900;
          margin-bottom: 18px;
        }

        .wishlistHero,
        .wishlistBox {
          border-radius: 24px;
          border: 1px solid rgba(0, 229, 255, 0.22);
          background: rgba(7, 12, 32, 0.86);
          box-shadow: 0 22px 60px rgba(0, 0, 0, 0.28);
        }

        .wishlistHero {
          padding: 32px;
          margin-bottom: 22px;
        }

        .wishlistHero p {
          margin: 0 0 10px;
          color: #00e5ff;
          letter-spacing: 3px;
          font-weight: 950;
        }

        .wishlistHero h1 {
          margin: 0;
          font-size: clamp(38px, 6vw, 72px);
          line-height: 1.02;
        }

        .wishlistHero span {
          display: block;
          margin-top: 12px;
          color: #c5d2f2;
        }

        .wishlistBox {
          padding: 24px;
        }

        .wishlistGrid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        .wishCard {
          display: grid;
          gap: 12px;
          padding: 14px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.055);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .wishCard img,
        .emptyImage {
          width: 100%;
          height: 190px;
          object-fit: cover;
          border-radius: 14px;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
          display: grid;
          place-items: center;
          color: #061020;
          font-weight: 950;
        }

        .wishCard strong {
          display: block;
          line-height: 1.35;
        }

        .wishCard span {
          display: block;
          margin-top: 8px;
          color: #00e5ff;
          font-size: 22px;
          font-weight: 950;
        }

        .wishCard small {
          display: block;
          margin-top: 6px;
          color: #9fb0d8;
        }

        .wishActions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .wishActions a,
        .wishActions button,
        .emptyBox a {
          min-height: 42px;
          border: 0;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 12px;
          color: #061020;
          font-weight: 950;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
          text-decoration: none;
          cursor: pointer;
        }

        .wishActions button {
          color: #fff;
          background: rgba(255, 79, 216, 0.22);
          border: 1px solid rgba(255, 79, 216, 0.28);
        }

        .emptyBox {
          padding: 36px;
          text-align: center;
          color: #c5d2f2;
        }

        .emptyBox h2 {
          color: #fff;
          margin: 0 0 10px;
        }

        @media (max-width: 980px) {
          .wishlistGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .wishlistPage {
            padding: 22px 12px 120px;
          }

          .wishlistGrid {
            grid-template-columns: 1fr;
          }

          .wishCard img,
          .emptyImage {
            height: 240px;
          }

          .wishActions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}