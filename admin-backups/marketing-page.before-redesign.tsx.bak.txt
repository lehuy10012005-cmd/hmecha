"use client";

import { FormEvent, useState } from "react";

type EmailType = "new_product" | "comeback";

export default function AdminMarketingPage() {
  const [type, setType] = useState<EmailType>("new_product");
  const [to, setTo] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productSlug, setProductSlug] = useState("");
  const [couponCode, setCouponCode] = useState("COMEBACK10");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/admin/marketing/send-test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          to,
          customerName,
          productName,
          productPrice,
          productSlug,
          couponCode,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Gửi email thất bại.");
      }

      setResult(data.message || "Đã gửi email test.");
    } catch (error: any) {
      setResult(error?.message || "Có lỗi xảy ra khi gửi email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f6f7f9", padding: "32px" }}>
      <section
        style={{
          maxWidth: "980px",
          margin: "0 auto",
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "24px",
          padding: "28px",
          boxShadow: "0 20px 60px rgba(15,23,42,.08)",
        }}
      >
        <div style={{ marginBottom: "24px" }}>
          <p style={{ color: "#dc2626", fontWeight: 800, margin: 0 }}>
            HMECHA ADMIN
          </p>
          <h1 style={{ fontSize: "32px", margin: "8px 0", color: "#111827" }}>
            Marketing Email
          </h1>
          <p style={{ color: "#6b7280", margin: 0 }}>
            Dùng để test gửi thông báo sản phẩm mới hoặc nhắc khách lâu chưa mua.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "18px" }}>
          <div style={{ display: "grid", gap: "8px" }}>
            <label style={{ fontWeight: 700 }}>Loại email</label>
            <select
              value={type}
              onChange={(event) => setType(event.target.value as EmailType)}
              style={inputStyle}
            >
              <option value="new_product">Thông báo sản phẩm mới / có hàng mới</option>
              <option value="comeback">Nhắc khách lâu chưa mua quay lại</option>
            </select>
          </div>

          <div style={{ display: "grid", gap: "8px" }}>
            <label style={{ fontWeight: 700 }}>Email nhận test</label>
            <input
              value={to}
              onChange={(event) => setTo(event.target.value)}
              placeholder="Nhập Gmail của bạn để test"
              style={inputStyle}
              required
            />
          </div>

          <div style={{ display: "grid", gap: "8px" }}>
            <label style={{ fontWeight: 700 }}>Tên khách hàng</label>
            <input
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="Ví dụ: Huy"
              style={inputStyle}
            />
          </div>

          {type === "new_product" ? (
            <div
              style={{
                display: "grid",
                gap: "16px",
                border: "1px solid #e5e7eb",
                borderRadius: "18px",
                padding: "18px",
                background: "#fafafa",
              }}
            >
              <h2 style={{ fontSize: "18px", margin: 0 }}>
                Nội dung thông báo hàng mới
              </h2>

              <div style={{ display: "grid", gap: "8px" }}>
                <label style={{ fontWeight: 700 }}>Tên sản phẩm</label>
                <input
                  value={productName}
                  onChange={(event) => setProductName(event.target.value)}
                  placeholder="Ví dụ: MGSD Destiny Gundam"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "grid", gap: "8px" }}>
                <label style={{ fontWeight: 700 }}>Giá</label>
                <input
                  value={productPrice}
                  onChange={(event) => setProductPrice(event.target.value)}
                  placeholder="Ví dụ: 1040000"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "grid", gap: "8px" }}>
                <label style={{ fontWeight: 700 }}>Link sản phẩm / slug</label>
                <input
                  value={productSlug}
                  onChange={(event) => setProductSlug(event.target.value)}
                  placeholder="Ví dụ: products/mgsd-destiny-gundam hoặc mgsd-destiny-gundam"
                  style={inputStyle}
                />
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "16px",
                border: "1px solid #e5e7eb",
                borderRadius: "18px",
                padding: "18px",
                background: "#fafafa",
              }}
            >
              <h2 style={{ fontSize: "18px", margin: 0 }}>
                Nội dung nhắc khách quay lại
              </h2>

              <div style={{ display: "grid", gap: "8px" }}>
                <label style={{ fontWeight: 700 }}>Mã giảm giá</label>
                <input
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value)}
                  placeholder="Ví dụ: COMEBACK10"
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          <button
            disabled={loading}
            style={{
              border: "none",
              borderRadius: "999px",
              padding: "14px 20px",
              background: loading ? "#9ca3af" : "#dc2626",
              color: "#fff",
              fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Đang gửi..." : "Gửi email test"}
          </button>

          {result ? (
            <div
              style={{
                borderRadius: "14px",
                padding: "14px 16px",
                background: result.includes("Đã gửi") ? "#ecfdf5" : "#fef2f2",
                color: result.includes("Đã gửi") ? "#047857" : "#b91c1c",
                fontWeight: 700,
              }}
            >
              {result}
            </div>
          ) : null}
        </form>

        <div
          style={{
            marginTop: "28px",
            padding: "18px",
            borderRadius: "18px",
            background: "#111827",
            color: "#fff",
          }}
        >
          <h2 style={{ fontSize: "18px", marginTop: 0 }}>Cách demo với thầy</h2>
          <p style={{ margin: "8px 0" }}>
            1. Nhập email test của bạn.
          </p>
          <p style={{ margin: "8px 0" }}>
            2. Chọn thông báo sản phẩm mới hoặc nhắc khách lâu chưa mua.
          </p>
          <p style={{ margin: "8px 0" }}>
            3. Bấm gửi và mở Gmail kiểm tra email.
          </p>
        </div>
      </section>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  border: "1px solid #d1d5db",
  borderRadius: "14px",
  padding: "12px 14px",
  fontSize: "15px",
  outline: "none",
  background: "#fff",
  color: "#111827",
};