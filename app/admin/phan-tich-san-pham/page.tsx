import Link from "next/link";
import { redirect } from "next/navigation";
import { createAuthServerClient } from "../../../lib/supabase-auth/server";
import { supabaseAdmin } from "../../../lib/supabase-admin";

export const dynamic = "force-dynamic";

type ProductEvent = {
  id: string;
  product_id: string | null;
  product_slug: string;
  product_name: string | null;
  event_type: string;
  price: number | null;
  quantity: number | null;
  created_at: string;
};

type ProductReview = {
  product_slug: string;
  rating: number;
};

type ProductStats = {
  productSlug: string;
  productName: string;
  views: number;
  clicks: number;
  addToCart: number;
  buyNow: number;
  revenueIntent: number;
  avgRating: number;
  reviewCount: number;
  score: number;
};

async function requireAdmin() {
  const supabase = await createAuthServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!user) {
    redirect("/admin-login");
  }

  if (!adminEmail || user.email?.trim().toLowerCase() !== adminEmail) {
    redirect("/admin-login");
  }
}

function money(value: number) {
  return Number(value || 0).toLocaleString("vi-VN") + "₫";
}

function getAdvice(item: ProductStats) {
  if (item.views >= 10 && item.addToCart === 0 && item.buyNow === 0) {
    return "Nhiều người xem nhưng chưa chuyển đổi. Nên xem lại giá, ảnh sản phẩm hoặc mô tả.";
  }

  if (item.addToCart >= 3 && item.buyNow === 0) {
    return "Khách có quan tâm nhưng chưa chốt mua. Có thể thêm mã giảm giá hoặc freeship.";
  }

  if (item.buyNow >= 3) {
    return "Sản phẩm có tín hiệu mua tốt. Nên ưu tiên hiển thị ở trang chủ hoặc flash sale.";
  }

  if (item.views <= 1) {
    return "Sản phẩm ít được xem. Nên tăng hiển thị, đổi ảnh đại diện hoặc đưa vào mục gợi ý.";
  }

  if (item.avgRating > 0 && item.avgRating < 4) {
    return "Điểm đánh giá chưa cao. Nên kiểm tra phản hồi khách và chất lượng sản phẩm.";
  }

  return "Sản phẩm đang ở mức ổn. Tiếp tục theo dõi thêm dữ liệu.";
}

function buildStats(events: ProductEvent[], reviews: ProductReview[]) {
  const map = new Map<string, ProductStats>();

  for (const event of events) {
    const slug = event.product_slug;

    if (!slug) continue;

    const current =
      map.get(slug) ||
      {
        productSlug: slug,
        productName: event.product_name || slug,
        views: 0,
        clicks: 0,
        addToCart: 0,
        buyNow: 0,
        revenueIntent: 0,
        avgRating: 0,
        reviewCount: 0,
        score: 0,
      };

    current.productName = event.product_name || current.productName;

    if (event.event_type === "product_view") current.views += 1;
    if (event.event_type === "product_click" || event.event_type === "quick_view") current.clicks += 1;
    if (event.event_type === "add_to_cart") current.addToCart += 1;
    if (event.event_type === "buy_now") {
      current.buyNow += 1;
      current.revenueIntent += Number(event.price || 0) * Number(event.quantity || 1);
    }

    map.set(slug, current);
  }

  const reviewsBySlug = new Map<string, number[]>();

  for (const review of reviews) {
    if (!review.product_slug) continue;

    const list = reviewsBySlug.get(review.product_slug) || [];
    list.push(Number(review.rating || 0));
    reviewsBySlug.set(review.product_slug, list);
  }

  for (const [slug, ratings] of reviewsBySlug.entries()) {
    const current =
      map.get(slug) ||
      {
        productSlug: slug,
        productName: slug,
        views: 0,
        clicks: 0,
        addToCart: 0,
        buyNow: 0,
        revenueIntent: 0,
        avgRating: 0,
        reviewCount: 0,
        score: 0,
      };

    current.reviewCount = ratings.length;
    current.avgRating =
      ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;

    map.set(slug, current);
  }

  return Array.from(map.values()).map((item) => {
    const score =
      item.views * 1 +
      item.clicks * 1.5 +
      item.addToCart * 4 +
      item.buyNow * 8 +
      item.reviewCount * 2 +
      item.avgRating * 2;

    return {
      ...item,
      score,
    };
  });
}

export default async function AdminProductAnalyticsPage() {
  await requireAdmin();

  const { data: eventsData } = await supabaseAdmin
    .from("product_events")
    .select("id, product_id, product_slug, product_name, event_type, price, quantity, created_at")
    .order("created_at", { ascending: false })
    .limit(5000);

  const { data: reviewsData } = await supabaseAdmin
    .from("product_reviews")
    .select("product_slug, rating");

  const events = (eventsData || []) as ProductEvent[];
  const reviews = (reviewsData || []) as ProductReview[];

  const stats = buildStats(events, reviews);

  const mostViewed = [...stats].sort((a, b) => b.views - a.views).slice(0, 8);
  const mostAdded = [...stats].sort((a, b) => b.addToCart - a.addToCart).slice(0, 8);
  const mostBuyNow = [...stats].sort((a, b) => b.buyNow - a.buyNow).slice(0, 8);
  const lowInteraction = [...stats]
    .filter((item) => item.views <= 2 && item.addToCart === 0 && item.buyNow === 0)
    .sort((a, b) => a.views - b.views)
    .slice(0, 8);

  const totalViews = stats.reduce((sum, item) => sum + item.views, 0);
  const totalAddToCart = stats.reduce((sum, item) => sum + item.addToCart, 0);
  const totalBuyNow = stats.reduce((sum, item) => sum + item.buyNow, 0);
  const totalIntent = stats.reduce((sum, item) => sum + item.revenueIntent, 0);

  return (
    <main className="analyticsPage">
      <div className="topbar">
        <div>
          <p>HMECHA INTELLIGENCE</p>
          <h1>Phân tích sản phẩm</h1>
          <span>
            Theo dõi sản phẩm xem nhiều, thêm giỏ nhiều, mua ngay nhiều và các mẫu ít tương tác.
          </span>
        </div>

        <Link href="/admin">← Quay lại Admin</Link>
      </div>

      <section className="statsGrid">
        <div>
          <span>Tổng lượt xem</span>
          <strong>{totalViews}</strong>
        </div>

        <div>
          <span>Thêm vào giỏ</span>
          <strong>{totalAddToCart}</strong>
        </div>

        <div>
          <span>Mua ngay</span>
          <strong>{totalBuyNow}</strong>
        </div>

        <div>
          <span>Doanh thu dự kiến</span>
          <strong>{money(totalIntent)}</strong>
        </div>
      </section>

      <section className="boardGrid">
        <AnalyticsCard title="Sản phẩm xem nhiều" items={mostViewed} metric="views" />
        <AnalyticsCard title="Thêm giỏ nhiều" items={mostAdded} metric="addToCart" />
        <AnalyticsCard title="Mua ngay nhiều" items={mostBuyNow} metric="buyNow" />
        <AnalyticsCard title="Ít tương tác" items={lowInteraction} metric="views" />
      </section>

      <section className="insightBoard">
        <div className="boardHead">
          <h2>Lời khuyên vận hành</h2>
          <p>Gợi ý nhanh dựa trên lượt xem, thêm giỏ, mua ngay và đánh giá.</p>
        </div>

        {stats.length === 0 ? (
          <div className="emptyBox">
            Chưa có dữ liệu tracking. Hãy mở vài sản phẩm, bấm thêm giỏ hoặc mua ngay để bắt đầu ghi nhận.
          </div>
        ) : (
          <div className="insightList">
            {[...stats]
              .sort((a, b) => b.score - a.score)
              .slice(0, 12)
              .map((item) => (
                <div className="insightItem" key={item.productSlug}>
                  <div>
                    <Link href={`/${item.productSlug}`}>{item.productName}</Link>
                    <span>
                      Xem {item.views} · Thêm giỏ {item.addToCart} · Mua ngay {item.buyNow} · Đánh giá{" "}
                      {item.avgRating ? item.avgRating.toFixed(1) : "0.0"}★
                    </span>
                  </div>

                  <p>{getAdvice(item)}</p>
                </div>
              ))}
          </div>
        )}
      </section>

      <style>{`
        .analyticsPage {
          min-height: 100vh;
          padding: 36px 24px 80px;
          color: #ffffff;
          background:
            radial-gradient(circle at 8% 0%, rgba(124, 77, 255, 0.24), transparent 34%),
            radial-gradient(circle at 92% 8%, rgba(0, 229, 255, 0.16), transparent 30%),
            linear-gradient(180deg, #050816 0%, #0b1434 48%, #050816 100%);
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          align-items: flex-start;
          max-width: 1480px;
          margin: 0 auto 28px;
        }

        .topbar p {
          margin: 0 0 10px;
          color: #00e5ff;
          font-weight: 950;
          letter-spacing: 4px;
          font-size: 13px;
        }

        .topbar h1 {
          margin: 0;
          font-size: clamp(38px, 5vw, 60px);
          line-height: 1.05;
        }

        .topbar span {
          display: block;
          margin-top: 14px;
          color: #c5d2f2;
          line-height: 1.7;
        }

        .topbar a {
          text-decoration: none;
          color: #061020;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
          font-weight: 950;
          border-radius: 13px;
          padding: 13px 18px;
          white-space: nowrap;
        }

        .statsGrid {
          max-width: 1480px;
          margin: 0 auto 24px;
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        .statsGrid div,
        .analyticsCard,
        .insightBoard {
          border: 1px solid rgba(0, 229, 255, 0.2);
          background: rgba(7, 12, 32, 0.84);
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.24);
        }

        .statsGrid div {
          padding: 22px;
          border-radius: 22px;
        }

        .statsGrid span {
          display: block;
          color: #9fb0d8;
          margin-bottom: 10px;
        }

        .statsGrid strong {
          color: #00e5ff;
          font-size: 28px;
        }

        .boardGrid {
          max-width: 1480px;
          margin: 0 auto 24px;
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .analyticsCard,
        .insightBoard {
          border-radius: 24px;
          overflow: hidden;
        }

        .cardHead,
        .boardHead {
          padding: 22px;
          border-bottom: 1px solid rgba(255,255,255,.08);
        }

        .cardHead h2,
        .boardHead h2 {
          margin: 0;
          font-size: 25px;
        }

        .boardHead p {
          margin: 8px 0 0;
          color: #9fb0d8;
        }

        .rankList,
        .insightList {
          display: grid;
        }

        .rankItem,
        .insightItem {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 14px;
          align-items: center;
          padding: 16px 22px;
          border-bottom: 1px solid rgba(255,255,255,.08);
        }

        .rankItem:last-child,
        .insightItem:last-child {
          border-bottom: 0;
        }

        .rankItem a,
        .insightItem a {
          color: #ffffff;
          font-weight: 900;
          text-decoration: none;
        }

        .rankItem a:hover,
        .insightItem a:hover {
          color: #00e5ff;
        }

        .rankItem span,
        .insightItem span {
          display: block;
          margin-top: 6px;
          color: #9fb0d8;
          font-size: 13px;
        }

        .metric {
          color: #00e5ff;
          font-size: 24px;
          font-weight: 950;
        }

        .insightBoard {
          max-width: 1480px;
          margin: 0 auto;
        }

        .insightItem {
          grid-template-columns: 1fr 1.3fr;
        }

        .insightItem p {
          margin: 0;
          color: #dce6ff;
          line-height: 1.6;
        }

        .emptyBox {
          margin: 20px;
          padding: 24px;
          color: #b9c8ed;
          border-radius: 18px;
          background: rgba(255,255,255,.055);
        }

        @media (max-width: 1000px) {
          .statsGrid,
          .boardGrid,
          .insightItem {
            grid-template-columns: 1fr;
          }

          .topbar {
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}

function AnalyticsCard({
  title,
  items,
  metric,
}: {
  title: string;
  items: ProductStats[];
  metric: "views" | "addToCart" | "buyNow";
}) {
  return (
    <section className="analyticsCard">
      <div className="cardHead">
        <h2>{title}</h2>
      </div>

      {items.length === 0 ? (
        <div className="emptyBox">Chưa có dữ liệu.</div>
      ) : (
        <div className="rankList">
          {items.map((item, index) => (
            <div className="rankItem" key={`${title}-${item.productSlug}`}>
              <div>
                <Link href={`/${item.productSlug}`}>
                  #{index + 1} {item.productName}
                </Link>
                <span>
                  Xem {item.views} · Click {item.clicks} · Giỏ {item.addToCart} · Mua ngay {item.buyNow}
                </span>
              </div>

              <strong className="metric">{item[metric]}</strong>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}