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

function getVoucherType(code: string) {
  const upper = code.toUpperCase();

  if (upper.includes("SHIP")) {
    return {
      title: "Miễn phí vận chuyển",
      type: "Mã vận chuyển",
      color: "#20b7a6",
      icon: "FREE\nSHIP",
    };
  }

  if (upper.includes("WELCOME")) {
    return {
      title: "Giảm cho khách mới",
      type: "Mã giảm giá",
      color: "#ef4b2b",
      icon: "VOUCHER",
    };
  }

  if (upper.includes("GUNDAM")) {
    return {
      title: "Giảm giá đơn hàng",
      type: "Mã giảm giá",
      color: "#ef4b2b",
      icon: "SALE",
    };
  }

  return {
    title: "Ưu đãi HMECHA",
    type: "Voucher",
    color: "#ef4b2b",
    icon: "DEAL",
  };
}

function getMinimumText(coupon: Coupon) {
  const text = `${coupon.title || ""} ${coupon.description || ""}`.toLowerCase();

  const match = text.match(/(\d+[\.,]?\d*)\s*k/);
  if (match) return `Đơn tối thiểu ${match[1].replace(".", ",")}k`;

  if (text.includes("bất kỳ") || text.includes("0")) return "Đơn tối thiểu 0đ";

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
    <div className="voucherPicker">
      <div className="voucherGroupTitle">
        <h3>Chọn HMECHA Voucher</h3>
        <span>1 mã / đơn</span>
      </div>

      <div className="voucherList">
        {visibleCoupons.map((coupon, index) => {
          const isActive =
            selectedCode.trim().toUpperCase() === coupon.code.trim().toUpperCase();

          const voucher = getVoucherType(coupon.code);

          return (
            <button
              key={coupon.id}
              type="button"
              className={isActive ? "voucherItem active" : "voucherItem"}
              onClick={() => onPick(coupon.code)}
              title={coupon.description || coupon.title}
            >
              <div className="voucherLeft" style={{ backgroundColor: voucher.color }}>
                <div className="ticketCut left" />
                <div className="ticketCut right" />

                <strong>{voucher.icon}</strong>
                <small>{voucher.type}</small>
              </div>

              <div className="voucherInfo">
                {index === 0 && <div className="bestTag">Lựa chọn tốt nhất</div>}

                <h4>{voucher.title}</h4>
                <p>{getMinimumText(coupon)}</p>

                <div className="voucherMeta">
                  <span>Dành riêng cho bạn</span>
                  <em>Điều kiện</em>
                </div>

                <small className="voucherCode">{coupon.code}</small>
              </div>

              <div className="voucherSelect">
                <span>{isActive ? "✓" : ""}</span>
              </div>
            </button>
          );
        })}
      </div>

      {coupons.length > 3 && (
        <button type="button" className="seeMoreVoucher" onClick={() => setShowAll(!showAll)}>
          {showAll ? "Thu gọn" : "Xem thêm"} <b>⌄</b>
        </button>
      )}

      <style>{`
        .voucherPicker {
          padding: 0;
          background: transparent;
          border: 0;
          font-family: Arial, "Helvetica Neue", sans-serif !important;
        }

        .voucherPicker * {
          box-sizing: border-box;
          font-family: Arial, "Helvetica Neue", sans-serif !important;
        }

        .voucherGroupTitle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 14px;
        }

        .voucherGroupTitle h3 {
          margin: 0;
          color: #111827;
          font-size: 20px;
          line-height: 1.2;
          font-weight: 900;
        }

        .voucherGroupTitle span {
          flex: 0 0 auto;
          padding: 6px 10px;
          border-radius: 999px;
          color: #ef4b2b;
          background: #fff4ef;
          border: 1px solid #ffc6b8;
          font-size: 12px;
          font-weight: 800;
        }

        .voucherList {
          display: grid;
          gap: 12px;
        }

        .voucherItem {
          position: relative;
          width: 100%;
          min-height: 116px;
          display: grid;
          grid-template-columns: 136px minmax(0, 1fr) 46px;
          align-items: stretch;
          padding: 0;
          overflow: hidden;
          border: 1px solid #e8e8e8;
          border-radius: 4px;
          background: #ffffff;
          text-align: left;
          cursor: pointer;
          box-shadow: 0 3px 10px rgba(15, 23, 42, 0.06);
          transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
        }

        .voucherItem:hover,
        .voucherItem.active {
          border-color: #ef4b2b;
          box-shadow: 0 8px 20px rgba(239, 75, 43, 0.12);
          transform: translateY(-1px);
        }

        .voucherLeft {
          position: relative;
          display: grid;
          place-items: center;
          align-content: center;
          gap: 8px;
          color: #ffffff;
          text-align: center;
          padding: 16px 12px;
        }

        .voucherLeft::before {
          content: "";
          position: absolute;
          left: -1px;
          top: 0;
          bottom: 0;
          width: 12px;
          background:
            radial-gradient(circle at 0 8px, transparent 7px, #ffffff 8px) 0 0 / 12px 20px repeat-y;
        }

        .voucherLeft strong {
          white-space: pre-line;
          color: #ffffff;
          font-size: 24px;
          line-height: 0.95;
          font-weight: 950;
          letter-spacing: 0.2px;
        }

        .voucherLeft small {
          color: rgba(255, 255, 255, 0.9);
          font-size: 13px;
          font-weight: 700;
        }

        .ticketCut {
          position: absolute;
          right: -7px;
          width: 14px;
          height: 14px;
          border-radius: 999px;
          background: #ffffff;
          z-index: 2;
        }

        .ticketCut.left {
          top: -7px;
        }

        .ticketCut.right {
          bottom: -7px;
        }

        .voucherInfo {
          position: relative;
          min-width: 0;
          padding: 18px 14px 15px 18px;
          border-right: 1px dashed #d8d8d8;
        }

        .bestTag {
          position: absolute;
          top: 0;
          right: 0;
          padding: 4px 10px;
          color: #ffffff;
          background: #ef4b2b;
          border-radius: 0 0 0 8px;
          font-size: 12px;
          font-weight: 800;
        }

        .voucherInfo h4 {
          margin: 0 0 6px;
          color: #111827;
          font-size: 18px;
          line-height: 1.25;
          font-weight: 900;
          padding-right: 96px;
        }

        .voucherInfo p {
          margin: 0 0 8px;
          color: #4b5563;
          font-size: 14px;
          font-weight: 700;
        }

        .voucherMeta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }

        .voucherMeta span {
          display: inline-flex;
          padding: 3px 8px;
          border: 1px solid #ffb7a6;
          color: #ef4b2b;
          background: #fff7f4;
          font-size: 12px;
          font-weight: 800;
        }

        .voucherMeta em {
          color: #2563eb;
          font-size: 13px;
          font-style: normal;
          font-weight: 700;
        }

        .voucherCode {
          display: block;
          color: #9ca3af;
          font-size: 12px;
          font-weight: 700;
        }

        .voucherSelect {
          display: grid;
          place-items: center;
          background: #ffffff;
        }

        .voucherSelect span {
          width: 32px;
          height: 32px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          border: 2px solid #d1d5db;
          color: #ffffff;
          background: #ffffff;
          font-size: 18px;
          font-weight: 900;
        }

        .voucherItem.active .voucherSelect span {
          border-color: #ef4b2b;
          background: #ef4b2b;
        }

        .seeMoreVoucher {
          width: 100%;
          min-height: 38px;
          margin-top: 10px;
          border: 0;
          background: #ffffff;
          color: #6b7280;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
        }

        .seeMoreVoucher:hover {
          color: #ef4b2b;
        }

        .seeMoreVoucher b {
          color: inherit;
          font-weight: 900;
        }

        @media (max-width: 640px) {
          .voucherItem {
            grid-template-columns: 112px minmax(0, 1fr) 38px;
            min-height: 104px;
          }

          .voucherLeft strong {
            font-size: 20px;
          }

          .voucherLeft small {
            font-size: 12px;
          }

          .voucherInfo {
            padding: 14px 10px 12px 14px;
          }

          .voucherInfo h4 {
            font-size: 15px;
            padding-right: 0;
          }

          .bestTag {
            display: none;
          }

          .voucherInfo p,
          .voucherMeta em {
            font-size: 12px;
          }

          .voucherMeta span,
          .voucherCode {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
}
