"use client";

import { useEffect, useState } from "react";

type Coupon = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
};

function couponIcon(code: string) {
  if (code.includes("WELCOME")) return "🎁";
  if (code.includes("GUNDAM")) return "🤖";
  if (code.includes("SHIP")) return "🚚";
  return "🎟️";
}

export default function CouponShowcase() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [copiedCode, setCopiedCode] = useState("");

  useEffect(() => {
    async function loadCoupons() {
      const response = await fetch("/api/coupons", { cache: "no-store" });
      const data = await response.json();

      setCoupons(data.coupons || []);
    }

    loadCoupons();
  }, []);

  async function copyCode(code: string) {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);

    window.setTimeout(() => setCopiedCode(""), 1500);
  }

  if (coupons.length === 0) return null;

  return (
    <section className="couponShowcase">
      <div className="couponHead">
        <h2>
          Mã Sale <span>Đặc Biệt</span>
        </h2>
        <p>Mỗi đơn hàng chỉ được áp dụng 1 mã giảm giá.</p>
      </div>

      <div className="couponGrid">
        {coupons.slice(0, 4).map((coupon) => (
          <article className="couponCard" key={coupon.id}>
            <div className="couponIcon">{couponIcon(coupon.code)}</div>

            <div className="couponDivider" />

            <div className="couponInfo">
              <h3>{coupon.title}</h3>
              <p>{coupon.description}</p>

              <span>Nhập mã</span>

              <div className="couponCodeRow">
                <strong>{coupon.code}</strong>

                <button type="button" onClick={() => copyCode(coupon.code)}>
                  {copiedCode === coupon.code ? "Đã sao chép" : "Sao chép"}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <style>{`
        .couponShowcase {
          margin: 42px auto;
          padding: 26px 24px 30px;
          max-width: 1480px;
          border-radius: 22px;
          background:
            radial-gradient(circle at top left, rgba(124,77,255,.18), transparent 34%),
            radial-gradient(circle at top right, rgba(0,229,255,.14), transparent 30%),
            rgba(7,12,32,.84);
          border: 1px solid rgba(0,229,255,.18);
        }

        .couponHead {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 20px;
        }

        .couponHead h2 {
          margin: 0;
          color: #ffffff;
          font-size: clamp(28px, 4vw, 42px);
          line-height: 1.1;
        }

        .couponHead h2 span {
          color: #00e5ff;
        }

        .couponHead p {
          margin: 0;
          color: #b9c8ed;
        }

        .couponGrid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        .couponCard {
          position: relative;
          overflow: hidden;
          display: grid;
          grid-template-columns: 96px 1px 1fr;
          gap: 16px;
          min-height: 142px;
          padding: 18px;
          border-radius: 18px;
          color: #061020;
          background: linear-gradient(135deg, #ffcc2e, #ff9f1c);
          box-shadow: 0 18px 34px rgba(0,0,0,.18);
        }

        .couponCard::before,
        .couponCard::after {
          content: "";
          position: absolute;
          width: 28px;
          height: 28px;
          border-radius: 999px;
          background: #0b1434;
          left: 104px;
          z-index: 2;
        }

        .couponCard::before {
          top: -14px;
        }

        .couponCard::after {
          bottom: -14px;
        }

        .couponIcon {
          display: grid;
          place-items: center;
          border-radius: 13px;
          color: #ffffff;
          font-size: 44px;
          background:
            radial-gradient(circle at 20% 0%, rgba(255,255,255,.26), transparent 28%),
            linear-gradient(135deg, #7c4dff, #00e5ff);
          border: 2px solid rgba(255,255,255,.5);
        }

        .couponDivider {
          border-left: 2px dashed rgba(124,77,255,.9);
        }

        .couponInfo h3 {
          margin: 0 0 6px;
          color: #ffffff;
          font-size: 18px;
          font-weight: 950;
        }

        .couponInfo p {
          margin: 0 0 13px;
          color: #231942;
          line-height: 1.45;
          font-weight: 650;
        }

        .couponInfo span {
          color: #7c4dff;
          font-weight: 850;
        }

        .couponCodeRow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-top: 4px;
        }

        .couponCodeRow strong {
          color: #7c4dff;
          font-size: 18px;
          letter-spacing: .4px;
        }

        .couponCodeRow button {
          border: 0;
          border-radius: 9px;
          min-height: 38px;
          padding: 0 13px;
          color: #ffffff;
          background: #7c4dff;
          font-weight: 850;
          cursor: pointer;
        }

        .couponCodeRow button:hover {
          background: #00bcd4;
        }

        @media (max-width: 1180px) {
          .couponGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .couponHead {
            align-items: flex-start;
            flex-direction: column;
          }

          .couponGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}