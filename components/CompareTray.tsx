"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type CompareItem = {
  name: string;
  slug: string;
  price: number;
  image?: string;
};

function readList(): CompareItem[] {
  try {
    return JSON.parse(localStorage.getItem("hmecha-compare") || "[]");
  } catch {
    return [];
  }
}

export default function CompareTray() {
  const router = useRouter();
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

  if (!items.length) return null;

  return (
    <section
      style={{
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        bottom: 24,
        zIndex: 58,
        width: "min(720px, calc(100vw - 28px))",
        border: "1px solid rgba(0,229,255,.28)",
        borderRadius: 20,
        padding: 12,
        background: "rgba(7,12,32,.94)",
        color: "#fff",
        boxShadow: "0 22px 60px rgba(0,0,0,.45)",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 12,
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", gap: 10, overflow: "hidden", alignItems: "center" }}>
        <strong style={{ color: "#00e5ff", whiteSpace: "nowrap" }}>
          So sánh ({items.length}/4)
        </strong>

        {items.map((item) => (
          <div
            key={item.slug}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              minWidth: 0,
              padding: "7px 9px",
              borderRadius: 999,
              background: "rgba(255,255,255,.07)",
            }}
          >
            <span
              style={{
                maxWidth: 150,
                overflow: "hidden",
                whiteSpace: "nowrap",
                textOverflow: "ellipsis",
              }}
            >
              {item.name}
            </span>

            <button
              type="button"
              onClick={() => remove(item.slug)}
              style={{
                border: 0,
                width: 22,
                height: 22,
                borderRadius: 999,
                cursor: "pointer",
                fontWeight: 950,
              }}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button
          type="button"
          onClick={() => router.push("/so-sanh")}
          style={{
            minHeight: 40,
            border: 0,
            borderRadius: 12,
            padding: "0 14px",
            fontWeight: 950,
            cursor: "pointer",
            color: "#061020",
            background: "linear-gradient(135deg,#7c4dff,#00e5ff)",
          }}
        >
          So sánh ngay
        </button>

        <button
          type="button"
          onClick={clear}
          style={{
            minHeight: 40,
            borderRadius: 12,
            padding: "0 12px",
            fontWeight: 900,
            cursor: "pointer",
            color: "#fff",
            border: "1px solid rgba(255,255,255,.18)",
            background: "rgba(255,255,255,.08)",
          }}
        >
          Xóa
        </button>
      </div>
    </section>
  );
}
