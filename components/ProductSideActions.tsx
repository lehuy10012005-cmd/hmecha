"use client";

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
    <div className="product-side-actions">
      <WishlistButton product={product} />
    </div>
  );
}