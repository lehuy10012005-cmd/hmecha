"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  orderId: string;
};

export default function CustomerCancelOrderButton({ orderId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function cancelOrder() {
    const ok = window.confirm(
      "Bạn chắc chắn muốn hủy đơn này? Sau khi hủy, shop sẽ không xử lý đơn nữa."
    );

    if (!ok) return;

    setLoading(true);

    try {
      const response = await fetch("/api/account/orders/cancel", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Không hủy được đơn hàng.");
        return;
      }

      alert(result.message || "Đã hủy đơn hàng.");
      router.refresh();
    } catch {
      alert("Lỗi kết nối khi hủy đơn hàng.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      style={{
        marginBottom: 18,
        border: "1px solid rgba(255,80,120,.35)",
        borderRadius: 18,
        padding: 18,
        background: "rgba(120,20,45,.16)",
        display: "flex",
        justifyContent: "space-between",
        gap: 16,
        alignItems: "center",
        flexWrap: "wrap",
      }}
    >
      <div>
        <strong style={{ display: "block", color: "#ffffff", marginBottom: 6 }}>
          Bạn muốn hủy đơn?
        </strong>
        <span style={{ color: "#f9c6d3", fontSize: 14 }}>
          Chỉ hủy được khi đơn chưa được shop xác nhận hoặc chưa thanh toán.
        </span>
      </div>

      <button
        type="button"
        onClick={cancelOrder}
        disabled={loading}
        style={{
          minHeight: 42,
          border: 0,
          borderRadius: 999,
          padding: "0 18px",
          cursor: loading ? "not-allowed" : "pointer",
          color: "#ffffff",
          fontWeight: 950,
          background: loading
            ? "rgba(148,163,184,.5)"
            : "linear-gradient(135deg,#ef4444,#be123c)",
        }}
      >
        {loading ? "Đang hủy..." : "Hủy đơn hàng"}
      </button>
    </section>
  );
}