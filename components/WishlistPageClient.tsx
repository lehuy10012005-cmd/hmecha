"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ProductImage = {
  image_url: string;
  sort_order: number | null;
};

type HomeProduct = {
  id?: string;
  name: string;
  slug: string;
  sku?: string;
  price: number;
  brand?: string | null;
  category?: string | null;
  status?: string | null;
  stock_quantity?: number | null;
  product_images?: ProductImage[];
};

type WishlistViewItem = {
  product_slug: string;
  product_name: string;
  product_price: number;
  product_image?: string | null;
  product_status?: string | null;
  product_brand?: string | null;
};

function money(value: number) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

function unique(list: string[]) {
  return Array.from(new Set(list.map(String).map((item) => item.trim()).filter(Boolean)));
}

function readLocalStorageList(key: string) {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);

    if (typeof parsed === "string") return parsed.split(",").map((x) => x.trim()).filter(Boolean);
  } catch {
    try {
      const raw = localStorage.getItem(key) || "";
      return raw.split(",").map((x) => x.trim()).filter(Boolean);
    } catch {}
  }

  return [];
}

function getCookie(name: string) {
  if (typeof document === "undefined") return "";

  const row = document.cookie
    .split("; ")
    .find((item) => item.startsWith(name + "="));

  return row ? row.split("=").slice(1).join("=") : "";
}

function readCookieList(name: string) {
  const raw = getCookie(name);
  if (!raw) return [];

  const tries = [raw];

  try {
    tries.push(decodeURIComponent(raw));
  } catch {}

  for (const value of tries) {
    try {
      const parsed = JSON.parse(value);

      if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
      if (typeof parsed === "string") return parsed.split(",").map((x) => x.trim()).filter(Boolean);
    } catch {}
  }

  return tries[tries.length - 1]
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function readAllWishlistSlugs() {
  return unique([
    ...readLocalStorageList("hmecha-wishlist"),
    ...readLocalStorageList("sudes_wishlist_products"),
    ...readCookieList("sudes_wishlist_products"),
  ]);
}

function writeLocalWishlist(slugs: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem("hmecha-wishlist", JSON.stringify(unique(slugs)));
}

function getProductImage(product: HomeProduct) {
  const images = [...(product.product_images || [])].sort(
    (a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0)
  );

  return images[0]?.image_url || null;
}

export default function WishlistPageClient() {
  const [slugs, setSlugs] = useState<string[]>([]);
  const [products, setProducts] = useState<HomeProduct[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);

    const currentSlugs = readAllWishlistSlugs();
    setSlugs(currentSlugs);
    writeLocalWishlist(currentSlugs);

    try {
      const response = await fetch("/api/home-products", { cache: "no-store" });
      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setProducts(data.products || []);
      }
    } catch {}

    setLoading(false);
  }

  useEffect(() => {
    loadData();

    function refresh() {
      loadData();
    }

    window.addEventListener("storage", refresh);
    window.addEventListener("hmecha-wishlist-updated", refresh);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("hmecha-wishlist-updated", refresh);
    };
  }, []);

  const items = useMemo<WishlistViewItem[]>(() => {
    return slugs.map((slug) => {
      const product = products.find((item) => item.slug === slug);

      if (product) {
        return {
          product_slug: product.slug,
          product_name: product.name,
          product_price: Number(product.price || 0),
          product_image: getProductImage(product),
          product_status: product.status || null,
          product_brand: product.brand || null,
        };
      }

      return {
        product_slug: slug,
        product_name: slug,
        product_price: 0,
        product_image: null,
        product_status: "Đã lưu",
        product_brand: "HMECHA",
      };
    });
  }, [slugs, products]);

  function removeItem(slug: string) {
    const next = slugs.filter((item) => item !== slug);

    setSlugs(next);
    writeLocalWishlist(next);

    try {
      document.cookie = `sudes_wishlist_products=${encodeURIComponent(JSON.stringify(next))}; path=/; max-age=${60 * 60 * 24 * 365}`;
    } catch {}

    window.dispatchEvent(new Event("hmecha-wishlist-updated"));
  }

  return (
    <main className="wishlistPage">
      <Link href="/" className="backLink">
        ← Về trang chủ
      </Link>

      <section className="wishlistHero">
        <p>HMECHA WISHLIST</p>
        <h1>Sản phẩm yêu thích</h1>
        <span>Danh sách những mẫu bạn đã bấm trái tim hoặc thêm vào yêu thích.</span>
      </section>

      <section className="wishlistBox">
        {loading ? (
          <div className="emptyBox">Đang tải sản phẩm yêu thích...</div>
        ) : items.length === 0 ? (
          <div className="emptyBox">
            <h2>Chưa có sản phẩm yêu thích</h2>
            <p>
              Hãy quay lại trang chủ hoặc trang chi tiết sản phẩm, bấm biểu tượng trái tim để lưu sản phẩm.
            </p>
            <Link href="/">Tiếp tục mua sắm</Link>
          </div>
        ) : (
          <div className="wishlistGrid">
            {items.map((item) => (
              <article className="wishCard" key={item.product_slug}>
                <Link href={`/${item.product_slug}`} className="imageBox">
                  {item.product_image ? (
                    <img src={item.product_image} alt={item.product_name} />
                  ) : (
                    <div className="noImage">HMECHA</div>
                  )}
                </Link>

                <div className="wishInfo">
                  <Link href={`/${item.product_slug}`}>
                    <strong>{item.product_name}</strong>
                  </Link>

                  <span>{item.product_price ? money(item.product_price) : "Đang cập nhật"}</span>

                  <small>
                    {item.product_brand || "HMECHA"} · {item.product_status || "Đang cập nhật"}
                  </small>
                </div>

                <div className="wishActions">
                  <Link href={`/${item.product_slug}`}>Xem chi tiết</Link>
                  <button type="button" onClick={() => removeItem(item.product_slug)}>
                    Bỏ yêu thích
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <style>{`
        .wishlistPage {
          min-height: 100vh;
          padding: 36px 18px 120px;
          color: #ffffff;
          background:
            radial-gradient(circle at 0% 0%, rgba(124, 77, 255, 0.2), transparent 32%),
            radial-gradient(circle at 100% 0%, rgba(0, 229, 255, 0.16), transparent 30%),
            #060b1f;
        }

        .backLink,
        .wishlistHero,
        .wishlistBox {
          max-width: 1320px;
          margin-left: auto;
          margin-right: auto;
        }

        .backLink {
          display: block;
          margin-bottom: 18px;
          color: #00e5ff;
          text-decoration: none;
          font-weight: 950;
        }

        .wishlistHero,
        .wishlistBox {
          border: 1px solid rgba(0, 229, 255, 0.22);
          background: rgba(7, 12, 32, 0.88);
          box-shadow: 0 22px 60px rgba(0, 0, 0, 0.28);
        }

        .wishlistHero {
          padding: 34px;
          border-radius: 26px;
          margin-bottom: 18px;
        }

        .wishlistHero p {
          margin: 0 0 10px;
          color: #00e5ff;
          letter-spacing: 3px;
          font-weight: 950;
        }

        .wishlistHero h1 {
          margin: 0;
          font-size: clamp(38px, 6vw, 70px);
          line-height: 1.02;
        }

        .wishlistHero span {
          display: block;
          margin-top: 12px;
          color: #cbd8ff;
          line-height: 1.6;
        }

        .wishlistBox {
          padding: 24px;
          border-radius: 26px;
        }

        .wishlistGrid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 18px;
        }

        .wishCard {
          display: grid;
          gap: 14px;
          padding: 14px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.055);
          border: 1px solid rgba(255, 255, 255, 0.09);
        }

        .imageBox {
          display: block;
          overflow: hidden;
          border-radius: 16px;
          background: #020617;
          border: 1px solid rgba(0, 229, 255, 0.16);
        }

        .imageBox img,
        .noImage {
          width: 100%;
          height: 220px;
          object-fit: cover;
          display: grid;
          place-items: center;
        }

        .noImage {
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
          color: #061020;
          font-weight: 950;
          letter-spacing: 2px;
        }

        .wishInfo a {
          color: #ffffff;
          text-decoration: none;
        }

        .wishInfo strong {
          display: block;
          min-height: 48px;
          line-height: 1.35;
          font-size: 18px;
        }

        .wishInfo span {
          display: block;
          margin-top: 8px;
          color: #00e5ff;
          font-size: 22px;
          font-weight: 950;
        }

        .wishInfo small {
          display: block;
          margin-top: 6px;
          color: #9fb0d8;
        }

        .wishActions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .wishActions a,
        .wishActions button,
        .emptyBox a {
          min-height: 44px;
          border: 0;
          border-radius: 13px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 12px;
          color: #061020;
          font-weight: 950;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
          text-decoration: none;
          cursor: pointer;
        }

        .wishActions button {
          color: #fff;
          background: rgba(255, 79, 216, 0.22);
          border: 1px solid rgba(255, 79, 216, 0.28);
        }

        .emptyBox {
          padding: 44px 20px;
          text-align: center;
          color: #cbd8ff;
        }

        .emptyBox h2 {
          color: #fff;
          margin: 0 0 10px;
        }

        .emptyBox p {
          margin: 0 auto 18px;
          max-width: 560px;
          line-height: 1.6;
        }

        @media (max-width: 1100px) {
          .wishlistGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 820px) {
          .wishlistGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 560px) {
          .wishlistPage {
            padding: 24px 12px 110px;
          }

          .wishlistHero,
          .wishlistBox {
            border-radius: 20px;
          }

          .wishlistHero {
            padding: 24px;
          }

          .wishlistGrid {
            grid-template-columns: 1fr;
          }

          .imageBox img,
          .noImage {
            height: 260px;
          }

          .wishActions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}