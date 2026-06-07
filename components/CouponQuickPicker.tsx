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
          <h3>Mã có thể dùng</h3>
          <p>Chọn nhanh hoặc nhập mã thủ công bên dưới.</p>
        </div>

        <span>Mỗi đơn chỉ áp dụng 1 mã</span>
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
          margin-bottom: 16px;
          padding: 16px;
          border-radius: 18px;
          background:
            radial-gradient(circle at 0% 0%, rgba(124, 77, 255, 0.18), transparent 34%),
            radial-gradient(circle at 100% 0%, rgba(0, 229, 255, 0.13), transparent 30%),
            rgba(255, 255, 255, 0.045);
          border: 1px solid rgba(0, 229, 255, 0.18);
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
          color: #ffffff;
          font-size: 18px;
          line-height: 1.2;
          font-weight: 950;
        }

        .couponTitle p {
          margin: 5px 0 0;
          color: #9fb0d8;
          font-size: 13px;
          line-height: 1.45;
        }

        .couponTitle span {
          flex: 0 0 auto;
          color: #9ff6ff;
          font-size: 12px;
          font-weight: 850;
          padding: 7px 10px;
          border-radius: 999px;
          background: rgba(0, 229, 255, 0.08);
          border: 1px solid rgba(0, 229, 255, 0.18);
        }

        .couponList {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .couponItem {
          position: relative;
          display: grid;
          grid-template-columns: 42px 1fr auto;
          gap: 10px;
          align-items: center;
          width: 100%;
          min-height: 78px;
          padding: 12px;
          text-align: left;
          border-radius: 16px;
          border: 1px solid rgba(0, 229, 255, 0.2);
          background:
            linear-gradient(135deg, rgba(5, 8, 22, 0.94), rgba(12, 25, 52, 0.92));
          color: #ffffff;
          cursor: pointer;
          overflow: hidden;
          transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
        }

        .couponItem::before,
        .couponItem::after {
          content: "";
          position: absolute;
          top: 50%;
          width: 16px;
          height: 16px;
          border-radius: 999px;
          background: rgba(7, 12, 32, 0.96);
          transform: translateY(-50%);
          z-index: 2;
        }

        .couponItem::before {
          left: -8px;
        }

        .couponItem::after {
          right: -8px;
        }

        .couponItem:hover {
          transform: translateY(-2px);
          border-color: rgba(0, 229, 255, 0.72);
          box-shadow: 0 0 22px rgba(0, 229, 255, 0.13);
        }

        .couponItem.active {
          border-color: #00e5ff;
          background:
            radial-gradient(circle at 0% 0%, rgba(124, 77, 255, 0.35), transparent 38%),
            linear-gradient(135deg, rgba(124, 77, 255, 0.78), rgba(0, 229, 255, 0.78));
          box-shadow: 0 0 24px rgba(0, 229, 255, 0.2);
        }

        .couponIcon {
          width: 42px;
          height: 42px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: rgba(0, 229, 255, 0.1);
          border: 1px solid rgba(0, 229, 255, 0.22);
          font-size: 22px;
        }

        .couponText {
          min-width: 0;
        }

        .couponText b {
          display: block;
          color: #00e5ff;
          font-size: 15px;
          line-height: 1.1;
          font-weight: 950;
          letter-spacing: 0.3px;
          margin-bottom: 5px;
        }

        .couponItem.active .couponText b {
          color: #061020;
        }

        .couponText small {
          display: block;
          color: #ffffff;
          font-size: 13px;
          font-weight: 850;
          margin-bottom: 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .couponText em {
          display: block;
          color: #9fb0d8;
          font-size: 12px;
          font-style: normal;
          line-height: 1.35;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .couponItem.active .couponText small,
        .couponItem.active .couponText em {
          color: #061020;
        }

        .couponAction {
          align-self: center;
          padding: 7px 10px;
          border-radius: 999px;
          color: #061020;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
          font-size: 12px;
          font-weight: 950;
          white-space: nowrap;
        }

        .couponItem.active .couponAction {
          background: #061020;
          color: #00e5ff;
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