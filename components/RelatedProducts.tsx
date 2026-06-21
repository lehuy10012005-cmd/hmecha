import Link from "next/link";
import { products as localProducts, formatPrice } from "../data/products";
import { supabase } from "../lib/supabase";

type DbProductImage = {
  image_url: string;
  sort_order: number;
};

type DbProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string | null;
  status: string | null;
  badge: string | null;
  stock_quantity: number | null;
  product_images: DbProductImage[] | null;
};

type RelatedProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  status: string;
  badge?: string | null;
  image1: string;
  image2: string;
  stockQuantity?: number | null;
  source: "database" | "demo";
};

type RelatedProductsProps = {
  currentSlug: string;
  currentId?: string;
  category?: string | null;
  limit?: number;
};

function normalizeCategory(value?: string | null) {
  return String(value || "").trim().toLowerCase();
}

function uniqueBySlug(products: RelatedProduct[]) {
  const seen = new Set<string>();
  const result: RelatedProduct[] = [];

  for (const product of products) {
    if (!product.slug || seen.has(product.slug)) continue;
    seen.add(product.slug);
    result.push(product);
  }

  return result;
}

function isOutOfStock(product: RelatedProduct) {
  return product.status === "Hết hàng" || Number(product.stockQuantity || 0) <= 0;
}

export default async function RelatedProducts({
  currentSlug,
  currentId,
  category,
  limit = 10,
}: RelatedProductsProps) {
  const normalizedCategory = normalizeCategory(category);

  const { data: dbProducts } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      price,
      category,
      status,
      badge,
      stock_quantity,
      product_images (
        image_url,
        sort_order
      )
    `)
    .neq("slug", currentSlug)
    .order("created_at", { ascending: false })
    .limit(50);

  const databaseProducts: RelatedProduct[] =
    dbProducts?.map((product: DbProduct) => {
      const images = [...(product.product_images || [])].sort(
        (a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0)
      );

      const fallback = "/logo/logo.png";

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(product.price || 0),
        category: product.category || "Khác",
        status: product.status || "Còn hàng",
        badge: product.badge,
        stockQuantity: product.stock_quantity,
        image1: images[0]?.image_url || fallback,
        image2: images[1]?.image_url || images[0]?.image_url || fallback,
        source: "database",
      };
    }) || [];

  const demoProducts: RelatedProduct[] = localProducts
    .filter((product) => product.slug !== currentSlug && product.id !== currentId)
    .map((product) => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price || 0),
      category: product.category || "Khác",
      status: product.status || "Còn hàng",
      badge: product.badge,
      stockQuantity: 1,
      image1: product.images[0] || "/logo/logo.png",
      image2: product.images[1] || product.images[0] || "/logo/logo.png",
      source: "demo",
    }));

  const allRelated = uniqueBySlug([...databaseProducts, ...demoProducts]);

  const sameCategory = allRelated.filter((product) => {
    return normalizeCategory(product.category) === normalizedCategory;
  });

  const fallback = allRelated.filter((product) => {
    return normalizeCategory(product.category) !== normalizedCategory;
  });

  const relatedProducts = [...sameCategory, ...fallback].slice(0, limit);

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <section className="relatedHomeStyle section-index">
      <div className="relatedTitle">
        <span className="titleBar" />
        <div>
          <p>Có thể bạn cũng thích</p>
          <h2>Sản phẩm liên quan</h2>
        </div>
      </div>

      <div className="relatedHomeGrid">
        {relatedProducts.map((product) => {
          const outOfStock = isOutOfStock(product);
          const stockText = outOfStock ? "Hết hàng" : product.status || "Còn hàng";
          const productUrl = `/${product.slug}`;

          return (
            <div className="relatedItem" key={`${product.source}-${product.id}`}>
              <div className="item_product_main">
                <div className="product-thumbnail">
                  <Link
                    className="image_thumb"
                    href={productUrl}
                    title={product.name}
                  >
                    <img className="image1" src={product.image1} alt={product.name} />
                    <img className="image2" src={product.image2} alt={product.name} />
                  </Link>

                  {product.badge ? (
                    <div className="badge">
                      <span>{product.badge}</span>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    className="setWishlist"
                    title="Thêm vào yêu thích"
                    aria-label="Thêm vào yêu thích"
                  >
                    ♡
                  </button>
                </div>

                <div className="product-info">
                  <h3 className="product-name">
                    <Link href={productUrl} title={product.name}>
                      {product.name}
                    </Link>
                  </h3>

                  <div className="product-price-cart">
                    <span className="price">{formatPrice(product.price)}</span>
                  </div>

                  <div className="inventory_quantity">
                    <span className="stock-brand-title">Tình trạng: </span>
                    <span className={outOfStock ? "a-stock out" : "a-stock"}>
                      {stockText}
                    </span>
                  </div>

                  <div className="product-button">
                    {outOfStock ? (
                      <button type="button" className="btn-cart disabled" disabled>
                        Hết hàng
                      </button>
                    ) : (
                      <Link
                        href={productUrl}
                        className="btn-cart relatedAddButton"
                        title="Xem chi tiết"
                      >
                        Xem chi tiết
                      </Link>
                    )}

                    <Link
                      href={productUrl}
                      className="relatedQuickView"
                      title="Xem nhanh"
                      aria-label="Xem nhanh"
                    >
                      🔍
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .relatedHomeStyle {
          margin-top: 34px;
          padding: 26px;
          border-radius: 18px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          box-shadow: 0 12px 34px rgba(15, 23, 42, 0.08);
          font-family: Arial, "Helvetica Neue", sans-serif !important;
        }

        .relatedHomeStyle * {
          box-sizing: border-box;
          font-family: Arial, "Helvetica Neue", sans-serif !important;
        }

        .relatedTitle {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 22px;
          padding-bottom: 18px;
          border-bottom: 1px solid #edf0f3;
        }

        .titleBar {
          width: 5px;
          height: 42px;
          border-radius: 999px;
          background: #d32f2f;
          flex: 0 0 auto;
        }

        .relatedTitle p {
          margin: 0 0 4px;
          color: #d32f2f;
          font-size: 13px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.4px;
        }

        .relatedTitle h2 {
          margin: 0;
          color: #111827;
          font-size: 24px;
          line-height: 1.2;
          font-weight: 950;
          letter-spacing: -0.3px;
        }

        .relatedHomeGrid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 18px;
        }

        .relatedItem {
          min-width: 0;
        }

        .item_product_main {
          height: 100%;
          overflow: hidden;
          border-radius: 14px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
        }

        .item_product_main:hover {
          transform: translateY(-4px);
          border-color: #f3b1b1;
          box-shadow: 0 14px 28px rgba(15, 23, 42, 0.12);
        }

        .product-thumbnail {
          position: relative;
          overflow: hidden;
          aspect-ratio: 1 / 1;
          background: #f8fafc;
          border-bottom: 1px solid #edf0f3;
        }

        .image_thumb {
          position: relative;
          display: block;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #f8fafc;
        }

        .image_thumb img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
          object-fit: contain;
          padding: 8px;
          transition: opacity 0.24s ease, transform 0.24s ease;
        }

        .image_thumb .image1 {
          opacity: 1;
          z-index: 1;
        }

        .image_thumb .image2 {
          opacity: 0;
          z-index: 2;
        }

        .item_product_main:hover .image1 {
          opacity: 0;
        }

        .item_product_main:hover .image2 {
          opacity: 1;
          transform: scale(1.035);
        }

        .badge {
          position: absolute;
          left: 10px;
          bottom: 10px;
          z-index: 4;
          background: transparent;
          padding: 0;
        }

        .badge span {
          display: inline-flex;
          align-items: center;
          min-height: 28px;
          padding: 0 10px;
          border-radius: 7px;
          color: #ffffff;
          background: #d32f2f;
          font-size: 12px;
          font-weight: 900;
          line-height: 1;
          box-shadow: 0 6px 14px rgba(211, 47, 47, 0.18);
        }

        .setWishlist {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 5;
          width: 38px;
          height: 38px;
          border-radius: 999px;
          border: 1px solid #f3b1b1;
          display: grid;
          place-items: center;
          color: #d32f2f;
          background: #ffffff;
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
          box-shadow: 0 6px 16px rgba(15, 23, 42, 0.16);
          transition: transform 0.2s ease, background 0.2s ease, color 0.2s ease;
        }

        .setWishlist:hover {
          color: #ffffff;
          background: #d32f2f;
          transform: scale(1.06);
        }

        .product-info {
          position: relative;
          display: flex;
          flex-direction: column;
          min-height: 170px;
          padding: 13px 13px 14px;
          color: #111827;
          background: #ffffff;
        }

        .product-name {
          margin: 0;
          min-height: 43px;
          font-size: 14px;
          line-height: 1.35;
          font-weight: 900;
          overflow: hidden;
        }

        .product-name a {
          color: #111827;
          text-decoration: none;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .product-name a:hover {
          color: #d32f2f;
        }

        .product-price-cart {
          margin: 10px 0 13px;
        }

        .price {
          color: #ff5722;
          font-size: 19px;
          line-height: 1;
          font-weight: 950;
          text-shadow: none;
        }

        .inventory_quantity {
          margin-top: auto;
          color: #6b7280;
          font-size: 12px;
          line-height: 1.45;
        }

        .stock-brand-title {
          color: #6b7280;
          font-weight: 500;
        }

        .a-stock {
          color: #15803d;
          font-weight: 800;
        }

        .a-stock.out {
          color: #d32f2f;
          font-weight: 900;
        }

        .product-button {
          position: absolute;
          left: 13px;
          right: 13px;
          bottom: 13px;
          z-index: 8;
          display: flex;
          align-items: center;
          gap: 8px;
          opacity: 0;
          transform: translateY(12px);
          pointer-events: none;
          transition: opacity 0.2s ease, transform 0.2s ease;
        }

        .item_product_main:hover .product-button {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .btn-cart {
          height: 38px;
          min-width: 0;
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 0;
          border-radius: 8px;
          text-decoration: none;
          color: #ffffff;
          background: #d32f2f;
          font-size: 13px;
          font-weight: 900;
          box-shadow: 0 8px 16px rgba(211, 47, 47, 0.18);
          cursor: pointer;
        }

        .btn-cart:hover {
          background: #b91c1c;
        }

        .btn-cart.disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .relatedQuickView {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          display: grid;
          place-items: center;
          text-decoration: none;
          color: #ffffff;
          background: #111827;
          font-size: 16px;
          box-shadow: 0 8px 16px rgba(17, 24, 39, 0.14);
        }

        .relatedQuickView:hover {
          background: #000000;
        }

        @media (max-width: 1199px) {
          .relatedHomeGrid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }

        @media (max-width: 991px) {
          .relatedHomeGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 767px) {
          .relatedHomeStyle {
            padding: 18px;
            border-radius: 14px;
          }

          .relatedHomeGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }

          .relatedTitle h2 {
            font-size: 21px;
          }

          .product-info {
            min-height: 150px;
            padding: 12px;
          }

          .product-name {
            min-height: 39px;
            font-size: 13px;
          }

          .price {
            font-size: 17px;
          }

          .product-button {
            left: 12px;
            right: 12px;
            bottom: 12px;
          }
        }
      `}</style>
    </section>
  );
}
