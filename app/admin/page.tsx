import Link from "next/link";
import { supabase } from "../../lib/supabase";

export default async function AdminDashboardPage() {
  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  const { count: orderCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true });

  return (
    <main className="dashboard">
      <div className="top">
        <p>HMECHA ADMIN</p>
        <h1>Bảng điều khiển</h1>
        <span>Quản lý sản phẩm, tồn kho, đơn hàng và mã giảm giá.</span>
      </div>

      <div className="cards">
        <Link href="/admin/products" className="card">
          <span>Sản phẩm</span>
          <b>{productCount || 0}</b>
          <small>Quản lý danh sách sản phẩm</small>
        </Link>

        <Link href="/admin/orders" className="card">
          <span>Đơn hàng</span>
          <b>{orderCount || 0}</b>
          <small>Xem và xử lý đơn hàng</small>
        </Link>

        <Link href="/admin/products/new" className="card">
          <span>Thêm mới</span>
          <b>+</b>
          <small>Thêm sản phẩm vào database</small>
        </Link>

      </div>

      <style>{`
        .dashboard {
          max-width: 1180px;
        }

        .top {
          margin-bottom: 28px;
        }

        .top p {
          margin: 0;
          color: #00e5ff;
          font-weight: 950;
          letter-spacing: 2px;
        }

        .top h1 {
          margin: 8px 0;
          font-size: 44px;
          line-height: 1.1;
        }

        .top span {
          color: #b8c4e6;
        }

        .cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 18px;
        }

        .card {
          display: block;
          text-decoration: none;
          color: white;
          padding: 24px;
          border-radius: 22px;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(0,229,255,.2);
          box-shadow: 0 0 34px rgba(124,77,255,.12);
          transition: .2s;
        }

        .card:hover {
          transform: translateY(-4px);
          border-color: rgba(0,229,255,.6);
        }

        .card span {
          color: #00e5ff;
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-size: 13px;
        }

        .card b {
          display: block;
          margin: 14px 0 8px;
          font-size: 36px;
          color: #ff78d2;
        }

        .card small {
          color: #b8c4e6;
        }
      `}</style>
    </main>
  );
}