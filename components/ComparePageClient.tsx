"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CompareItem = {
  id?: string;
  name: string;
  slug: string;
  sku?: string;
  price: number;
  image?: string;
  images?: string[];
  status?: string;
  brand?: string;
  category?: string;
  badge?: string | null;
};

function money(value: number) {
  return Number(value || 0).toLocaleString("vi-VN") + "₫";
}

function readList(): CompareItem[] {
  try {
    return JSON.parse(localStorage.getItem("hmecha-compare") || "[]");
  } catch {
    return [];
  }
}

export default function ComparePageClient() {
  const [items, setItems] = useState<CompareItem[]>([]);

  function sync() {
    setItems(readList());
  }

  useEffect(() => {
    sync();
    window.addEventListener("hmecha-compare-updated", sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener("hmecha-compare-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  function remove(slug: string) {
    const next = items.filter((item) => item.slug !== slug);
    localStorage.setItem("hmecha-compare", JSON.stringify(next));
    window.dispatchEvent(new Event("hmecha-compare-updated"));
    setItems(next);
  }

  function clear() {
    localStorage.removeItem("hmecha-compare");
    window.dispatchEvent(new Event("hmecha-compare-updated"));
    setItems([]);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "42px 20px 90px",
        color: "#fff",
        background:
          "radial-gradient(circle at 12% 0%, rgba(124,77,255,.2), transparent 30%), radial-gradient(circle at 90% 0%, rgba(0,229,255,.16), transparent 30%), linear-gradient(180deg, #050816 0%, #081226 100%)",
      }}
    >
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <Link href="/" style={{ color: "#00e5ff", fontWeight: 900, textDecoration: "none" }}>
          ← Về trang chủ
        </Link>

        <section
          style={{
            marginTop: 24,
            border: "1px solid rgba(0,229,255,.2)",
            borderRadius: 24,
            padding: 26,
            background: "rgba(7,12,32,.86)",
          }}
        >
          <p style={{ color: "#00e5ff", letterSpacing: 4, fontWeight: 950, margin: 0 }}>
            HMECHA COMPARE
          </p>
          <h1 style={{ fontSize: "clamp(38px, 5vw, 64px)", margin: "10px 0" }}>
            So sánh sản phẩm
          </h1>
          <p style={{ color: "#c5d2f2", margin: 0 }}>
            Chọn tối đa 4 sản phẩm để so sánh giá, tình trạng, thương hiệu và thông tin cơ bản.
          </p>
        </section>

        {items.length === 0 ? (
          <section
            style={{
              marginTop: 22,
              border: "1px solid rgba(0,229,255,.2)",
              borderRadius: 22,
              padding: 26,
              background: "rgba(7,12,32,.84)",
            }}
          >
            <h2>Chưa có sản phẩm để so sánh</h2>
            <p style={{ color: "#c5d2f2" }}>
              Hãy vào trang chi tiết sản phẩm và bấm “So sánh sản phẩm”.
            </p>
            <Link
              href="/"
              style={{
                display: "inline-grid",
                placeItems: "center",
                minHeight: 46,
                borderRadius: 12,
                padding: "0 18px",
                color: "#061020",
                fontWeight: 950,
                textDecoration: "none",
                background: "linear-gradient(135deg,#7c4dff,#00e5ff)",
              }}
            >
              Mua sắm ngay
            </Link>
          </section>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, margin: "18px 0" }}>
              <strong style={{ color: "#00e5ff" }}>Đang so sánh {items.length} sản phẩm</strong>
              <button
                type="button"
                onClick={clear}
                style={{
                  border: "1px solid rgba(255,255,255,.18)",
                  borderRadius: 12,
                  minHeight: 40,
                  padding: "0 14px",
                  background: "rgba(255,255,255,.08)",
                  color: "#fff",
                  fontWeight: 900,
                  cursor: "pointer",
                }}
              >
                Xóa tất cả
              </button>
            </div>

            <section
              style={{
                overflowX: "auto",
                border: "1px solid rgba(0,229,255,.2)",
                borderRadius: 22,
                background: "rgba(7,12,32,.84)",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
                <tbody>
                  <tr>
                    <th style={th}>Sản phẩm</th>
                    {items.map((item) => (
                      <td style={td} key={item.slug}>
                        <img
                          src={item.image || item.images?.[0] || "/placeholder.png"}
                          alt={item.name}
                          style={{
                            width: 150,
                            height: 150,
                            objectFit: "cover",
                            borderRadius: 16,
                            border: "1px solid rgba(0,229,255,.22)",
                            background: "#000",
                          }}
                        />
                        <h3 style={{ margin: "12px 0 8px" }}>{item.name}</h3>
                        <button
                          type="button"
                          onClick={() => remove(item.slug)}
                          style={{
                            border: 0,
                            borderRadius: 999,
                            padding: "7px 11px",
                            background: "rgba(255,79,216,.18)",
                            color: "#fff",
                            fontWeight: 900,
                            cursor: "pointer",
                          }}
                        >
                          Bỏ khỏi so sánh
                        </button>
                      </td>
                    ))}
                  </tr>

                  <Row label="Giá" values={items.map((item) => money(item.price))} />
                  <Row label="Mã SKU" values={items.map((item) => item.sku || "Đang cập nhật")} />
                  <Row label="Thương hiệu" values={items.map((item) => item.brand || "Đang cập nhật")} />
                  <Row label="Danh mục" values={items.map((item) => item.category || "Đang cập nhật")} />
                  <Row label="Tình trạng" values={items.map((item) => item.status || "Đang cập nhật")} />
                  <Row label="Nhãn" values={items.map((item) => item.badge || "Không có")} />

                  <tr>
                    <th style={th}>Hành động</th>
                    {items.map((item) => (
                      <td style={td} key={item.slug}>
                        <Link
                          href={"/" + item.slug}
                          style={{
                            display: "grid",
                            placeItems: "center",
                            minHeight: 44,
                            borderRadius: 12,
                            textDecoration: "none",
                            color: "#061020",
                            fontWeight: 950,
                            background: "linear-gradient(135deg,#7c4dff,#00e5ff)",
                          }}
                        >
                          Xem chi tiết
                        </Link>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

const th: React.CSSProperties = {
  width: 170,
  padding: 18,
  textAlign: "left",
  color: "#00e5ff",
  borderBottom: "1px solid rgba(255,255,255,.1)",
  verticalAlign: "top",
};

const td: React.CSSProperties = {
  padding: 18,
  borderBottom: "1px solid rgba(255,255,255,.1)",
  color: "#fff",
  verticalAlign: "top",
};

function Row({ label, values }: { label: string; values: string[] }) {
  return (
    <tr>
      <th style={th}>{label}</th>
      {values.map((value, index) => (
        <td style={td} key={index}>
          {value}
        </td>
      ))}
    </tr>
  );
}
