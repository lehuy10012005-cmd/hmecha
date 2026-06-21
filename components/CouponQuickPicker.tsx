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
      heading: "Miễn phí vận chuyển",
      type: "Mã vận chuyển",
      leftBg: "#dff7f4",
      leftText: "#0f766e",
      badgeBg: "#ecfeff",
      badgeText: "#0f766e",
      shortText: "FREE\nSHIP",
    };
  }

  if (upper.includes("WELCOME")) {
    return {
      heading: "Giảm cho khách mới",
      type: "Mã giảm giá",
      leftBg: "#fff1eb",
      leftText: "#ea580c",
      badgeBg: "#fff7ed",
      badgeText: "#c2410c",
      shortText: "WELCOME",
    };
  }

  if (upper.includes("GUNDAM")) {
    return {
      heading: "Giảm giá đơn hàng",
      type: "Mã giảm giá",
      leftBg: "#fff1eb",
      leftText: "#ea580c",
      badgeBg: "#fff7ed",
      badgeText: "#c2410c",
      shortText: "SALE",
    };
  }

  return {
    heading: "Ưu đãi HMECHA",
    type: "Voucher",
    leftBg: "#f8fafc",
    leftText: "#334155",
    badgeBg: "#f8fafc",
    badgeText: "#334155",
    shortText: "VOUCHER",
  };
}

function getMinimumText(coupon: Coupon) {
  const text = `${coupon.title || ""} ${coupon.description || ""}`.toLowerCase();

  if (text.includes("miễn phí ship") || text.includes("miễn phí vận chuyển")) {
    return "Áp dụng cho đơn đủ điều kiện";
  }

  const match = text.match(/(\d+[\.,]?\d*)\s*k/);
  if (match) return `Đơn tối thiểu ${match[1].replace(".", ",")}k`;

  if (text.includes("bất kỳ") || text.includes("0đ")) return "Đơn tối thiểu 0đ";

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
      <div className="voucherHeader">
        <div>
          <h3>Chọn HMECHA Voucher</h3>
          <p>Chọn nhanh một mã phù hợp cho đơn hàng.</p>
        </div>

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
              <div
                className="voucherLeft"
                style={{
                  background: voucher.leftBg,
                  color: voucher.leftText,
                }}
              >
                <strong>{voucher.shortText}</strong>
                <small>{voucher.type}</small>
              </div>

              <div className="voucherBody">
                <div className="voucherTop">
                  <h4>{voucher.heading}</h4>
                  {index === 0 && <span className="bestChoice">Gợi ý</span>}
                </div>

                <p className="voucherCondition">{getMinimumText(coupon)}</p>

                <div className="voucherMeta">
                  <span
                    className="customerTag"
                    style={{
                      background: voucher.badgeBg,
                      color: voucher.badgeText,
                    }}
                  >
                    Dành riêng cho bạn
                  </span>

                  <em>Điều kiện</em>
                </div>

                <small className="voucherCode">{coupon.code}</small>
              </div>

              <div className="voucherCheck">
                <span>{isActive ? "✓" : ""}</span>
              </div>
            </button>
          );
        })}
      </div>

      {coupons.length > 3 && (
        <button
          type="button"
          className="toggleMoreBtn"
          onClick={() => setShowAll(!showAll)}
        >
          {showAll ? "Thu gọn" : "Xem thêm"} <b>⌄</b>
        </button>
      )}

      <style>{`
        .voucherPicker {
          font-family: Arial, "Helvetica Neue", sans-serif !important;
        }

        .voucherPicker * {
          box-sizing: border-box;
          font-family: Arial, "Helvetica Neue", sans-serif !important;
        }

        .voucherHeader {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }

        .voucherHeader h3 {
          margin: 0;
          color: #111827;
          font-size: 18px;
          line-height: 1.2;
          font-weight: 900;
        }

        .voucherHeader p {
          margin: 4px 0 0;
          color: #6b7280;
          font-size: 13px;
          line-height: 1.45;
        }

        .voucherHeader span {
          flex: 0 0 auto;
          padding: 6px 10px;
          border-radius: 999px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          color: #374151;
          font-size: 12px;
          font-weight: 800;
        }

        .voucherList {
          display: grid;
          gap: 10px;
        }

        .voucherItem {
          width: 100%;
          min-height: 92px;
          display: grid;
          grid-template-columns: 104px minmax(0, 1fr) 42px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          overflow: hidden;
          background: #ffffff;
          text-align: left;
          cursor: pointer;
          transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
        }

        .voucherItem:hover {
          transform: translateY(-1px);
          border-color: #d1d5db;
          box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);
        }

        .voucherItem.active {
          border-color: #ea580c;
          box-shadow: 0 8px 18px rgba(234, 88, 12, 0.1);
        }

        .voucherLeft {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 12px 8px;
          text-align: center;
          border-right: 1px dashed #d1d5db;
        }

        .voucherLeft::before {
          content: "";
          position: absolute;
          left: -1px;
          top: 0;
          bottom: 0;
          width: 10px;
          background:
            radial-gradient(circle at 0 8px, transparent 6px, #ffffff 7px) 0 0 / 10px 18px repeat-y;
        }

        .voucherLeft strong {
          white-space: pre-line;
          font-size: 19px;
          line-height: 1;
          font-weight: 950;
          letter-spacing: 0.2px;
        }

        .voucherLeft small {
          margin-top: 6px;
          font-size: 11px;
          font-weight: 700;
          opacity: 0.9;
        }

        .voucherBody {
          min-width: 0;
          padding: 12px 12px 10px 14px;
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
          font-size: 16px;
          line-height: 1.25;
          font-weight: 900;
        }

        .bestChoice {
          flex: 0 0 auto;
          padding: 3px 7px;
          border-radius: 999px;
          background: #fff7ed;
          color: #ea580c;
          font-size: 11px;
          font-weight: 800;
        }

        .voucherCondition {
          margin: 0 0 7px;
          color: #4b5563;
          font-size: 13px;
          font-weight: 700;
        }

        .voucherMeta {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 5px;
        }

        .customerTag {
          display: inline-flex;
          align-items: center;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 800;
        }

        .voucherMeta em {
          color: #2563eb;
          font-size: 12px;
          font-style: normal;
          font-weight: 700;
        }

        .voucherCode {
          display: block;
          color: #9ca3af;
          font-size: 11px;
          font-weight: 700;
        }

        .voucherCheck {
          display: grid;
          place-items: center;
          padding: 0 8px;
          background: #ffffff;
        }

        .voucherCheck span {
          width: 24px;
          height: 24px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          border: 2px solid #d1d5db;
          background: #ffffff;
          color: #ffffff;
          font-size: 14px;
          font-weight: 900;
        }

        .voucherItem.active .voucherCheck span {
          border-color: #ea580c;
          background: #ea580c;
        }

        .toggleMoreBtn {
          width: 100%;
          min-height: 36px;
          margin-top: 10px;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          background: #ffffff;
          color: #4b5563;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
        }

        .toggleMoreBtn:hover {
          color: #ea580c;
          border-color: #fed7aa;
          background: #fffaf5;
        }

        .toggleMoreBtn b {
          font-weight: 900;
          color: inherit;
        }

        @media (max-width: 640px) {
          .voucherHeader {
            flex-direction: column;
          }

          .voucherItem {
            grid-template-columns: 88px minmax(0, 1fr) 36px;
            min-height: 84px;
          }

          .voucherLeft {
            padding: 10px 6px;
          }

          .voucherLeft strong {
            font-size: 15px;
          }

          .voucherLeft small {
            font-size: 10px;
          }

          .voucherBody {
            padding: 10px 10px 9px 12px;
          }

          .voucherTop h4 {
            font-size: 14px;
          }

          .voucherCondition,
          .voucherMeta em {
            font-size: 11px;
          }

          .customerTag,
          .voucherCode,
          .bestChoice {
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  );
}
