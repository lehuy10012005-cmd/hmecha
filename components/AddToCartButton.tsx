"use client";

import { useState } from "react";
import type { Product } from "../data/products";

function isUnavailableStatus(status: string) {
  const value = String(status || "").toLowerCase();

  return (
    value.includes("hết hàng") ||
    value.includes("het hang") ||
    value.includes("preorder") ||
    value.includes("đặt trước") ||
    value.includes("dat truoc") ||
    value.includes("sắp về") ||
    value.includes("sap ve")
  );
}

export default function AddToCartButton({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifyMessage, setNotifyMessage] = useState("");

  const isOutOfStock = isUnavailableStatus(product.status);

  function saveToCart(goToCheckout = false) {
    const oldCart = localStorage.getItem("hmecha-cart");
    const cart = oldCart ? JSON.parse(oldCart) : [];

    const existingItem = cart.find((item: any) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: product.images[0],
        quantity,
      });
    }

    localStorage.setItem("hmecha-cart", JSON.stringify(cart));

    if (goToCheckout) {
      window.location.href = "/checkout";
    } else {
      alert("Đã thêm vào giỏ hàng!");
    }
  }

  async function submitNotification() {
    const email = notifyEmail.trim();

    if (!email) {
      setNotifyMessage("Bạn nhập email để HMECHA báo khi sản phẩm có hàng nhé.");
      return;
    }

    setNotifyLoading(true);
    setNotifyMessage("");

    try {
      const response = await fetch("/api/product-notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          productId: product.id,
          productName: product.name,
          productSlug: product.slug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Không đăng ký được thông báo.");
      }

      setNotifyMessage(data?.message || "Đã ghi nhận email của bạn.");
      setNotifyEmail("");
    } catch (error: any) {
      setNotifyMessage(error?.message || "Không đăng ký được thông báo.");
    } finally {
      setNotifyLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 20 }}>
      {!isOutOfStock ? (
        <>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 18,
            }}
          >
            <b style={{ color: "white", fontSize: 16 }}>Số lượng:</b>

            <div
              style={{
                display: "flex",
                borderRadius: 8,
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,.25)",
              }}
            >
              <button
                type="button"
                onClick={() => setQuantity((v) => Math.max(1, v - 1))}
                style={{
                  width: 46,
                  height: 42,
                  border: "none",
                  background: "#e5e7eb",
                  color: "#111827",
                  fontSize: 20,
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                -
              </button>

              <input
                value={quantity}
                readOnly
                style={{
                  width: 58,
                  height: 42,
                  border: "none",
                  textAlign: "center",
                  fontWeight: 900,
                  fontSize: 16,
                }}
              />

              <button
                type="button"
                onClick={() => setQuantity((v) => v + 1)}
                style={{
                  width: 46,
                  height: 42,
                  border: "none",
                  background: "#e5e7eb",
                  color: "#111827",
                  fontSize: 20,
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                +
              </button>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: 12,
            }}
          >
            <button
              type="button"
              data-hmecha-event="buy_now"
              onClick={() => saveToCart(true)}
              style={{
                minHeight: 64,
                border: "none",
                borderRadius: 10,
                background: "linear-gradient(135deg,#e5485b,#c9184a)",
                color: "white",
                cursor: "pointer",
                fontWeight: 900,
                boxShadow: "0 0 24px rgba(229,72,91,.35)",
              }}
            >
              🛒 MUA NGAY
            </button>

            <button
              type="button"
              data-hmecha-event="add_to_cart"
              onClick={() => saveToCart(false)}
              style={{
                minHeight: 64,
                border: "none",
                borderRadius: 10,
                background: "linear-gradient(135deg,#ffd21f,#ffb700)",
                color: "#111827",
                cursor: "pointer",
                fontSize: 16,
                fontWeight: 950,
                boxShadow: "0 0 24px rgba(255,210,31,.3)",
              }}
            >
              THÊM VÀO GIỎ HÀNG
            </button>
          </div>
        </>
      ) : (
        <div
          style={{
            border: "1px solid rgba(0,229,255,.28)",
            background:
              "linear-gradient(135deg, rgba(0,229,255,.12), rgba(124,77,255,.12))",
            borderRadius: 18,
            padding: 18,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              padding: "7px 11px",
              borderRadius: 999,
              background: "rgba(255,255,255,.12)",
              color: "#00e5ff",
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: 1.5,
              marginBottom: 12,
            }}
          >
            PREORDER / RESTOCK ALERT
          </div>

          <h3
            style={{
              margin: "0 0 8px",
              color: "white",
              fontSize: 22,
              lineHeight: 1.2,
            }}
          >
            Sản phẩm hiện chưa sẵn hàng
          </h3>

          <p
            style={{
              margin: "0 0 16px",
              color: "#c5d2f2",
              lineHeight: 1.7,
            }}
          >
            Nhập email để HMECHA thông báo khi sản phẩm có hàng lại hoặc mở preorder.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 10,
            }}
          >
            <input
              value={notifyEmail}
              onChange={(event) => setNotifyEmail(event.target.value)}
              placeholder="Email của bạn"
              type="email"
              style={{
                minHeight: 48,
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,.18)",
                background: "rgba(255,255,255,.08)",
                color: "white",
                padding: "0 14px",
                outline: "none",
                fontWeight: 700,
              }}
            />

            <button
              type="button"
              disabled={notifyLoading}
              onClick={submitNotification}
              style={{
                minHeight: 48,
                border: "none",
                borderRadius: 12,
                padding: "0 16px",
                background: "linear-gradient(135deg,#00e5ff,#7c4dff)",
                color: "#050816",
                cursor: notifyLoading ? "not-allowed" : "pointer",
                fontWeight: 950,
                whiteSpace: "nowrap",
              }}
            >
              {notifyLoading ? "Đang gửi..." : "Nhận thông báo"}
            </button>
          </div>

          {notifyMessage ? (
            <p
              style={{
                margin: "12px 0 0",
                color: notifyMessage.includes("Đã") ? "#86efac" : "#fecaca",
                fontWeight: 800,
                lineHeight: 1.5,
              }}
            >
              {notifyMessage}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}