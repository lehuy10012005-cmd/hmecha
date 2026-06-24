import AdminOrderSummaryFix from "../../components/admin/AdminOrderSummaryFix";
import { redirect } from "next/navigation";
import AdminSidebarNav from "../../components/admin/AdminSidebarNav";
import { createAuthServerClient } from "../../lib/supabase-auth/server";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!adminEmail || !user?.email || user.email.toLowerCase() !== adminEmail) {
    redirect("/admin-login");
  }

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

        <AdminSidebarNav />
      </aside>

      <section className="content"><AdminOrderSummaryFix />{children}</section>

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
          box-sizing: border-box;
          padding: 24px 18px;
          border-right: 1px solid rgba(0,229,255,.18);
          background: rgba(5,8,22,.9);
          backdrop-filter: blur(10px);
          display: grid;
          grid-template-rows: auto 1fr;
          overflow: hidden;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 22px;
        }

        .brand span {
          width: 46px;
          height: 46px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
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

        .adminNav {
          min-height: 0;
          max-height: 100%;
          overflow-y: auto;
          overflow-x: hidden;
          display: grid;
          align-content: start;
          gap: 10px;
          padding-right: 6px;
          padding-bottom: 18px;
        }

        .adminNav::-webkit-scrollbar {
          width: 7px;
        }

        .adminNav::-webkit-scrollbar-track {
          background: rgba(255,255,255,.04);
          border-radius: 999px;
        }

        .adminNav::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #7c4dff, #00e5ff);
          border-radius: 999px;
        }

        .adminNav a {
          text-decoration: none;
          color: #dce6ff;
          padding: 13px 14px;
          border-radius: 14px;
          font-weight: 850;
          border: 1px solid transparent;
          background: rgba(255,255,255,.045);
          transition: .18s ease;
        }

        .adminNav a:hover {
          color: #050816;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
          border-color: rgba(0,229,255,.4);
          transform: translateX(2px);
        }

        .adminNav a.active {
          color: #061020;
          background: linear-gradient(135deg, #00e5ff, #7c4dff);
          border-color: rgba(255,255,255,.42);
          box-shadow:
            0 12px 28px rgba(0,229,255,.22),
            inset 0 1px 0 rgba(255,255,255,.35);
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
            max-height: none;
            overflow: visible;
          }

          .adminNav {
            max-height: 260px;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
}