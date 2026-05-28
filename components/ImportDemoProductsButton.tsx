
"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";
import { importProducts } from "../data/importProducts";

export default function ImportDemoProductsButton() {
  const [loading, setLoading] = useState(false);

  async function importDemoProducts() {
    if (loading) return;

    const ok = confirm(
      `Import ${importProducts.length} sản phẩm mẫu vào Supabase?\nSản phẩm trùng slug sẽ được bỏ qua.`
    );

    if (!ok) return;

    setLoading(true);

    try {
      const slugs = importProducts.map((item) => item.slug);

      const { data: existingProducts, error: checkError } = await supabase
        .from("products")
        .select("slug")
        .in("slug", slugs);

      if (checkError) {
        alert("Lỗi kiểm tra sản phẩm trùng: " + checkError.message);
        setLoading(false);
        return;
      }

      const existingSlugs = new Set((existingProducts || []).map((item) => item.slug));
      const newProducts = importProducts.filter((item) => !existingSlugs.has(item.slug));

      if (newProducts.length === 0) {
        alert("Tất cả sản phẩm mẫu đã có trong database rồi.");
        setLoading(false);
        return;
      }

      const { data: insertedProducts, error: insertError } = await supabase
        .from("products")
        .insert(
          newProducts.map(({ images, ...product }) => ({
            ...product,
          }))
        )
        .select("id, slug");

      if (insertError) {
        alert("Lỗi import sản phẩm: " + insertError.message);
        setLoading(false);
        return;
      }

      const imageRows = (insertedProducts || []).flatMap((product) => {
        const sourceProduct = newProducts.find((item) => item.slug === product.slug);
        return (sourceProduct?.images || []).map((imageUrl, index) => ({
          product_id: product.id,
          image_url: imageUrl,
          sort_order: index + 1,
        }));
      });

      if (imageRows.length > 0) {
        const { error: imageError } = await supabase
          .from("product_images")
          .insert(imageRows);

        if (imageError) {
          alert("Đã import sản phẩm nhưng lỗi lưu ảnh: " + imageError.message);
          setLoading(false);
          return;
        }
      }

      alert(`Import xong ${newProducts.length} sản phẩm. Bấm OK để tải lại trang.`);
      window.location.reload();
    } catch (error: any) {
      alert("Lỗi import: " + error.message);
    }

    setLoading(false);
  }

  return (
    <button type="button" className="importBtn" onClick={importDemoProducts} disabled={loading}>
      {loading ? "Đang import..." : "Import sản phẩm mẫu"}

      <style jsx>{`
        .importBtn {
          border: none;
          border-radius: 16px;
          padding: 15px 20px;
          cursor: pointer;
          font-weight: 950;
          color: #050816;
          background: linear-gradient(135deg, #ff78d2, #00e5ff);
          box-shadow: 0 0 24px rgba(0, 229, 255, 0.22);
        }

        .importBtn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </button>
  );
}
