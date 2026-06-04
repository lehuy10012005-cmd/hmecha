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
  badge: string;
  stock_quantity: number;
  product_images: DbProductImage[];
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
      const image =
        product.product_images
          ?.sort((a, b) => a.sort_order - b.sort_order)[0]?.image_url ||
        "/logo/logo.png";

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(product.price || 0),
        category: product.category || "Khác",
        status: product.status || "Đang cập nhật",
        badge: product.badge,
        image,
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
    source: "demo",
  }));

  const allProducts: FilterProduct[] = [
    ...databaseProducts,
    ...demoProducts,
  ];


  return (
    <main className="page">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">Trang chủ</Link>
          <span>›</span>
          <strong>Tất cả sản phẩm</strong>
        </div>

        <div className="heading">
          <p>HMECHA COLLECTION</p>
          <h1>Tất cả sản phẩm</h1>
          <span>
            Gồm sản phẩm admin thêm từ database và các mẫu demo cũ để web nhìn đầy đủ hơn.
          </span>
        </div>

              <ProductFilterGrid products={allProducts} />
      </div>

      <style>{`
        .page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(124,77,255,.24), transparent 34%),
            radial-gradient(circle at top right, rgba(0,229,255,.16), transparent 28%),
            linear-gradient(180deg, #050816 0%, #0b1026 45%, #050816 100%);
          color: white;
          padding: 34px 20px 70px;
        }

        .container {
          max-width: 1280px;
          margin: 0 auto;
        }

        .breadcrumb {
          display: flex;
          gap: 10px;
          align-items: center;
          color: #9fb0d8;
          margin-bottom: 28px;
        }

        .breadcrumb a {
          color: #9fb0d8;
          text-decoration: none;
        }

        .breadcrumb strong {
          color: #00e5ff;
        }

        .heading {
          margin-bottom: 28px;
        }

        .heading p {
          margin: 0;
          color: #00e5ff;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .heading h1 {
          margin: 8px 0;
          font-size: 42px;
          line-height: 1.1;
        }

        .heading span {
          color: #b8c4e6;
        }
        .filters {
          display: flex;
          align-items: flex-end;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 28px;
          padding: 20px;
          border-radius: 18px;
          background: rgba(11, 16, 38, 0.8);
          border: 1px solid rgba(0, 229, 255, 0.2);
          box-shadow: 0 0 28px rgba(124, 77, 255, 0.1);
        }

        .filterGroup {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 230px;
        }

        .filterGroup label {
          color: #c5d2f2;
          font-size: 14px;
          font-weight: 700;
        }

        .filterGroup select {
          height: 48px;
          padding: 0 14px;
          border-radius: 12px;
          background: rgba(5, 8, 22, 0.9);
          border: 1px solid rgba(0, 229, 255, 0.28);
          color: #ffffff;
          outline: none;
          cursor: pointer;
        }

        .filterGroup select:focus {
          border-color: #00e5ff;
          box-shadow: 0 0 14px rgba(0, 229, 255, 0.18);
        }

        .resetFilter {
          height: 48px;
          padding: 0 20px;
          border-radius: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .filterCount {
          margin: 0 0 14px auto;
          color: #b8c4e6;
          font-size: 14px;
        }

        .filterCount strong {
          color: #00e5ff;
          font-size: 17px;
        }

        .emptyFilter {
          padding: 46px 20px;
          text-align: center;
          border-radius: 18px;
          color: #bac8ea;
          border: 1px dashed rgba(0, 229, 255, 0.28);
          background: rgba(11, 16, 38, 0.55);
        }

        .info .category {
          margin: 0 0 7px;
          color: #00e5ff;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.7px;
          text-transform: uppercase;
        }

        @media (max-width: 720px) {
          .filterGroup {
            width: 100%;
          }

          .filterCount {
            width: 100%;
            margin: 4px 0 0;
          }
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
          gap: 22px;
        }

        .card {
          display: block;
          text-decoration: none;
          color: inherit;
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(0,229,255,.22);
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 0 30px rgba(124,77,255,.12);
          transition: .22s;
        }

        .card:hover {
          transform: translateY(-5px);
          border-color: rgba(0,229,255,.65);
          box-shadow: 0 0 36px rgba(0,229,255,.18);
        }

        .thumb {
          position: relative;
          aspect-ratio: 1 / 1;
          background: #02040d;
          overflow: hidden;
        }

        .thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .badge {
          position: absolute;
          left: 12px;
          bottom: 12px;
          background: linear-gradient(135deg,#ff3d8b,#7c4dff);
          color: white;
          padding: 7px 11px;
          border-radius: 8px;
          font-weight: 900;
          font-size: 13px;
        }

        .dbBadge {
          position: absolute;
          left: 12px;
          top: 12px;
          background: linear-gradient(135deg,#00e5ff,#7c4dff);
          color: #050816;
          padding: 7px 11px;
          border-radius: 8px;
          font-weight: 950;
          font-size: 13px;
        }

        .heart {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 42px;
          height: 42px;
          border-radius: 999px;
          border: none;
          background: white;
          font-size: 24px;
          cursor: pointer;
        }

        .info {
          padding: 16px;
          background: rgba(255,255,255,.94);
          color: #111827;
        }

        .info h2 {
          margin: 0;
          min-height: 48px;
          font-size: 17px;
          line-height: 1.35;
        }

        .price {
          margin: 13px 0;
          color: #ef2f72;
          font-size: 21px;
          font-weight: 950;
        }

        .stock {
          margin: 0;
          color: #4b5563;
        }

        .stock b {
          color: #111827;
        }
      `}</style>
    </main>
  );
}