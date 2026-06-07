"use client";

import { useEffect, useMemo, useState } from "react";

type VoucherStatus = "available" | "locked" | "used";

type Voucher = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  discountType: string;
  discountValue: number;
  maxDiscount: number | null;
  minOrderAmount: number;
  requirementText: string;
  status: VoucherStatus;
  usedAt: string | null;
  usedDiscountAmount: number;
};

type Points = {
  points: number;
  lifetimePoints: number;
  lifetimeSpent: number;
  completedOrders: number;
  completedItems: number;
  tier: string;
};

function money(value: number) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

function getVoucherIcon(code: string) {
  if (code.includes("WELCOME")) return "🎁";
  if (code.includes("GUNDAM")) return "🤖";
  if (code.includes("SHIP")) return "🚚";
  return "🎟️";
}

function statusText(status: VoucherStatus) {
  if (status === "available") return "Có thể dùng";
  if (status === "used") return "Đã dùng";
  return "Chưa mở khóa";
}

export default function CustomerVoucherPanel() {
  const [points, setPoints] = useState<Points | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState("");
  const [tab, setTab] = useState<"available" | "locked" | "used">("available");

  async function loadData() {
    setLoading(true);

    try {
      const response = await fetch("/api/account/vouchers", { cache: "no-store" });
      const data = await response.json();

      setPoints(data.points || null);
      setVouchers(data.vouchers || []);
    } catch {
      setPoints(null);
      setVouchers([]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const grouped = useMemo(() => {
    return {
      available: vouchers.filter((voucher) => voucher.status === "available"),
      locked: vouchers.filter((voucher) => voucher.status === "locked"),
      used: vouchers.filter((voucher) => voucher.status === "used"),
    };
  }, [vouchers]);

  const visibleVouchers = grouped[tab];

  async function copyCode(code: string) {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);

    window.setTimeout(() => setCopiedCode(""), 1500);
  }

  if (loading) {
    return (
      <section className="customerVoucherPanel">
        <div className="loadingBox">Đang tải voucher của bạn...</div>
      </section>
    );
  }

  return (
    <section className="customerVoucherPanel">
      <div className="voucherHero">
        <div>
          <p>HMECHA MEMBER</p>
          <h2>Voucher & điểm tích lũy</h2>
          <span>
            Theo dõi ưu đãi đang có, mã đã dùng và các voucher cần mở khóa.
          </span>
        </div>

        <div className="pointsCard">
          <span>Điểm hiện có</span>
          <strong>{points?.points || 0}</strong>
          <em>{points?.tier || "Rookie Builder"}</em>
        </div>
      </div>

      <div className="miniStats">
        <div>
          <span>Đơn hoàn thành</span>
          <strong>{points?.completedOrders || 0}</strong>
        </div>

        <div>
          <span>Sản phẩm đã mua</span>
          <strong>{points?.completedItems || 0}</strong>
        </div>

        <div>
          <span>Tổng chi tiêu</span>
          <strong>{money(points?.lifetimeSpent || 0)}</strong>
        </div>

        <div>
          <span>Điểm trọn đời</span>
          <strong>{points?.lifetimePoints || 0}</strong>
        </div>
      </div>

      <div className="voucherTabs">
        <button
          type="button"
          className={tab === "available" ? "active" : ""}
          onClick={() => setTab("available")}
        >
          Có thể dùng ({grouped.available.length})
        </button>

        <button
          type="button"
          className={tab === "locked" ? "active" : ""}
          onClick={() => setTab("locked")}
        >
          Chưa mở khóa ({grouped.locked.length})
        </button>

        <button
          type="button"
          className={tab === "used" ? "active" : ""}
          onClick={() => setTab("used")}
        >
          Đã dùng ({grouped.used.length})
        </button>
      </div>

      {visibleVouchers.length === 0 ? (
        <div className="emptyVoucher">
          Chưa có voucher trong mục này.
        </div>
      ) : (
        <div className="voucherGrid">
          {visibleVouchers.map((voucher) => (
            <article className={`voucherCard ${voucher.status}`} key={voucher.id}>
              <div className="ticketIcon">{getVoucherIcon(voucher.code)}</div>

              <div className="ticketBody">
                <div className="ticketTop">
                  <div>
                    <strong>{voucher.code}</strong>
                    <h3>{voucher.title}</h3>
                  </div>

                  <span>{statusText(voucher.status)}</span>
                </div>

                <p>{voucher.description || "Ưu đãi dành cho khách hàng HMECHA."}</p>

                <div className="requirement">
                  {voucher.requirementText}
                </div>

                <div className="ticketActions">
                  {voucher.status === "available" ? (
                    <button type="button" onClick={() => copyCode(voucher.code)}>
                      {copiedCode === voucher.code ? "Đã sao chép" : "Sao chép mã"}
                    </button>
                  ) : voucher.status === "used" ? (
                    <small>
                      Đã dùng{voucher.usedDiscountAmount ? ` · Giảm ${money(voucher.usedDiscountAmount)}` : ""}
                    </small>
                  ) : (
                    <small>Cần đạt điều kiện để mở khóa.</small>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="pointNote">
        <b>Gợi ý tích điểm:</b> Sau này khi đơn chuyển sang trạng thái Hoàn thành,
        hệ thống có thể cộng điểm theo quy đổi 10.000đ = 1 điểm.
      </div>

      <style>{`
        .customerVoucherPanel {
          display: grid;
          gap: 18px;
          color: #ffffff;
        }

        .voucherHero,
        .miniStats div,
        .voucherCard,
        .emptyVoucher,
        .pointNote,
        .loadingBox {
          border: 1px solid rgba(0, 229, 255, 0.2);
          background:
            radial-gradient(circle at 0% 0%, rgba(124, 77, 255, 0.16), transparent 34%),
            rgba(7, 12, 32, 0.82);
          box-shadow: 0 18px 42px rgba(0,0,0,.22);
        }

        .voucherHero {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: stretch;
          padding: 24px;
          border-radius: 24px;
        }

        .voucherHero p {
          margin: 0 0 8px;
          color: #00e5ff;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 3px;
        }

        .voucherHero h2 {
          margin: 0;
          font-size: clamp(28px, 4vw, 44px);
          line-height: 1.1;
        }

        .voucherHero span {
          display: block;
          margin-top: 10px;
          color: #c5d2f2;
          line-height: 1.6;
        }

        .pointsCard {
          min-width: 210px;
          padding: 18px;
          border-radius: 18px;
          background: linear-gradient(135deg, rgba(124,77,255,.28), rgba(0,229,255,.18));
          border: 1px solid rgba(0,229,255,.22);
        }

        .pointsCard span,
        .miniStats span {
          display: block;
          color: #9fb0d8;
          margin-bottom: 8px;
        }

        .pointsCard strong {
          display: block;
          color: #00e5ff;
          font-size: 42px;
          line-height: 1;
        }

        .pointsCard em {
          display: inline-flex;
          margin-top: 12px;
          color: #061020;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
          border-radius: 999px;
          padding: 7px 12px;
          font-style: normal;
          font-weight: 950;
        }

        .miniStats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .miniStats div {
          padding: 18px;
          border-radius: 18px;
        }

        .miniStats strong {
          color: #00e5ff;
          font-size: 23px;
        }

        .voucherTabs {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .voucherTabs button {
          min-height: 42px;
          padding: 0 16px;
          border-radius: 999px;
          border: 1px solid rgba(0, 229, 255, 0.22);
          background: rgba(5, 8, 22, 0.78);
          color: #dce6ff;
          font-weight: 850;
          cursor: pointer;
        }

        .voucherTabs button.active,
        .voucherTabs button:hover {
          color: #061020;
          border-color: #00e5ff;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
        }

        .voucherGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .voucherCard {
          position: relative;
          overflow: hidden;
          display: grid;
          grid-template-columns: 76px 1fr;
          gap: 14px;
          padding: 16px;
          border-radius: 20px;
        }

        .voucherCard::before,
        .voucherCard::after {
          content: "";
          position: absolute;
          top: 50%;
          width: 24px;
          height: 24px;
          border-radius: 999px;
          background: #050816;
          transform: translateY(-50%);
        }

        .voucherCard::before {
          left: -12px;
        }

        .voucherCard::after {
          right: -12px;
        }

        .voucherCard.locked,
        .voucherCard.used {
          opacity: 0.68;
        }

        .ticketIcon {
          min-height: 92px;
          display: grid;
          place-items: center;
          border-radius: 16px;
          font-size: 34px;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
        }

        .ticketTop {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
        }

        .ticketTop strong {
          display: block;
          color: #00e5ff;
          font-size: 18px;
          margin-bottom: 4px;
        }

        .ticketTop h3 {
          margin: 0;
          font-size: 18px;
        }

        .ticketTop span {
          flex: 0 0 auto;
          padding: 6px 10px;
          border-radius: 999px;
          color: #061020;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
          font-size: 12px;
          font-weight: 950;
        }

        .ticketBody p {
          margin: 10px 0;
          color: #c5d2f2;
          line-height: 1.55;
        }

        .requirement {
          padding: 10px 12px;
          border-radius: 12px;
          color: #9ff6ff;
          background: rgba(0, 229, 255, 0.08);
          border: 1px solid rgba(0, 229, 255, 0.14);
          font-size: 13px;
          line-height: 1.45;
        }

        .ticketActions {
          margin-top: 12px;
        }

        .ticketActions button {
          min-height: 38px;
          border: 0;
          border-radius: 11px;
          padding: 0 14px;
          color: #061020;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
          font-weight: 950;
          cursor: pointer;
        }

        .ticketActions small {
          color: #9fb0d8;
        }

        .emptyVoucher,
        .pointNote,
        .loadingBox {
          padding: 20px;
          border-radius: 18px;
          color: #c5d2f2;
          line-height: 1.6;
        }

        .pointNote b {
          color: #00e5ff;
        }

        @media (max-width: 900px) {
          .voucherHero {
            flex-direction: column;
          }

          .miniStats,
          .voucherGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}