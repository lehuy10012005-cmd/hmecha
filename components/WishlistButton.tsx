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
        style={{
          width: 42,
          height: 42,
          borderRadius: 999,
          border: 0,
          background: "#ffffff",
          color: active ? "#ff4fd8" : "#061020",
          fontSize: 22,
          cursor: "pointer",
          fontWeight: 950,
        }}
      >
        {active ? "♥" : "♡"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleWishlist}
      disabled={loading}
      style={{
        width: "100%",
        minHeight: 56,
        borderRadius: 14,
        border: "1px solid rgba(0,229,255,.24)",
        background: active
          ? "linear-gradient(135deg, rgba(255,79,216,.28), rgba(0,229,255,.12))"
          : "rgba(255,255,255,.045)",
        color: "#ffffff",
        fontSize: 18,
        fontWeight: 900,
        cursor: "pointer",
        boxShadow: active ? "0 0 24px rgba(255,79,216,.2)" : "none",
      }}
    >
      {loading ? "Đang xử lý..." : active ? "♥ Đã yêu thích" : "♡ Thêm vào yêu thích"}
    </button>
  );
}
