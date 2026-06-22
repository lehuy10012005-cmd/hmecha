"use client";

import { useState } from "react";

type Props = {
  productId?: string;
  productName?: string;
  productSlug?: string;
};

export default function MarketingSubscribeBox({
  productId,
  productName,
  productSlug,
}: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit() {
    const cleanEmail = email.trim();

    if (!cleanEmail) {
      setMessage("Bạn nhập email để nhận mã giảm giá và thông báo flash sale nhé.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/marketing-subscribers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: cleanEmail,
          source: "product_page",
          productId,
          productName,
          productSlug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Không đăng ký được.");
      }

      setMessage(data?.message || "Đã đăng ký nhận khuyến mãi.");
      setEmail("");
    } catch (error: any) {
      setMessage(error?.message || "Không đăng ký được.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="marketingSubscribeBox">
      <div className="marketingTag">PROMOTION ALERT</div>

      <h3>Nhận thông báo khuyến mãi</h3>

      <p>
        Nhập email để HMECHA gửi mã giảm giá, flash sale, hàng mới về và ưu đãi
        riêng cho khách quay lại.
      </p>

      <div className="marketingForm">
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          placeholder="Email của bạn"
        />

        <button type="button" disabled={loading} onClick={submit}>
          {loading ? "Đang gửi..." : "Đăng ký"}
        </button>
      </div>

      {message ? <span className="marketingMessage">{message}</span> : null}
    </div>
  );
}