"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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

export default function ProductFilterGrid({
  products,
}: {
  products: FilterProduct[];
}) {
  const [category, setCategory] = useState("all");
  const [priceRange, setPriceRange] = useState<PriceRange>("all");

  const categories = useMemo(() => {
    return Array.from(
      new Set(products.map((product) => product.category).filter(Boolean))
    );
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
          {filteredProducts.map((product) => (
            <Link
              href={`/${product.slug}`}
              className="card"
              key={`${product.source}-${product.id}`}
            >
              <div className="thumb">
                <img src={product.image} alt={product.name} />

                {product.badge && (
                  <span className="badge">{product.badge}</span>
                )}

                {product.source === "database" && (
                  <span className="dbBadge">Admin</span>
                )}

                <span className="heart" aria-hidden="true">
                  ♡
                </span>
              </div>

              <div className="info">
                <p className="category">{product.category}</p>
                <h2>{product.name}</h2>
                <p className="price">{formatPrice(product.price)}</p>
                <p className="stock">
                  Tình trạng: <b>{product.status}</b>
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="emptyFilter">
          Không có sản phẩm phù hợp với bộ lọc hiện tại.
        </div>
      )}
    </>
  );
}