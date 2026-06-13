"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type CompareItem = {
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

export default function CompareTray() {
  const router = useRouter();
  const [items, setItems] = useState<CompareItem[]>([]);
  const [hidden, setHidden] = useState(false);

  function sync() {
    const next = readList();
    setItems(next);

    if (next.length === 0) {
      setHidden(false);
    }
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

  function remove(slug: string) {
    const next = items.filter((item) => item.slug !== slug);
    saveList(next);
    setItems(next);
  }

  function clear() {
    localStorage.removeItem("hmecha-compare");
    window.dispatchEvent(new Event("hmecha-compare-updated"));
    setItems([]);
    setHidden(false);
  }

  if (!items.length || hidden) return null;

  return (
    <div className="compareTrayFixed">
      <div className="compareTrayHead">
        <button
          type="button"
          className="compareMainBtn"
          onClick={() => router.push("/so-sanh")}
          title="Mở trang so sánh"
        >
          ⇄ So sánh ({items.length}/4)
        </button>

        <button
          type="button"
          className="compareIconBtn"
          onClick={() => setHidden(true)}
          title="Ẩn thanh so sánh"
        >
          ×
        </button>
      </div>

      <div className="compareTrayBody">
        {items.slice(0, 4).map((item) => (
          <div className="compareMiniItem" key={item.slug}>
            <span>{item.name}</span>
            <button type="button" onClick={() => remove(item.slug)} title="Bỏ sản phẩm">
              ×
            </button>
          </div>
        ))}
      </div>

      <div className="compareTrayActions">
        <button type="button" onClick={() => router.push("/so-sanh")}>
          Xem so sánh
        </button>

        <button type="button" onClick={clear}>
          Xóa tất cả
        </button>
      </div>

      <style>{`
        .compareTrayFixed {
          position: fixed;
          right: 18px;
          bottom: 136px;
          z-index: 70;
          width: min(330px, calc(100vw - 28px));
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid rgba(0, 229, 255, 0.25);
          background:
            radial-gradient(circle at 0% 0%, rgba(124, 77, 255, 0.2), transparent 34%),
            rgba(7, 12, 32, 0.96);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(14px);
        }

        .compareTrayHead {
          display: flex;
          gap: 8px;
          align-items: center;
          padding: 10px;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
        }

        .compareMainBtn,
        .compareIconBtn,
        .compareTrayActions button,
        .compareMiniItem button {
          border: 0;
          cursor: pointer;
          font-weight: 950;
        }

        .compareMainBtn {
          flex: 1;
          min-height: 40px;
          border-radius: 12px;
          color: #061020;
          background: rgba(255, 255, 255, 0.86);
        }

        .compareIconBtn {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          color: #061020;
          background: rgba(255, 255, 255, 0.9);
          font-size: 22px;
        }

        .compareTrayBody {
          display: grid;
          gap: 8px;
          padding: 10px;
          max-height: 190px;
          overflow: auto;
        }

        .compareMiniItem {
          display: grid;
          grid-template-columns: 1fr 28px;
          gap: 8px;
          align-items: center;
          padding: 10px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.06);
        }

        .compareMiniItem span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #fff;
          font-size: 13px;
          font-weight: 800;
        }

        .compareMiniItem button {
          width: 28px;
          height: 28px;
          border-radius: 999px;
          color: #fff;
          background: rgba(255, 79, 216, 0.22);
        }

        .compareTrayActions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          padding: 0 10px 10px;
        }

        .compareTrayActions button {
          min-height: 38px;
          border-radius: 12px;
          color: #061020;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
        }

        .compareTrayActions button:last-child {
          color: #fff;
          background: rgba(255, 79, 216, 0.22);
          border: 1px solid rgba(255, 79, 216, 0.28);
        }

        @media (max-width: 768px) {
          .compareTrayFixed {
            right: 12px;
            left: 12px;
            bottom: 96px;
            width: auto;
          }

          .compareTrayBody {
            max-height: 120px;
          }
        }
      `}</style>
    </div>
  );
}