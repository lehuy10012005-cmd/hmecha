"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import CheckoutAddressPicker from "../../components/CheckoutAddressPicker";
import CouponQuickPicker from "../../components/CouponQuickPicker";
import { supabase } from "../../lib/supabase";

type CartItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
};

type PaymentMethod = "vnpay" | "cod";

type AppliedCoupon = {
  code: string;
  title: string;
  description: string | null;
  discountAmount: number;
  finalTotal: number;
};

function formatPrice(price: number) {
  return Number(price || 0).toLocaleString("vi-VN") + "₫";
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [placing, setPlacing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponMessage, setCouponMessage] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  const [customer, setCustomer] = useState({
    email: "",
    name: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    note: "",
    payment: "vnpay" as PaymentMethod,
  });

  useEffect(() => {
    const savedCart = localStorage.getItem("hmecha-cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    async function loadProfile() {
      try {
        const response = await fetch("/api/account/profile", { cache: "no-store" });
        const data = await response.json();

        if (data?.profile) {
          setCustomer((current) => ({
            ...current,
            email: data.profile.email || current.email,
            name: data.profile.full_name || current.name,
            phone: data.profile.phone || current.phone,
            address: data.profile.address || current.address,
          }));
        }
      } catch {
        // Không có tài khoản vẫn checkout bình thường.
      }
    }

    loadProfile();
  }, []);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  }, [cart]);

  const shippingFee = subtotal >= 1000000 || subtotal === 0 ? 0 : 30000;
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const total = Math.max(0, subtotal + shippingFee - discountAmount);

  useEffect(() => {
    setAppliedCoupon(null);
    setCouponMessage("");
  }, [subtotal, shippingFee]);

  function updateCustomer(field: keyof typeof customer, value: string) {
    setCustomer((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function getFullAddress() {
    return [customer.address, customer.ward, customer.district, customer.city]
      .filter(Boolean)
      .join(", ");
  }

  async function applyCoupon() {
    if (!couponCode.trim()) {
      setCouponMessage("Vui lòng nhập mã giảm giá.");
      return;
    }

    if (cart.length === 0) {
      setCouponMessage("Giỏ hàng đang trống.");
      return;
    }

    setCouponLoading(true);
    setCouponMessage("");

    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: couponCode,
          subtotal,
          shippingFee,
          customerEmail: customer.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAppliedCoupon(null);
        setCouponMessage(data.error || "Không áp dụng được mã giảm giá.");
        setCouponLoading(false);
        return;
      }

      setAppliedCoupon({
        code: data.coupon.code,
        title: data.coupon.title,
        description: data.coupon.description,
        discountAmount: Number(data.discountAmount || 0),
        finalTotal: Number(data.finalTotal || 0),
      });

      setCouponCode(data.coupon.code);
      setCouponMessage(data.message || "Áp dụng mã thành công.");
    } catch {
      setCouponMessage("Không kết nối được hệ thống mã giảm giá.");
    }

    setCouponLoading(false);
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponMessage("");
  }

  async function placeOrder() {
    if (placing) return;

    if (cart.length === 0) {
      alert("Giỏ hàng đang trống.");
      return;
    }

    const fullAddress = getFullAddress();

    if (!customer.name || !customer.phone || !fullAddress) {
      alert("Vui lòng nhập họ tên, số điện thoại và địa chỉ nhận hàng.");
      return;
    }

    setPlacing(true); const { data: { user } } = await supabase.auth.getUser();

    const couponNote = appliedCoupon
      ? ` | Mã giảm giá: ${appliedCoupon.code} (-${formatPrice(appliedCoupon.discountAmount)})`
      : "";

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
              address: fullAddress,
              note: `${customer.note || ""}${couponNote}`,
              payment: "vnpay",
            },
            coupon: appliedCoupon
              ? {
                  code: appliedCoupon.code,
                  discountAmount: appliedCoupon.discountAmount,
                }
              : null,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setPlacing(false);
          alert(data.message || "Không tạo được thanh toán VNPAY.");
          return;
        }

        localStorage.removeItem("hmecha-cart");
        window.open(data.paymentUrl, "_top");
        return;
      } catch {
        setPlacing(false);
        alert("Lỗi kết nối tới VNPAY.");
        return;
      }
    }

    try {
      const response = await fetch("/api/checkout/cod", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cart,
          customer: {
            ...customer,
            email: customer.email || user?.email || "",
            address: fullAddress,
            note: `${customer.note || ""}${couponNote}`,
            payment: "cod",
          },
          coupon: appliedCoupon
            ? {
                code: appliedCoupon.code,
                discountAmount: appliedCoupon.discountAmount,
              }
            : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPlacing(false);
        alert(data.message || "Không tạo được đơn COD.");
        return;
      }

      localStorage.removeItem("hmecha-cart");
      window.open(data.successUrl, "_top");
      return;
    } catch {
      setPlacing(false);
      alert("Lỗi kết nối khi tạo đơn COD.");
      return;
    }
  }

  return (
    <main className="checkoutPage">
      <div className="checkoutShell">
        <div className="checkoutTop">
          <Link href="/" className="backLink">
            ← Về trang chủ
          </Link>

          <div>
            <p>HMECHA CHECKOUT</p>
            <h1>Thanh toán đơn hàng</h1>
            <span>Chỉ hỗ trợ COD và VNPAY / QR.</span>
          </div>
        </div>

        <div className="checkoutLayout">
          <section className="leftPanel">
            <div className="panelHeader">
              <h2>Thông tin mua hàng</h2>
              <span>Điền thông tin nhận hàng để HMECHA xác nhận đơn.</span>
            </div>

            <div className="fieldGrid">
              <label>
                <span>Email</span>
                <input
                  value={customer.email}
                  onChange={(event) => updateCustomer("email", event.target.value)}
                  placeholder="Email của bạn"
                />
              </label>

              <label>
                <span>Họ và tên</span>
                <input
                  value={customer.name}
                  onChange={(event) => updateCustomer("name", event.target.value)}
                  placeholder="Nhập họ và tên"
                />
              </label>

              <label>
                <span>Số điện thoại</span>
                <input
                  value={customer.phone}
                  onChange={(event) => updateCustomer("phone", event.target.value)}
                  placeholder="Nhập số điện thoại"
                />
              </label>

              <label className="full">
                <span>Địa chỉ</span>
                <input
                  value={customer.address}
                  onChange={(event) => updateCustomer("address", event.target.value)}
                  placeholder="Số nhà, tên đường..."
                />
              </label>

              <CheckoutAddressPicker
  city={customer.city}
  district={customer.district}
  ward={customer.ward}
  onChange={(field, value) => updateCustomer(field, value)}
/>

              <label className="full">
                <span>Ghi chú đơn hàng</span>
                <textarea
                  value={customer.note}
                  onChange={(event) => updateCustomer("note", event.target.value)}
                  placeholder="Ghi chú thêm cho HMECHA nếu có..."
                />
              </label>
            </div>

            <div className="sectionBlock">
              <h2>Shipping</h2>

              <div className="shippingOption">
                <span className="radioDot" />
                <div>
                  <b>Giao hàng tận nơi</b>
                  <small>Miễn phí vận chuyển cho đơn từ 1.000.000đ.</small>
                </div>
                <strong>{shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}</strong>
              </div>
            </div>

            <div className="sectionBlock">
              <h2>Payment</h2>

              <div className="paymentList">
                <label className={customer.payment === "vnpay" ? "active" : ""}>
                  <input
                    type="radio"
                    name="payment"
                    checked={customer.payment === "vnpay"}
                    onChange={() => updateCustomer("payment", "vnpay")}
                  />
                  <span>
                    <b>Thanh toán VNPAY / QR</b>
                    <small>Chuyển sang cổng VNPAY Sandbox để quét QR hoặc dùng thẻ test.</small>
                  </span>
                  <i>💳</i>
                </label>

                <label className={customer.payment === "cod" ? "active" : ""}>
                  <input
                    type="radio"
                    name="payment"
                    checked={customer.payment === "cod"}
                    onChange={() => updateCustomer("payment", "cod")}
                  />
                  <span>
                    <b>Thanh toán khi nhận hàng (COD)</b>
                    <small>HMECHA sẽ gọi xác nhận trước khi giao.</small>
                  </span>
                  <i>💵</i>
                </label>
              </div>
            </div>
          </section>

          <aside className="orderPanel">
            <h2>Đơn hàng ({cart.length} sản phẩm)</h2>

            {cart.length === 0 ? (
              <div className="emptyBox">
                <p>Giỏ hàng đang trống.</p>
                <Link href="/">Xem sản phẩm</Link>
              </div>
            ) : (
              <>
                <div className="cartItems">
                  {cart.map((item) => (
                    <div className="cartItem" key={item.id}>
                      <div className="thumb">
                        <img src={item.image} alt={item.name} />
                        <span>{item.quantity}</span>
                      </div>

                      <div>
                        <h3>{item.name}</h3>
                        <p>{formatPrice(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>

              <div className="couponBox">
  <CouponQuickPicker
    selectedCode={couponCode}
    onPick={(code) => {
      setCouponCode(code);
      setCouponMessage("Đã chọn mã " + code + ". Bấm Áp dụng để dùng mã.");
    }}
  />

  <div className="couponInput">
                    <input
                      value={couponCode}
                      onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                      placeholder="Nhập mã giảm giá"
                    />
                    <button type="button" onClick={applyCoupon} disabled={couponLoading}>
                      {couponLoading ? "Đang áp dụng..." : "Áp dụng"}
                    </button>
                  </div>

                  {couponMessage && (
                    <p className={appliedCoupon ? "couponOk" : "couponError"}>{couponMessage}</p>
                  )}

                  {appliedCoupon && (
                    <div className="appliedCoupon">
                      <span>
                        Đã áp dụng <b>{appliedCoupon.code}</b>
                      </span>
                      <button type="button" onClick={removeCoupon}>
                        Bỏ mã
                      </button>
                    </div>
                  )}
                </div>

                <div className="summary">
                  <div>
                    <span>Tạm tính</span>
                    <b>{formatPrice(subtotal)}</b>
                  </div>

                  <div>
                    <span>Phí vận chuyển</span>
                    <b>{shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}</b>
                  </div>

                  {discountAmount > 0 && (
                    <div className="discount">
                      <span>Giảm giá</span>
                      <b>-{formatPrice(discountAmount)}</b>
                    </div>
                  )}

                  <div>
                    <span>Phương thức</span>
                    <b>{customer.payment === "vnpay" ? "VNPAY / QR" : "COD"}</b>
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
          padding: 34px 20px 80px;
          color: #ffffff;
          background:
            radial-gradient(circle at 8% 0%, rgba(124, 77, 255, 0.24), transparent 34%),
            radial-gradient(circle at 92% 8%, rgba(0, 229, 255, 0.16), transparent 30%),
            linear-gradient(180deg, #050816 0%, #0b1434 48%, #050816 100%);
        }

        .checkoutShell {
          max-width: 1360px;
          margin: 0 auto;
        }

        .checkoutTop {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          align-items: flex-start;
          margin-bottom: 30px;
        }

        .backLink,
        .cartLink {
          color: #00e5ff;
          text-decoration: none;
          font-weight: 900;
        }

        .checkoutTop p {
          margin: 0 0 8px;
          color: #00e5ff;
          font-size: 13px;
          font-weight: 950;
          letter-spacing: 4px;
          text-align: right;
        }

        .checkoutTop h1 {
          margin: 0;
          font-size: clamp(36px, 5vw, 56px);
          line-height: 1.05;
          text-align: right;
        }

        .checkoutTop span {
          display: block;
          margin-top: 10px;
          color: #c5d2f2;
          text-align: right;
        }

        .checkoutLayout {
          display: grid;
          grid-template-columns: minmax(0, 1.14fr) minmax(390px, 0.86fr);
          gap: 26px;
          align-items: start;
        }

        .leftPanel,
        .orderPanel {
          border-radius: 24px;
          border: 1px solid rgba(0, 229, 255, 0.22);
          background:
            radial-gradient(circle at 0% 0%, rgba(124, 77, 255, 0.12), transparent 34%),
            rgba(7, 12, 32, 0.84);
          box-shadow: 0 20px 52px rgba(0, 0, 0, 0.28);
          overflow: hidden;
        }

        .leftPanel {
          padding: 28px;
        }

        .panelHeader {
          margin-bottom: 22px;
        }

        .panelHeader h2,
        .sectionBlock h2,
        .orderPanel h2 {
          margin: 0;
          font-size: 25px;
          line-height: 1.2;
        }

        .panelHeader span {
          display: block;
          margin-top: 8px;
          color: #9fb0d8;
          line-height: 1.6;
        }

        .fieldGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 28px;
        }

        .fieldGrid label {
          display: grid;
          gap: 7px;
        }

        .fieldGrid label.full {
          grid-column: 1 / -1;
        }

        .fieldGrid span {
          color: #c5d2f2;
          font-size: 13px;
          font-weight: 850;
        }

        input,
        textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid rgba(0, 229, 255, 0.22);
          outline: none;
          border-radius: 13px;
          padding: 15px 16px;
          background: rgba(5, 8, 22, 0.92);
          color: #ffffff;
          font: inherit;
          font-size: 15px;
        }

        input::placeholder,
        textarea::placeholder {
          color: #8ea0ca;
        }

        input:focus,
        textarea:focus {
          border-color: #00e5ff;
          box-shadow: 0 0 0 3px rgba(0, 229, 255, 0.13);
        }

        textarea {
          min-height: 100px;
          resize: vertical;
        }

        .sectionBlock {
          margin-top: 24px;
        }

        .sectionBlock h2 {
          margin-bottom: 14px;
        }

        .shippingOption,
        .paymentList label {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 17px;
          border-radius: 16px;
          border: 1px solid rgba(0, 229, 255, 0.18);
          background: rgba(255, 255, 255, 0.055);
        }

        .radioDot {
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background: #00e5ff;
          box-shadow: 0 0 0 5px rgba(0, 229, 255, 0.15);
          flex: 0 0 auto;
        }

        .shippingOption div,
        .paymentList span {
          flex: 1;
        }

        .shippingOption b,
        .paymentList b {
          display: block;
          color: #ffffff;
          margin-bottom: 5px;
        }

        .shippingOption small,
        .paymentList small {
          color: #9fb0d8;
          line-height: 1.45;
        }

        .shippingOption strong {
          color: #00e5ff;
          white-space: nowrap;
        }

        .paymentList {
          display: grid;
          gap: 12px;
        }

        .paymentList label {
          cursor: pointer;
          transition: 0.22s ease;
        }

        .paymentList label.active {
          border-color: rgba(0, 229, 255, 0.8);
          box-shadow: 0 0 22px rgba(0, 229, 255, 0.14);
          background: rgba(0, 229, 255, 0.075);
        }

        .paymentList input {
          width: 18px;
          height: 18px;
          accent-color: #00e5ff;
        }

        .paymentList i {
          font-style: normal;
          font-size: 24px;
        }

        .orderPanel h2 {
          padding: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.09);
          background: rgba(0, 0, 0, 0.18);
        }

        .cartItems {
          display: grid;
          gap: 15px;
          padding: 22px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.09);
        }

        .cartItem {
          display: grid;
          grid-template-columns: 78px 1fr;
          gap: 15px;
          align-items: center;
        }

        .thumb {
          position: relative;
        }

        .thumb img {
          width: 78px;
          height: 78px;
          object-fit: contain;
          border-radius: 13px;
          border: 1px solid rgba(0, 229, 255, 0.28);
          background: #050816;
          display: block;
        }

        .thumb span {
          position: absolute;
          top: -9px;
          right: -9px;
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          border-radius: 999px;
          background: #00e5ff;
          color: #061020;
          font-weight: 950;
        }

        .cartItem h3 {
          margin: 0 0 8px;
          font-size: 16px;
          line-height: 1.35;
        }

        .cartItem p {
          margin: 0;
          color: #ff78d2;
          font-weight: 950;
        }

        .couponBox {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.09);
        }

        .couponInput {
          display: grid;
          grid-template-columns: 1fr 132px;
          gap: 10px;
        }

        .couponInput button,
        .orderBtn {
          border: 0;
          border-radius: 13px;
          color: #061020;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
          font-weight: 950;
          cursor: pointer;
        }

        .couponInput button:disabled,
        .orderBtn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .couponOk,
        .couponError {
          margin: 12px 0 0;
          font-size: 14px;
          font-weight: 850;
        }

        .couponOk {
          color: #9ff6ff;
        }

        .couponError {
          color: #ff8aa5;
        }

        .appliedCoupon {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          margin-top: 12px;
          padding: 12px;
          border-radius: 13px;
          background: rgba(0, 229, 255, 0.08);
          border: 1px solid rgba(0, 229, 255, 0.18);
          color: #dce6ff;
        }

        .appliedCoupon b {
          color: #00e5ff;
        }

        .appliedCoupon button {
          border: 0;
          background: transparent;
          color: #ff8aa5;
          font-weight: 850;
          cursor: pointer;
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

        .summary b {
          color: #ffffff;
        }

        .summary .discount b {
          color: #9ff6ff;
        }

        .summary .total {
          margin-top: 4px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.14);
          font-size: 22px;
        }

        .summary .total b {
          color: #00e5ff;
          font-size: 30px;
        }

        .orderBtn {
          width: calc(100% - 48px);
          margin: 0 24px 14px;
          min-height: 58px;
          font-size: 16px;
          box-shadow: 0 0 24px rgba(0, 229, 255, 0.24);
        }

        .cartLink {
          display: block;
          padding: 0 24px 24px;
        }

        .emptyBox {
          padding: 24px;
          color: #dce6ff;
        }

        .emptyBox a {
          color: #00e5ff;
          font-weight: 900;
        }

        @media (max-width: 980px) {
          .checkoutTop {
            display: block;
          }

          .checkoutTop p,
          .checkoutTop h1,
          .checkoutTop span {
            text-align: left;
          }

          .checkoutLayout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .leftPanel {
            padding: 20px;
          }

          .fieldGrid,
          .couponInput {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}