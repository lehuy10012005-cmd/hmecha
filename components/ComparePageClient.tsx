"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ProductImage = {
  image_url: string;
  sort_order: number | null;
};

type Product = {
  id?: string;
  name: string;
  slug: string;
  sku?: string;
  price: number;
  brand?: string;
  category?: string;
  status?: string;
  badge?: string | null;
  image?: string;
  images?: string[];
  product_images?: ProductImage[];
};

type CompareItem = Product;

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

function saveList(list: CompareItem[]) {
  localStorage.setItem("hmecha-compare", JSON.stringify(list));
  window.dispatchEvent(new Event("hmecha-compare-updated"));
}

function getImage(product: Product) {
  if (product.image) return product.image;
  if (product.images?.[0]) return product.images[0];

  const images = [...(product.product_images || [])].sort(
    (a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0)
  );

  return images[0]?.image_url || "";
}

function normalizeProduct(product: Product): CompareItem {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    price: Number(product.price || 0),
    brand: product.brand,
    category: product.category,
    status: product.status,
    badge: product.badge,
    image: getImage(product),
  };
}

function Row({ label, values }: { label: string; values: string[] }) {
  return (
    <tr>
      <th>{label}</th>
      {values.map((value, index) => (
        <td key={index}>{value}</td>
      ))}
    </tr>
  );
}

export default function ComparePageClient() {
  const [items, setItems] = useState<CompareItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);

      try {
        const response = await fetch("/api/home-products", {
          cache: "no-store",
        });

        const data = await response.json();

        if (response.ok) {
          setProducts(data.products || []);
        }
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  const selectedSlugs = useMemo(
    () => new Set(items.map((item) => item.slug)),
    [items]
  );

  const filteredProducts = useMemo(() => {
    const text = keyword.trim().toLowerCase();

    const list = products.filter((product) => {
      if (!text) return true;

      return [
        product.name,
        product.sku,
        product.brand,
        product.category,
        product.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(text);
    });

    return list.slice(0, 24);
  }, [keyword, products]);

  function addProduct(product: Product) {
    const normalized = normalizeProduct(product);
    const current = readList();

    if (current.some((item) => item.slug === normalized.slug)) {
      return;
    }

    if (current.length >= 4) {
      alert("Chỉ có thể so sánh tối đa 4 sản phẩm.");
      return;
    }

    const next = [...current, normalized];

    saveList(next);
    setItems(next);
  }

  function remove(slug: string) {
    const next = items.filter((item) => item.slug !== slug);

    saveList(next);
    setItems(next);
  }

  function clear() {
    localStorage.removeItem("hmecha-compare");
    window.dispatchEvent(new Event("hmecha-compare-updated"));
    setItems([]);
  }

  return (
    <main className="comparePage">
      <Link href="/" className="backLink">
        ← Về trang chủ
      </Link>

      <section className="compareHero">
        <p>HMECHA COMPARE</p>
        <h1>So sánh sản phẩm</h1>
        <span>
          Chọn tối đa 4 sản phẩm để so sánh giá, tình trạng, thương hiệu và thông tin cơ bản.
        </span>
      </section>

      <section className="comparePicker">
        <div className="pickerHead">
          <div>
            <h2>Chọn sản phẩm để so sánh</h2>
            <p>Đã chọn {items.length}/4 sản phẩm.</p>
          </div>

          <button type="button" onClick={clear} disabled={!items.length}>
            Xóa tất cả
          </button>
        </div>

        <div className="selectedSlots">
          {[0, 1, 2, 3].map((index) => {
            const item = items[index];

            return item ? (
              <div className="selectedSlot active" key={item.slug}>
                {item.image ? <img src={item.image} alt={item.name} /> : <div className="emptyImage" />}
                <strong>{item.name}</strong>
                <span>{money(item.price)}</span>
                <button type="button" onClick={() => remove(item.slug)}>
                  Bỏ chọn
                </button>
              </div>
            ) : (
              <div className="selectedSlot" key={index}>
                <div className="plusBox">+</div>
                <strong>Thêm sản phẩm</strong>
                <span>Chọn từ danh sách bên dưới</span>
              </div>
            );
          })}
        </div>

        <div className="searchCompare">
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tìm sản phẩm để thêm vào so sánh..."
          />
        </div>

        <div className="productPickGrid">
          {loading ? (
            <div className="emptyBox">Đang tải sản phẩm...</div>
          ) : filteredProducts.length ? (
            filteredProducts.map((product) => {
              const image = getImage(product);
              const active = selectedSlugs.has(product.slug);

              return (
                <article className="pickCard" key={product.slug}>
                  {image ? <img src={image} alt={product.name} /> : <div className="emptyImage" />}

                  <div>
                    <strong>{product.name}</strong>
                    <span>{money(Number(product.price || 0))}</span>
                    <small>
                      {product.brand || "Bandai"} · {product.status || "Đang cập nhật"}
                    </small>
                  </div>

                  <button
                    type="button"
                    onClick={() => addProduct(product)}
                    disabled={active || items.length >= 4}
                  >
                    {active ? "Đã chọn" : "Thêm so sánh"}
                  </button>
                </article>
              );
            })
          ) : (
            <div className="emptyBox">Không tìm thấy sản phẩm phù hợp.</div>
          )}
        </div>
      </section>

      <section className="compareTableBox">
        <div className="tableHeadTitle">
          <h2>Bảng so sánh</h2>
          <p>Thông tin được lấy từ danh sách sản phẩm bạn đã chọn.</p>
        </div>

        {items.length < 2 ? (
          <div className="emptyBox">
            Cần chọn ít nhất 2 sản phẩm để bắt đầu so sánh.
          </div>
        ) : (
          <div className="tableScroll">
            <table className="compareTable">
              <tbody>
                <tr>
                  <th>Sản phẩm</th>
                  {items.map((item) => (
                    <td key={item.slug}>
                      <div className="tableProduct">
                        {item.image ? <img src={item.image} alt={item.name} /> : null}
                        <strong>{item.name}</strong>
                        <button type="button" onClick={() => remove(item.slug)}>
                          Bỏ khỏi so sánh
                        </button>
                      </div>
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
                  <th>Hành động</th>
                  {items.map((item) => (
                    <td key={item.slug}>
                      <Link href={`/${item.slug}`} className="detailBtn">
                        Xem chi tiết
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      <style>{`
        .comparePage {
          min-height: 100vh;
          padding: 34px 18px 120px;
          color: #fff;
          background:
            radial-gradient(circle at 0% 0%, rgba(124, 77, 255, 0.18), transparent 30%),
            radial-gradient(circle at 100% 0%, rgba(0, 229, 255, 0.13), transparent 28%),
            #070b1d;
        }

        .comparePage a {
          color: inherit;
        }

        .backLink {
          display: inline-flex;
          margin: 0 auto 18px;
          max-width: 1420px;
          width: 100%;
          color: #00e5ff;
          text-decoration: none;
          font-weight: 900;
        }

        .compareHero,
        .comparePicker,
        .compareTableBox {
          max-width: 1420px;
          margin: 0 auto 22px;
          border-radius: 24px;
          border: 1px solid rgba(0, 229, 255, 0.22);
          background: rgba(7, 12, 32, 0.86);
          box-shadow: 0 22px 60px rgba(0, 0, 0, 0.28);
        }

        .compareHero {
          padding: 32px;
        }

        .compareHero p {
          margin: 0 0 10px;
          color: #00e5ff;
          letter-spacing: 3px;
          font-weight: 950;
        }

        .compareHero h1 {
          margin: 0;
          font-size: clamp(38px, 6vw, 72px);
          line-height: 1.02;
        }

        .compareHero span {
          display: block;
          margin-top: 12px;
          color: #c5d2f2;
        }

        .pickerHead,
        .tableHeadTitle {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
          padding: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .pickerHead h2,
        .tableHeadTitle h2 {
          margin: 0 0 8px;
          font-size: 28px;
        }

        .pickerHead p,
        .tableHeadTitle p {
          margin: 0;
          color: #9fb0d8;
        }

        .pickerHead button,
        .pickCard button,
        .selectedSlot button,
        .tableProduct button,
        .detailBtn {
          min-height: 42px;
          border: 0;
          border-radius: 12px;
          padding: 0 16px;
          cursor: pointer;
          color: #061020;
          font-weight: 950;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .pickerHead button:disabled,
        .pickCard button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .selectedSlots {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          padding: 22px 24px;
        }

        .selectedSlot {
          min-height: 180px;
          border-radius: 18px;
          border: 1px dashed rgba(0, 229, 255, 0.35);
          display: grid;
          place-items: center;
          text-align: center;
          padding: 16px;
          background: rgba(255, 255, 255, 0.035);
        }

        .selectedSlot.active {
          border-style: solid;
          background: rgba(255, 255, 255, 0.065);
        }

        .selectedSlot img {
          width: 88px;
          height: 88px;
          object-fit: cover;
          border-radius: 14px;
          margin-bottom: 10px;
        }

        .plusBox,
        .emptyImage {
          width: 88px;
          height: 88px;
          border-radius: 14px;
          display: grid;
          place-items: center;
          background: rgba(255, 255, 255, 0.08);
          color: #00e5ff;
          font-size: 34px;
        }

        .selectedSlot strong {
          display: block;
          line-height: 1.35;
        }

        .selectedSlot span {
          color: #00e5ff;
          font-weight: 900;
        }

        .searchCompare {
          padding: 0 24px 22px;
        }

        .searchCompare input {
          width: 100%;
          min-height: 54px;
          border-radius: 16px;
          border: 1px solid rgba(0, 229, 255, 0.24);
          background: rgba(5, 8, 22, 0.9);
          color: #fff;
          padding: 0 18px;
          outline: none;
          font-size: 16px;
        }

        .productPickGrid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          padding: 0 24px 24px;
        }

        .pickCard {
          display: grid;
          gap: 12px;
          padding: 14px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.055);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .pickCard img,
        .pickCard .emptyImage {
          width: 100%;
          height: 160px;
          object-fit: cover;
          border-radius: 14px;
        }

        .pickCard strong {
          display: block;
          line-height: 1.35;
          min-height: 44px;
        }

        .pickCard span {
          display: block;
          margin-top: 8px;
          color: #00e5ff;
          font-size: 20px;
          font-weight: 950;
        }

        .pickCard small {
          display: block;
          margin-top: 6px;
          color: #9fb0d8;
        }

        .tableScroll {
          overflow-x: auto;
          padding: 20px 24px 24px;
        }

        .compareTable {
          width: 100%;
          min-width: 900px;
          border-collapse: collapse;
        }

        .compareTable th {
          width: 170px;
          color: #00e5ff;
          text-align: left;
          vertical-align: top;
        }

        .compareTable th,
        .compareTable td {
          padding: 18px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .tableProduct {
          display: grid;
          gap: 10px;
        }

        .tableProduct img {
          width: 120px;
          height: 120px;
          object-fit: cover;
          border-radius: 14px;
        }

        .emptyBox {
          padding: 24px;
          color: #c5d2f2;
        }

        @media (max-width: 980px) {
          .selectedSlots,
          .productPickGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .comparePage {
            padding: 22px 12px 120px;
          }

          .pickerHead,
          .tableHeadTitle {
            display: grid;
          }

          .selectedSlots,
          .productPickGrid {
            grid-template-columns: 1fr;
            padding-left: 14px;
            padding-right: 14px;
          }

          .compareHero,
          .comparePicker,
          .compareTableBox {
            border-radius: 18px;
          }

          .pickCard img,
          .pickCard .emptyImage {
            height: 220px;
          }
        }
      `}</style>
    </main>
  );
}