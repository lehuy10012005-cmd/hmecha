"use client";

import { useEffect, useState } from "react";

type ProductLike = {
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

function getCompareList(): ProductLike[] {
  try {
    return JSON.parse(localStorage.getItem("hmecha-compare") || "[]");
  } catch {
    return [];
  }
}

function saveCompareList(list: ProductLike[]) {
  localStorage.setItem("hmecha-compare", JSON.stringify(list));
  window.dispatchEvent(new Event("hmecha-compare-updated"));
}

export default function CompareButton({
  product,
  variant = "side",
}: {
  product: ProductLike;
  variant?: "side" | "compact";
}) {
  const [active, setActive] = useState(false);

  function sync() {
    const list = getCompareList();
    setActive(list.some((item) => item.slug === product.slug));
  }

  useEffect(() => {
    sync();

    window.addEventListener("hmecha-compare-updated", sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener("hmecha-compare-updated", sync);
      window.removeEventListener("storage", sync);
    };
  }, [product.slug]);

  function toggleCompare() {
    const list = getCompareList();
    const existed = list.some((item) => item.slug === product.slug);

    if (existed) {
      const next = list.filter((item) => item.slug !== product.slug);
      saveCompareList(next);
      setActive(false);
      alert("Đã bỏ khỏi danh sách so sánh.");
      return;
    }

    if (list.length >= 4) {
      alert("Chỉ có thể so sánh tối đa 4 sản phẩm.");
      return;
    }

    const next = [
      ...list,
      {
        ...product,
        image: product.image || product.images?.[0] || "",
      },
    ];

    saveCompareList(next);
    setActive(true);
    alert("Đã thêm vào so sánh.");
  }

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={toggleCompare}
        title={active ? "Đã thêm so sánh" : "So sánh sản phẩm"}
        style={{
          minHeight: 36,
          borderRadius: 999,
          border: "1px solid rgba(0,229,255,.24)",
          background: active ? "rgba(0,229,255,.18)" : "rgba(255,255,255,.06)",
          color: "#ffffff",
          padding: "0 10px",
          fontWeight: 900,
          cursor: "pointer",
        }}
      >
        ⇄
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleCompare}
      style={{
        width: "100%",
        minHeight: 56,
        borderRadius: 14,
        border: "1px solid rgba(0,229,255,.24)",
        background: active
          ? "linear-gradient(135deg, rgba(124,77,255,.28), rgba(0,229,255,.16))"
          : "rgba(255,255,255,.045)",
        color: "#ffffff",
        fontSize: 18,
        fontWeight: 900,
        cursor: "pointer",
      }}
    >
      {active ? "✓ Đã thêm so sánh" : "⇄ So sánh sản phẩm"}
    </button>
  );
}
