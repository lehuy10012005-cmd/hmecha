"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "../../../../../lib/supabase";

type ProductImage = {
  id: string;
  image_url: string;
  sort_order: number | null;
};

function createSlug(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeImageUrl(url: string) {
  const trimmed = url.trim();

  if (!trimmed) return "";

  if (trimmed.startsWith("//")) {
    return "https:" + trimmed;
  }

  return trimmed;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = String(params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("Còn hàng");
  const [stockQuantity, setStockQuantity] = useState("0");
  const [badge, setBadge] = useState("");
  const [image1, setImage1] = useState("");
  const [image2, setImage2] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [fullDescription, setFullDescription] = useState("");

  async function loadProduct() {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        product_images (
          id,
          image_url,
          sort_order
        )
      `
      )
      .eq("id", productId)
      .single();

    if (error) {
      alert("Không tải được sản phẩm: " + error.message);
      setLoading(false);
      return;
    }

    const images = ((data.product_images || []) as ProductImage[]).sort(
      (a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0)
    );

    setName(data.name || "");
    setSlug(data.slug || "");
    setSku(data.sku || "");
    setPrice(String(data.price || ""));
    setBrand(data.brand || "");
    setCategory(data.category || "");
    setStatus(data.status || "Còn hàng");
    setStockQuantity(String(data.stock_quantity || 0));
    setBadge(data.badge || "");
    setImage1(images[0]?.image_url || "");
    setImage2(images[1]?.image_url || "");
    setShortDescription(data.short_description || "");
    setFullDescription(data.full_description || "");

    setLoading(false);
  }

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  function handleNameChange(value: string) {
    setName(value);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!name.trim()) {
      alert("Bạn chưa nhập tên sản phẩm.");
      return;
    }

    if (!slug.trim()) {
      alert("Bạn chưa nhập slug sản phẩm.");
      return;
    }

    if (!price || Number(price) <= 0) {
      alert("Bạn chưa nhập giá hợp lệ.");
      return;
    }

    setSaving(true);

    const productPayload = {
      name: name.trim(),
      slug: createSlug(slug.trim()),
      sku: sku.trim() || null,
      price: Number(price),
      brand: brand.trim() || null,
      category: category.trim() || null,
      status,
      stock_quantity: Number(stockQuantity || 0),
      badge: badge.trim() || null,
      short_description: shortDescription.trim() || null,
      full_description: fullDescription.trim() || null,
      is_active: true,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("products")
      .update(productPayload)
      .eq("id", productId);

    if (error) {
      setSaving(false);
      alert("Lỗi cập nhật sản phẩm: " + error.message);
      return;
    }

    const { error: deleteImageError } = await supabase
      .from("product_images")
      .delete()
      .eq("product_id", productId);

    if (deleteImageError) {
      setSaving(false);
      alert("Đã cập nhật sản phẩm nhưng lỗi xóa ảnh cũ: " + deleteImageError.message);
      return;
    }

    const images = [normalizeImageUrl(image1), normalizeImageUrl(image2)]
      .filter(Boolean)
      .map((url, index) => ({
        product_id: productId,
        image_url: url,
        sort_order: index,
      }));

    if (images.length > 0) {
      const { error: imageError } = await supabase
        .from("product_images")
        .insert(images);

      if (imageError) {
        setSaving(false);
        alert("Đã cập nhật sản phẩm nhưng lỗi thêm ảnh mới: " + imageError.message);
        return;
      }
    }

    alert("Đã cập nhật sản phẩm thành công.");
    router.push("/admin/products");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="editProductPage">
        <div className="loadingBox">Đang tải sản phẩm...</div>

        <style>{`
          .editProductPage {
            color: white;
          }

          .loadingBox {
            padding: 30px;
            border-radius: 20px;
            background: rgba(255,255,255,.08);
            border: 1px solid rgba(0,229,255,.2);
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="editProductPage">
      <div className="top">
        <div>
          <p className="eyebrow">HMECHA ADMIN</p>
          <h1>Sửa sản phẩm</h1>
          <span>Cập nhật thông tin sản phẩm trong Supabase.</span>
        </div>

        <Link href="/admin/products" className="backBtn">
          ← Quay lại sản phẩm
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="formPanel">
        <section className="formGrid">
          <div className="field full">
            <label>Tên sản phẩm *</label>
            <input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Slug *</label>
            <input
              value={slug}
              onChange={(e) => setSlug(createSlug(e.target.value))}
            />
            <small>Slug là đường link sản phẩm. Không dùng dấu cách.</small>
          </div>

          <div className="field">
            <label>SKU</label>
            <input value={sku} onChange={(e) => setSku(e.target.value)} />
          </div>

          <div className="field">
            <label>Giá *</label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              type="number"
              min="0"
            />
          </div>

          <div className="field">
            <label>Tồn kho</label>
            <input
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              type="number"
              min="0"
            />
          </div>

          <div className="field">
            <label>Thương hiệu</label>
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Bandai"
            />
          </div>

          <div className="field">
            <label>Danh mục</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Flash Sale</option>
              <option>Sản phẩm mới nhất</option>
              <option>Bán chạy</option>
              <option>Gundam Plastic Model Bandai</option>
              <option>30MM / 30MF / 30MS / 30MP</option>
              <option>Dòng Model Kit Khác</option>
              <option>OnePiece</option>
              <option>Phụ Kiện</option>
              <option>Metal Build</option>
            </select>
          </div>

          <div className="field">
            <label>Tình trạng</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>Còn hàng</option>
              <option>Hết hàng</option>
              <option>Đặt trước</option>
            </select>
          </div>

          <div className="field">
            <label>Badge</label>
            <select value={badge} onChange={(e) => setBadge(e.target.value)}>
              <option>Hàng mới</option>
              <option>Đặt trước</option>
              <option>Sale</option>
              <option>Admin</option>
              <option></option>
            </select>
          </div>

          <div className="field full">
            <label>Ảnh chính</label>
            <input
              value={image1}
              onChange={(e) => setImage1(e.target.value)}
              placeholder="Dán link ảnh sản phẩm chính"
            />
          </div>

          <div className="field full">
            <label>Ảnh phụ / ảnh hover</label>
            <input
              value={image2}
              onChange={(e) => setImage2(e.target.value)}
              placeholder="Dán link ảnh phụ nếu có"
            />
          </div>

          <div className="field full">
            <label>Mô tả ngắn</label>
            <textarea
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="field full">
            <label>Mô tả đầy đủ</label>
            <textarea
              value={fullDescription}
              onChange={(e) => setFullDescription(e.target.value)}
              rows={5}
            />
          </div>
        </section>

        <div className="previewPanel">
          <h2>Xem nhanh</h2>

          <div className="previewCard">
            <div className="previewImage">
              {image1 ? (
                <img src={normalizeImageUrl(image1)} alt={name || "Preview"} />
              ) : (
                <span>Chưa có ảnh</span>
              )}
            </div>

            <div className="previewInfo">
              <b>{name || "Tên sản phẩm"}</b>
              <small>/{slug || "slug-san-pham"}</small>
              <strong>
                {Number(price || 0).toLocaleString("vi-VN")}
                {price ? "₫" : ""}
              </strong>
              <em>{status}</em>
            </div>
          </div>
        </div>

        <div className="submitBar">
          <Link href="/admin/products" className="cancelBtn">
            Hủy
          </Link>

          <button disabled={saving} type="submit" className="saveBtn">
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>

      <style>{`
        .editProductPage {
          color: white;
        }

        .top {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: flex-start;
          margin-bottom: 24px;
        }

        .eyebrow {
          margin: 0;
          color: #00e5ff;
          font-weight: 950;
          letter-spacing: 2px;
        }

        h1 {
          margin: 8px 0;
          font-size: 42px;
          line-height: 1.1;
        }

        .top span {
          color: #b8c4e6;
        }

        .backBtn {
          text-decoration: none;
          border-radius: 14px;
          padding: 13px 18px;
          font-weight: 950;
          color: #dce6ff;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.14);
          white-space: nowrap;
        }

        .formPanel {
          display: grid;
          grid-template-columns: 1.5fr .8fr;
          gap: 20px;
        }

        .formGrid,
        .previewPanel {
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(0,229,255,.2);
          border-radius: 22px;
          padding: 20px;
          box-shadow: 0 0 34px rgba(124,77,255,.12);
        }

        .formGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field.full {
          grid-column: 1 / -1;
        }

        label {
          color: #00e5ff;
          font-weight: 950;
          font-size: 14px;
        }

        input,
        select,
        textarea {
          width: 100%;
          border: 1px solid rgba(255,255,255,.16);
          outline: none;
          border-radius: 14px;
          padding: 14px 15px;
          background: rgba(255,255,255,.94);
          color: #111827;
          font-weight: 750;
          font-family: inherit;
        }

        textarea {
          resize: vertical;
        }

        small {
          color: #8fa2d0;
        }

        .previewPanel {
          height: fit-content;
          position: sticky;
          top: 20px;
        }

        .previewPanel h2 {
          margin-top: 0;
          color: #00e5ff;
        }

        .previewCard {
          background: white;
          color: #111827;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(0,229,255,.35);
        }

        .previewImage {
          height: 260px;
          display: grid;
          place-items: center;
          background: #050816;
        }

        .previewImage img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .previewImage span {
          color: #94a3b8;
          font-weight: 900;
        }

        .previewInfo {
          padding: 16px;
        }

        .previewInfo b {
          display: block;
          font-size: 18px;
          line-height: 1.35;
          margin-bottom: 8px;
        }

        .previewInfo small {
          display: block;
          color: #64748b;
          margin-bottom: 12px;
        }

        .previewInfo strong {
          display: block;
          color: #00cfe8;
          font-size: 24px;
          margin-bottom: 12px;
        }

        .previewInfo em {
          display: inline-flex;
          color: #050816;
          background: linear-gradient(135deg,#7c4dff,#00e5ff);
          border-radius: 999px;
          padding: 7px 12px;
          font-style: normal;
          font-weight: 950;
        }

        .submitBar {
          grid-column: 1 / -1;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(0,229,255,.2);
          border-radius: 22px;
          padding: 16px;
        }

        .cancelBtn,
        .saveBtn {
          text-decoration: none;
          border: none;
          border-radius: 14px;
          padding: 14px 20px;
          font-weight: 950;
          cursor: pointer;
          font-size: 15px;
        }

        .cancelBtn {
          color: #dce6ff;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.14);
        }

        .saveBtn {
          color: #050816;
          background: linear-gradient(135deg,#7c4dff,#00e5ff);
          box-shadow: 0 0 24px rgba(0,229,255,.25);
        }

        .saveBtn:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        @media (max-width: 1000px) {
          .formPanel {
            grid-template-columns: 1fr;
          }

          .previewPanel {
            position: static;
          }
        }

        @media (max-width: 700px) {
          .top {
            display: block;
          }

          .backBtn {
            display: inline-flex;
            margin-top: 18px;
          }

          h1 {
            font-size: 34px;
          }

          .formGrid {
            grid-template-columns: 1fr;
          }

          .submitBar {
            flex-direction: column;
          }

          .cancelBtn,
          .saveBtn {
            text-align: center;
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}