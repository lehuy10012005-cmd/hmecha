"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/data/products";

export type FilterProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  status: string;
  badge?: string | null;
  image: string;
  image2?: string | null;
  source: string;
};

type PriceRange =
  | "all"
  | "under300"
  | "from300to500"
  | "from500to1000"
  | "over1000";

function matchPriceRange(price: number, range: PriceRange) {
  switch (range) {
    case "under300":
      return price < 300000;
    case "from300to500":
      return price >= 300000 && price < 500000;
    case "from500to1000":
      return price >= 500000 && price <= 1000000;
    case "over1000":
      return price > 1000000;
    default:
      return true;
  }
}

function normalizeImageUrl(url?: string | null) {
  const value = String(url || "").trim();

  if (!value || value.startsWith("data:image")) {
    return "/logo/logo.png";
  }

  if (value.startsWith("//")) {
    return "https:" + value;
  }

  return value;
}

function readCart() {
  try {
    return JSON.parse(localStorage.getItem("hmecha-cart") || "[]");
  } catch {
    return [];
  }
}

function saveCart(cart: any[]) {
  localStorage.setItem("hmecha-cart", JSON.stringify(cart));

  const totalQuantity = cart.reduce((sum, item) => {
    return sum + Number(item.quantity || 0);
  }, 0);

  document
    .querySelectorAll(".count_item, .count_item_pr, .js-cart-count")
    .forEach((element) => {
      element.textContent = String(totalQuantity);
    });
}

export default function ProductFilterGrid({
  products,
}: {
  products: FilterProduct[];
}) {
  const router = useRouter();

  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<PriceRange>("all");
  const [addedId, setAddedId] = useState<string | null>(null);

  const categories = useMemo(() => {
    return Array.from(
      new Set(products.map((product) => product.category).filter(Boolean))
    ).sort((a, b) => a.localeCompare(b, "vi"));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchedCategory =
        category === "all" || product.category === category;

      const matchedPrice = matchPriceRange(product.price, priceRange);

      return matchedCategory && matchedPrice;
    });
  }, [products, category, priceRange]);

  const isFiltering = category !== "all" || priceRange !== "all";

  function clearFilters() {
    setCategory("all");
    setPriceRange("all");
  }

  function addToCart(product: FilterProduct) {
    const item = {
      id: product.id || product.slug,
      name: product.name,
      slug: product.slug,
      price: Number(product.price || 0),
      image: normalizeImageUrl(product.image),
      quantity: 1,
    };

    const currentCart = readCart();

    const existed = currentCart.find((cartItem: any) => {
      return String(cartItem.id) === String(item.id);
    });

    let nextCart;

    if (existed) {
      nextCart = currentCart.map((cartItem: any) => {
        if (String(cartItem.id) === String(item.id)) {
          return {
            ...cartItem,
            quantity: Number(cartItem.quantity || 1) + 1,
          };
        }

        return cartItem;
      });
    } else {
      nextCart = currentCart.concat(item);
    }

    saveCart(nextCart);
    setAddedId(product.id);

    setTimeout(() => {
      setAddedId(null);
    }, 1200);
  }

  return (
    <>
      <section className="filters" aria-label="Bộ lọc sản phẩm">
        <div className="filterGroup">
          <label htmlFor="product-category">Loại sản phẩm</label>

          <select
            id="product-category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="all">Tất cả loại sản phẩm</option>

            {categories.map((item) => (
              <option value={item} key={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="filterGroup">
          <label htmlFor="product-price">Khoảng giá</label>

          <select
            id="product-price"
            value={priceRange}
            onChange={(event) =>
              setPriceRange(event.target.value as PriceRange)
            }
          >
            <option value="all">Tất cả mức giá</option>
            <option value="under300">Dưới 300.000₫</option>
            <option value="from300to500">300.000₫ - dưới 500.000₫</option>
            <option value="from500to1000">500.000₫ - 1.000.000₫</option>
            <option value="over1000">Trên 1.000.000₫</option>
          </select>
        </div>

        {isFiltering && (
          <button className="resetFilter" type="button" onClick={clearFilters}>
            Xóa bộ lọc
          </button>
        )}

        <p className="filterCount">
          Hiển thị <strong>{filteredProducts.length}</strong> sản phẩm
        </p>
      </section>

      {filteredProducts.length > 0 ? (
        <div className="grid">
          {filteredProducts.map((product) => {
            const secondImage = product.image2 || product.image;
            const isAdded = addedId === product.id;
            const isSoldOut = product.status.toLowerCase().includes("hết");

            return (
              <article className="productCard" key={`${product.source}-${product.id}`}>
                <div
                  className="productThumb"
                  onClick={() => router.push(`/${product.slug}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") router.push(`/${product.slug}`);
                  }}
                >
                  <img
                    className="image1"
                    src={normalizeImageUrl(product.image)}
                    alt={product.name}
                  />

                  <img
                    className="image2"
                    src={normalizeImageUrl(secondImage)}
                    alt={product.name}
                  />

                  {product.badge && <span className="badge">{product.badge}</span>}

                  <button
                    type="button"
                    className="heart"
                    aria-label="Thêm vào yêu thích"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                    }}
                  >
                    ♡
                  </button>
                </div>

                <div className="productInfo">
                  <h2
                    onClick={() => router.push(`/${product.slug}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") router.push(`/${product.slug}`);
                    }}
                  >
                    {product.name}
                  </h2>

                  <p className="price">{formatPrice(product.price)}</p>

                  <p className="stock">
                    <span>Tình trạng:</span> <b>{product.status}</b>
                  </p>

                  <div className="productActions">
                    <button
                      type="button"
                      className={isAdded ? "cartBtn added" : "cartBtn"}
                      disabled={isSoldOut}
                      onClick={() => addToCart(product)}
                    >
                      {isSoldOut
                        ? "Hết hàng"
                        : isAdded
                        ? "Đã thêm ✓"
                        : "Thêm vào giỏ"}
                    </button>

                    <button
                      type="button"
                      className="compareBtn"
                      aria-label="So sánh"
                      onClick={() => router.push(`/${product.slug}`)}
                    >
                      ⇄
                    </button>

                    <button
                      type="button"
                      className="quickBtn"
                      aria-label="Xem nhanh"
                      onClick={() => router.push(`/${product.slug}`)}
                    >
                      <svg
                        viewBox="0 0 192.904 192.904"
                        width="20"
                        height="20"
                        aria-hidden="true"
                      >
                        <path
                          fill="currentColor"
                          d="M190.707,180.101l-47.078-47.077c11.702-14.072,18.752-32.142,18.752-51.831C162.381,36.423,125.959,0,81.191,0 C36.422,0,0,36.423,0,81.193c0,44.767,36.422,81.187,81.191,81.187c19.688,0,37.759-7.049,51.831-18.751l47.079,47.078 c1.464,1.465,3.384,2.197,5.303,2.197c1.919,0,3.839-0.732,5.304-2.197C193.637,187.778,193.637,183.03,190.707,180.101z M15,81.193 C15,44.694,44.693,15,81.191,15c36.497,0,66.189,29.694,66.189,66.193c0,36.496-29.692,66.187-66.189,66.187 C44.693,147.38,15,117.689,15,81.193z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="emptyFilter">
          Không có sản phẩm phù hợp với bộ lọc hiện tại.
        </div>
      )}

      <style jsx>{`
        .filters {
          display: grid;
          grid-template-columns: minmax(240px, 1fr) minmax(240px, 0.7fr) auto auto;
          align-items: end;
          gap: 18px;
          margin-bottom: 30px;
          padding: 22px;
          border-radius: 22px;
          background: linear-gradient(
            135deg,
            rgba(10, 18, 44, 0.96),
            rgba(8, 13, 33, 0.96)
          );
          border: 1px solid rgba(0, 229, 255, 0.2);
          box-shadow: 0 0 24px rgba(124, 77, 255, 0.08);
        }

        .filterGroup {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .filterGroup label {
          color: #dce6ff;
          font-size: 14px;
          font-weight: 800;
        }

        .filterGroup select {
          width: 100%;
          height: 52px;
          padding: 0 14px;
          border-radius: 14px;
          background: rgba(5, 8, 22, 0.95);
          border: 1px solid rgba(0, 229, 255, 0.3);
          color: #ffffff;
          outline: none;
          cursor: pointer;
          font-weight: 700;
        }

        .filterGroup select:focus {
          border-color: #00e5ff;
          box-shadow: 0 0 14px rgba(0, 229, 255, 0.18);
        }

        .resetFilter {
          height: 52px;
          padding: 0 20px;
          border: 0;
          border-radius: 14px;
          font-weight: 900;
          cursor: pointer;
          color: #061020;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
        }

        .filterCount {
          margin: 0;
          justify-self: end;
          align-self: center;
          color: #b8c4e6;
          font-size: 15px;
          white-space: nowrap;
        }

        .filterCount strong {
          color: #00e5ff;
          font-size: 20px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 20px;
        }

        .productCard {
          overflow: hidden;
          background: #ffffff;
          border: 2px solid rgba(255, 255, 255, 0.78);
          box-shadow: 0 0 18px rgba(0, 229, 255, 0.08);
          transition: transform 0.22s ease, box-shadow 0.22s ease,
            border-color 0.22s ease;
        }

        .productCard:hover {
          transform: translateY(-5px);
          border-color: rgba(0, 229, 255, 0.9);
          box-shadow: 0 0 24px rgba(0, 229, 255, 0.18);
        }

        .productThumb {
          position: relative;
          aspect-ratio: 1 / 1;
          background: #000000;
          overflow: hidden;
          cursor: pointer;
        }

        .productThumb img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: opacity 0.28s ease, transform 0.28s ease;
        }

        .productThumb .image1 {
          opacity: 1;
          transform: scale(1);
        }

        .productThumb .image2 {
          opacity: 0;
          transform: scale(1.04);
        }

        .productCard:hover .productThumb .image1 {
          opacity: 0;
          transform: scale(1.03);
        }

        .productCard:hover .productThumb .image2 {
          opacity: 1;
          transform: scale(1);
        }

        .badge {
          position: absolute;
          left: 10px;
          bottom: 10px;
          z-index: 2;
          background: linear-gradient(135deg, #ffb52e, #ff6ad5);
          color: #ffffff;
          padding: 6px 10px;
          border-radius: 8px;
          font-weight: 900;
          font-size: 12px;
          line-height: 1;
        }

        .heart {
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 2;
          width: 42px;
          height: 42px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          border: 0;
          background: #ffffff;
          color: #111111;
          font-size: 24px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        }

        .productInfo {
          position: relative;
          min-height: 178px;
          padding: 14px 14px 16px;
          background: rgba(255, 255, 255, 0.98);
          color: #111827;
        }

        .productInfo h2 {
          margin: 0;
          min-height: 58px;
          color: #18212f;
          font-size: 18px;
          line-height: 1.35;
          font-weight: 800;
          cursor: pointer;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .productInfo h2:hover {
          color: #00a9c8;
        }

        .price {
          margin: 12px 0 18px;
          color: #00c9e8;
          font-size: 20px;
          font-weight: 950;
          line-height: 1;
        }

        .stock {
          margin: 0;
          color: #5b6473;
          font-size: 14px;
        }

        .stock span {
          color: #5b6473;
        }

        .stock b {
          color: #4b5563;
          font-weight: 500;
        }

        .productActions {
          position: absolute;
          left: 14px;
          right: 14px;
          bottom: 14px;
          display: grid;
          grid-template-columns: 1fr 38px 38px;
          gap: 8px;
          opacity: 0;
          transform: translateY(12px);
          pointer-events: none;
          transition: opacity 0.22s ease, transform 0.22s ease;
        }

        .productCard:hover .productActions {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        .productCard:hover .stock {
          opacity: 0;
        }

        .cartBtn,
        .compareBtn,
        .quickBtn {
          height: 40px;
          border: 0;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 850;
          color: #061020;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
          box-shadow: 0 0 14px rgba(0, 229, 255, 0.18);
        }

        .cartBtn:hover,
        .compareBtn:hover,
        .quickBtn:hover {
          color: #ffffff;
          background: linear-gradient(135deg, #ff4fd8, #7c4dff);
        }

        .cartBtn.added {
          background: linear-gradient(135deg, #16f29a, #00e5ff);
          color: #061020;
        }

        .cartBtn:disabled {
          cursor: not-allowed;
          background: #d1d5db;
          color: #6b7280;
          box-shadow: none;
        }

        .compareBtn {
          font-size: 20px;
        }

        .quickBtn {
          display: grid;
          place-items: center;
        }

        .emptyFilter {
          padding: 50px 20px;
          text-align: center;
          border-radius: 18px;
          color: #bac8ea;
          border: 1px dashed rgba(0, 229, 255, 0.28);
          background: rgba(11, 16, 38, 0.55);
        }

        @media (max-width: 1500px) {
          .grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }

        @media (max-width: 1180px) {
          .grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .filters {
            grid-template-columns: 1fr 1fr;
          }

          .filterCount {
            justify-self: start;
          }
        }

        @media (max-width: 760px) {
          .filters {
            grid-template-columns: 1fr;
            padding: 18px;
          }

          .grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
          }

          .productInfo {
            min-height: 156px;
            padding: 12px;
          }

          .productInfo h2 {
            min-height: 52px;
            font-size: 15px;
          }

          .price {
            font-size: 18px;
          }

          .heart {
            width: 36px;
            height: 36px;
            font-size: 21px;
          }

          .productActions {
            position: static;
            margin-top: 12px;
            opacity: 1;
            transform: none;
            pointer-events: auto;
            grid-template-columns: 1fr;
          }

          .compareBtn,
          .quickBtn {
            display: none;
          }

          .productCard:hover .stock {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}