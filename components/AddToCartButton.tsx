"use client";

import { useState } from "react";
import type { Product } from "../data/products";

export default function AddToCartButton({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);

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

  const isOutOfStock = product.status === "Hết hàng";

  return (
    <div style={{ marginTop: 20 }}>
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
          disabled={isOutOfStock}
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
          <div style={{ fontSize: 18 }}>🛒 MUA NGAY</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>
            Giao hàng tận nơi hoặc nhận tại cửa hàng
          </div>
        </button>

        <button
          type="button"
          disabled={isOutOfStock}
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
          {isOutOfStock ? "HẾT HÀNG" : "THÊM VÀO GIỎ HÀNG"}
        </button>
      </div>
    </div>
  );
}