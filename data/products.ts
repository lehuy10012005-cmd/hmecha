import { importProducts } from "./importProducts";

export type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  brand: string;
  category: string;
  status: string;
  badge?: string;
  images: string[];
  shortDescription: string;
  fullDescription: string;
  specs: string[];
};

export const products: Product[] = importProducts.map((item: any, index: number) => ({
  id: item.id || `demo-${index + 1}`,
  name: item.name,
  slug: item.slug,
  sku: item.sku || `DEMO-${index + 1}`,
  price: item.price,
  brand: item.brand || "Bandai",
  category: item.category || "Gundam Bandai",
  status: item.status || "Còn hàng",
  badge: item.badge || "Hàng mới",
  images: item.images || [],
  shortDescription:
    item.short_description ||
    item.shortDescription ||
    "Mô hình Gundam chính hãng, phù hợp để sưu tầm và trưng bày.",
  fullDescription:
    item.full_description ||
    item.fullDescription ||
    "Sản phẩm mô hình Gundam/Gunpla với chi tiết sắc nét, phù hợp cho người chơi mô hình, sưu tầm và trưng bày.",
  specs:
    item.specs ||
    [
      "Thương hiệu: Bandai",
      "Dòng sản phẩm: Gundam / Gunpla",
      "Tình trạng: Còn hàng",
      "Lắp ráp: Không cần keo dán",
    ],
}));

export function formatPrice(price: number) {
  return price.toLocaleString("vi-VN") + "₫";
}

export function getProductBySlug(slug?: string) {
  if (!slug) return undefined;
  return products.find((product) => product.slug === slug);
}

export function getRelatedProducts(product: Product) {
  return products
    .filter(
      (item) =>
        item.category === product.category && item.slug !== product.slug
    )
    .slice(0, 4);
}