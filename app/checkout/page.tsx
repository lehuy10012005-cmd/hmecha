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
  return Number(price || 0).toLocaleString("vi-VN") + "â‚«";
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
        // KhÃ´ng cÃ³ tÃ i khoáº£n váº«n checkout bÃ¬nh thÆ°á»ng.
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
      setCouponMessage("Vui lÃ²ng nháº­p mÃ£ giáº£m giÃ¡.");
      return;
    }

    if (cart.length === 0) {
      setCouponMessage("Giá» hÃ ng Ä‘ang trá»‘ng.");
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
        setCouponMessage(data.error || "KhÃ´ng Ã¡p dá»¥ng Ä‘Æ°á»£c mÃ£ giáº£m giÃ¡.");
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
      setCouponMessage(data.message || "Ãp dá»¥ng mÃ£ thÃ nh cÃ´ng.");
    } catch {
      setCouponMessage("KhÃ´ng káº¿t ná»‘i Ä‘Æ°á»£c há»‡ thá»‘ng mÃ£ giáº£m giÃ¡.");
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
      alert("Giá» hÃ ng Ä‘ang trá»‘ng.");
      return;
    }

    const fullAddress = getFullAddress();

    if (!customer.name || !customer.phone || !fullAddress) {
      alert("Vui lÃ²ng nháº­p há» tÃªn, sá»‘ Ä‘iá»‡n thoáº¡i vÃ  Ä‘á»‹a chá»‰ nháº­n hÃ ng.");
      return;
    }

    setPlacing(true); const { data: { user } } = await supabase.auth.getUser();

    const couponNote = appliedCoupon
      ? ` | MÃ£ giáº£m giÃ¡: ${appliedCoupon.code} (-${formatPrice(appliedCoupon.discountAmount)})`
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
          alert(data.message || "KhÃ´ng táº¡o Ä‘Æ°á»£c thanh toÃ¡n VNPAY.");
          return;
        }

        localStorage.removeItem("hmecha-cart");
        window.open(data.paymentUrl, "_top");
        return;
      } catch {
        setPlacing(false);
        alert("Lá»—i káº¿t ná»‘i tá»›i VNPAY.");
        return;
      }
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({ customer_id: user?.id || null,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_email: customer.email || user?.email || null,
        customer_address: fullAddress,
        note: `${customer.note || ""}${couponNote}`,
        payment_method: "cod",
        payment_status: "cod",
        subtotal,
        shipping_fee: shippingFee,
        total,
        status: "Chá» xÃ¡c nháº­n",
      })
      .select()
      .single();

    if (orderError) {
      setPlacing(false);
      alert("Lá»—i táº¡o Ä‘Æ¡n COD: " + orderError.message);
      return;
    }

    const orderItems = cart.map((item) => ({
      order_id: order.id,
      product_id: isUuid(item.id) ? item.id : null,
      product_name: item.name,
      product_price: item.price,
      quantity: item.quantity,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);

    if (itemsError) {
      setPlacing(false);
      alert("ÄÃ£ táº¡o Ä‘Æ¡n nhÆ°ng lá»—i lÆ°u sáº£n pháº©m: " + itemsError.message);
      return;
    }

    for (const item of cart) {
      if (isUuid(item.id)) {
        await supabase.rpc("decrement_product_stock", {
          product_id_input: item.id,
          quantity_input: item.quantity,
        });
      }
    }

    await supabase
      .from("orders")
      .update({
        stock_deducted: true,
        stock_deducted_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    await fetch("/api/orders/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId: order.id,
      }),
    });

    localStorage.removeItem("hmecha-cart");

    const successUrl =
      `/order-success?method=cod` +
      `&total=${total}` +
      `&order=${encodeURIComponent(order.id)}` +
      `&content=${encodeURIComponent("COD")}`;

    window.open(successUrl, "_top");
  }

  return (
    <main className="checkoutPage">
      <div className="checkoutShell">
        <div className="checkoutTop">
          <Link href="/" className="backLink">
            â† Vá» trang chá»§
          </Link>

          <div>
            <p>HMECHA CHECKOUT</p>
            <h1>Thanh toÃ¡n Ä‘Æ¡n hÃ ng</h1>
            <span>Chá»‰ há»— trá»£ COD vÃ  VNPAY / QR.</span>
          </div>
        </div>

        <div className="checkoutLayout">
          <section className="leftPanel">
            <div className="panelHeader">
              <h2>ThÃ´ng tin mua hÃ ng</h2>
              <span>Äiá»n thÃ´ng tin nháº­n hÃ ng Ä‘á»ƒ HMECHA xÃ¡c nháº­n Ä‘Æ¡n.</span>
            </div>

            <div className="fieldGrid">
              <label>
                <span>Email</span>
                <input
                  value={customer.email}
                  onChange={(event) => updateCustomer("email", event.target.value)}
                  placeholder="Email cá»§a báº¡n"
                />
              </label>

              <label>
                <span>Há» vÃ  tÃªn</span>
                <input
                  value={customer.name}
                  onChange={(event) => updateCustomer("name", event.target.value)}
                  placeholder="Nháº­p há» vÃ  tÃªn"
                />
              </label>

              <label>
                <span>Sá»‘ Ä‘iá»‡n thoáº¡i</span>
                <input
                  value={customer.phone}
                  onChange={(event) => updateCustomer("phone", event.target.value)}
                  placeholder="Nháº­p sá»‘ Ä‘iá»‡n thoáº¡i"
                />
              </label>

              <label className="full">
                <span>Äá»‹a chá»‰</span>
                <input
                  value={customer.address}
                  onChange={(event) => updateCustomer("address", event.target.value)}
                  placeholder="Sá»‘ nhÃ , tÃªn Ä‘Æ°á»ng..."
                />
              </label>

              <CheckoutAddressPicker
  city={customer.city}
  district={customer.district}
  ward={customer.ward}
  onChange={(field, value) => updateCustomer(field, value)}
/>

              <label className="full">
                <span>Ghi chÃº Ä‘Æ¡n hÃ ng</span>
                <textarea
                  value={customer.note}
                  onChange={(event) => updateCustomer("note", event.target.value)}
                  placeholder="Ghi chÃº thÃªm cho HMECHA náº¿u cÃ³..."
                />
              </label>
            </div>

            <div className="sectionBlock">
              <h2>Shipping</h2>

              <div className="shippingOption">
                <span className="radioDot" />
                <div>
                  <b>Giao hÃ ng táº­n nÆ¡i</b>
                  <small>Miá»…n phÃ­ váº­n chuyá»ƒn cho Ä‘Æ¡n tá»« 1.000.000Ä‘.</small>
                </div>
                <strong>{shippingFee === 0 ? "Miá»…n phÃ­" : formatPrice(shippingFee)}</strong>
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
                    <b>Thanh toÃ¡n VNPAY / QR</b>
                    <small>Chuyá»ƒn sang cá»•ng VNPAY Sandbox Ä‘á»ƒ quÃ©t QR hoáº·c dÃ¹ng tháº» test.</small>
                  </span>
                  <i>ðŸ’³</i>
                </label>

                <label className={customer.payment === "cod" ? "active" : ""}>
                  <input
                    type="radio"
                    name="payment"
                    checked={customer.payment === "cod"}
                    onChange={() => updateCustomer("payment", "cod")}
                  />
                  <span>
                    <b>Thanh toÃ¡n khi nháº­n hÃ ng (COD)</b>
                    <small>HMECHA sáº½ gá»i xÃ¡c nháº­n trÆ°á»›c khi giao.</small>
                  </span>
                  <i>ðŸ’µ</i>
                </label>
              </div>
            </div>
          </section>

          <aside className="orderPanel">
            <h2>ÄÆ¡n hÃ ng ({cart.length} sáº£n pháº©m)</h2>

            {cart.length === 0 ? (
              <div className="emptyBox">
                <p>Giá» hÃ ng Ä‘ang trá»‘ng.</p>
                <Link href="/">Xem sáº£n pháº©m</Link>
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
      setCouponMessage("ÄÃ£ chá»n mÃ£ " + code + ". Báº¥m Ãp dá»¥ng Ä‘á»ƒ dÃ¹ng mÃ£.");
    }}
  />

  <div className="couponInput">
                    <input
                      value={couponCode}
                      onChange={(event) => setCouponCode(event.target.value.toUpperCase())}
                      placeholder="Nháº­p mÃ£ giáº£m giÃ¡"
                    />
                    <button type="button" onClick={applyCoupon} disabled={couponLoading}>
                      {couponLoading ? "Äang Ã¡p dá»¥ng..." : "Ãp dá»¥ng"}
                    </button>
                  </div>

                  {couponMessage && (
                    <p className={appliedCoupon ? "couponOk" : "couponError"}>{couponMessage}</p>
                  )}

                  {appliedCoupon && (
                    <div className="appliedCoupon">
                      <span>
                        ÄÃ£ Ã¡p dá»¥ng <b>{appliedCoupon.code}</b>
                      </span>
                      <button type="button" onClick={removeCoupon}>
                        Bá» mÃ£
                      </button>
                    </div>
                  )}
                </div>

                <div className="summary">
                  <div>
                    <span>Táº¡m tÃ­nh</span>
                    <b>{formatPrice(subtotal)}</b>
                  </div>

                  <div>
                    <span>PhÃ­ váº­n chuyá»ƒn</span>
                    <b>{shippingFee === 0 ? "Miá»…n phÃ­" : formatPrice(shippingFee)}</b>
                  </div>

                  {discountAmount > 0 && (
                    <div className="discount">
                      <span>Giáº£m giÃ¡</span>
                      <b>-{formatPrice(discountAmount)}</b>
                    </div>
                  )}

                  <div>
                    <span>PhÆ°Æ¡ng thá»©c</span>
                    <b>{customer.payment === "vnpay" ? "VNPAY / QR" : "COD"}</b>
                  </div>

                  <div className="total">
                    <span>Tá»•ng cá»™ng</span>
                    <b>{formatPrice(total)}</b>
                  </div>
                </div>

                <button className="orderBtn" onClick={placeOrder} disabled={placing}>
                  {placing
                    ? customer.payment === "vnpay"
                      ? "ÄANG CHUYá»‚N SANG VNPAY..."
                      : "ÄANG Táº O ÄÆ N COD..."
                    : customer.payment === "vnpay"
                    ? "THANH TOÃN QUA VNPAY / QR"
                    : "Äáº¶T HÃ€NG COD"}
                </button>

                <Link href="/cart" className="cartLink">
                  â† Quay vá» giá» hÃ ng
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