"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../lib/supabase";

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

export default function NewProductPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [brand, setBrand] = useState("Bandai");
  const [category, setCategory] = useState("Gundam Plastic Model Bandai");
  const [status, setStatus] = useState("Còn hàng");
  const [stockQuantity, setStockQuantity] = useState("1");
  const [badge, setBadge] = useState("Hàng mới");
  const [image1, setImage1] = useState("");
  const [image2, setImage2] = useState("");
  const [shortDescription, setShortDescription] = useState(
    "Mô hình Gundam chính hãng, phù hợp trưng bày và sưu tầm."
  );
  const [fullDescription, setFullDescription] = useState(
    "Sản phẩm mô hình nhựa lắp ráp, chi tiết sắc nét, phù hợp cho người chơi Gunpla và người sưu tầm mô hình mecha."
  );

  const [saving, setSaving] = useState(false);

  function handleNameChange(value: string) {
    setName(value);

    if (!slug.trim()) {
      setSlug(createSlug(value));
    }
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
    };

    const { data: product, error } = await supabase
      .from("products")
      .insert(productPayload)
      .select()
      .single();

    if (error) {
      setSaving(false);
      alert("Lỗi thêm sản phẩm: " + error.message);
      return;
    }

    const images = [normalizeImageUrl(image1), normalizeImageUrl(image2)]
      .filter(Boolean)
      .map((url, index) => ({
        product_id: product.id,
        image_url: url,
        sort_order: index,
      }));

    if (images.length > 0) {
      const { error: imageError } = await supabase
        .from("product_images")
        .insert(images);

      if (imageError) {
        setSaving(false);
        alert(
          "Sản phẩm đã được tạo nhưng lỗi thêm ảnh: " + imageError.message
        );
        router.push("/admin/products");
        return;
      }
    }

    alert("Đã thêm sản phẩm mới thành công.");
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <main className="newProductPage">
      <div className="top">
        <div>
          <p className="eyebrow">HMECHA ADMIN</p>
          <h1>Thêm sản phẩm mới</h1>
          <span>Sản phẩm mới sẽ được lưu trực tiếp vào Supabase.</span>
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
              placeholder="VD: HGGQ 016 1/144 New Gundam"
            />
          </div>

          <div className="field">
            <label>Slug *</label>
            <input
              value={slug}
              onChange={(e) => setSlug(createSlug(e.target.value))}
              placeholder="hggq-016-1-144-new-gundam"
            />
            <small>Slug là đường link sản phẩm. Không dùng dấu cách.</small>
          </div>

          <div className="field">
            <label>SKU</label>
            <input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="VD: HMC-085"
            />
          </div>

          <div className="field">
            <label>Giá *</label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="VD: 740000"
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
              placeholder="Dán link ảnh sản phẩm chính vào đây"
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
            {saving ? "Đang lưu..." : "Lưu sản phẩm"}
          </button>
        </div>
      </form>

      <style>{`
        .newProductPage {
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