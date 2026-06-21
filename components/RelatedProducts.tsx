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
    <section className="relatedSection">
      <div className="relatedHeader">
        <span />
        <h2>Sản phẩm liên quan</h2>
      </div>

      <div className="relatedGrid">
        {relatedProducts.map((product) => {
          const outOfStock = isOutOfStock(product);
          const productUrl = `/${product.slug}`;

          return (
            <article className="relatedCard" key={`${product.source}-${product.id}`}>
              <Link href={productUrl} className="imageBox" title={product.name}>
                <img className="imageMain" src={product.image1} alt={product.name} />
                <img className="imageHover" src={product.image2} alt={product.name} />
              </Link>

              <button
                type="button"
                className="wishBtn"
                title="Thêm vào yêu thích"
                aria-label="Thêm vào yêu thích"
              >
                ♡
              </button>

              <div className="cardBody">
                <h3>
                  <Link href={productUrl} title={product.name}>
                    {product.name}
                  </Link>
                </h3>

                <div className="relatedPrice">{formatPrice(product.price)}</div>

                <div className="stockLine">
                  <span>Tình trạng:</span>
                  <b className={outOfStock ? "out" : ""}>
                    {outOfStock ? "Hết hàng" : product.status || "Còn hàng"}
                  </b>
                </div>

                <Link href={productUrl} className="detailBtn">
                  Xem chi tiết
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      <style>{`
        .relatedSection {
          margin-top: 34px;
          padding: 24px;
          border-radius: 18px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          box-shadow: 0 12px 34px rgba(15, 23, 42, 0.08);
          font-family: Arial, "Helvetica Neue", sans-serif !important;
        }

        .relatedSection * {
          box-sizing: border-box;
          font-family: Arial, "Helvetica Neue", sans-serif !important;
        }

        .relatedHeader {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #edf0f3;
        }

        .relatedHeader span {
          width: 4px;
          height: 26px;
          border-radius: 99px;
          background: #d32f2f;
        }

        .relatedHeader h2 {
          margin: 0;
          color: #111827;
          font-size: 22px;
          line-height: 1.2;
          font-weight: 850;
          letter-spacing: -0.2px;
        }

        .relatedGrid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 18px;
        }

        .relatedCard {
          position: relative;
          overflow: hidden;
          border-radius: 14px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          box-shadow: 0 6px 16px rgba(15, 23, 42, 0.05);
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }

        .relatedCard:hover {
          transform: translateY(-3px);
          border-color: #f0b7b7;
          box-shadow: 0 12px 24px rgba(15, 23, 42, 0.1);
        }

        .imageBox {
          position: relative;
          display: block;
          aspect-ratio: 1 / 1;
          overflow: hidden;
          background: #f8fafc;
          border-bottom: 1px solid #edf0f3;
        }

        .imageBox img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 8px;
          transition: opacity 0.22s ease, transform 0.22s ease;
        }

        .imageMain {
          opacity: 1;
        }

        .imageHover {
          opacity: 0;
        }

        .relatedCard:hover .imageMain {
          opacity: 0;
        }

        .relatedCard:hover .imageHover {
          opacity: 1;
          transform: scale(1.03);
        }

        .wishBtn {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 5;
          width: 34px;
          height: 34px;
          border-radius: 999px;
          border: 1px solid #f3b1b1;
          background: #ffffff;
          color: #d32f2f;
          display: grid;
          place-items: center;
          font-size: 20px;
          line-height: 1;
          cursor: pointer;
          box-shadow: 0 6px 14px rgba(15, 23, 42, 0.14);
        }

        .wishBtn:hover {
          background: #d32f2f;
          color: #ffffff;
        }

        .cardBody {
          padding: 13px 14px 14px;
        }

        .cardBody h3 {
          margin: 0 0 9px;
          min-height: 40px;
          font-size: 14px;
          line-height: 1.35;
          font-weight: 750;
        }

        .cardBody h3 a {
          color: #111827;
          text-decoration: none;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .cardBody h3 a:hover {
          color: #d32f2f;
        }

        .relatedPrice {
          margin-bottom: 12px;
          color: #ff5722;
          font-size: 20px;
          line-height: 1;
          font-weight: 850;
          letter-spacing: -0.2px;
        }

        .stockLine {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #6b7280;
          font-size: 12px;
          line-height: 1.4;
        }

        .stockLine span {
          color: #6b7280;
          font-weight: 500;
        }

        .stockLine b {
          color: #15803d;
          font-weight: 750;
        }

        .stockLine b.out {
          color: #d32f2f;
        }

        .detailBtn {
          margin-top: 12px;
          display: none;
          align-items: center;
          justify-content: center;
          height: 36px;
          border-radius: 8px;
          background: #d32f2f;
          color: #ffffff;
          text-decoration: none;
          font-size: 13px;
          font-weight: 800;
        }

        .relatedCard:hover .detailBtn {
          display: flex;
        }

        .detailBtn:hover {
          background: #b91c1c;
        }

        @media (max-width: 1199px) {
          .relatedGrid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }

        @media (max-width: 991px) {
          .relatedGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 767px) {
          .relatedSection {
            padding: 16px;
            border-radius: 14px;
          }

          .relatedGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
          }

          .relatedHeader h2 {
            font-size: 20px;
          }

          .cardBody {
            padding: 12px;
          }

          .cardBody h3 {
            font-size: 13px;
          }

          .relatedPrice {
            font-size: 18px;
          }
        }
      `}</style>
    </section>
  );
}
