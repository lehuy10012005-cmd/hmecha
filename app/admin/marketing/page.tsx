"use client";

import { FormEvent, useMemo, useState } from "react";
import type { CSSProperties } from "react";

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

  const preview = useMemo(() => {
    if (type === "new_product") {
      return {
        title: "Thông báo sản phẩm mới",
        subject: productName
          ? `HMECHA vừa có hàng mới: ${productName}`
          : "HMECHA vừa có sản phẩm mới",
        body:
          "Email này dùng để thông báo cho khách về sản phẩm mới, sản phẩm vừa restock hoặc mẫu đang được quan tâm.",
      };
    }

    return {
      title: "Nhắc khách quay lại",
      subject: "HMECHA có vài mẫu mới dành cho bạn",
      body:
        "Email này dùng để chăm sóc khách hàng cũ, nhắc khách lâu chưa mua quay lại website kèm mã ưu đãi.",
    };
  }, [type, productName]);

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

      setResult(data.message || "Đã gửi email.");
    } catch (error: any) {
      setResult(error?.message || "Có lỗi xảy ra khi gửi email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>CRM & EMAIL MARKETING</p>
          <h1 style={styles.title}>Marketing Email</h1>
          <p style={styles.description}>
            Gửi email chăm sóc khách hàng, thông báo sản phẩm mới và nhắc khách cũ quay lại HMECHA.
          </p>
        </div>

        <div style={styles.statusBadge}>
          <span style={styles.statusDot} />
          Sẵn sàng gửi test
        </div>
      </header>

      <section style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Kịch bản</span>
          <strong style={styles.statValue}>2</strong>
          <p style={styles.statText}>Hàng mới và khách cũ</p>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statLabel}>Kênh gửi</span>
          <strong style={styles.statValue}>Email</strong>
          <p style={styles.statText}>Gmail SMTP</p>
        </div>

        <div style={styles.statCard}>
          <span style={styles.statLabel}>Trạng thái</span>
          <strong style={styles.statValue}>Test</strong>
          <p style={styles.statText}>Gửi thử trước khi dùng thật</p>
        </div>
      </section>

      <section style={styles.workArea}>
        <form onSubmit={handleSubmit} style={styles.formCard}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>Tạo email gửi khách hàng</h2>
            <p style={styles.sectionDesc}>
              Nhập thông tin cần gửi, hệ thống sẽ tạo nội dung email theo đúng loại chiến dịch.
            </p>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Loại chiến dịch</label>
            <select
              value={type}
              onChange={(event) => setType(event.target.value as EmailType)}
              style={styles.input}
            >
              <option value="new_product">Thông báo sản phẩm mới / có hàng mới</option>
              <option value="comeback">Nhắc khách lâu chưa mua quay lại</option>
            </select>
          </div>

          <div style={styles.twoCols}>
            <div style={styles.field}>
              <label style={styles.label}>Email người nhận</label>
              <input
                value={to}
                onChange={(event) => setTo(event.target.value)}
                placeholder="customer@gmail.com"
                style={styles.input}
                required
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Tên khách hàng</label>
              <input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Ví dụ: Huy"
                style={styles.input}
              />
            </div>
          </div>

          {type === "new_product" ? (
            <div style={styles.innerBox}>
              <div style={styles.field}>
                <label style={styles.label}>Tên sản phẩm</label>
                <input
                  value={productName}
                  onChange={(event) => setProductName(event.target.value)}
                  placeholder="Ví dụ: MGSD Destiny Gundam"
                  style={styles.input}
                />
              </div>

              <div style={styles.twoCols}>
                <div style={styles.field}>
                  <label style={styles.label}>Giá sản phẩm</label>
                  <input
                    value={productPrice}
                    onChange={(event) => setProductPrice(event.target.value)}
                    placeholder="Ví dụ: 1040000"
                    style={styles.input}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Slug / link sản phẩm</label>
                  <input
                    value={productSlug}
                    onChange={(event) => setProductSlug(event.target.value)}
                    placeholder="Ví dụ: mgsd-destiny-gundam"
                    style={styles.input}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.innerBox}>
              <div style={styles.field}>
                <label style={styles.label}>Mã ưu đãi gửi khách</label>
                <input
                  value={couponCode}
                  onChange={(event) => setCouponCode(event.target.value)}
                  placeholder="Ví dụ: COMEBACK10"
                  style={styles.input}
                />
              </div>
            </div>
          )}

          <button disabled={loading} style={styles.submitButton}>
            {loading ? "Đang gửi email..." : "Gửi email"}
          </button>

          {result ? (
            <div
              style={{
                ...styles.resultBox,
                ...(result.includes("Đã gửi") ? styles.resultSuccess : styles.resultError),
              }}
            >
              {result}
            </div>
          ) : null}
        </form>

        <aside style={styles.previewCard}>
          <div style={styles.previewTop}>
            <span style={styles.previewIcon}>✉</span>
            <div>
              <h2 style={styles.previewTitle}>{preview.title}</h2>
              <p style={styles.previewDesc}>Xem nhanh nội dung trước khi gửi</p>
            </div>
          </div>

          <div style={styles.emailMockup}>
            <div style={styles.emailHeader}>
              <span style={styles.emailFrom}>HMECHA</span>
              <span style={styles.emailTag}>
                {type === "new_product" ? "Hàng mới" : "Chăm sóc khách cũ"}
              </span>
            </div>

            <h3 style={styles.emailSubject}>{preview.subject}</h3>
            <p style={styles.emailBody}>{preview.body}</p>

            {type === "new_product" ? (
              <div style={styles.productPreview}>
                <strong>{productName || "Tên sản phẩm sẽ hiển thị ở đây"}</strong>
                <span>{productPrice ? `${Number(productPrice).toLocaleString("vi-VN")}đ` : "Giá sản phẩm"}</span>
              </div>
            ) : (
              <div style={styles.couponPreview}>
                <span>Mã quay lại</span>
                <strong>{couponCode || "COMEBACK10"}</strong>
              </div>
            )}

            <div style={styles.emailButton}>
              {type === "new_product" ? "Xem sản phẩm" : "Quay lại HMECHA"}
            </div>
          </div>

          <div style={styles.noteBox}>
            <strong>Lưu ý</strong>
            <p>
              Đây là khu vực gửi email kiểm thử. Khi cần dùng thật, có thể mở rộng thêm danh sách khách nhận tin và bộ lọc khách lâu chưa mua.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    display: "grid",
    gap: "24px",
  },
  header: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "24px",
    padding: "26px",
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    alignItems: "flex-start",
    boxShadow: "0 18px 45px rgba(15,23,42,.06)",
  },
  eyebrow: {
    margin: 0,
    color: "#dc2626",
    fontWeight: 900,
    letterSpacing: ".08em",
    fontSize: "12px",
  },
  title: {
    margin: "8px 0 8px",
    fontSize: "34px",
    lineHeight: 1.1,
    color: "#111827",
    fontWeight: 900,
  },
  description: {
    margin: 0,
    maxWidth: "720px",
    color: "#6b7280",
    fontSize: "15px",
    lineHeight: 1.6,
  },
  statusBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    border: "1px solid #bbf7d0",
    background: "#f0fdf4",
    color: "#166534",
    borderRadius: "999px",
    padding: "9px 13px",
    fontWeight: 800,
    fontSize: "13px",
    whiteSpace: "nowrap",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "999px",
    background: "#22c55e",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "16px",
  },
  statCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "20px",
    padding: "18px",
    boxShadow: "0 12px 30px rgba(15,23,42,.05)",
  },
  statLabel: {
    color: "#6b7280",
    fontSize: "13px",
    fontWeight: 800,
  },
  statValue: {
    display: "block",
    marginTop: "8px",
    fontSize: "24px",
    color: "#111827",
  },
  statText: {
    margin: "6px 0 0",
    color: "#9ca3af",
    fontSize: "13px",
  },
  workArea: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.3fr) minmax(340px, .7fr)",
    gap: "20px",
    alignItems: "start",
  },
  formCard: {
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "24px",
    padding: "24px",
    display: "grid",
    gap: "18px",
    boxShadow: "0 18px 45px rgba(15,23,42,.06)",
  },
  sectionHeader: {
    borderBottom: "1px solid #f3f4f6",
    paddingBottom: "16px",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "22px",
    color: "#111827",
    fontWeight: 900,
  },
  sectionDesc: {
    margin: "8px 0 0",
    color: "#6b7280",
    lineHeight: 1.55,
  },
  twoCols: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
  },
  field: {
    display: "grid",
    gap: "8px",
  },
  label: {
    color: "#374151",
    fontWeight: 800,
    fontSize: "14px",
  },
  input: {
    width: "100%",
    border: "1px solid #d1d5db",
    borderRadius: "14px",
    padding: "12px 14px",
    fontSize: "15px",
    outline: "none",
    background: "#ffffff",
    color: "#111827",
  },
  innerBox: {
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    borderRadius: "20px",
    padding: "18px",
    display: "grid",
    gap: "16px",
  },
  submitButton: {
    border: "none",
    borderRadius: "16px",
    padding: "14px 20px",
    background: "#dc2626",
    color: "#ffffff",
    fontWeight: 900,
    fontSize: "15px",
    cursor: "pointer",
    boxShadow: "0 14px 30px rgba(220,38,38,.25)",
  },
  resultBox: {
    borderRadius: "16px",
    padding: "14px 16px",
    fontWeight: 800,
    fontSize: "14px",
  },
  resultSuccess: {
    background: "#ecfdf5",
    color: "#047857",
    border: "1px solid #bbf7d0",
  },
  resultError: {
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fecaca",
  },
  previewCard: {
    background: "#111827",
    color: "#ffffff",
    borderRadius: "24px",
    padding: "22px",
    display: "grid",
    gap: "18px",
    boxShadow: "0 18px 45px rgba(15,23,42,.18)",
  },
  previewTop: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  previewIcon: {
    width: "42px",
    height: "42px",
    borderRadius: "14px",
    display: "grid",
    placeItems: "center",
    background: "#dc2626",
    fontSize: "20px",
  },
  previewTitle: {
    margin: 0,
    fontSize: "19px",
    fontWeight: 900,
  },
  previewDesc: {
    margin: "4px 0 0",
    color: "#94a3b8",
    fontSize: "13px",
  },
  emailMockup: {
    background: "#ffffff",
    color: "#111827",
    borderRadius: "20px",
    padding: "18px",
    display: "grid",
    gap: "14px",
  },
  emailHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
    alignItems: "center",
  },
  emailFrom: {
    fontWeight: 900,
    color: "#dc2626",
  },
  emailTag: {
    borderRadius: "999px",
    padding: "5px 9px",
    background: "#fee2e2",
    color: "#b91c1c",
    fontWeight: 800,
    fontSize: "12px",
  },
  emailSubject: {
    margin: 0,
    fontSize: "18px",
    lineHeight: 1.35,
  },
  emailBody: {
    margin: 0,
    color: "#6b7280",
    lineHeight: 1.6,
    fontSize: "14px",
  },
  productPreview: {
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    padding: "14px",
    display: "grid",
    gap: "6px",
    background: "#f9fafb",
  },
  couponPreview: {
    border: "1px solid #fecaca",
    borderRadius: "16px",
    padding: "14px",
    display: "grid",
    gap: "6px",
    background: "#fff1f2",
    color: "#b91c1c",
  },
  emailButton: {
    display: "inline-flex",
    justifyContent: "center",
    borderRadius: "999px",
    background: "#dc2626",
    color: "#ffffff",
    fontWeight: 900,
    padding: "11px 16px",
  },
  noteBox: {
    border: "1px solid rgba(255,255,255,.12)",
    background: "rgba(255,255,255,.06)",
    borderRadius: "18px",
    padding: "16px",
    color: "#cbd5e1",
    fontSize: "14px",
    lineHeight: 1.6,
  },
};