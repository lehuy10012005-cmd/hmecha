"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type ProductImage = {
  image_url: string;
  sort_order: number | null;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  price: number;
  brand: string | null;
  category: string | null;
  status: string | null;
  stock_quantity: number | null;
  low_stock_threshold: number | null;
  badge: string | null;
  sold_count: number;
  stock_level: "normal" | "low" | "out";
  stock_updated_at: string | null;
  product_images?: ProductImage[];
};

type EditState = {
  stockQuantity: string;
  changeQuantity: string;
  status: string;
  threshold: string;
  note: string;
};

function money(value: number) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

function mainImage(product: Product) {
  const images = product.product_images || [];
  const sorted = [...images].sort(
    (a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0)
  );

  return sorted[0]?.image_url || "";
}

function stockLabel(product: Product) {
  const stock = Number(product.stock_quantity || 0);

  if (stock <= 0) return "Hết hàng";
  if (product.stock_level === "low") return "Sắp hết";
  return "Ổn định";
}

function stockColor(product: Product) {
  const stock = Number(product.stock_quantity || 0);

  if (stock <= 0) return "#ff4f8b";
  if (product.stock_level === "low") return "#ffd166";
  return "#00e5ff";
}

const cardStyle = {
  border: "1px solid rgba(0,229,255,.2)",
  background:
    "radial-gradient(circle at 0% 0%, rgba(124,77,255,.14), transparent 34%), rgba(7,12,32,.84)",
  boxShadow: "0 18px 42px rgba(0,0,0,.22)",
};

export default function AdminInventoryPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [edits, setEdits] = useState<Record<string, EditState>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [keyword, setKeyword] = useState("");
  const [filter, setFilter] = useState("Tất cả");

  async function loadProducts() {
    setLoading(true);

    const response = await fetch("/api/admin/inventory", { cache: "no-store" });
    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Không tải được tồn kho.");
      setLoading(false);
      return;
    }

    const list = data.products || [];
    setProducts(list);

    const nextEdits: Record<string, EditState> = {};

    for (const product of list) {
      nextEdits[product.id] = {
        stockQuantity: String(Number(product.stock_quantity || 0)),
        changeQuantity: "1",
        status: product.status || "Còn hàng",
        threshold: String(Number(product.low_stock_threshold || 3)),
        note: "",
      };
    }

    setEdits(nextEdits);
    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const stats = useMemo(() => {
    const totalStock = products.reduce(
      (sum, product) => sum + Number(product.stock_quantity || 0),
      0
    );

    const low = products.filter((product) => product.stock_level === "low").length;
    const out = products.filter((product) => product.stock_level === "out").length;
    const preOrder = products.filter((product) => product.status === "Đặt trước").length;

    return {
      totalProducts: products.length,
      totalStock,
      low,
      out,
      preOrder,
    };
  }, [products]);

  const filtered = useMemo(() => {
    const cleanKeyword = keyword.toLowerCase().trim();

    return products.filter((product) => {
      const searchText = [
        product.name,
        product.slug,
        product.sku || "",
        product.category || "",
        product.brand || "",
      ]
        .join(" ")
        .toLowerCase();

      const matchKeyword = !cleanKeyword || searchText.includes(cleanKeyword);

      const matchFilter =
        filter === "Tất cả" ||
        (filter === "Sắp hết" && product.stock_level === "low") ||
        (filter === "Hết hàng" && product.stock_level === "out") ||
        (filter === "Đặt trước" && product.status === "Đặt trước") ||
        (filter === "Còn hàng" && product.status === "Còn hàng");

      return matchKeyword && matchFilter;
    });
  }, [products, keyword, filter]);

  function updateEdit(productId: string, field: keyof EditState, value: string) {
    setEdits((current) => ({
      ...current,
      [productId]: {
        ...current[productId],
        [field]: value,
      },
    }));
  }

  async function updateStock(product: Product, action: "set" | "increase" | "decrease") {
    const edit = edits[product.id];

    if (!edit) return;

    setSavingId(product.id);

    const response = await fetch("/api/admin/inventory", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId: product.id,
        action,
        stockQuantity: Number(edit.stockQuantity || 0),
        quantity: Number(edit.changeQuantity || 0),
        status: edit.status,
        lowStockThreshold: Number(edit.threshold || 3),
        note: edit.note,
      }),
    });

    const data = await response.json();
    setSavingId("");

    if (!response.ok) {
      alert(data.message || "Không cập nhật được tồn kho.");
      return;
    }

    alert(data.message || "Đã cập nhật tồn kho.");
    loadProducts();
  }

  return (
    <div style={{ color: "#fff", display: "grid", gap: 20 }}>
      <section style={{ ...cardStyle, borderRadius: 26, padding: 30 }}>
        <p
          style={{
            color: "#00e5ff",
            fontWeight: 950,
            letterSpacing: 4,
            margin: "0 0 8px",
          }}
        >
          HMECHA ADMIN
        </p>

        <h1
          style={{
            margin: 0,
            fontSize: "clamp(42px, 6vw, 68px)",
            lineHeight: 1.05,
          }}
        >
          Quản lý tồn kho
        </h1>

        <p style={{ color: "#c5d2f2", margin: "14px 0 0" }}>
          Theo dõi tồn kho, cảnh báo sắp hết hàng và cập nhật số lượng sản phẩm.
        </p>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 14,
        }}
      >
        <Stat label="Tổng sản phẩm" value={stats.totalProducts} />
        <Stat label="Tổng tồn kho" value={stats.totalStock} />
        <Stat label="Sắp hết" value={stats.low} />
        <Stat label="Hết hàng" value={stats.out} />
        <Stat label="Đặt trước" value={stats.preOrder} />
      </section>

      <section
        style={{
          ...cardStyle,
          borderRadius: 22,
          padding: 18,
          display: "grid",
          gridTemplateColumns: "1fr 220px auto",
          gap: 12,
        }}
      >
        <input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Tìm theo tên, SKU, slug, danh mục..."
          style={inputStyle}
        />

        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          style={inputStyle}
        >
          <option>Tất cả</option>
          <option>Còn hàng</option>
          <option>Sắp hết</option>
          <option>Hết hàng</option>
          <option>Đặt trước</option>
        </select>

        <button type="button" onClick={loadProducts} style={primaryButton}>
          Tải lại
        </button>
      </section>

      <section style={{ ...cardStyle, borderRadius: 24, overflow: "hidden" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.4fr 120px 120px 130px 1.6fr",
            gap: 14,
            padding: "16px 18px",
            color: "#00e5ff",
            fontWeight: 950,
            borderBottom: "1px solid rgba(255,255,255,.1)",
          }}
        >
          <span>Sản phẩm</span>
          <span>Đã bán</span>
          <span>Tồn kho</span>
          <span>Cảnh báo</span>
          <span>Cập nhật nhanh</span>
        </div>

        {loading ? (
          <div style={{ padding: 22, color: "#c5d2f2" }}>Đang tải tồn kho...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 22, color: "#c5d2f2" }}>Không tìm thấy sản phẩm.</div>
        ) : (
          filtered.map((product) => {
            const edit = edits[product.id];
            const img = mainImage(product);

            return (
              <article
                key={product.id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.4fr 120px 120px 130px 1.6fr",
                  gap: 14,
                  padding: 18,
                  borderBottom: "1px solid rgba(255,255,255,.1)",
                  alignItems: "center",
                }}
              >
                <div style={{ display: "flex", gap: 12, alignItems: "center", minWidth: 0 }}>
                  {img ? (
                    <img
                      src={img}
                      alt={product.name}
                      style={{
                        width: 72,
                        height: 72,
                        objectFit: "cover",
                        borderRadius: 14,
                        border: "1px solid rgba(0,229,255,.22)",
                        background: "#000",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 14,
                        display: "grid",
                        placeItems: "center",
                        background: "rgba(255,255,255,.06)",
                        color: "#9fb0d8",
                      }}
                    >
                      No image
                    </div>
                  )}

                  <div style={{ minWidth: 0 }}>
                    <strong style={{ display: "block", fontSize: 16 }}>{product.name}</strong>
                    <small style={{ color: "#9fb0d8" }}>
                      SKU: {product.sku || "Chưa có"} · {money(product.price)}
                    </small>
                    <br />
                    <Link
                      href={"/" + product.slug}
                      style={{ color: "#00e5ff", fontSize: 13, textDecoration: "none" }}
                    >
                      Xem sản phẩm
                    </Link>
                  </div>
                </div>

                <strong>{Number(product.sold_count || 0)}</strong>

                <strong style={{ color: stockColor(product), fontSize: 24 }}>
                  {Number(product.stock_quantity || 0)}
                </strong>

                <div>
                  <strong style={{ color: stockColor(product) }}>{stockLabel(product)}</strong>
                  <br />
                  <small style={{ color: "#9fb0d8" }}>
                    Ngưỡng: {Number(product.low_stock_threshold || 3)}
                  </small>
                </div>

                <div style={{ display: "grid", gap: 8 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    <input
                      value={edit?.stockQuantity || ""}
                      onChange={(event) =>
                        updateEdit(product.id, "stockQuantity", event.target.value)
                      }
                      type="number"
                      placeholder="Tồn mới"
                      style={smallInput}
                    />

                    <input
                      value={edit?.changeQuantity || ""}
                      onChange={(event) =>
                        updateEdit(product.id, "changeQuantity", event.target.value)
                      }
                      type="number"
                      placeholder="+/-"
                      style={smallInput}
                    />

                    <input
                      value={edit?.threshold || ""}
                      onChange={(event) =>
                        updateEdit(product.id, "threshold", event.target.value)
                      }
                      type="number"
                      placeholder="Ngưỡng"
                      style={smallInput}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <select
                      value={edit?.status || "Còn hàng"}
                      onChange={(event) =>
                        updateEdit(product.id, "status", event.target.value)
                      }
                      style={smallInput}
                    >
                      <option>Còn hàng</option>
                      <option>Hết hàng</option>
                      <option>Đặt trước</option>
                    </select>

                    <input
                      value={edit?.note || ""}
                      onChange={(event) => updateEdit(product.id, "note", event.target.value)}
                      placeholder="Ghi chú"
                      style={smallInput}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      disabled={savingId === product.id}
                      onClick={() => updateStock(product, "set")}
                      style={miniButton}
                    >
                      Set
                    </button>

                    <button
                      type="button"
                      disabled={savingId === product.id}
                      onClick={() => updateStock(product, "increase")}
                      style={miniButton}
                    >
                      + Nhập
                    </button>

                    <button
                      type="button"
                      disabled={savingId === product.id}
                      onClick={() => updateStock(product, "decrease")}
                      style={dangerButton}
                    >
                      - Xuất
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ ...cardStyle, borderRadius: 18, padding: 18 }}>
      <span style={{ color: "#9fb0d8" }}>{label}</span>
      <strong
        style={{
          display: "block",
          color: "#00e5ff",
          fontSize: 34,
          marginTop: 8,
        }}
      >
        {value}
      </strong>
    </div>
  );
}

const inputStyle = {
  minHeight: 48,
  borderRadius: 14,
  border: "1px solid rgba(0,229,255,.22)",
  background: "rgba(5,8,22,.9)",
  color: "#fff",
  padding: "0 14px",
  outline: "none",
};

const smallInput = {
  minHeight: 40,
  borderRadius: 11,
  border: "1px solid rgba(0,229,255,.2)",
  background: "rgba(5,8,22,.9)",
  color: "#fff",
  padding: "0 10px",
  outline: "none",
  width: "100%",
};

const primaryButton = {
  minHeight: 48,
  border: 0,
  borderRadius: 14,
  padding: "0 18px",
  fontWeight: 950,
  cursor: "pointer",
  color: "#061020",
  background: "linear-gradient(135deg,#7c4dff,#00e5ff)",
};

const miniButton = {
  minHeight: 38,
  border: 0,
  borderRadius: 11,
  padding: "0 12px",
  fontWeight: 950,
  cursor: "pointer",
  color: "#061020",
  background: "linear-gradient(135deg,#7c4dff,#00e5ff)",
};

const dangerButton = {
  ...miniButton,
  color: "#fff",
  background: "linear-gradient(135deg,#ff4fd8,#7c4dff)",
};
