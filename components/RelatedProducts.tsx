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
  return (
    product.status === "Hết hàng" ||
    Number(product.stockQuantity || 0) <= 0
  );
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
      <div className="relatedTitle section-title a-left font-title">
        <h2>
          Sản phẩm <span>liên quan</span>
        </h2>
      </div>

      <div className="relatedHomeGrid">
        {relatedProducts.map((product) => {
          const outOfStock = isOutOfStock(product);
          const stockText = outOfStock ? "Hết hàng" : product.status || "Còn hàng";
          const productUrl = `/${product.slug}`;

          return (
            <div className="swiper-slide" key={`${product.source}-${product.id}`}>
              <div className="item_product_main">
                <form
                  action="javascript:void(0)"
                  method="post"
                  className="variants product-action item-product-main duration-300"
                >
                  <div className="product-thumbnail">
                    <Link
                      className="image_thumb scale_hover"
                      href={productUrl}
                      title={product.name}
                    >
                      <img
                        className="duration-300 image1"
                        src={product.image1}
                        alt={product.name}
                      />

                      <img
                        className="duration-300 image2"
                        src={product.image2}
                        alt={product.name}
                      />
                    </Link>

                    {product.badge ? (
                      <div className="badge">
                        <span className="new">{product.badge}</span>
                      </div>
                    ) : null}

                    <button
                      type="button"
                      className="setWishlist btn-views btn-circle"
                      title="Thêm vào yêu thích"
                      aria-label="Thêm vào yêu thích"
                    >
                      ♡
                    </button>
                  </div>

                  <div className="product-info">
                    <h3 className="product-name line-clamp-2-new">
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
                        <button
                          type="button"
                          className="btn-cart btn-views disabled"
                          disabled
                        >
                          Hết hàng
                        </button>
                      ) : (
                        <Link
                          href={productUrl}
                          className="btn-cart btn-views relatedAddButton"
                          title="Xem chi tiết"
                        >
                          Thêm vào giỏ
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
                </form>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .relatedHomeStyle {
          margin-top: 54px;
          padding: 0;
        }

        .relatedHomeStyle .relatedTitle {
          margin-bottom: 22px;
        }

        .relatedHomeStyle .relatedTitle h2 {
          margin: 0;
          color: #ffffff !important;
          font-size: 32px;
          font-weight: 950;
          line-height: 1.15;
        }

        .relatedHomeStyle .relatedTitle h2 span {
          color: #00e5ff !important;
        }

        .relatedHomeGrid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 20px;
        }

        .relatedHomeGrid .swiper-slide {
          width: 100% !important;
          height: auto !important;
          margin: 0 !important;
        }

        .relatedHomeStyle .item_product_main {
          height: 100%;
          background: transparent !important;
        }

        .relatedHomeStyle .product-action {
          position: relative;
          height: 100%;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          background: #ffffff !important;
          border: 2px solid rgba(0, 229, 255, 0.35) !important;
          border-radius: 0 !important;
          box-shadow: 0 0 18px rgba(0, 229, 255, 0.08) !important;
          transition: transform 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
        }

        .relatedHomeStyle .product-action:hover {
          transform: translateY(-4px);
          border-color: rgba(0, 229, 255, 0.95) !important;
          box-shadow: 0 0 26px rgba(0, 229, 255, 0.18) !important;
        }

        .relatedHomeStyle .product-thumbnail {
          position: relative;
          overflow: hidden;
          aspect-ratio: 1 / 1;
          background: #000000 !important;
        }

        .relatedHomeStyle .image_thumb {
          position: relative;
          display: block;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #000000 !important;
        }

        .relatedHomeStyle .image_thumb img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
          object-fit: contain;
          transition: opacity 0.25s ease, transform 0.25s ease;
        }

        .relatedHomeStyle .image_thumb .image1 {
          opacity: 1;
          z-index: 1;
        }

        .relatedHomeStyle .image_thumb .image2 {
          opacity: 0;
          z-index: 2;
        }

        .relatedHomeStyle .product-action:hover .image1 {
          opacity: 0;
        }

        .relatedHomeStyle .product-action:hover .image2 {
          opacity: 1;
          transform: scale(1.035);
        }

        .relatedHomeStyle .badge {
          position: absolute;
          left: 12px;
          bottom: 12px;
          z-index: 4;
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          background: transparent !important;
          padding: 0 !important;
        }

        .relatedHomeStyle .badge .new,
        .relatedHomeStyle .badge span {
          display: inline-flex;
          align-items: center;
          min-height: 34px;
          padding: 0 13px;
          border-radius: 8px;
          color: #ffffff !important;
          background: linear-gradient(135deg, #ff4fd8, #7c4dff) !important;
          font-size: 13px;
          font-weight: 950;
          line-height: 1;
        }

        .relatedHomeStyle .setWishlist {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 5;
          width: 46px;
          height: 46px;
          border-radius: 999px;
          border: none;
          display: grid;
          place-items: center;
          color: #111827 !important;
          background: #ffffff !important;
          font-size: 27px;
          line-height: 1;
          cursor: pointer;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.28);
          transition: transform 0.2s ease, color 0.2s ease;
        }

        .relatedHomeStyle .setWishlist:hover {
          color: #ff4fd8 !important;
          transform: scale(1.06);
        }

        .relatedHomeStyle .product-info {
          position: relative;
          flex: 1;
          display: flex;
          flex-direction: column;
          min-height: 166px;
          padding: 14px 14px 15px;
          background: #ffffff !important;
          color: #111827 !important;
        }

        .relatedHomeStyle .product-name {
          margin: 0;
          min-height: 49px;
          font-size: 17px !important;
          line-height: 1.35 !important;
          font-weight: 900 !important;
          overflow: hidden;
        }

        .relatedHomeStyle .product-name a {
          color: #111827 !important;
          text-decoration: none !important;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .relatedHomeStyle .product-price-cart {
          margin: 12px 0 16px;
        }

        .relatedHomeStyle .product-price-cart .price,
        .relatedHomeStyle .price {
          color: #00cfe8 !important;
          font-size: 22px !important;
          line-height: 1 !important;
          font-weight: 950 !important;
          text-shadow: none !important;
        }

        .relatedHomeStyle .inventory_quantity {
          margin-top: auto;
          color: #4b5563 !important;
          font-size: 14px !important;
          line-height: 1.4;
        }

        .relatedHomeStyle .stock-brand-title {
          color: #4b5563 !important;
          font-weight: 400 !important;
        }

        .relatedHomeStyle .a-stock {
          color: #4b5563 !important;
          font-weight: 500 !important;
        }

        .relatedHomeStyle .a-stock.out {
          color: #ff4f7b !important;
          font-weight: 800 !important;
        }

        .relatedHomeStyle .product-button {
          position: absolute;
          left: 14px;
          right: 14px;
          bottom: 14px;
          z-index: 8;
          display: flex;
          align-items: center;
          gap: 10px;
          opacity: 0;
          transform: translateY(14px);
          pointer-events: none;
          transition: opacity 0.22s ease, transform 0.22s ease;
        }

        .relatedHomeStyle .product-action:hover .product-button {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .relatedHomeStyle .btn-cart {
          height: 42px;
          min-width: 0;
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: none !important;
          border-radius: 8px !important;
          text-decoration: none !important;
          color: #050816 !important;
          background: linear-gradient(90deg, #7c4dff, #00e5ff) !important;
          font-size: 14px !important;
          font-weight: 950 !important;
          box-shadow: 0 0 16px rgba(0, 229, 255, 0.2) !important;
          cursor: pointer;
        }

        .relatedHomeStyle .btn-cart:hover {
          color: #ffffff !important;
          background: linear-gradient(90deg, #ff4fd8, #7c4dff) !important;
        }

        .relatedHomeStyle .btn-cart.disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .relatedHomeStyle .relatedQuickView {
          width: 42px;
          height: 42px;
          border-radius: 8px;
          display: grid;
          place-items: center;
          text-decoration: none;
          color: #ffffff !important;
          background: linear-gradient(135deg, #7c4dff, #00e5ff) !important;
          font-size: 18px;
          box-shadow: 0 0 16px rgba(0, 229, 255, 0.22);
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
          .relatedHomeGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }

          .relatedHomeStyle .product-info {
            min-height: 150px;
            padding: 12px;
          }

          .relatedHomeStyle .product-name {
            min-height: 43px;
            font-size: 15px !important;
          }

          .relatedHomeStyle .product-price-cart .price,
          .relatedHomeStyle .price {
            font-size: 19px !important;
          }

          .relatedHomeStyle .product-button {
            left: 12px;
            right: 12px;
            bottom: 12px;
          }

          .relatedHomeStyle .btn-cart {
            font-size: 13px !important;
          }
        }
      `}</style>
    </section>
  );
}
