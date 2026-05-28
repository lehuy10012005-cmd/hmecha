"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabase";

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
  badge: string | null;
  created_at: string | null;
  product_images?: ProductImage[];
};

function formatPrice(price: number) {
  return Number(price || 0).toLocaleString("vi-VN") + "₫";
}

function getMainImage(product: Product) {
  const images = product.product_images || [];
  const sorted = [...images].sort(
    (a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0)
  );

  return sorted[0]?.image_url || "";
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tất cả");
  const [categoryFilter, setCategoryFilter] = useState("Tất cả");

  async function loadProducts() {
    setLoading(true);

    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        product_images (
          image_url,
          sort_order
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      alert("Lỗi tải sản phẩm: " + error.message);
      setLoading(false);
      return;
    }

    setProducts((data || []) as Product[]);
    setLoading(false);
  }

  async function deleteProduct(product: Product) {
    const confirmDelete = confirm(
      `Bạn có chắc muốn xóa sản phẩm này không?\n\n${product.name}`
    );

    if (!confirmDelete) return;

    const { error: imageError } = await supabase
      .from("product_images")
      .delete()
      .eq("product_id", product.id);

    if (imageError) {
      alert("Lỗi xóa ảnh sản phẩm: " + imageError.message);
      return;
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if (error) {
      alert("Lỗi xóa sản phẩm: " + error.message);
      return;
    }

    setProducts((prev) => prev.filter((item) => item.id !== product.id));
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const list = products
      .map((item) => item.category)
      .filter(Boolean) as string[];

    return ["Tất cả", ...Array.from(new Set(list))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchText = `${product.name} ${product.slug} ${product.sku || ""}`
        .toLowerCase()
        .trim();

      const matchKeyword = searchText.includes(keyword.toLowerCase().trim());

      const matchStatus =
        statusFilter === "Tất cả" || product.status === statusFilter;

      const matchCategory =
        categoryFilter === "Tất cả" || product.category === categoryFilter;

      return matchKeyword && matchStatus && matchCategory;
    });
  }, [products, keyword, statusFilter, categoryFilter]);

  const totalProducts = products.length;
  const totalStock = products.reduce(
    (sum, product) => sum + Number(product.stock_quantity || 0),
    0
  );
  const inStockCount = products.filter(
    (product) => product.status === "Còn hàng"
  ).length;
  const outStockCount = products.filter(
    (product) => product.status === "Hết hàng"
  ).length;

  return (
    <main className="adminProductsPage">
      <div className="top">
        <div>
          <p className="eyebrow">HMECHA ADMIN</p>
          <h1>Quản lý sản phẩm</h1>
          <span>
            Danh sách sản phẩm đang lấy trực tiếp từ Supabase database.
          </span>
        </div>

        <div className="actions">
          <Link href="/" className="ghostBtn">
            Về website
          </Link>
          <Link href="/admin/products/new" className="addBtn">
            + Thêm sản phẩm
          </Link>
        </div>
      </div>

      <section className="statsGrid">
        <div className="statCard">
          <span>Tổng sản phẩm</span>
          <b>{totalProducts}</b>
        </div>

        <div className="statCard">
          <span>Tổng tồn kho</span>
          <b>{totalStock}</b>
        </div>

        <div className="statCard">
          <span>Còn hàng</span>
          <b>{inStockCount}</b>
        </div>

        <div className="statCard">
          <span>Hết hàng</span>
          <b>{outStockCount}</b>
        </div>
      </section>

      <section className="toolbar">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Tìm theo tên, slug hoặc SKU..."
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>Tất cả</option>
          <option>Còn hàng</option>
          <option>Hết hàng</option>
          <option>Đặt trước</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          {categories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>

        <button onClick={loadProducts}>Tải lại</button>
      </section>

      <section className="panel">
        {loading ? (
          <div className="empty">Đang tải sản phẩm...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty">
            <h2>Không tìm thấy sản phẩm</h2>
            <p>Thử đổi từ khóa hoặc bộ lọc.</p>
          </div>
        ) : (
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Giá</th>
                  <th>Danh mục</th>
                  <th>Tồn kho</th>
                  <th>Tình trạng</th>
                  <th>Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((product) => {
                  const mainImage = getMainImage(product);

                  return (
                    <tr key={product.id}>
                      <td>
                        <div className="productCell">
                          <div className="thumb">
                            {mainImage ? (
                              <img src={mainImage} alt={product.name} />
                            ) : (
                              <span>No image</span>
                            )}
                          </div>

                          <div>
                            <b>{product.name}</b>
                            <small>/{product.slug}</small>
                            <em>SKU: {product.sku || "Chưa có"}</em>
                          </div>
                        </div>
                      </td>

                      <td className="price">{formatPrice(product.price)}</td>

                      <td>
                        <span className="category">
                          {product.category || "Chưa phân loại"}
                        </span>
                      </td>

                      <td>
                        <strong className="stock">
                          {Number(product.stock_quantity || 0)}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={
                            product.status === "Còn hàng"
                              ? "status inStock"
                              : product.status === "Đặt trước"
                              ? "status preorder"
                              : "status outStock"
                          }
                        >
                          {product.status || "Chưa rõ"}
                        </span>
                      </td>

                      <td>
                        <div className="rowActions">
                          <Link href={`/${product.slug}`} className="viewBtn">
  Xem
</Link>

<Link href={`/admin/products/${product.id}/edit`} className="editBtn">
  Sửa
</Link>

<button
  className="deleteBtn"
  onClick={() => deleteProduct(product)}
>
  Xóa
</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <style>{`
        .adminProductsPage {
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

        .actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .ghostBtn,
        .addBtn {
          text-decoration: none;
          border-radius: 14px;
          padding: 13px 18px;
          font-weight: 950;
          white-space: nowrap;
        }

        .ghostBtn {
          color: #dce6ff;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.14);
        }

        .addBtn {
          color: #050816;
          background: linear-gradient(135deg,#7c4dff,#00e5ff);
          box-shadow: 0 0 24px rgba(0,229,255,.25);
        }

        .statsGrid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 18px;
        }

        .statCard {
          border-radius: 20px;
          padding: 18px;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(0,229,255,.18);
          box-shadow: 0 0 24px rgba(124,77,255,.1);
        }

        .statCard span {
          display: block;
          color: #b8c4e6;
          font-size: 14px;
          margin-bottom: 8px;
        }

        .statCard b {
          font-size: 30px;
          color: #00e5ff;
        }

        .toolbar {
          display: grid;
          grid-template-columns: 1.5fr 180px 240px 120px;
          gap: 12px;
          margin-bottom: 18px;
        }

        .toolbar input,
        .toolbar select,
        .toolbar button {
          border: 1px solid rgba(255,255,255,.16);
          outline: none;
          border-radius: 14px;
          padding: 14px 15px;
          background: rgba(255,255,255,.94);
          color: #111827;
          font-weight: 750;
        }

        .toolbar button {
          cursor: pointer;
          color: #050816;
          background: linear-gradient(135deg,#7c4dff,#00e5ff);
          border: none;
          font-weight: 950;
        }

        .panel {
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(0,229,255,.2);
          border-radius: 22px;
          box-shadow: 0 0 34px rgba(124,77,255,.12);
          overflow: hidden;
        }

        .empty {
          padding: 34px;
          text-align: center;
          color: #dce6ff;
        }

        .empty h2 {
          margin-top: 0;
          color: white;
        }

        .tableWrap {
          overflow-x: auto;
        }

        table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
}

        th {
          text-align: left;
          padding: 18px 16px;
          color: #00e5ff;
          background: rgba(0,0,0,.25);
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: .5px;
        }

        td {
          padding: 15px 16px;
          border-top: 1px solid rgba(255,255,255,.09);
          color: #dce6ff;
          vertical-align: middle;
        }

        .productCell {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 320px;
}

        .thumb {
          width: 68px;
          height: 68px;
          border-radius: 16px;
          overflow: hidden;
          background: white;
          display: grid;
          place-items: center;
          flex: 0 0 auto;
        }

        .thumb img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .thumb span {
          color: #6b7280;
          font-size: 11px;
          font-weight: 800;
        }

        td b {
          display: block;
          color: white;
          margin-bottom: 5px;
          line-height: 1.35;
        }

        td small {
          display: block;
          color: #8fa2d0;
          margin-bottom: 4px;
        }

        td em {
          display: block;
          color: #b8c4e6;
          font-style: normal;
          font-size: 12px;
        }

        .price {
          color: #ff78d2;
          font-weight: 950;
          white-space: nowrap;
        }

        .category {
          display: inline-flex;
          padding: 7px 10px;
          border-radius: 999px;
          background: rgba(255,255,255,.08);
          color: #dce6ff;
          font-weight: 850;
          white-space: nowrap;
        }

        .stock {
          color: #00e5ff;
          font-size: 18px;
        }

        .status {
          display: inline-flex;
          padding: 7px 10px;
          border-radius: 999px;
          font-weight: 950;
          white-space: nowrap;
        }

        .inStock {
          background: rgba(0,229,255,.13);
          color: #00e5ff;
        }

        .outStock {
          background: rgba(255,79,216,.13);
          color: #ff78d2;
        }

        .preorder {
          background: rgba(255,205,64,.14);
          color: #ffd166;
        }

        .rowActions {
          display: flex;
          gap: 8px;
        }

       .viewBtn,
.editBtn,
        .deleteBtn {
          border: none;
          text-decoration: none;
          border-radius: 12px;
          padding: 10px 13px;
          font-weight: 950;
          cursor: pointer;
          white-space: nowrap;
        }

        .viewBtn {
          color: #050816;
          background: #00e5ff;
        }
.editBtn {
  color: #050816;
  background: #ffd166;
}
        .deleteBtn {
          color: white;
          background: rgba(255,79,216,.22);
          border: 1px solid rgba(255,79,216,.35);
        }

        @media (max-width: 1000px) {
          .statsGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .toolbar {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 700px) {
          .top {
            display: block;
          }

          .actions {
            margin-top: 18px;
          }

          h1 {
            font-size: 34px;
          }

          .statsGrid,
          .toolbar {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}