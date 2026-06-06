import Link from "next/link";
import { redirect } from "next/navigation";
import AdminLogoutButton from "../../components/admin/AdminLogoutButton";
import { createAuthServerClient } from "../../lib/supabase-auth/server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!adminEmail || !user?.email || user.email.toLowerCase() !== adminEmail) {
    redirect("/admin-login");
  }

  return (
    <div className="adminShell">
      <aside className="sidebar">
        <div className="brand">
          <span>H</span>
          <div><b>HMECHA</b><small>Admin Panel</small></div>
        </div>
      <nav>
  <Link href="/admin">Dashboard</Link>
  <Link href="/admin/products">Sản phẩm</Link>
  <Link href="/admin/products/new">Thêm sản phẩm</Link>
  <Link href="/admin/orders">Đơn hàng</Link>
  <Link href="/admin/khach-hang">Khách hàng</Link>
  <Link href="/">Về website</Link>
</nav>
      </aside>
      <section className="content">{children}</section>
      <style>{`
        .adminShell { min-height:100vh; display:grid; grid-template-columns:260px 1fr; background:radial-gradient(circle at top left,rgba(124,77,255,.24),transparent 34%),radial-gradient(circle at top right,rgba(0,229,255,.16),transparent 30%),linear-gradient(180deg,#050816 0%,#0b1026 45%,#050816 100%); color:white; }
        .sidebar { position:sticky; top:0; height:100vh; box-sizing:border-box; padding:24px 18px; border-right:1px solid rgba(0,229,255,.18); background:rgba(5,8,22,.86); backdrop-filter:blur(10px); }
        .brand { display:flex; align-items:center; gap:12px; margin-bottom:28px; }
        .brand span { width:46px; height:46px; display:grid; place-items:center; border-radius:14px; background:linear-gradient(135deg,#7c4dff,#00e5ff); color:#050816; font-size:26px; font-weight:950; }
        .brand b { display:block; letter-spacing:2px; color:#00e5ff; }
        .brand small { color:#b8c4e6; }
        nav { display:grid; gap:10px; }
        nav a { text-decoration:none; color:#dce6ff; padding:13px 14px; border-radius:14px; font-weight:850; border:1px solid transparent; background:rgba(255,255,255,.04); }
        nav a:hover { color:#050816; background:linear-gradient(135deg,#7c4dff,#00e5ff); border-color:rgba(0,229,255,.4); }
        .logoutButton { width:100%; margin-top:10px; border:1px solid rgba(255,255,255,.12); border-radius:12px; padding:13px 16px; color:#ff9eac; background:rgba(255,79,104,.08); font-weight:800; cursor:pointer; text-align:left; }
        .content { padding:34px 28px 70px; min-width:0; }
        @media (max-width:900px) { .adminShell { grid-template-columns:1fr; } .sidebar { position:static; height:auto; } nav { grid-template-columns:repeat(2,1fr); } }
      `}</style>
    </div>
  );
}
