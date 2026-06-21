"use client";

import { useEffect, useState } from "react";

type ProductLike = {
  id?: string;
  name: string;
  slug: string;
  price: number;
  image?: string;
  images?: string[];
  status?: string;
  brand?: string;
  category?: string;
};

export default function WishlistButton({
  product,
  variant = "side",
}: {
  product: ProductLike;
  variant?: "side" | "compact";
}) {
  const [active, setActive] = useState(false);
  const [loading, setLoading] = useState(false);

  async function checkActive() {
    if (!product?.slug) return;

    const response = await fetch(
      "/api/account/wishlist?productSlug=" + encodeURIComponent(product.slug),
      { cache: "no-store" }
    );

    if (!response.ok) return;

    const data = await response.json();
    setActive(Boolean(data.active));
  }

  useEffect(() => {
    checkActive();
  }, [product?.slug]);

  async function toggleWishlist() {
    if (loading) return;

    setLoading(true);

    const response = await fetch("/api/account/wishlist", {
      method: active ? "DELETE" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        active
          ? { productSlug: product.slug }
          : {
              product: {
                ...product,
                image: product.image || product.images?.[0] || "",
              },
            }
      ),
    });

    const data = await response.json().catch(() => ({}));
    setLoading(false);

    if (response.status === 401) {
      alert("Bạn cần đăng nhập để lưu sản phẩm yêu thích.");
      return;
    }

    if (!response.ok) {
      alert(data.message || "Không xử lý được yêu thích.");
      return;
    }

    setActive(Boolean(data.active));
    alert(data.message || "Đã cập nhật yêu thích.");
    window.dispatchEvent(new Event("hmecha-wishlist-updated"));
  }

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={toggleWishlist}
        disabled={loading}
        title={active ? "Đã yêu thích" : "Thêm vào yêu thích"}
        className={active ? "wishCompact active" : "wishCompact"}
      >
        {active ? "♥" : "♡"}

        <style jsx>{`
          .wishCompact {
            width: 38px;
            height: 38px;
            border-radius: 999px;
            border: 1px solid #e5e7eb;
            background: #ffffff;
            color: #111827;
            font-size: 20px;
            cursor: pointer;
            font-weight: 900;
            box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12);
          }

          .wishCompact.active {
            color: #d32f2f;
          }
        `}</style>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleWishlist}
      disabled={loading}
      className={active ? "wishButton active" : "wishButton"}
    >
      {loading ? "Đang xử lý..." : active ? "♥ Đã yêu thích" : "♡ Thêm vào yêu thích"}

      <style jsx>{`
        .wishButton {
          width: 100%;
          min-height: 50px;
          border-radius: 10px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          color: #111827;
          font-size: 15px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.18s ease;
        }

        .wishButton:hover,
        .wishButton.active {
          border-color: #d32f2f;
          color: #d32f2f;
          background: #fff7f7;
        }
      `}</style>
    </button>
  );
}
