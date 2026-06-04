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

type PaymentMethod = "vnpay" | "cod";

function formatPrice(price: number) {
  return Number(price || 0).toLocaleString("vi-VN") + "₫";
}


export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [placing, setPlacing] = useState(false);

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    note: "",
    payment: "vnpay" as PaymentMethod,
  });

  useEffect(() => {
    const savedCart = localStorage.getItem("hmecha-cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    fetch("/api/account/profile")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!data?.profile) return;
        setCustomer((current) => ({
          ...current,
          name: current.name || data.profile.full_name || "",
          phone: current.phone || data.profile.phone || "",
          email: current.email || data.profile.email || "",
        }));
      })
      .catch(() => undefined);
  }, []);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const shippingFee = subtotal >= 1000000 || subtotal === 0 ? 0 : 30000;
  const total = subtotal + shippingFee;

  function updateCustomer(field: keyof typeof customer, value: string) {
    setCustomer((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function placeOrder() {
    if (placing) return;

    if (cart.length === 0) {
      alert("Giỏ hàng đang trống.");
      return;
    }

    if (!customer.name || !customer.phone || !customer.address) {
      alert("Vui lòng nhập họ tên, số điện thoại và địa chỉ.");
      return;
    }

    setPlacing(true);

    if (customer.payment === "vnpay") {
      try {
        const response = await fetch("/api/checkout/vnpay", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cart,
            customer: {
              ...customer,
              payment: "vnpay",
            },
          }),
        });

        const data = await response.json();

        if (response.status === 401) {
          window.location.href = "/dang-nhap?next=/checkout";
          return;
        }

        if (!response.ok) {
          setPlacing(false);
          alert(data.message || "Không tạo được thanh toán VNPAY.");
          return;
        }

        localStorage.removeItem("hmecha-cart");

        // Mở VNPAY ở cửa sổ chính, tránh bị chặn iframe.
        window.open(data.paymentUrl, "_top");
        return;
      } catch (error) {
        setPlacing(false);
        alert("Lỗi kết nối tới VNPAY.");
        return;
      }
    }

    try {
      const response = await fetch("/api/checkout/cod", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, customer: { ...customer, payment: "cod" } }),
      });
      const data = await response.json();
      if (response.status === 401) {
        window.location.href = "/dang-nhap?next=/checkout";
        return;
      }
      if (!response.ok) {
        setPlacing(false);
        alert(data.message || "Không tạo được đơn COD.");
        return;
      }
      localStorage.removeItem("hmecha-cart");
      window.open(data.successUrl, "_top");
    } catch {
      setPlacing(false);
      alert("Lỗi kết nối khi tạo đơn COD.");
    }
  }

  return (
    <main className="checkoutPage">
      <div className="container">
        <div className="top">
          <Link href="/" className="backLink">
            ← Về trang chủ
          </Link>

          <div>
            <p>HMECHA CHECKOUT</p>
            <h1>Thanh toán đơn hàng</h1>
            <span>Chọn COD hoặc thanh toán VNPAY Sandbox.</span>
          </div>
        </div>

        <div className="checkoutGrid">
          <section className="formBox">
            <h2>Thông tin mua hàng</h2>

            <div className="inputGrid">
              <input
                placeholder="Họ và tên"
                value={customer.name}
                onChange={(e) => updateCustomer("name", e.target.value)}
              />

              <input
                placeholder="Số điện thoại"
                value={customer.phone}
                onChange={(e) => updateCustomer("phone", e.target.value)}
              />

              <input
                placeholder="Email"
                value={customer.email}
                onChange={(e) => updateCustomer("email", e.target.value)}
              />

              <input
                placeholder="Địa chỉ nhận hàng"
                value={customer.address}
                onChange={(e) => updateCustomer("address", e.target.value)}
              />

              <textarea
                placeholder="Ghi chú đơn hàng"
                value={customer.note}
                onChange={(e) => updateCustomer("note", e.target.value)}
              />
            </div>

            <h2>Hình thức thanh toán</h2>

            <div className="paymentBox">
              <label className={customer.payment === "vnpay" ? "active" : ""}>
                <input
                  type="radio"
                  name="payment"
                  checked={customer.payment === "vnpay"}
                  onChange={() => updateCustomer("payment", "vnpay")}
                />
                <span>
                  <b>Thanh toán VNPAY Sandbox / QR</b>
                  <small>
                    Chuyển sang cổng VNPAY để quét QR hoặc dùng thẻ test.
                  </small>
                </span>
              </label>

              <label className={customer.payment === "cod" ? "active" : ""}>
                <input
                  type="radio"
                  name="payment"
                  checked={customer.payment === "cod"}
                  onChange={() => updateCustomer("payment", "cod")}
                />
                <span>
                  <b>Thanh toán khi nhận hàng</b>
                  <small>COD - HMECHA sẽ gọi xác nhận trước khi giao.</small>
                </span>
              </label>
            </div>

            {customer.payment === "vnpay" && (
              <div className="noticeBox">
                <b>Demo VNPAY Sandbox</b>
                <p>
                  Sau khi bấm thanh toán, hệ thống sẽ chuyển bạn sang trang
                  VNPAY sandbox. Bạn dùng thẻ test NCB để mô phỏng thanh toán,
                  không dùng tiền thật.
                </p>
              </div>
            )}

            {customer.payment === "cod" && (
              <div className="noticeBox">
                <b>Thanh toán COD</b>
                <p>
                  Đơn hàng sẽ được lưu vào hệ thống với trạng thái “Chờ xác
                  nhận”. Admin xử lý đơn trong trang quản trị.
                </p>
              </div>
            )}
          </section>

          <aside className="orderBox">
            <h2>Đơn hàng ({cart.length} sản phẩm)</h2>

            {cart.length === 0 ? (
              <div className="empty">
                <p>Giỏ hàng đang trống.</p>
                <Link href="/">Về trang chủ</Link>
              </div>
            ) : (
              <>
                <div className="items">
                  {cart.map((item) => (
                    <div className="item" key={item.id}>
                      <div className="imgWrap">
                        <img src={item.image} alt={item.name} />
                        <span>{item.quantity}</span>
                      </div>

                      <div className="itemInfo">
                        <h3>{item.name}</h3>
                        <p>{formatPrice(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="summary">
                  <div>
                    <span>Tạm tính</span>
                    <b>{formatPrice(subtotal)}</b>
                  </div>

                  <div>
                    <span>Phí vận chuyển</span>
                    <b>
                      {shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}
                    </b>
                  </div>

                  <div>
                    <span>Phương thức</span>
                    <b>
                      {customer.payment === "vnpay" ? "VNPAY / QR" : "COD"}
                    </b>
                  </div>

                  <div className="total">
                    <span>Tổng cộng</span>
                    <b>{formatPrice(total)}</b>
                  </div>
                </div>

                <button className="orderBtn" onClick={placeOrder} disabled={placing}>
                  {placing
                    ? customer.payment === "vnpay"
                      ? "ĐANG CHUYỂN SANG VNPAY..."
                      : "ĐANG TẠO ĐƠN COD..."
                    : customer.payment === "vnpay"
                    ? "THANH TOÁN QUA VNPAY / QR"
                    : "ĐẶT HÀNG COD"}
                </button>

                <Link href="/cart" className="cartLink">
                  ← Quay về giỏ hàng
                </Link>
              </>
            )}
          </aside>
        </div>
      </div>

      <style>{`
        .checkoutPage {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(124,77,255,.22), transparent 32%),
            radial-gradient(circle at top right, rgba(0,229,255,.15), transparent 30%),
            linear-gradient(180deg, #050816 0%, #0b1026 48%, #050816 100%);
          color: #ffffff;
          padding: 34px 20px 70px;
        }

        .container {
          max-width: 1250px;
          margin: 0 auto;
        }

        .top {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: flex-start;
          margin-bottom: 30px;
        }

        .backLink {
          color: #00e5ff;
          text-decoration: none;
          font-weight: 900;
        }

        .top p {
          margin: 0;
          color: #00e5ff;
          font-weight: 950;
          letter-spacing: 2px;
          text-align: right;
        }

        .top h1 {
          margin: 8px 0;
          font-size: 42px;
          line-height: 1.1;
          text-align: right;
        }

        .top span {
          color: #b8c4e6;
        }

        .checkoutGrid {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(360px, .9fr);
          gap: 26px;
          align-items: start;
        }

        .formBox,
        .orderBox {
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(0,229,255,.2);
          border-radius: 22px;
          box-shadow: 0 0 34px rgba(124,77,255,.12);
          backdrop-filter: blur(8px);
        }

        .formBox {
          padding: 26px;
        }

        .formBox h2,
        .orderBox h2 {
          margin: 0 0 18px;
          font-size: 24px;
        }

        .inputGrid {
          display: grid;
          gap: 14px;
          margin-bottom: 28px;
        }

        input,
        textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid rgba(255,255,255,.16);
          outline: none;
          border-radius: 12px;
          padding: 15px 16px;
          background: rgba(255,255,255,.92);
          color: #111827;
          font-size: 15px;
        }

        textarea {
          min-height: 110px;
          resize: vertical;
        }

        .paymentBox {
          display: grid;
          gap: 12px;
        }

        .paymentBox label {
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 16px;
          border-radius: 14px;
          border: 1px solid rgba(0,229,255,.18);
          background: rgba(255,255,255,.06);
          cursor: pointer;
        }

        .paymentBox label.active {
          border-color: rgba(0,229,255,.7);
          box-shadow: 0 0 20px rgba(0,229,255,.16);
        }

        .paymentBox input {
          width: auto;
        }

        .paymentBox b {
          display: block;
          margin-bottom: 4px;
        }

        .paymentBox small {
          color: #b8c4e6;
        }

        .noticeBox {
          margin-top: 16px;
          padding: 16px;
          border-radius: 16px;
          border: 1px solid rgba(0,229,255,.24);
          background: rgba(0,0,0,.22);
        }

        .noticeBox b {
          color: #00e5ff;
        }

        .noticeBox p {
          color: #dce6ff;
          line-height: 1.6;
          margin: 8px 0 0;
        }

        .orderBox {
          padding: 0;
          overflow: hidden;
        }

        .orderBox h2 {
          padding: 22px 24px;
          border-bottom: 1px solid rgba(255,255,255,.1);
          background: rgba(0,0,0,.2);
        }

        .items {
          display: grid;
          gap: 14px;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255,255,255,.1);
        }

        .item {
          display: grid;
          grid-template-columns: 74px 1fr;
          gap: 14px;
          align-items: center;
        }

        .imgWrap {
          position: relative;
        }

        .imgWrap img {
          width: 74px;
          height: 74px;
          object-fit: contain;
          background: white;
          border-radius: 12px;
          display: block;
          border: 1px solid rgba(0,229,255,.25);
        }

        .imgWrap span {
          position: absolute;
          top: -8px;
          right: -8px;
          width: 26px;
          height: 26px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background: #00e5ff;
          color: #050816;
          font-weight: 950;
          font-size: 13px;
        }

        .itemInfo h3 {
          margin: 0 0 8px;
          font-size: 16px;
          line-height: 1.35;
        }

        .itemInfo p {
          margin: 0;
          color: #ff78d2;
          font-weight: 950;
        }

        .summary {
          padding: 20px 24px;
          display: grid;
          gap: 14px;
        }

        .summary div {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          color: #dce6ff;
        }

        .summary .total {
          padding-top: 14px;
          border-top: 1px solid rgba(255,255,255,.15);
          font-size: 22px;
        }

        .summary .total b {
          color: #00e5ff;
          font-size: 28px;
        }

        .orderBtn {
          width: calc(100% - 48px);
          margin: 0 24px 14px;
          min-height: 58px;
          border: none;
          border-radius: 14px;
          background: linear-gradient(135deg,#7c4dff,#00e5ff);
          color: #050816;
          font-weight: 950;
          font-size: 16px;
          cursor: pointer;
          box-shadow: 0 0 24px rgba(0,229,255,.28);
        }

        .orderBtn:disabled {
          opacity: .65;
          cursor: not-allowed;
        }

        .cartLink {
          display: block;
          padding: 0 24px 24px;
          color: #00e5ff;
          text-decoration: none;
          font-weight: 800;
        }

        .empty {
          padding: 24px;
          color: #dce6ff;
        }

        .empty a {
          color: #00e5ff;
          font-weight: 900;
        }

        @media (max-width: 980px) {
          .top {
            display: block;
          }

          .top p,
          .top h1 {
            text-align: left;
          }

          .checkoutGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}