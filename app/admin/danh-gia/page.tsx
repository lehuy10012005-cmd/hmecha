import Link from "next/link";
import { redirect } from "next/navigation";
import { createAuthServerClient } from "../../../lib/supabase-auth/server";
import AdminReviewsPanel from "../../../components/AdminReviewsPanel";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const supabase = await createAuthServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!user) {
    redirect("/admin-login");
  }

  if (!adminEmail || user.email?.trim().toLowerCase() !== adminEmail) {
    redirect("/admin-login");
  }
}

export default async function AdminReviewsPage() {
  await requireAdmin();

  return (
    <main className="adminReviewsPage">
      <div className="topbar">
        <div>
          <p>HMECHA ADMIN</p>
          <h1>Đánh giá sản phẩm</h1>
          <span>
            Quản lý bình luận, điểm sao và phản hồi của khách hàng trên từng sản phẩm.
          </span>
        </div>

        <Link href="/admin">← Quay lại Admin</Link>
      </div>

      <AdminReviewsPanel />

      <style>{`
        .adminReviewsPage {
          min-height: 100vh;
          padding: 36px 24px 80px;
          color: #ffffff;
          background:
            radial-gradient(circle at 8% 0%, rgba(124, 77, 255, 0.24), transparent 34%),
            radial-gradient(circle at 92% 8%, rgba(0, 229, 255, 0.16), transparent 30%),
            linear-gradient(180deg, #050816 0%, #0b1434 48%, #050816 100%);
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          align-items: flex-start;
          max-width: 1480px;
          margin: 0 auto 28px;
        }

        .topbar p {
          margin: 0 0 10px;
          color: #00e5ff;
          font-weight: 950;
          letter-spacing: 4px;
          font-size: 13px;
        }

        .topbar h1 {
          margin: 0;
          font-size: clamp(38px, 5vw, 60px);
          line-height: 1.05;
        }

        .topbar span {
          display: block;
          margin-top: 14px;
          color: #c5d2f2;
          line-height: 1.7;
        }

        .topbar a {
          text-decoration: none;
          color: #061020;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
          font-weight: 950;
          border-radius: 13px;
          padding: 13px 18px;
          white-space: nowrap;
        }

        @media (max-width: 850px) {
          .topbar {
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}