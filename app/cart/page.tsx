"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type CartItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
};

function formatPrice(price: number) {
  return price.toLocaleString("vi-VN") + "₫";
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    const oldCart = localStorage.getItem("hmecha-cart");
    if (oldCart) {
      setCart(JSON.parse(oldCart));
    }
  }, []);

  function saveCart(newCart: CartItem[]) {
    setCart(newCart);
    localStorage.setItem("hmecha-cart", JSON.stringify(newCart));
  }

  function increase(id: string) {
    const newCart = cart.map((item) =>
      item.id === id ? { ...item, quantity: item.quantity + 1 } : item
    );
    saveCart(newCart);
  }

  function decrease(id: string) {
    const newCart = cart
      .map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      )
      .filter((item) => item.quantity > 0);

    saveCart(newCart);
  }

  function removeItem(id: string) {
    const newCart = cart.filter((item) => item.id !== id);
    saveCart(newCart);
  }

  function clearCart() {
    localStorage.removeItem("hmecha-cart");
    setCart([]);
  }

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const shippingFee = subtotal >= 1000000 || subtotal === 0 ? 0 : 30000;
  const total = subtotal + shippingFee;

  return (
    <main className="cartPage">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">Trang chủ</Link>
          <span>›</span>
          <strong>Giỏ hàng</strong>
        </div>

        <div className="heading">
          <p>HMECHA CART</p>
          <h1>Giỏ hàng của bạn</h1>
          <span>Kiểm tra sản phẩm trước khi đặt hàng.</span>
        </div>

        {cart.length === 0 ? (
          <section className="emptyBox">
            <h2>Giỏ hàng đang trống</h2>
            <p>Chọn vài mẫu Gundam/mecha trước rồi quay lại đây nha.</p>
            <Link href="/products">Xem sản phẩm</Link>
          </section>
        ) : (
          <div className="cartGrid">
            <section className="cartList">
              {cart.map((item) => (
                <article className="cartItem" key={item.id}>
                  <Link href={`/${item.slug}`} className="image">
                    <img src={item.image} alt={item.name} />
                  </Link>

                  <div className="info">
                    <Link href={`/${item.slug}`}>
                      <h2>{item.name}</h2>
                    </Link>

                    <p className="price">{formatPrice(item.price)}</p>

                    <div className="actions">
                      <div className="qty">
                        <button onClick={() => decrease(item.id)}>-</button>
                        <input value={item.quantity} readOnly />
                        <button onClick={() => increase(item.id)}>+</button>
                      </div>

                      <button
                        className="remove"
                        onClick={() => removeItem(item.id)}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>

                  <div className="lineTotal">
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </article>
              ))}

              <button className="clearBtn" onClick={clearCart}>
                Xóa toàn bộ giỏ hàng
              </button>
            </section>

            <aside className="summaryBox">
              <h2>Tóm tắt đơn hàng</h2>

              <div className="summaryLine">
                <span>Tạm tính</span>
                <b>{formatPrice(subtotal)}</b>
              </div>

              <div className="summaryLine">
                <span>Phí vận chuyển</span>
                <b>{shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}</b>
              </div>

              <div className="summaryLine total">
                <span>Tổng cộng</span>
                <b>{formatPrice(total)}</b>
              </div>

              <Link href="/checkout" className="checkoutBtn">
                TIẾN HÀNH THANH TOÁN
              </Link>

              <Link href="/products" className="continueBtn">
                ← Tiếp tục mua hàng
              </Link>
            </aside>
          </div>
        )}
      </div>

      <style>{`
        .cartPage {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(124,77,255,.24), transparent 34%),
            radial-gradient(circle at top right, rgba(0,229,255,.16), transparent 30%),
            linear-gradient(180deg, #050816 0%, #0b1026 45%, #050816 100%);
          color: white;
          padding: 34px 20px 70px;
        }

        .container {
          max-width: 1250px;
          margin: 0 auto;
        }

        .breadcrumb {
          display: flex;
          gap: 10px;
          align-items: center;
          color: #9fb0d8;
          margin-bottom: 26px;
        }

        .breadcrumb a {
          color: #9fb0d8;
          text-decoration: none;
        }

        .breadcrumb strong {
          color: #00e5ff;
        }

        .heading {
          margin-bottom: 28px;
        }

        .heading p {
          margin: 0;
          color: #00e5ff;
          font-weight: 950;
          letter-spacing: 2px;
        }

        .heading h1 {
          margin: 8px 0;
          font-size: 42px;
          line-height: 1.1;
        }

        .heading span {
          color: #b8c4e6;
        }

        .cartGrid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 360px;
          gap: 24px;
          align-items: start;
        }

        .cartList,
        .summaryBox,
        .emptyBox {
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(0,229,255,.2);
          border-radius: 22px;
          box-shadow: 0 0 34px rgba(124,77,255,.12);
          backdrop-filter: blur(8px);
        }

        .cartList {
          padding: 18px;
        }

        .cartItem {
          display: grid;
          grid-template-columns: 120px 1fr auto;
          gap: 18px;
          align-items: center;
          padding: 16px;
          border-radius: 18px;
          background: rgba(0,0,0,.16);
          border: 1px solid rgba(255,255,255,.08);
          margin-bottom: 14px;
        }

        .image img {
          width: 120px;
          height: 120px;
          object-fit: cover;
          border-radius: 14px;
          border: 1px solid rgba(0,229,255,.24);
          display: block;
        }

        .info a {
          color: white;
          text-decoration: none;
        }

        .info h2 {
          margin: 0 0 10px;
          font-size: 20px;
          line-height: 1.3;
        }

        .price {
          color: #ff78d2;
          font-weight: 950;
          font-size: 20px;
          margin: 0 0 14px;
        }

        .actions {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }

        .qty {
          display: flex;
          overflow: hidden;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,.18);
        }

        .qty button {
          width: 40px;
          height: 38px;
          border: none;
          cursor: pointer;
          background: rgba(255,255,255,.14);
          color: white;
          font-size: 18px;
          font-weight: 900;
        }

        .qty input {
          width: 50px;
          border: none;
          text-align: center;
          background: white;
          color: #111827;
          font-weight: 900;
        }

        .remove,
        .clearBtn {
          border: none;
          cursor: pointer;
          border-radius: 10px;
          padding: 10px 14px;
          background: rgba(255,255,255,.1);
          color: #ff8aa8;
          font-weight: 900;
        }

        .lineTotal {
          color: #00e5ff;
          font-weight: 950;
          font-size: 20px;
          white-space: nowrap;
        }

        .clearBtn {
          margin-top: 6px;
        }

        .summaryBox {
          padding: 22px;
          position: sticky;
          top: 20px;
        }

        .summaryBox h2 {
          margin: 0 0 20px;
          font-size: 24px;
        }

        .summaryLine {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding: 14px 0;
          border-bottom: 1px solid rgba(255,255,255,.1);
          color: #dce6ff;
        }

        .summaryLine.total {
          border-bottom: none;
          font-size: 22px;
          margin-top: 8px;
        }

        .summaryLine.total b {
          color: #00e5ff;
          font-size: 28px;
        }

        .checkoutBtn {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 56px;
          margin-top: 18px;
          border-radius: 14px;
          background: linear-gradient(135deg,#e5485b,#c9184a);
          color: white;
          text-decoration: none;
          font-weight: 950;
          box-shadow: 0 0 24px rgba(229,72,91,.32);
        }

        .continueBtn {
          display: block;
          margin-top: 16px;
          color: #00e5ff;
          text-decoration: none;
          font-weight: 900;
          text-align: center;
        }

        .emptyBox {
          padding: 34px;
          text-align: center;
        }

        .emptyBox h2 {
          margin-top: 0;
        }

        .emptyBox p {
          color: #b8c4e6;
        }

        .emptyBox a {
          display: inline-flex;
          margin-top: 12px;
          padding: 14px 22px;
          border-radius: 14px;
          background: linear-gradient(135deg,#7c4dff,#00e5ff);
          color: #050816;
          text-decoration: none;
          font-weight: 950;
        }

        @media (max-width: 900px) {
          .cartGrid {
            grid-template-columns: 1fr;
          }

          .summaryBox {
            position: static;
          }
        }

        @media (max-width: 620px) {
          .cartItem {
            grid-template-columns: 90px 1fr;
          }

          .image img {
            width: 90px;
            height: 90px;
          }

          .lineTotal {
            grid-column: 1 / -1;
          }
        }
      `}</style>
    </main>
  );
}