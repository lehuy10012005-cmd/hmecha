"use client";

import { useEffect, useState } from "react";

type Reward = {
  id: string;
  title: string;
  description: string | null;
  required_points: number;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
};

function money(value: number) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

function rewardValue(reward: Reward) {
  if (reward.discount_type === "free_shipping") return "Freeship";
  if (reward.discount_type === "percent") return "Giảm " + reward.discount_value + "%";
  return "Giảm " + money(reward.discount_value);
}

export default function PointExchangePanel() {
  const [points, setPoints] = useState(0);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState("");

  async function loadRewards() {
    setLoading(true);

    const response = await fetch("/api/account/rewards", { cache: "no-store" });
    const data = await response.json();

    if (response.ok) {
      setPoints(Number(data.points?.points || 0));
      setRewards(data.rewards || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadRewards();
  }, []);

  async function redeem(rewardId: string) {
    setRedeemingId(rewardId);

    const response = await fetch("/api/account/rewards", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rewardId }),
    });

    const data = await response.json();
    setRedeemingId("");

    if (!response.ok) {
      alert(data.message || "Không đổi được voucher.");
      return;
    }

    alert(data.message || "Đổi điểm thành công.");
    loadRewards();
    window.dispatchEvent(new Event("hmecha-vouchers-updated"));
  }

  if (loading) {
    return (
      <section className="pointExchange">
        <p>Đang tải quà đổi điểm...</p>
      </section>
    );
  }

  return (
    <section className="pointExchange">
      <div className="exchangeHead">
        <div>
          <p>HMECHA REWARD</p>
          <h2>Đổi điểm lấy voucher</h2>
          <span>Mỗi voucher đổi từ điểm sẽ là mã cá nhân của riêng tài khoản này.</span>
        </div>

        <div className="pointBadge">
          <span>Điểm hiện có</span>
          <strong>{points}</strong>
        </div>
      </div>

      <div className="rewardGrid">
        {rewards.map((reward) => {
          const canRedeem = points >= Number(reward.required_points || 0);

          return (
            <article className={canRedeem ? "rewardCard" : "rewardCard locked"} key={reward.id}>
              <div className="rewardIcon">🎟️</div>

              <div>
                <strong>{rewardValue(reward)}</strong>
                <h3>{reward.title}</h3>
                <p>{reward.description || "Voucher dành cho thành viên HMECHA."}</p>

                <div className="rewardMeta">
                  <span>Cần {reward.required_points} điểm</span>
                  <span>Đơn từ {money(reward.min_order_amount)}</span>
                </div>
              </div>

              <button
                type="button"
                disabled={!canRedeem || redeemingId === reward.id}
                onClick={() => redeem(reward.id)}
              >
                {redeemingId === reward.id
                  ? "Đang đổi..."
                  : canRedeem
                  ? "Đổi ngay"
                  : "Chưa đủ điểm"}
              </button>
            </article>
          );
        })}
      </div>

      <style>{`
        .pointExchange {
          margin-top: 24px;
          color: #ffffff;
          border: 1px solid rgba(0, 229, 255, 0.2);
          border-radius: 24px;
          padding: 22px;
          background:
            radial-gradient(circle at 0% 0%, rgba(124, 77, 255, 0.18), transparent 34%),
            rgba(7, 12, 32, 0.84);
          box-shadow: 0 18px 42px rgba(0,0,0,.22);
        }

        .exchangeHead {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: stretch;
          margin-bottom: 18px;
        }

        .exchangeHead p {
          margin: 0 0 8px;
          color: #00e5ff;
          font-weight: 950;
          letter-spacing: 3px;
          font-size: 12px;
        }

        .exchangeHead h2 {
          margin: 0;
          font-size: clamp(28px, 4vw, 42px);
        }

        .exchangeHead span {
          color: #c5d2f2;
          display: block;
          margin-top: 8px;
        }

        .pointBadge {
          min-width: 180px;
          border-radius: 18px;
          padding: 16px;
          background: linear-gradient(135deg, rgba(124,77,255,.35), rgba(0,229,255,.2));
          border: 1px solid rgba(0,229,255,.22);
        }

        .pointBadge span {
          color: #9fb0d8;
          margin: 0;
        }

        .pointBadge strong {
          display: block;
          color: #00e5ff;
          font-size: 40px;
          line-height: 1.1;
          margin-top: 8px;
        }

        .rewardGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .rewardCard {
          display: grid;
          grid-template-columns: 64px 1fr auto;
          gap: 14px;
          align-items: center;
          border-radius: 20px;
          padding: 16px;
          background: rgba(255,255,255,.045);
          border: 1px solid rgba(0,229,255,.18);
        }

        .rewardCard.locked {
          opacity: .62;
        }

        .rewardIcon {
          width: 64px;
          height: 64px;
          display: grid;
          place-items: center;
          border-radius: 18px;
          font-size: 30px;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
        }

        .rewardCard strong {
          display: block;
          color: #00e5ff;
          font-size: 20px;
          margin-bottom: 4px;
        }

        .rewardCard h3 {
          margin: 0;
          font-size: 18px;
        }

        .rewardCard p {
          margin: 8px 0;
          color: #c5d2f2;
          line-height: 1.5;
        }

        .rewardMeta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .rewardMeta span {
          color: #dce6ff;
          font-size: 13px;
          padding: 7px 10px;
          border-radius: 999px;
          background: rgba(0,229,255,.08);
          border: 1px solid rgba(0,229,255,.14);
        }

        .rewardCard button {
          min-height: 44px;
          border: 0;
          border-radius: 13px;
          padding: 0 16px;
          font-weight: 950;
          cursor: pointer;
          color: #061020;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
        }

        .rewardCard button:disabled {
          cursor: not-allowed;
          opacity: .65;
        }

        @media (max-width: 980px) {
          .exchangeHead,
          .rewardCard {
            grid-template-columns: 1fr;
            flex-direction: column;
          }

          .rewardGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
