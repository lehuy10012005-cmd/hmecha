"use client";

import CompareButton from "./CompareButton";
import WishlistButton from "./WishlistButton";

type ProductLike = {
  id?: string;
  name: string;
  slug: string;
  sku?: string;
  price: number;
  image?: string;
  images?: string[];
  status?: string;
  brand?: string;
  category?: string;
  badge?: string | null;
};

export default function ProductSideActions({ product }: { product: ProductLike }) {
  return (
    <div
      style={{
        display: "grid",
        gap: 12,
        marginTop: 16,
      }}
    >
      <WishlistButton product={product} />
      <CompareButton product={product} />

      <a
        href="/so-sanh"
        style={{
          display: "grid",
          placeItems: "center",
          minHeight: 46,
          borderRadius: 14,
          border: "1px dashed rgba(0,229,255,.28)",
          color: "#00e5ff",
          textDecoration: "none",
          fontWeight: 900,
          background: "rgba(0,229,255,.06)",
        }}
      >
        Xem bảng so sánh
      </a>
    </div>
  );
}
