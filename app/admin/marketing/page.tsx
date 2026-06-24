"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

type Product = {
  id: string | number;
  name: string;
  slug: string;
  price: number;
  category?: string;
  status?: string;
  stock_quantity?: number;
};

type Recipient = {
  id: string;
  email: string;
  name?: string;
  source: string;
  label: string;
  lastOrderAt?: string;
  daysSinceLastOrder?: number;
  completedOrderCount?: number;
};

type RecipientGroup = "newsletter" | "buyers" | "inactive30" | "inactive60" | "inactive90";

const groupLabels: Record<RecipientGroup, string> = {
  newsletter: "Người đăng ký nhận tin",
  buyers: "Khách đã mua hàng",
  inactive30: "Khách lâu chưa mua 30 ngày",
  inactive60: "Khách lâu chưa mua 60 ngày",
  inactive90: "Khách lâu chưa mua 90 ngày",
};

function money(value: number) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

export default function AdminMarketingPage() {
  const [campaignType, setCampaignType] = useState<"new_product" | "comeback">("new_product");
  const [recipientGroup, setRecipientGroup] = useState<RecipientGroup>("newsletter");
  const [recipients, setRecipients] = useState<Record<RecipientGroup, Recipient[]>>({
    newsletter: [],
    buyers: [],
    inactive30: [],
    inactive60: [],
    inactive90: [],
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState<string[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<Array<string | number>>([]);
  const [productSearch, setProductSearch] = useState("");
  const [couponCode, setCouponCode] = useState("COMEBACK10");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);

  async function loadData() {
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/marketing/data", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Không tải được dữ liệu marketing.");
      }

      setProducts(data.products || []);
      setRecipients({
        newsletter: data.recipients?.newsletter || [],
        buyers: data.recipients?.buyers || [],
        inactive30: data.recipients?.inactive30 || [],
        inactive60: data.recipients?.inactive60 || [],
        inactive90: data.recipients?.inactive90 || [],
      });
      setWarnings(data.warnings || []);
    } catch (error: any) {
      setMessage(error?.message || "Không tải được dữ liệu.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const currentRecipients = recipients[recipientGroup] || [];

  const selectedRecipients = useMemo(() => {
    const selected = new Set(selectedRecipientIds);
    return currentRecipients.filter((item) => selected.has(item.id));
  }, [currentRecipients, selectedRecipientIds]);

  const filteredProducts = useMemo(() => {
    const keyword = productSearch.trim().toLowerCase();

    if (!keyword) return products.slice(0, 80);

    return products
      .filter((product) => {
        const text = `${product.name} ${product.category || ""} ${product.status || ""}`.toLowerCase();
        return text.includes(keyword);
      })
      .slice(0, 80);
  }, [products, productSearch]);

  const selectedProducts = useMemo(() => {
    const selected = new Set(selectedProductIds.map(String));
    return products.filter((item) => selected.has(String(item.id)));
  }, [products, selectedProductIds]);

  function switchGroup(group: RecipientGroup) {
    setRecipientGroup(group);
    setSelectedRecipientIds([]);
  }

  function toggleRecipient(id: string) {
    setSelectedRecipientIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function toggleProduct(id: string | number) {
    setSelectedProductIds((prev) =>
      prev.map(String).includes(String(id))
        ? prev.filter((item) => String(item) !== String(id))
        : [...prev, id]
    );
  }

  async function sendCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSending(true);
    setMessage("");

    try {
      const response = await fetch("/api/admin/marketing/send-campaign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: campaignType,
          couponCode,
          recipients: selectedRecipients,
          products: selectedProducts.map((item) => ({
            name: item.name,
            slug: item.slug,
            price: item.price,
            status: item.status,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Gửi email thất bại.");
      }

      setMessage(data.message || "Đã gửi email.");
    } catch (error: any) {
      setMessage(error?.message || "Có lỗi khi gửi email.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="marketingAdminPage" style={styles.page}>
      <header style={styles.header}>
        <div>
          <p style={styles.eyebrow}>HMECHA CRM</p>
          <h1 style={styles.title}>Marketing Email</h1>
          <p style={styles.desc}>
            Quản lý email khách đăng ký nhận tin, khách đã mua hàng và khách lâu chưa quay lại.
          </p>
        </div>

        <button type="button" onClick={loadData} style={styles.reloadButton}>
          Tải lại dữ liệu
        </button>
      </header>

      {warnings.length ? (
        <div style={styles.warningBox}>
          {warnings.map((item) => (
            <p key={item} style={{ margin: "4px 0" }}>
              {item}
            </p>
          ))}
        </div>
      ) : null}

      {message ? <div style={styles.messageBox}>{message}</div> : null}

      <section style={styles.grid}>
        <form onSubmit={sendCampaign} style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>1. Chọn chiến dịch</h2>
            <p style={styles.cardDesc}>Chọn loại email sẽ gửi cho khách hàng.</p>
          </div>

          <div style={styles.segment}>
            <button
              type="button"
              onClick={() => setCampaignType("new_product")}
              style={{
                ...styles.segmentButton,
                ...(campaignType === "new_product" ? styles.segmentActive : null),
              }}
            >
              Sản phẩm mới / có hàng mới
            </button>

            <button
              type="button"
              onClick={() => setCampaignType("comeback")}
              style={{
                ...styles.segmentButton,
                ...(campaignType === "comeback" ? styles.segmentActive : null),
              }}
            >
              Nhắc khách quay lại
            </button>
          </div>

          {campaignType === "comeback" ? (
            <div style={styles.field}>
              <label style={styles.label}>Mã ưu đãi gửi khách</label>
              <input
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                style={styles.input}
                placeholder="COMEBACK10"
              />
            </div>
          ) : null}

          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>2. Chọn nhóm người nhận</h2>
            <p style={styles.cardDesc}>
              Có thể gửi cho email đăng ký ở footer hoặc khách đã từng mua hàng.
            </p>
          </div>

          <div style={styles.groupGrid}>
            {(Object.keys(groupLabels) as RecipientGroup[]).map((group) => (
              <button
                key={group}
                type="button"
                onClick={() => switchGroup(group)}
                style={{
                  ...styles.groupButton,
                  ...(recipientGroup === group ? styles.groupActive : null),
                }}
              >
                <strong>{groupLabels[group]}</strong>
                <span>{recipients[group]?.length || 0} email</span>
              </button>
            ))}
          </div>

          <div style={styles.toolbar}>
            <button
              type="button"
              style={styles.smallButton}
              onClick={() => setSelectedRecipientIds(currentRecipients.map((item) => item.id))}
            >
              Chọn tất cả
            </button>

            <button
              type="button"
              style={styles.smallButtonLight}
              onClick={() => setSelectedRecipientIds([])}
            >
              Bỏ chọn
            </button>
          </div>

          <div style={styles.listBox}>
            {loading ? (
              <p style={styles.emptyText}>Đang tải dữ liệu...</p>
            ) : currentRecipients.length ? (
              currentRecipients.map((recipient) => (
                <label key={recipient.id} style={styles.checkRow}>
                  <input
                    type="checkbox"
                    checked={selectedRecipientIds.includes(recipient.id)}
                    onChange={() => toggleRecipient(recipient.id)}
                  />
                  <span>
                    <strong>{recipient.name || recipient.email}</strong>
                    <small>
                      {recipient.email}
                      {recipient.daysSinceLastOrder
                        ? ` · ${recipient.daysSinceLastOrder} ngày chưa mua`
                        : ""}
                    </small>
                  </span>
                </label>
              ))
            ) : (
              <p style={styles.emptyText}>Chưa có email trong nhóm này.</p>
            )}
          </div>

          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>3. Chọn sản phẩm gửi kèm</h2>
            <p style={styles.cardDesc}>
              Lấy trực tiếp từ danh sách sản phẩm trong website, không cần nhập tay.
            </p>
          </div>

          <input
            value={productSearch}
            onChange={(event) => setProductSearch(event.target.value)}
            style={styles.input}
            placeholder="Tìm sản phẩm: Gundam, HG, RG, Bandai..."
          />

          <div style={styles.listBox}>
            {filteredProducts.length ? (
              filteredProducts.map((product) => (
                <label key={product.id} style={styles.checkRow}>
                  <input
                    type="checkbox"
                    checked={selectedProductIds.map(String).includes(String(product.id))}
                    onChange={() => toggleProduct(product.id)}
                  />
                  <span>
                    <strong>{product.name}</strong>
                    <small>
                      {money(product.price)}
                      {product.status ? ` · ${product.status}` : ""}
                    </small>
                  </span>
                </label>
              ))
            ) : (
              <p style={styles.emptyText}>Không tìm thấy sản phẩm.</p>
            )}
          </div>

          <button disabled={sending} style={styles.submitButton}>
            {sending
              ? "Đang gửi..."
              : `Gửi email cho ${selectedRecipients.length} khách`}
          </button>
        </form>

        <aside style={styles.previewCard}>
          <h2 style={styles.previewTitle}>Xem trước chiến dịch</h2>

          <div style={styles.previewSection}>
            <span style={styles.previewLabel}>Loại email</span>
            <strong>
              {campaignType === "new_product"
                ? "Thông báo sản phẩm mới"
                : "Nhắc khách quay lại"}
            </strong>
          </div>

          <div style={styles.previewSection}>
            <span style={styles.previewLabel}>Người nhận</span>
            <strong>{selectedRecipients.length} email đã chọn</strong>
            <p>{groupLabels[recipientGroup]}</p>
          </div>

          <div style={styles.previewSection}>
            <span style={styles.previewLabel}>Sản phẩm gửi kèm</span>
            {selectedProducts.length ? (
              selectedProducts.map((product) => (
                <div key={product.id} style={styles.productChip}>
                  <strong>{product.name}</strong>
                  <small>{money(product.price)}</small>
                </div>
              ))
            ) : (
              <p>Chưa chọn sản phẩm. Email vẫn gửi được nhưng nên chọn sản phẩm để nội dung hấp dẫn hơn.</p>
            )}
          </div>

          {campaignType === "comeback" ? (
            <div style={styles.couponBox}>
              <span>Mã quay lại</span>
              <strong>{couponCode || "COMEBACK10"}</strong>
            </div>
          ) : null}

          <div style={styles.flowBox}>
            <h3>Flow đang dùng</h3>
            <p>
              Footer lưu email khách chưa mua → Admin chọn nhóm nhận tin → chọn sản phẩm từ database → gửi email.
            </p>
            <p>
              Đơn hàng hoàn thành → lấy email khách đã mua → lọc khách lâu chưa mua → gửi email nhắc quay lại.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    display: "grid",
    gap: "22px",
    color: "#111827",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: "18px",
    alignItems: "flex-start",
    padding: "24px",
    borderRadius: "22px",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    boxShadow: "0 14px 36px rgba(15,23,42,.06)",
  },
  eyebrow: {
    margin: 0,
    color: "#dc2626",
    fontWeight: 900,
    letterSpacing: ".08em",
    fontSize: "12px",
  },
  title: {
    margin: "8px 0",
    fontSize: "32px",
    fontWeight: 900,
  },
  desc: {
    margin: 0,
    color: "#6b7280",
    lineHeight: 1.6,
  },
  reloadButton: {
    border: "1px solid #fecaca",
    borderRadius: "14px",
    background: "#fff1f2",
    color: "#b91c1c",
    padding: "11px 14px",
    fontWeight: 800,
    cursor: "pointer",
  },
  warningBox: {
    padding: "14px 16px",
    borderRadius: "16px",
    background: "#fffbeb",
    border: "1px solid #fde68a",
    color: "#92400e",
    fontWeight: 700,
  },
  messageBox: {
    padding: "14px 16px",
    borderRadius: "16px",
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#166534",
    fontWeight: 800,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1.35fr) minmax(340px, .65fr)",
    gap: "20px",
    alignItems: "start",
  },
  card: {
    display: "grid",
    gap: "18px",
    padding: "24px",
    borderRadius: "22px",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    boxShadow: "0 14px 36px rgba(15,23,42,.06)",
  },
  cardHeader: {
    borderTop: "1px solid #f3f4f6",
    paddingTop: "16px",
  },
  cardTitle: {
    margin: 0,
    fontSize: "19px",
    fontWeight: 900,
  },
  cardDesc: {
    margin: "6px 0 0",
    color: "#6b7280",
    lineHeight: 1.55,
  },
  segment: {
    display: "grid",
    gridTemplateColumns: "repeat(2,minmax(0,1fr))",
    gap: "10px",
  },
  segmentButton: {
    border: "1px solid #334155",
    borderRadius: "16px",
    padding: "13px",
    background: "#1e293b",
    color: "#f8fafc",
    fontWeight: 800,
    cursor: "pointer",
  },
  segmentActive: {
    background: "#dc2626",
    borderColor: "#dc2626",
    color: "#ffffff",
  },
  field: {
    display: "grid",
    gap: "8px",
  },
  label: {
    fontWeight: 800,
    color: "#374151",
  },
  input: {
    width: "100%",
    border: "1px solid #d1d5db",
    borderRadius: "14px",
    padding: "12px 14px",
    color: "#111827",
    background: "#ffffff",
    outline: "none",
  },
  groupGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2,minmax(0,1fr))",
    gap: "10px",
  },
  groupButton: {
    textAlign: "left",
    border: "1px solid #334155",
    borderRadius: "16px",
    padding: "14px",
    background: "#1e293b",
    color: "#f8fafc",
    cursor: "pointer",
    display: "grid",
    gap: "5px",
  },
  groupActive: {
    borderColor: "#f97316",
    background: "#7f1d1d",
    color: "#ffffff",
  },
  toolbar: {
    display: "flex",
    gap: "10px",
  },
  smallButton: {
    border: "none",
    borderRadius: "999px",
    background: "#111827",
    color: "#fff",
    padding: "9px 12px",
    fontWeight: 800,
    cursor: "pointer",
  },
  smallButtonLight: {
    border: "1px solid #e5e7eb",
    borderRadius: "999px",
    background: "#fff",
    color: "#374151",
    padding: "9px 12px",
    fontWeight: 800,
    cursor: "pointer",
  },
  listBox: {
    maxHeight: "320px",
    overflow: "auto",
    border: "1px solid #e5e7eb",
    borderRadius: "18px",
    background: "#f9fafb",
    padding: "8px",
    display: "grid",
    gap: "6px",
  },
  checkRow: {
    display: "grid",
    gridTemplateColumns: "22px 1fr",
    gap: "10px",
    alignItems: "start",
    padding: "10px",
    borderRadius: "14px",
    background: "#ffffff",
    border: "1px solid #f3f4f6",
    cursor: "pointer",
  },
  emptyText: {
    margin: 0,
    padding: "18px",
    color: "#6b7280",
  },
  submitButton: {
    border: "none",
    borderRadius: "16px",
    padding: "14px 18px",
    background: "#dc2626",
    color: "#ffffff",
    fontWeight: 900,
    cursor: "pointer",
  },
  previewCard: {
    position: "sticky",
    top: "20px",
    display: "grid",
    gap: "16px",
    padding: "22px",
    borderRadius: "22px",
    background: "#111827",
    color: "#ffffff",
  },
  previewTitle: {
    margin: 0,
    fontSize: "22px",
    fontWeight: 900,
  },
  previewSection: {
    display: "grid",
    gap: "8px",
    padding: "14px",
    borderRadius: "16px",
    background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.1)",
  },
  previewLabel: {
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: 900,
    textTransform: "uppercase",
  },
  productChip: {
    display: "grid",
    gap: "4px",
    borderRadius: "12px",
    background: "#1e293b",
    color: "#f8fafc",
    border: "1px solid #334155",
    padding: "10px",
  },
  couponBox: {
    display: "grid",
    gap: "6px",
    borderRadius: "16px",
    background: "#3b1d1d",
    color: "#fecaca",
    border: "1px solid #7f1d1d",
    padding: "14px",
  },
  flowBox: {
    color: "#cbd5e1",
    fontSize: "14px",
    lineHeight: 1.6,
  },
};