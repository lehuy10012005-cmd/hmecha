"use client";

import { useEffect, useState } from "react";

type Coupon = {
  id: string;
  code: string;
  title: string;
  description: string | null;
};

type CouponQuickPickerProps = {
  selectedCode: string;
  onPick: (code: string) => void;
};

function getCouponIcon(code: string) {
  if (code.includes("WELCOME")) return "🎁";
  if (code.includes("GUNDAM")) return "🤖";
  if (code.includes("SHIP")) return "🚚";
  return "🎟️";
}

export default function CouponQuickPicker({
  selectedCode,
  onPick,
}: CouponQuickPickerProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  useEffect(() => {
    async function loadCoupons() {
      try {
        const response = await fetch("/api/coupons", { cache: "no-store" });
        const data = await response.json();

        setCoupons(data.coupons || []);
      } catch {
        setCoupons([]);
      }
    }

    loadCoupons();
  }, []);

  if (coupons.length === 0) return null;

  return (
    <div className="couponQuickPicker">
      <div className="couponTitle">
        <div>
          <h3>Mã giảm giá</h3>
          <p>Chọn nhanh một mã phù hợp cho đơn hàng.</p>
        </div>

        <span>1 mã / đơn</span>
      </div>

      <div className="couponList">
        {coupons.slice(0, 6).map((coupon) => {
          const isActive =
            selectedCode.trim().toUpperCase() === coupon.code.trim().toUpperCase();

          return (
            <button
              key={coupon.id}
              type="button"
              className={isActive ? "couponItem active" : "couponItem"}
              onClick={() => onPick(coupon.code)}
              title={coupon.description || coupon.title}
            >
              <div className="couponIcon">{getCouponIcon(coupon.code)}</div>

              <div className="couponText">
                <b>{coupon.code}</b>
                <small>{coupon.title}</small>
                <em>{coupon.description || "Ưu đãi HMECHA"}</em>
              </div>

              <div className="couponAction">{isActive ? "Đã chọn" : "Chọn"}</div>
            </button>
          );
        })}
      </div>

      <style>{`
        .couponQuickPicker {
          margin-bottom: 0;
          padding: 16px;
          border-radius: 14px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
        }

        .couponTitle {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 14px;
        }

        .couponTitle h3 {
          margin: 0;
          color: #111827;
          font-size: 17px;
          line-height: 1.2;
          font-weight: 900;
        }

        .couponTitle p {
          margin: 5px 0 0;
          color: #6b7280;
          font-size: 13px;
          line-height: 1.45;
        }

        .couponTitle span {
          flex: 0 0 auto;
          color: #d32f2f;
          font-size: 12px;
          font-weight: 900;
          padding: 6px 10px;
          border-radius: 999px;
          background: #fff5f5;
          border: 1px solid #f3b1b1;
        }

        .couponList {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .couponItem {
          display: grid;
          grid-template-columns: 40px 1fr auto;
          gap: 10px;
          align-items: center;
          width: 100%;
          min-height: 74px;
          padding: 11px;
          text-align: left;
          border-radius: 13px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          color: #111827;
          cursor: pointer;
          transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
        }

        .couponItem:hover {
          transform: translateY(-1px);
          border-color: #f3b1b1;
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
        }

        .couponItem.active {
          border-color: #d32f2f;
          background: #fff8ed;
          box-shadow: 0 8px 18px rgba(211, 47, 47, 0.1);
        }

        .couponIcon {
          width: 40px;
          height: 40px;
          display: grid;
          place-items: center;
          border-radius: 11px;
          background: #fff5f5;
          border: 1px solid #f3b1b1;
          font-size: 20px;
        }

        .couponText {
          min-width: 0;
        }

        .couponText b {
          display: block;
          color: #d32f2f;
          font-size: 14px;
          line-height: 1.1;
          font-weight: 900;
          letter-spacing: 0.2px;
          margin-bottom: 5px;
        }

        .couponText small {
          display: block;
          color: #111827;
          font-size: 13px;
          font-weight: 800;
          margin-bottom: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .couponText em {
          display: block;
          color: #6b7280;
          font-size: 12px;
          font-style: normal;
          line-height: 1.35;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .couponAction {
          align-self: center;
          padding: 7px 10px;
          border-radius: 999px;
          color: #ffffff;
          background: #111827;
          font-size: 12px;
          font-weight: 900;
          white-space: nowrap;
        }

        .couponItem.active .couponAction {
          background: #d32f2f;
        }

        @media (max-width: 720px) {
          .couponTitle {
            flex-direction: column;
          }

          .couponList {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
