import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="adminShell">
      <aside className="sidebar">
        <div className="brand">
          <span>H</span>
          <div>
            <b>HMECHA</b>
            <small>Admin Panel</small>
          </div>
        </div>

        <nav>
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/products">Sản phẩm</Link>
          <Link href="/admin/products/new">Thêm sản phẩm</Link>
          <Link href="/admin/orders">Đơn hàng</Link>
          <Link href="/admin/coupons">Mã giảm giá</Link>
          <Link href="/">Về website</Link>
        </nav>
      </aside>

      <section className="content">{children}</section>

      <style>{`
        .adminShell {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 260px 1fr;
          background:
            radial-gradient(circle at top left, rgba(124,77,255,.24), transparent 34%),
            radial-gradient(circle at top right, rgba(0,229,255,.16), transparent 30%),
            linear-gradient(180deg, #050816 0%, #0b1026 45%, #050816 100%);
          color: white;
        }

        .sidebar {
          position: sticky;
          top: 0;
          height: 100vh;
          padding: 24px 18px;
          border-right: 1px solid rgba(0,229,255,.18);
          background: rgba(5,8,22,.86);
          backdrop-filter: blur(10px);
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
        }

        .brand span {
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background: linear-gradient(135deg,#7c4dff,#00e5ff);
          color: #050816;
          font-size: 26px;
          font-weight: 950;
        }

        .brand b {
          display: block;
          letter-spacing: 2px;
          color: #00e5ff;
        }

        .brand small {
          color: #b8c4e6;
        }

        nav {
          display: grid;
          gap: 10px;
        }

        nav a {
          text-decoration: none;
          color: #dce6ff;
          padding: 13px 14px;
          border-radius: 14px;
          font-weight: 850;
          border: 1px solid transparent;
          background: rgba(255,255,255,.04);
        }

        nav a:hover {
          color: #050816;
          background: linear-gradient(135deg,#7c4dff,#00e5ff);
          border-color: rgba(0,229,255,.4);
        }

        .content {
          padding: 34px 28px 70px;
          min-width: 0;
        }

        @media (max-width: 900px) {
          .adminShell {
            grid-template-columns: 1fr;
          }

          .sidebar {
            position: static;
            height: auto;
          }

          nav {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
}