import Link from "next/link";
import { products as localProducts } from "../../data/products";
import { supabase } from "../../lib/supabase";
import ProductFilterGrid, {
  type FilterProduct,
} from "../../components/ProductFilterGrid";

type DbProductImage = {
  image_url: string;
  sort_order: number;
};

type DbProduct = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  price: number;
  brand: string;
  category: string;
  status: string;
  badge: string | null;
  stock_quantity: number;
  product_images: DbProductImage[] | null;
};

export default async function ProductsPage() {
  const { data: dbProducts } = await supabase
    .from("products")
    .select(`
      *,
      product_images (
        image_url,
        sort_order
      )
    `)
    .order("created_at", { ascending: false });

  const databaseProducts: FilterProduct[] =
    dbProducts?.map((product: DbProduct) => {
      const sortedImages = [...(product.product_images || [])].sort(
        (a, b) => a.sort_order - b.sort_order
      );

      const image = sortedImages[0]?.image_url || "/logo/logo.png";
      const image2 = sortedImages[1]?.image_url || image;

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(product.price || 0),
        category: product.category || "Khác",
        status: product.status || "Đang cập nhật",
        badge: product.badge,
        image,
        image2,
        source: "database",
      };
    }) || [];

  const demoProducts: FilterProduct[] = localProducts.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: Number(product.price || 0),
    category: product.category || "Khác",
    status: product.status || "Đang cập nhật",
    badge: product.badge,
    image: product.images[0] || "/logo/logo.png",
    image2: product.images[1] || product.images[0] || "/logo/logo.png",
    source: "demo",
  }));

  const allProducts: FilterProduct[] = [...databaseProducts, ...demoProducts];

  return (
    <main className="page">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">Trang chủ</Link>
          <span>›</span>
          <strong>Tất cả sản phẩm</strong>
        </div>
        <ProductFilterGrid products={allProducts} />
      </div>

      <style>{`
        .page {
          min-height: 100vh;
          padding: 34px 20px 80px;
          color: #ffffff;
          background:
            radial-gradient(circle at 10% 0%, rgba(124, 77, 255, 0.28), transparent 32%),
            radial-gradient(circle at 88% 8%, rgba(0, 229, 255, 0.18), transparent 30%),
            linear-gradient(180deg, #050816 0%, #0b1434 44%, #050816 100%);
        }

        .container {
          max-width: 1480px;
          margin: 0 auto;
        }

        .breadcrumb {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-bottom: 26px;
          color: #9fb0d8;
          font-size: 15px;
        }

        .breadcrumb a {
          color: #b9c8ed;
          text-decoration: none;
        }

        .breadcrumb a:hover {
          color: #00e5ff;
        }

        .breadcrumb strong {
          color: #00e5ff;
        }

        .hero {
          position: relative;
          overflow: hidden;
          display: flex;
          justify-content: space-between;
          gap: 28px;
          margin-bottom: 30px;
          padding: 42px;
          border-radius: 28px;
          background:
            radial-gradient(circle at 88% 18%, rgba(0, 229, 255, 0.16), transparent 34%),
            radial-gradient(circle at 12% 0%, rgba(255, 79, 216, 0.13), transparent 30%),
            rgba(7, 12, 32, 0.78);
          border: 1px solid rgba(0, 229, 255, 0.22);
          box-shadow:
            0 22px 50px rgba(0, 0, 0, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .hero::after {
          content: "";
          position: absolute;
          right: -90px;
          top: -90px;
          width: 260px;
          height: 260px;
          border-radius: 999px;
          background: rgba(0, 229, 255, 0.11);
          filter: blur(10px);
        }

        .heroText {
          position: relative;
          z-index: 1;
        }

        .heroText p {
          margin: 0 0 12px;
          color: #00e5ff;
          font-size: 13px;
          font-weight: 950;
          letter-spacing: 4px;
        }

        .heroText h1 {
          margin: 0;
          font-size: clamp(40px, 5vw, 68px);
          line-height: 1.04;
          font-weight: 950;
          letter-spacing: -1.7px;
          text-shadow: 0 0 24px rgba(0, 229, 255, 0.13);
        }

        .heroText span {
          display: block;
          max-width: 760px;
          margin-top: 18px;
          color: #c5d2f2;
          font-size: 17px;
          line-height: 1.75;
        }

        .heroStats {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: repeat(2, minmax(150px, 1fr));
          gap: 14px;
          min-width: 340px;
          align-self: flex-end;
        }

        .heroStats div {
          padding: 18px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(0, 229, 255, 0.16);
        }

        .heroStats strong {
          display: block;
          color: #00e5ff;
          font-size: 24px;
          font-weight: 950;
        }

        .heroStats span {
          display: block;
          margin-top: 4px;
          color: #aebce4;
          font-size: 13px;
        }

        @media (max-width: 980px) {
          .hero {
            flex-direction: column;
            padding: 30px 22px;
          }

          .heroStats {
            min-width: 0;
            width: 100%;
          }
        }

        @media (max-width: 640px) {
          .page {
            padding: 24px 14px 60px;
          }

          .heroStats {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}