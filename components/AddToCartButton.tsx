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
        image: Array.isArray(product.images) ? product.images[0] : "",
        quantity,
      });
    }

    localStorage.setItem("hmecha-cart", JSON.stringify(cart));

    if (goToCheckout) {
      window.location.href = "/checkout";
    } else {
      alert("Đã thêm sản phẩm vào giỏ hàng.");
    }
  }

  const isOutOfStock = product.status === "Hết hàng";

  return (
    <div className="cartBox">
      <div className="qtyRow">
        <span>Số lượng</span>

        <div className="qtyControl">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          >
            -
          </button>

          <input value={quantity} readOnly aria-label="Số lượng" />

          <button type="button" onClick={() => setQuantity((value) => value + 1)}>
            +
          </button>
        </div>
      </div>

      <div className="actionGrid">
        <button
          type="button"
          disabled={isOutOfStock}
          data-hmecha-event="buy_now"
          className="buyNow"
          onClick={() => saveToCart(true)}
        >
          Mua ngay
          <small>Đặt hàng và thanh toán</small>
        </button>

        <button
          type="button"
          disabled={isOutOfStock}
          data-hmecha-event="add_to_cart"
          className="addCart"
          onClick={() => saveToCart(false)}
        >
          {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ"}
        </button>
      </div>

      <style jsx>{`
        .cartBox {
          margin-top: 22px;
        }

        .qtyRow {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 16px;
          color: #374151;
          font-size: 15px;
          font-weight: 700;
        }

        .qtyControl {
          display: inline-flex;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          background: #ffffff;
        }

        .qtyControl button {
          width: 42px;
          height: 40px;
          border: 0;
          background: #f3f4f6;
          color: #111827;
          font-size: 18px;
          font-weight: 900;
          cursor: pointer;
        }

        .qtyControl input {
          width: 56px;
          height: 40px;
          border: 0;
          text-align: center;
          font-size: 15px;
          font-weight: 900;
          color: #111827;
          background: #ffffff;
        }

        .actionGrid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 12px;
        }

        .buyNow,
        .addCart {
          min-height: 56px;
          border: 0;
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 900;
          transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
        }

        .buyNow {
          display: grid;
          place-items: center;
          gap: 2px;
          background: #d32f2f;
          color: #ffffff;
          box-shadow: 0 10px 20px rgba(211, 47, 47, 0.2);
        }

        .buyNow small {
          font-size: 11px;
          font-weight: 600;
          opacity: 0.9;
        }

        .addCart {
          background: #111827;
          color: #ffffff;
          box-shadow: 0 10px 20px rgba(17, 24, 39, 0.14);
        }

        .buyNow:hover,
        .addCart:hover {
          transform: translateY(-1px);
        }

        .buyNow:hover {
          background: #b91c1c;
        }

        .addCart:hover {
          background: #000000;
        }

        .buyNow:disabled,
        .addCart:disabled {
          opacity: 0.55;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 560px) {
          .qtyRow {
            align-items: flex-start;
            flex-direction: column;
          }

          .actionGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
