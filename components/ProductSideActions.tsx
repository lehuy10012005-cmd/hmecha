"use client";

import WishlistButton from "./WishlistButton";

type ProductLike = {
  id?: string;
  name?: string;
  slug?: string;
  sku?: string;
  price?: number | null;
  image?: string | null;
  images?: string[];
  status?: string | null;
  brand?: string | null;
  category?: string | null;
  badge?: string | null;
};

export default function ProductSideActions({ product }: { product: ProductLike }) {
  const wishlistProduct = {
    id: product.id,
    name: product.name || "Sản phẩm HMECHA",
    slug: product.slug || "",
    sku: product.sku,
    price: Number(product.price || 0),
    image: product.image || undefined,
    images: product.images || [],
    status: product.status || undefined,
    brand: product.brand || undefined,
    category: product.category || undefined,
    badge: product.badge || null,
  };

  return (
    <div className="product-side-actions">
      <WishlistButton product={wishlistProduct} />
    </div>
  );
}