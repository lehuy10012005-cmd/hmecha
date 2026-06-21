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

function getVoucherInfo(code: string) {
  const upper = code.toUpperCase();

  if (upper.includes("SHIP")) {
    return {
      label: "FREE SHIP",
      type: "Mã vận chuyển",
      title: "Miễn phí vận chuyển",
      accent: "#0f766e",
      soft: "#ecfdf5",
    };
  }

  if (upper.includes("WELCOME")) {
    return {
      label: "WELCOME",
      type: "Mã giảm giá",
      title: "Giảm cho khách mới",
      accent: "#d32f2f",
      soft: "#fff5f5",
    };
  }

  if (upper.includes("GUNDAM")) {
    return {
      label: "SALE",
      type: "Mã giảm giá",
      title: "Giảm giá đơn hàng",
      accent: "#d32f2f",
      soft: "#fff5f5",
    };
  }

  return {
    label: "VOUCHER",
    type: "Ưu đãi",
    title: "Ưu đãi HMECHA",
    accent: "#d32f2f",
    soft: "#fff5f5",
  };
}

function getMinimumText(coupon: Coupon) {
  const text = `${coupon.title || ""} ${coupon.description || ""}`.toLowerCase();

  const match = text.match(/(\d+[\.,]?\d*)\s*k/);
  if (match) return `Đơn tối thiểu ${match[1].replace(".", ",")}k`;

  if (text.includes("0đ") || text.includes("bất kỳ")) return "Đơn tối thiểu 0đ";

  return "Áp dụng cho đơn đủ điều kiện";
}

export default function CouponQuickPicker({
  selectedCode,
  onPick,
}: CouponQuickPickerProps) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [showAll, setShowAll] = useState(false);

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

  const visibleCoupons = showAll ? coupons : coupons.slice(0, 3);

  return (
    <div className="hmechaWhiteVoucher">
      <div className="voucherHeading">
        <div>
          <h3>Chọn HMECHA Voucher</h3>
          <p>Chọn một mã giảm giá phù hợp cho đơn hàng.</p>
        </div>

        <span>1 mã / đơn</span>
      </div>

      <div className="voucherList">
        {visibleCoupons.map((coupon, index) => {
          const active =
            selectedCode.trim().toUpperCase() === coupon.code.trim().toUpperCase();

          const info = getVoucherInfo(coupon.code);

          return (
            <button
              key={coupon.id}
              type="button"
              className={active ? "voucherCard active" : "voucherCard"}
              onClick={() => onPick(coupon.code)}
            >
              <div
                className="voucherIcon"
                style={{
                  background: info.soft,
                  color: info.accent,
                }}
              >
                <b>{info.label}</b>
                <small>{info.type}</small>
              </div>

              <div className="voucherContent">
                <div className="voucherTop">
                  <h4>{info.title}</h4>
                  {index === 0 && <em>Gợi ý</em>}
                </div>

                <p>{getMinimumText(coupon)}</p>

                <div className="voucherMeta">
                  <span>Dành riêng cho bạn</span>
                  <a>Điều kiện</a>
                </div>

                <small>{coupon.code}</small>
              </div>

              <div className="voucherRadio">
                <i>{active ? "✓" : ""}</i>
              </div>
            </button>
          );
        })}
      </div>

      {coupons.length > 3 && (
        <button
          type="button"
          className="moreVoucher"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Thu gọn" : "Xem thêm"} ˅
        </button>
      )}

      <style>{`
        .hmechaWhiteVoucher {
          width: 100%;
          font-family: Arial, "Helvetica Neue", sans-serif !important;
        }

        .hmechaWhiteVoucher * {
          box-sizing: border-box;
          font-family: Arial, "Helvetica Neue", sans-serif !important;
        }

        .voucherHeading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }

        .voucherHeading h3 {
          margin: 0;
          color: #111827;
          font-size: 18px;
          line-height: 1.25;
          font-weight: 900;
        }

        .voucherHeading p {
          margin: 4px 0 0;
          color: #6b7280;
          font-size: 13px;
          line-height: 1.4;
        }

        .voucherHeading > span {
          flex: 0 0 auto;
          padding: 6px 10px;
          border: 1px solid #e5e7eb;
          border-radius: 999px;
          background: #ffffff;
          color: #374151;
          font-size: 12px;
          font-weight: 800;
        }

        .voucherList {
          display: grid;
          gap: 10px;
        }

        .voucherCard {
          position: relative;
          width: 100%;
          min-height: 92px;
          display: grid;
          grid-template-columns: 108px minmax(0, 1fr) 42px;
          padding: 0;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #ffffff !important;
          color: #111827;
          text-align: left;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
          transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
        }

        .voucherCard:hover {
          transform: translateY(-1px);
          border-color: #d1d5db;
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.08);
        }

        .voucherCard.active {
          border-color: #d32f2f;
          box-shadow: 0 8px 18px rgba(211, 47, 47, 0.1);
        }

        .voucherIcon {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 12px 8px;
          text-align: center;
          border-right: 1px dashed #d1d5db;
        }

        .voucherIcon::before {
          content: "";
          position: absolute;
          left: -1px;
          top: 0;
          bottom: 0;
          width: 9px;
          background:
            radial-gradient(circle at 0 8px, transparent 6px, #ffffff 7px) 0 0 / 9px 18px repeat-y;
        }

        .voucherIcon b {
          color: inherit;
          font-size: 17px;
          line-height: 1;
          font-weight: 950;
          letter-spacing: 0.2px;
        }

        .voucherIcon small {
          color: inherit;
          opacity: 0.9;
          font-size: 11px;
          font-weight: 700;
        }

        .voucherContent {
          min-width: 0;
          padding: 12px 12px 10px 14px;
          background: #ffffff !important;
        }

        .voucherTop {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 4px;
        }

        .voucherTop h4 {
          margin: 0;
          color: #111827;
          font-size: 15px;
          line-height: 1.3;
          font-weight: 900;
        }

        .voucherTop em {
          flex: 0 0 auto;
          padding: 3px 7px;
          border-radius: 999px;
          background: #f3f4f6;
          color: #4b5563;
          font-size: 11px;
          font-style: normal;
          font-weight: 800;
        }

        .voucherContent p {
          margin: 0 0 7px;
          color: #4b5563;
          font-size: 13px;
          line-height: 1.35;
          font-weight: 700;
        }

        .voucherMeta {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          margin-bottom: 5px;
        }

        .voucherMeta span {
          display: inline-flex;
          align-items: center;
          padding: 3px 8px;
          border-radius: 6px;
          background: #f9fafb;
          color: #374151;
          border: 1px solid #e5e7eb;
          font-size: 11px;
          font-weight: 800;
        }

        .voucherMeta a {
          color: #2563eb;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
        }

        .voucherContent > small {
          display: block;
          color: #9ca3af;
          font-size: 11px;
          font-weight: 700;
        }

        .voucherRadio {
          display: grid;
          place-items: center;
          background: #ffffff !important;
          border-left: 1px solid #f3f4f6;
        }

        .voucherRadio i {
          width: 24px;
          height: 24px;
          display: grid;
          place-items: center;
          border-radius: 999px;
          border: 2px solid #d1d5db;
          background: #ffffff;
          color: #ffffff;
          font-size: 14px;
          line-height: 1;
          font-style: normal;
          font-weight: 900;
        }

        .voucherCard.active .voucherRadio i {
          border-color: #d32f2f;
          background: #d32f2f;
        }

        .moreVoucher {
          width: 100%;
          min-height: 36px;
          margin-top: 10px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          background: #ffffff;
          color: #4b5563;
          font-size: 13px;
          font-weight: 800;
          cursor: pointer;
        }

        .moreVoucher:hover {
          color: #d32f2f;
          border-color: #f3b1b1;
          background: #fffafa;
        }

        @media (max-width: 640px) {
          .voucherHeading {
            flex-direction: column;
          }

          .voucherCard {
            grid-template-columns: 88px minmax(0, 1fr) 36px;
            min-height: 84px;
          }

          .voucherIcon b {
            font-size: 14px;
          }

          .voucherIcon small {
            font-size: 10px;
          }

          .voucherContent {
            padding: 10px 10px 9px 12px;
          }

          .voucherTop h4 {
            font-size: 14px;
          }

          .voucherContent p,
          .voucherMeta a {
            font-size: 11px;
          }

          .voucherMeta span,
          .voucherContent > small,
          .voucherTop em {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
}
