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


const CHECKOUT_INFO_KEY = "hmecha-last-checkout-info";

type SavedCheckoutInfo = {
  email: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  payment: PaymentMethod;
};

function readSavedCheckoutInfo(): Partial<SavedCheckoutInfo> | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(CHECKOUT_INFO_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);

    return {
      email: String(data.email || ""),
      name: String(data.name || ""),
      phone: String(data.phone || ""),
      address: String(data.address || ""),
      city: String(data.city || ""),
      district: String(data.district || ""),
      ward: String(data.ward || ""),
      payment: data.payment === "cod" ? "cod" : "vnpay",
    };
  } catch {
    return null;
  }
}

function saveCheckoutCustomerInfo(customer: Partial<SavedCheckoutInfo> & { note?: string }) {
  if (typeof window === "undefined") return;

  try {
    const data: SavedCheckoutInfo = {
      email: String(customer.email || ""),
      name: String(customer.name || ""),
      phone: String(customer.phone || ""),
      address: String(customer.address || ""),
      city: String(customer.city || ""),
      district: String(customer.district || ""),
      ward: String(customer.ward || ""),
      payment: customer.payment === "cod" ? "cod" : "vnpay",
    };

    localStorage.setItem(CHECKOUT_INFO_KEY, JSON.stringify(data));
  } catch {
    // Không chặn đặt hàng nếu trình duyệt không cho lưu localStorage.
  }
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

    const savedCheckoutInfo = readSavedCheckoutInfo();

    if (savedCheckoutInfo) {
      setCustomer((current) => ({
        ...current,
        ...savedCheckoutInfo,
        note: "",
      }));
    }

    async function loadProfile() {
      try {
        const response = await fetch("/api/account/profile", { cache: "no-store" });
        const data = await response.json();

        if (data?.profile) {
          setCustomer((current) => ({
            ...current,
            email: current.email || data.profile.email || "",
            name: current.name || data.profile.full_name || "",
            phone: current.phone || data.profile.phone || "",
            address: current.address || data.profile.address || "",
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

    setPlacing(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

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

        saveCheckoutCustomerInfo(customer);
        saveCheckoutCustomerInfo(customer);
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

      saveCheckoutCustomerInfo(customer);
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
          <Link href="/cart" className="backLink">
            ← Quay lại giỏ hàng
          </Link>

          <div>
            <span>HMECHA CHECKOUT</span>
            <h1>Tiến hành thanh toán</h1>
            <p>Kiểm tra thông tin nhận hàng trước khi xác nhận đơn.</p>
          </div>
        </div>

        <div className="checkoutLayout">
          <section className="leftPanel">
            <div className="panelHeader">
              <h2>Thông tin mua hàng</h2>
              <p>Điền thông tin nhận hàng để HMECHA xác nhận đơn.</p>
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
              <h2>Vận chuyển</h2>

              <div className="shippingOption">
                <span className="radioDot" />

                <div>
                  <b>Giao hàng tận nơi</b>
                  <small>Miễn phí vận chuyển cho đơn hàng từ 1.000.000đ.</small>
                </div>

                <strong>{shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}</strong>
              </div>
            </div>

            <div className="sectionBlock">
              <h2>Thanh toán</h2>

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
            <div className="orderHeader">
              <h2>Đơn hàng</h2>
              <span>{cart.length} sản phẩm</span>
            </div>

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
                      <div className="checkoutThumb">
                        <img src={item.image} alt={item.name} />
                      </div>

                      <div>
                        <h3>{item.name}</h3>
                        <p className="itemPriceLine">
                          <span>{formatPrice(item.price)}</span>
                          <b>x{item.quantity}</b>
                        </p>
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
                    <p className={appliedCoupon ? "couponOk" : "couponError"}>
                      {couponMessage}
                    </p>
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
                      ? "Đang chuyển sang VNPAY..."
                      : "Đang tạo đơn COD..."
                    : customer.payment === "vnpay"
                    ? "Thanh toán qua VNPAY / QR"
                    : "Đặt hàng COD"}
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
          background: #f3f6fb;
          color: #111827;
          font-family: Arial, "Helvetica Neue", sans-serif !important;
        }

        .checkoutPage * {
          box-sizing: border-box;
          font-family: Arial, "Helvetica Neue", sans-serif !important;
        }

        .checkoutShell {
          max-width: 1360px;
          margin: 0 auto;
        }

        .checkoutTop {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          margin-bottom: 22px;
        }

        .backLink,
        .cartLink {
          color: #d32f2f;
          text-decoration: none;
          font-weight: 800;
        }

        .checkoutTop > div {
          text-align: right;
        }

        .checkoutTop span {
          display: inline-block;
          margin-bottom: 6px;
          color: #d32f2f;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 0.5px;
        }

        .checkoutTop h1 {
          margin: 0;
          color: #111827;
          font-size: clamp(30px, 4vw, 44px);
          line-height: 1.1;
          font-weight: 950;
          letter-spacing: -0.6px;
        }

        .checkoutTop p {
          margin: 8px 0 0;
          color: #6b7280;
          font-size: 15px;
        }

        .checkoutLayout {
          display: grid;
          grid-template-columns: minmax(0, 1.18fr) minmax(390px, 0.82fr);
          gap: 24px;
          align-items: start;
        }

        .leftPanel,
        .orderPanel {
          overflow: hidden;
          border-radius: 18px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          box-shadow: 0 12px 34px rgba(15, 23, 42, 0.08);
        }

        .leftPanel {
          padding: 26px;
        }

        .panelHeader {
          margin-bottom: 22px;
        }

        .panelHeader h2,
        .sectionBlock h2 {
          margin: 0;
          color: #111827;
          font-size: 24px;
          line-height: 1.2;
          font-weight: 900;
          letter-spacing: -0.2px;
        }

        .panelHeader p {
          margin: 8px 0 0;
          color: #6b7280;
          line-height: 1.6;
          font-size: 14px;
        }

        .fieldGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 26px;
        }

        .fieldGrid label {
          display: grid;
          gap: 7px;
        }

        .fieldGrid label.full {
          grid-column: 1 / -1;
        }

        .fieldGrid span {
          color: #374151;
          font-size: 13px;
          font-weight: 800;
        }

        .checkoutPage input,
        .checkoutPage textarea {
          width: 100%;
          border: 1px solid #d1d5db;
          outline: none;
          border-radius: 12px;
          padding: 14px 15px;
          background: #ffffff;
          color: #111827;
          font-size: 15px;
          line-height: 1.4;
        }

        .checkoutPage input::placeholder,
        .checkoutPage textarea::placeholder {
          color: #9ca3af;
        }

        .checkoutPage input:focus,
        .checkoutPage textarea:focus {
          border-color: #d32f2f;
          box-shadow: 0 0 0 3px rgba(211, 47, 47, 0.11);
        }

        .checkoutPage textarea {
          min-height: 100px;
          resize: vertical;
        }

        .sectionBlock {
          margin-top: 24px;
        }

        .sectionBlock h2 {
          margin-bottom: 14px;
          font-size: 22px;
        }

        .shippingOption,
        .paymentList label {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px;
          border-radius: 14px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
        }

        .radioDot {
          width: 18px;
          height: 18px;
          border-radius: 999px;
          background: #d32f2f;
          box-shadow: 0 0 0 5px rgba(211, 47, 47, 0.1);
          flex: 0 0 auto;
        }

        .shippingOption div,
        .paymentList span {
          flex: 1;
        }

        .shippingOption b,
        .paymentList b {
          display: block;
          color: #111827;
          margin-bottom: 5px;
          font-size: 14px;
          font-weight: 900;
        }

        .shippingOption small,
        .paymentList small {
          color: #6b7280;
          line-height: 1.45;
          font-size: 13px;
        }

        .shippingOption strong {
          color: #d32f2f;
          white-space: nowrap;
          font-weight: 900;
        }

        .paymentList {
          display: grid;
          gap: 12px;
        }

        .paymentList label {
          cursor: pointer;
          transition: 0.2s ease;
        }

        .paymentList label.active {
          border-color: #d32f2f;
          background: #fff8ed;
          box-shadow: 0 8px 20px rgba(211, 47, 47, 0.08);
        }

        .paymentList input {
          width: 18px;
          height: 18px;
          accent-color: #d32f2f;
        }

        .paymentList i {
          font-style: normal;
          font-size: 24px;
        }

        .orderPanel {
          position: sticky;
          top: 18px;
        }

        .orderHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 22px 24px;
          border-bottom: 1px solid #edf0f3;
          background: #ffffff;
        }

        .orderHeader h2 {
          margin: 0;
          color: #111827;
          font-size: 23px;
          line-height: 1.2;
          font-weight: 900;
        }

        .orderHeader span {
          color: #d32f2f;
          font-size: 14px;
          font-weight: 900;
        }

        .cartItems {
          display: grid;
          gap: 14px;
          padding: 20px 24px;
          border-bottom: 1px solid #edf0f3;
        }

        .cartItem {
          display: grid;
          grid-template-columns: 70px 1fr;
          gap: 14px;
          align-items: center;
        }

        .checkoutThumb {
          position: relative;
        }

        .checkoutThumb img {
          width: 70px;
          height: 70px;
          object-fit: contain;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          background: #f8fafc;
          display: block;
        }

        

        .cartItem h3 {
          margin: 0 0 7px;
          color: #111827;
          font-size: 14px;
          line-height: 1.35;
          font-weight: 800;
        }

        .cartItem p {
          margin: 0;
        }

        .itemPriceLine {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .itemPriceLine span {
          color: #ff5722;
          font-size: 14px;
          font-weight: 900;
        }

        .itemPriceLine b {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 34px;
          height: 22px;
          padding: 0 8px;
          border-radius: 999px;
          background: #f3f4f6;
          color: #374151;
          font-size: 13px;
          font-weight: 900;
        }

        .couponBox {
          padding: 20px 24px;
          border-bottom: 1px solid #edf0f3;
          background: #fafafa;
        }

        .couponInput {
          display: grid;
          grid-template-columns: 1fr 118px;
          gap: 10px;
          margin-top: 14px;
        }

        .couponInput button,
        .orderBtn {
          border: 0;
          border-radius: 11px;
          color: #ffffff;
          background: #d32f2f;
          font-weight: 900;
          cursor: pointer;
          transition: 0.18s ease;
        }

        .couponInput button:hover,
        .orderBtn:hover {
          background: #b91c1c;
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
          font-weight: 800;
        }

        .couponOk {
          color: #15803d;
        }

        .couponError {
          color: #d32f2f;
        }

        .appliedCoupon {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          margin-top: 12px;
          padding: 12px;
          border-radius: 12px;
          background: #ecfdf3;
          border: 1px solid #bbf7d0;
          color: #166534;
        }

        .appliedCoupon b {
          color: #15803d;
        }

        .appliedCoupon button {
          border: 0;
          background: transparent;
          color: #d32f2f;
          font-weight: 900;
          cursor: pointer;
        }

        .summary {
          padding: 20px 24px;
          display: grid;
          gap: 14px;
          background: #ffffff;
        }

        .summary div {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          color: #4b5563;
          font-size: 14px;
        }

        .summary b {
          color: #111827;
          font-weight: 900;
        }

        .summary .discount b {
          color: #15803d;
        }

        .summary .total {
          margin-top: 4px;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
          align-items: flex-end;
        }

        .summary .total span {
          color: #111827;
          font-size: 18px;
          font-weight: 800;
        }

        .summary .total b {
          color: #ff5722;
          font-size: 30px;
          line-height: 1;
          font-weight: 950;
        }

        .orderBtn {
          width: calc(100% - 48px);
          margin: 0 24px 14px;
          min-height: 56px;
          font-size: 15px;
          text-transform: uppercase;
          box-shadow: 0 10px 20px rgba(211, 47, 47, 0.18);
        }

        .cartLink {
          display: block;
          padding: 0 24px 24px;
        }

        .emptyBox {
          padding: 24px;
          color: #4b5563;
        }

        .emptyBox a {
          color: #d32f2f;
          font-weight: 900;
        }

        @media (max-width: 980px) {
          .checkoutTop {
            display: block;
          }

          .checkoutTop > div {
            text-align: left;
            margin-top: 16px;
          }

          .checkoutLayout {
            grid-template-columns: 1fr;
          }

          .orderPanel {
            position: static;
          }
        }

        @media (max-width: 640px) {
          .checkoutPage {
            padding: 20px 12px 60px;
          }

          .leftPanel {
            padding: 18px;
          }

          .fieldGrid,
          .couponInput {
            grid-template-columns: 1fr;
          }

          .orderHeader,
          .cartItems,
          .couponBox,
          .summary {
            padding-left: 18px;
            padding-right: 18px;
          }

          .orderBtn {
            width: calc(100% - 36px);
            margin-left: 18px;
            margin-right: 18px;
          }

          .cartLink {
            padding-left: 18px;
            padding-right: 18px;
          }
        }
      `}</style>
    </main>
  );
}

