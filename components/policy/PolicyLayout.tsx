import Link from "next/link";
import type { ReactNode } from "react";

type PolicyLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  updatedAt: string;
  children: ReactNode;
};

export default function PolicyLayout({
  eyebrow,
  title,
  description,
  updatedAt,
  children,
}: PolicyLayoutProps) {
  return (
    <main className="policyPage">
      <div className="policyContainer">
        <nav className="breadcrumb" aria-label="breadcrumb">
          <Link href="/">Trang chủ</Link>
          <span>›</span>
          <strong>{title}</strong>
        </nav>

        <section className="policyHero">
          <p>{eyebrow}</p>
          <h1>{title}</h1>
          <span>{description}</span>

          <div className="updatedBox">
            <strong>Cập nhật lần cuối</strong>
            <span>{updatedAt}</span>
          </div>
        </section>

        <section className="policyGrid">
          <aside className="policySidebar">
            <Link href="/chinh-sach-bao-mat">Chính sách bảo mật</Link>
            <Link href="/chinh-sach-van-chuyen">Chính sách vận chuyển</Link>
            <Link href="/chinh-sach-doi-tra">Chính sách đổi trả</Link>
            <Link href="/chinh-sach-thanh-toan">Chính sách thanh toán</Link>
            <Link href="/">← Quay lại mua sắm</Link>
          </aside>

          <article className="policyContent">{children}</article>
        </section>
      </div>

      <style>{`
        .policyPage {
          min-height: 100vh;
          padding: 36px 20px 90px;
          color: #ffffff;
          background:
            radial-gradient(circle at 8% 0%, rgba(124, 77, 255, 0.28), transparent 34%),
            radial-gradient(circle at 92% 8%, rgba(0, 229, 255, 0.16), transparent 30%),
            linear-gradient(180deg, #050816 0%, #0b1434 46%, #050816 100%);
        }

        .policyContainer {
          max-width: 1320px;
          margin: 0 auto;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 26px;
          color: #9fb0d8;
          font-size: 15px;
        }

        .breadcrumb a {
          color: #b9c8ed;
          text-decoration: none;
        }

        .breadcrumb a:hover,
        .breadcrumb strong {
          color: #00e5ff;
        }

        .policyHero {
          margin-bottom: 30px;
          padding: 42px;
          border-radius: 28px;
          background:
            radial-gradient(circle at 86% 14%, rgba(0, 229, 255, 0.16), transparent 34%),
            radial-gradient(circle at 12% 0%, rgba(255, 79, 216, 0.12), transparent 32%),
            rgba(7, 12, 32, 0.78);
          border: 1px solid rgba(0, 229, 255, 0.22);
          box-shadow:
            0 22px 50px rgba(0, 0, 0, 0.28),
            inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }

        .policyHero p {
          margin: 0 0 12px;
          color: #00e5ff;
          font-size: 13px;
          font-weight: 950;
          letter-spacing: 4px;
          text-transform: uppercase;
        }

        .policyHero h1 {
          margin: 0;
          max-width: 900px;
          font-size: clamp(38px, 5vw, 62px);
          line-height: 1.05;
          font-weight: 950;
          letter-spacing: -1.4px;
        }

        .policyHero > span {
          display: block;
          max-width: 840px;
          margin-top: 18px;
          color: #c5d2f2;
          font-size: 17px;
          line-height: 1.75;
        }

        .updatedBox {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          margin-top: 24px;
          padding: 12px 16px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(0, 229, 255, 0.16);
          color: #b9c8ed;
        }

        .updatedBox strong {
          color: #ffffff;
        }

        .policyGrid {
          display: grid;
          grid-template-columns: 290px 1fr;
          gap: 24px;
          align-items: start;
        }

        .policySidebar {
          position: sticky;
          top: 20px;
          display: grid;
          gap: 10px;
          padding: 18px;
          border-radius: 22px;
          background: rgba(7, 12, 32, 0.82);
          border: 1px solid rgba(0, 229, 255, 0.18);
        }

        .policySidebar a {
          padding: 14px 15px;
          border-radius: 13px;
          color: #dce6ff;
          text-decoration: none;
          font-weight: 850;
          background: rgba(255, 255, 255, 0.055);
        }

        .policySidebar a:hover {
          color: #061020;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
        }

        .policyContent {
          padding: 34px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.96);
          color: #111827;
          border: 1px solid rgba(0, 229, 255, 0.18);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.24);
        }

        .policyContent section {
          padding-bottom: 26px;
          margin-bottom: 26px;
          border-bottom: 1px solid #e5e7eb;
        }

        .policyContent section:last-child {
          margin-bottom: 0;
          padding-bottom: 0;
          border-bottom: 0;
        }

        .policyContent h2 {
          margin: 0 0 14px;
          color: #08111f;
          font-size: 26px;
          line-height: 1.25;
        }

        .policyContent p {
          margin: 0 0 13px;
          color: #374151;
          line-height: 1.78;
          font-size: 16px;
        }

        .policyContent ul,
        .policyContent ol {
          margin: 0 0 14px;
          padding-left: 22px;
          color: #374151;
          line-height: 1.78;
        }

        .policyContent li {
          margin-bottom: 7px;
        }

        .policyContent strong {
          color: #111827;
        }

        .policyNotice {
          margin: 18px 0;
          padding: 16px 18px;
          border-radius: 16px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1e3a8a;
        }

        .policyWarning {
          margin: 18px 0;
          padding: 16px 18px;
          border-radius: 16px;
          background: #fff7ed;
          border: 1px solid #fed7aa;
          color: #9a3412;
        }

        .policyTable {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
          border-radius: 14px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
        }

        .policyTable th,
        .policyTable td {
          padding: 14px;
          text-align: left;
          vertical-align: top;
          border-bottom: 1px solid #e5e7eb;
        }

        .policyTable th {
          background: #f3f4f6;
          color: #111827;
        }

        .policyTable tr:last-child td {
          border-bottom: 0;
        }

        @media (max-width: 900px) {
          .policyGrid {
            grid-template-columns: 1fr;
          }

          .policySidebar {
            position: static;
          }

          .policyHero {
            padding: 30px 22px;
          }

          .policyContent {
            padding: 24px 18px;
          }
        }
      `}</style>
    </main>
  );
}
