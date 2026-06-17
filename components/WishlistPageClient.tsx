"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ApiWishlistItem = {
  id?: string;
  product_slug: string;
  product_name: string;
  product_price: number;
  product_image?: string | null;
  product_status?: string | null;
  product_brand?: string | null;
  product_category?: string | null;
};

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
  product_images?: ProductImage[];
};

type WishlistViewItem = {
  product_slug: string;
  product_name: string;
  product_price: number;
  product_image?: string | null;
  product_status?: string | null;
  product_brand?: string | null;
  product_category?: string | null;
  source: "account" | "browser";
};

function money(value: number) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

function getCookie(name: string) {
  if (typeof document === "undefined") return "";

  const value = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="));

  return value ? value.split("=").slice(1).join("=") : "";
}

function parseCookieWishlist() {
  const raw = getCookie("sudes_wishlist_products");

  if (!raw) return [];

  try {
    const decoded = decodeURIComponent(raw);
    const parsed = JSON.parse(decoded);

    if (Array.isArray(parsed)) {
      return parsed.map(String).filter(Boolean);
    }
  } catch {}

  try {
    const parsed = JSON.parse(raw);

    if (Array.isArray(parsed)) {
      return parsed.map(String).filter(Boolean);
    }
  } catch {}

  return [];
}

function setCookieWishlist(slugs: string[]) {
  const value = encodeURIComponent(JSON.stringify(slugs));
  document.cookie = `sudes_wishlist_products=${value}; path=/; max-age=${60 * 60 * 24 * 365}`;
}

function getProductImage(product: HomeProduct) {
  const images = [...(product.product_images || [])].sort(
    (a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0)
  );

  return images[0]?.image_url || null;
}

export default function WishlistPageClient() {
  const [accountItems, setAccountItems] = useState<ApiWishlistItem[]>([]);
  const [browserSlugs, setBrowserSlugs] = useState<string[]>([]);
  const [products, setProducts] = useState<HomeProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [message, setMessage] = useState("");

  async function loadData() {
    setLoading(true);
    setMessage("");

    const cookieSlugs = parseCookieWishlist();
    setBrowserSlugs(cookieSlugs);

    const [wishlistResponse, productsResponse] = await Promise.all([
      fetch("/api/account/wishlist", { cache: "no-store" }).catch(() => null),
      fetch("/api/home-products", { cache: "no-store" }).catch(() => null),
    ]);

    if (productsResponse?.ok) {
      const data = await productsResponse.json().catch(() => ({}));
      setProducts(data.products || []);
    }

    if (!wishlistResponse) {
      setIsLoggedIn(false);
      setAccountItems([]);
      setLoading(false);
      return;
    }

    const wishlistData = await wishlistResponse.json().catch(() => ({}));

    if (wishlistResponse.status === 401) {
      setIsLoggedIn(false);
      setAccountItems([]);
      setMessage("Bạn chưa đăng nhập. Trang này vẫn hiển thị các sản phẩm yêu thích đã lưu trên trình duyệt.");
      setLoading(false);
      return;
    }

    if (!wishlistResponse.ok) {
      setAccountItems([]);
      setMessage(wishlistData.message || "Không tải được danh sách yêu thích.");
      setLoading(false);
      return;
    }

    setIsLoggedIn(true);
    setAccountItems(wishlistData.items || []);
    setLoading(false);
  }

  useEffect(() => {
    loadData();

    function refresh() {
      loadData();
    }

    window.addEventListener("hmecha-wishlist-updated", refresh);

    return () => {
      window.removeEventListener("hmecha-wishlist-updated", refresh);
    };
  }, []);

  const mergedItems = useMemo(() => {
    const map = new Map<string, WishlistViewItem>();

    for (const item of accountItems) {
      if (!item.product_slug) continue;

      map.set(item.product_slug, {
        product_slug: item.product_slug,
        product_name: item.product_name,
        product_price: Number(item.product_price || 0),
        product_image: item.product_image || null,
        product_status: item.product_status || null,
        product_brand: item.product_brand || null,
        product_category: item.product_category || null,
        source: "account",
      });
    }

    for (const slug of browserSlugs) {
      if (map.has(slug)) continue;

      const product = products.find((item) => item.slug === slug);

      if (product) {
        map.set(slug, {
          product_slug: product.slug,
          product_name: product.name,
          product_price: Number(product.price || 0),
          product_image: getProductImage(product),
          product_status: product.status || null,
          product_brand: product.brand || null,
          product_category: product.category || null,
          source: "browser",
        });
      } else {
        map.set(slug, {
          product_slug: slug,
          product_name: slug,
          product_price: 0,
          product_image: null,
          product_status: "Đã lưu trên trình duyệt",
          product_brand: "HMECHA",
          product_category: null,
          source: "browser",
        });
      }
    }

    return Array.from(map.values());
  }, [accountItems, browserSlugs, products]);

  async function removeItem(item: WishlistViewItem) {
    if (item.source === "account") {
      const response = await fetch("/api/account/wishlist", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productSlug: item.product_slug,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        alert(data.message || "Không xóa được sản phẩm yêu thích.");
        return;
      }
    }

    const nextSlugs = parseCookieWishlist().filter((slug) => slug !== item.product_slug);
    setCookieWishlist(nextSlugs);
    setBrowserSlugs(nextSlugs);

    setAccountItems((current) =>
      current.filter((row) => row.product_slug !== item.product_slug)
    );

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
        <span>
          Danh sách những mẫu bạn đã bấm trái tim hoặc thêm vào yêu thích.
        </span>
      </section>

      {message ? <div className="notice">{message}</div> : null}

      {!isLoggedIn ? (
        <div className="notice">
          Muốn lưu yêu thích theo tài khoản, bạn nên đăng nhập trước khi bấm trái tim.
          <Link href="/dang-nhap">Đăng nhập ngay</Link>
        </div>
      ) : null}

      <section className="wishlistBox">
        {loading ? (
          <div className="emptyBox">Đang tải sản phẩm yêu thích...</div>
        ) : mergedItems.length === 0 ? (
          <div className="emptyBox">
            <h2>Chưa có sản phẩm yêu thích</h2>
            <p>
              Hãy quay lại trang chủ hoặc trang chi tiết sản phẩm, bấm biểu tượng trái tim để lưu sản phẩm.
            </p>
            <Link href="/">Tiếp tục mua sắm</Link>
          </div>
        ) : (
          <div className="wishlistGrid">
            {mergedItems.map((item) => (
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
                  <button type="button" onClick={() => removeItem(item)}>
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
        .wishlistBox,
        .notice {
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
        .wishlistBox,
        .notice {
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

        .notice {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 16px 20px;
          border-radius: 18px;
          margin-bottom: 18px;
          color: #dbe7ff;
        }

        .notice a {
          color: #061020;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
          padding: 10px 16px;
          border-radius: 999px;
          text-decoration: none;
          font-weight: 950;
          white-space: nowrap;
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

          .notice {
            display: grid;
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