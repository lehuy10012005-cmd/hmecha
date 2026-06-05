import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import CustomerLogoutButton from "../../components/customer/CustomerLogoutButton";
import { createAuthServerClient } from "../../lib/supabase-auth/server";

export const dynamic = "force-dynamic";

export default async function CustomerAccountLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createAuthServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/dang-nhap?next=/tai-khoan");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,email")
    .eq("id", user.id)
    .maybeSingle();

  const customerName =
    profile?.full_name || profile?.email || user.email || "Thành viên HMECHA";

  return (
    <main className="shell">
      <aside>
        <Link className="brand" href="/">
          HMECHA
        </Link>

        <p className="accountName">{customerName}</p>

        <Link className="shopBack" href="/">
          ← Tiếp tục mua sắm
        </Link>

        <nav>
          <Link href="/tai-khoan">Tổng quan</Link>
          <Link href="/tai-khoan/don-hang">Đơn hàng của tôi</Link>
          <span>Thẻ tích điểm — sắp có</span>
          <span>Voucher — sắp có</span>
          <span>Yêu thích — sắp có</span>
        </nav>

        <CustomerLogoutButton />
      </aside>

      <section className="content">{children}</section>

      <style>{`
        .shell {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 300px 1fr;
          color: #fff;
          background:
            radial-gradient(circle at top left, rgba(124, 77, 255, 0.22), transparent 34%),
            radial-gradient(circle at top right, rgba(0, 229, 255, 0.16), transparent 30%),
            #050816;
        }

        aside {
          padding: 34px 22px;
          border-right: 1px solid rgba(0, 229, 255, 0.17);
          background: rgba(8, 13, 33, 0.95);
          position: sticky;
          top: 0;
          height: 100vh;
        }

        .brand {
          display: block;
          color: #00e5ff;
          font-size: 27px;
          font-weight: 950;
          letter-spacing: 4px;
          text-decoration: none;
        }

        .accountName {
          color: #cbd8ff;
          margin: 10px 0 18px;
          line-height: 1.5;
        }

        .shopBack {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 46px;
          margin-bottom: 24px;
          border-radius: 14px;
          color: #061020;
          text-decoration: none;
          font-weight: 950;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
          box-shadow: 0 0 22px rgba(0, 229, 255, 0.22);
        }

        .shopBack:hover {
          color: #ffffff;
          background: linear-gradient(135deg, #ff4fd8, #7c4dff);
        }

        nav {
          display: grid;
          gap: 10px;
        }

        nav a,
        nav span {
          padding: 15px 16px;
          border-radius: 14px;
          color: #dce6ff;
          background: rgba(255, 255, 255, 0.055);
          text-decoration: none;
          font-weight: 850;
        }

        nav a:hover {
          color: #071020;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
        }

        nav span {
          color: #7281a7;
        }

        .customerLogout {
          width: 100%;
          margin-top: 32px;
          padding: 14px;
          border: 1px solid rgba(255, 90, 110, 0.26);
          border-radius: 13px;
          color: #ff9eac;
          background: rgba(255, 90, 110, 0.08);
          font-weight: 850;
          cursor: pointer;
        }

        .customerLogout:hover {
          color: #ffffff;
          background: rgba(255, 90, 110, 0.2);
        }

        .content {
          padding: 44px min(5vw, 58px);
        }

        @media (max-width: 880px) {
          .shell {
            grid-template-columns: 1fr;
          }

          aside {
            position: static;
            height: auto;
            border-right: none;
            border-bottom: 1px solid rgba(0, 229, 255, 0.17);
          }
        }
      `}</style>
    </main>
  );
}