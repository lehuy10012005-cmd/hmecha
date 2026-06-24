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
  cartRate: number;
  buyRate: number;
  lostCart: number;
  score: number;
  action: string;
  actionTone: "good" | "warning" | "danger" | "info";
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

function pct(value: number) {
  if (!Number.isFinite(value)) return "0.0%";
  return value.toFixed(1) + "%";
}

function getAction(item: ProductStats): {
  action: string;
  tone: ProductStats["actionTone"];
} {
  if (item.views >= 8 && item.addToCart === 0 && item.buyNow === 0) {
    return {
      action:
        "View cao nhưng chưa có hành động mua. Nên đổi ảnh đại diện, thêm ưu đãi hoặc viết lại mô tả ngắn ở đầu trang.",
      tone: "danger",
    };
  }

  if (item.addToCart >= 2 && item.buyNow === 0) {
    return {
      action:
        "Khách đã thêm giỏ nhưng chưa chốt. Nên dùng mã giảm giá, freeship hoặc nhắc lại cam kết chính hãng.",
      tone: "warning",
    };
  }

  if (item.buyNow >= 3 || item.buyRate >= 20) {
    return {
      action:
        "Tỷ lệ mua tốt. Nên ghim sản phẩm ở trang chủ, đưa vào Flash Sale hoặc đề xuất trong chatbot.",
      tone: "good",
    };
  }

  if (item.views <= 2) {
    return {
      action:
        "Sản phẩm ít được tiếp cận. Nên đưa vào khu nổi bật, đổi vị trí hiển thị hoặc thêm vào bộ sưu tập gợi ý.",
      tone: "info",
    };
  }

  if (item.avgRating > 0 && item.avgRating < 4) {
    return {
      action:
        "Đánh giá chưa cao. Nên kiểm tra phản hồi khách, ảnh sản phẩm và chính sách hỗ trợ.",
      tone: "warning",
    };
  }

  return {
    action: "Sản phẩm đang ổn. Tiếp tục theo dõi thêm dữ liệu trước khi ra quyết định.",
    tone: "info",
  };
}

function buildStats(events: ProductEvent[], reviews: ProductReview[]) {
  const map = new Map<string, ProductStats>();

  for (const event of events) {
    const slug = event.product_slug;

    if (!slug) continue;

    const current =
      map.get(slug) ||
      ({
        productSlug: slug,
        productName: event.product_name || slug,
        views: 0,
        clicks: 0,
        addToCart: 0,
        buyNow: 0,
        revenueIntent: 0,
        avgRating: 0,
        reviewCount: 0,
        cartRate: 0,
        buyRate: 0,
        lostCart: 0,
        score: 0,
        action: "",
        actionTone: "info",
      } satisfies ProductStats);

    current.productName = event.product_name || current.productName;

    if (event.event_type === "product_view") current.views += 1;
    if (event.event_type === "product_click" || event.event_type === "quick_view") {
      current.clicks += 1;
    }
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
      ({
        productSlug: slug,
        productName: slug,
        views: 0,
        clicks: 0,
        addToCart: 0,
        buyNow: 0,
        revenueIntent: 0,
        avgRating: 0,
        reviewCount: 0,
        cartRate: 0,
        buyRate: 0,
        lostCart: 0,
        score: 0,
        action: "",
        actionTone: "info",
      } satisfies ProductStats);

    current.reviewCount = ratings.length;
    current.avgRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;

    map.set(slug, current);
  }

  return Array.from(map.values()).map((item) => {
    const cartRate = item.views > 0 ? (item.addToCart / item.views) * 100 : 0;
    const buyRate = item.views > 0 ? (item.buyNow / item.views) * 100 : 0;
    const lostCart = Math.max(0, item.addToCart - item.buyNow);
    const action = getAction({
      ...item,
      cartRate,
      buyRate,
      lostCart,
    });

    const score =
      item.views * 1 +
      item.clicks * 1.5 +
      item.addToCart * 4 +
      item.buyNow * 10 +
      item.reviewCount * 2 +
      item.avgRating * 2 -
      lostCart * 0.8;

    return {
      ...item,
      cartRate,
      buyRate,
      lostCart,
      score,
      action: action.action,
      actionTone: action.tone,
    };
  });
}

function MetricCard({
  title,
  value,
  caption,
}: {
  title: string;
  value: string | number;
  caption: string;
}) {
  return (
    <div className="metricCard">
      <span>{title}</span>
      <strong>{value}</strong>
      <small>{caption}</small>
    </div>
  );
}

function FunnelBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const width = Math.max(4, Math.round((value / Math.max(max, 1)) * 100));

  return (
    <div className="funnelBar">
      <div>
        <b>{label}</b>
        <span>{value}</span>
      </div>
      <i>
        <em style={{ width: `${width}%` }} />
      </i>
    </div>
  );
}

function ProductRow({
  item,
  metric,
  max,
}: {
  item: ProductStats;
  metric: keyof Pick<ProductStats, "views" | "addToCart" | "buyNow" | "revenueIntent" | "lostCart">;
  max: number;
}) {
  const rawValue = Number(item[metric] || 0);
  const width = Math.max(4, Math.round((rawValue / Math.max(max, 1)) * 100));

  return (
    <div className="productRow">
      <div>
        <Link href={`/${item.productSlug}`}>{item.productName}</Link>
        <span>
          Xem {item.views} · Click {item.clicks} · Giỏ {item.addToCart} · Mua ngay{" "}
          {item.buyNow} · Đánh giá {item.avgRating ? item.avgRating.toFixed(1) : "0.0"}★
        </span>
      </div>

      <div className="rowBar">
        <i style={{ width: `${width}%` }} />
      </div>

      <b>{metric === "revenueIntent" ? money(rawValue) : rawValue}</b>
    </div>
  );
}

function AnalyticsPanel({
  title,
  subtitle,
  items,
  metric,
}: {
  title: string;
  subtitle: string;
  items: ProductStats[];
  metric: keyof Pick<ProductStats, "views" | "addToCart" | "buyNow" | "revenueIntent" | "lostCart">;
}) {
  const max = Math.max(...items.map((item) => Number(item[metric] || 0)), 1);

  return (
    <section className="panel">
      <div className="panelHead">
        <p>{subtitle}</p>
        <h2>{title}</h2>
      </div>

      <div className="productList">
        {items.length ? (
          items.map((item) => (
            <ProductRow key={item.productSlug} item={item} metric={metric} max={max} />
          ))
        ) : (
          <div className="emptyBox">Chưa có dữ liệu.</div>
        )}
      </div>
    </section>
  );
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
  const topRevenueIntent = [...stats]
    .sort((a, b) => b.revenueIntent - a.revenueIntent)
    .slice(0, 8);

  const lostCartProducts = [...stats]
    .filter((item) => item.lostCart > 0)
    .sort((a, b) => b.lostCart - a.lostCart)
    .slice(0, 8);

  const shouldPush = [...stats]
    .filter((item) => item.buyNow >= 1 || item.buyRate >= 12)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const shouldDiscount = [...stats]
    .filter((item) => item.addToCart >= 1 && item.buyNow === 0)
    .sort((a, b) => b.addToCart - a.addToCart)
    .slice(0, 8);

  const weakProducts = [...stats]
    .filter((item) => item.views <= 2 && item.addToCart === 0 && item.buyNow === 0)
    .sort((a, b) => a.views - b.views)
    .slice(0, 8);

  const totalViews = stats.reduce((sum, item) => sum + item.views, 0);
  const totalClicks = stats.reduce((sum, item) => sum + item.clicks, 0);
  const totalAddToCart = stats.reduce((sum, item) => sum + item.addToCart, 0);
  const totalBuyNow = stats.reduce((sum, item) => sum + item.buyNow, 0);
  const totalIntent = stats.reduce((sum, item) => sum + item.revenueIntent, 0);
  const avgCartRate = totalViews ? (totalAddToCart / totalViews) * 100 : 0;
  const avgBuyRate = totalViews ? (totalBuyNow / totalViews) * 100 : 0;
  const maxFunnel = Math.max(totalViews, totalClicks, totalAddToCart, totalBuyNow, 1);

  const topAdvice = [...stats].sort((a, b) => b.score - a.score).slice(0, 12);

  return (
    <main className="analyticsPage">
      <section className="analyticsHero">
        <div>
          <p>HMECHA INTELLIGENCE</p>
          <h1>Phân tích sản phẩm</h1>
          <span>
            Theo dõi lượt xem, thêm giỏ, mua ngay, đánh giá và gợi ý hành động cho từng mẫu.
          </span>
        </div>

        <Link href="/admin">← Quay lại Admin</Link>
      </section>

      <section className="metricGrid">
        <MetricCard title="Tổng lượt xem" value={totalViews} caption="Tất cả sản phẩm được tracking" />
        <MetricCard title="Click / xem nhanh" value={totalClicks} caption="Tín hiệu khách quan tâm" />
        <MetricCard title="Thêm vào giỏ" value={totalAddToCart} caption={`${pct(avgCartRate)} trên lượt xem`} />
        <MetricCard title="Mua ngay" value={totalBuyNow} caption={`${pct(avgBuyRate)} trên lượt xem`} />
        <MetricCard title="Doanh thu dự kiến" value={money(totalIntent)} caption="Tính theo hành động mua ngay" />
        <MetricCard title="Sản phẩm có dữ liệu" value={stats.length} caption="Có view, giỏ, mua hoặc review" />
      </section>

      <section className="analyticsGrid">
        <section className="panel">
          <div className="panelHead">
            <p>FUNNEL</p>
            <h2>Hành trình khách hàng</h2>
          </div>

          <div className="funnelBox">
            <FunnelBar label="Xem sản phẩm" value={totalViews} max={maxFunnel} />
            <FunnelBar label="Click / xem nhanh" value={totalClicks} max={maxFunnel} />
            <FunnelBar label="Thêm vào giỏ" value={totalAddToCart} max={maxFunnel} />
            <FunnelBar label="Mua ngay" value={totalBuyNow} max={maxFunnel} />
          </div>
        </section>

        <section className="panel">
          <div className="panelHead">
            <p>GỢI Ý NHANH</p>
            <h2>Admin nên làm gì?</h2>
          </div>

          <div className="adviceList">
            {topAdvice.length ? (
              topAdvice.map((item) => (
                <article className={`adviceCard ${item.actionTone}`} key={item.productSlug}>
                  <div>
                    <Link href={`/${item.productSlug}`}>{item.productName}</Link>
                    <span>
                      View {item.views} · Giỏ {item.addToCart} · Mua {item.buyNow} · CVR{" "}
                      {pct(item.buyRate)}
                    </span>
                  </div>
                  <p>{item.action}</p>
                </article>
              ))
            ) : (
              <div className="emptyBox">Chưa có dữ liệu để tạo gợi ý.</div>
            )}
          </div>
        </section>
      </section>

      <section className="decisionGrid">
        <section className="decisionCard good">
          <h2>Nên đẩy bán</h2>
          <p>Sản phẩm có tín hiệu mua tốt, nên ghim trang chủ hoặc đưa vào Flash Sale.</p>
          {shouldPush.length ? (
            shouldPush.slice(0, 5).map((item) => (
              <Link key={item.productSlug} href={`/${item.productSlug}`}>
                {item.productName}
                <span>{pct(item.buyRate)} mua / view</span>
              </Link>
            ))
          ) : (
            <small>Chưa có sản phẩm nổi bật.</small>
          )}
        </section>

        <section className="decisionCard warning">
          <h2>Nên giảm giá / freeship</h2>
          <p>Khách thêm giỏ nhưng chưa mua, nên thử mã giảm hoặc ưu đãi vận chuyển.</p>
          {shouldDiscount.length ? (
            shouldDiscount.slice(0, 5).map((item) => (
              <Link key={item.productSlug} href={`/${item.productSlug}`}>
                {item.productName}
                <span>{item.addToCart} lượt thêm giỏ</span>
              </Link>
            ))
          ) : (
            <small>Chưa có sản phẩm cần giảm giá.</small>
          )}
        </section>

        <section className="decisionCard danger">
          <h2>Nên tối ưu lại</h2>
          <p>Sản phẩm ít tương tác, nên đổi ảnh, đổi vị trí hoặc bổ sung mô tả hấp dẫn hơn.</p>
          {weakProducts.length ? (
            weakProducts.slice(0, 5).map((item) => (
              <Link key={item.productSlug} href={`/${item.productSlug}`}>
                {item.productName}
                <span>{item.views} lượt xem</span>
              </Link>
            ))
          ) : (
            <small>Không có sản phẩm quá yếu.</small>
          )}
        </section>
      </section>

      <section className="analyticsGrid">
        <AnalyticsPanel
          title="Sản phẩm xem nhiều"
          subtitle="AWARENESS"
          items={mostViewed}
          metric="views"
        />

        <AnalyticsPanel
          title="Thêm giỏ nhiều"
          subtitle="INTEREST"
          items={mostAdded}
          metric="addToCart"
        />
      </section>

      <section className="analyticsGrid">
        <AnalyticsPanel
          title="Mua ngay nhiều"
          subtitle="CONVERSION"
          items={mostBuyNow}
          metric="buyNow"
        />

        <AnalyticsPanel
          title="Doanh thu dự kiến cao"
          subtitle="REVENUE INTENT"
          items={topRevenueIntent}
          metric="revenueIntent"
        />
      </section>

      <section className="analyticsGrid">
        <AnalyticsPanel
          title="Bị bỏ giỏ nhiều"
          subtitle="CART DROP"
          items={lostCartProducts}
          metric="lostCart"
        />

        <section className="panel">
          <div className="panelHead">
            <p>HIỆU SUẤT CHI TIẾT</p>
            <h2>Bảng tỷ lệ chuyển đổi</h2>
          </div>

          <div className="detailTable">
            <div className="detailHead">
              <span>Sản phẩm</span>
              <span>View</span>
              <span>Giỏ</span>
              <span>Mua</span>
              <span>Giỏ/View</span>
              <span>Mua/View</span>
              <span>Rating</span>
            </div>

            {[...stats]
              .sort((a, b) => b.score - a.score)
              .slice(0, 12)
              .map((item) => (
                <div className="detailRow" key={item.productSlug}>
                  <Link href={`/${item.productSlug}`}>{item.productName}</Link>
                  <span>{item.views}</span>
                  <span>{item.addToCart}</span>
                  <span>{item.buyNow}</span>
                  <span>{pct(item.cartRate)}</span>
                  <span>{pct(item.buyRate)}</span>
                  <span>{item.avgRating ? item.avgRating.toFixed(1) : "0.0"}★</span>
                </div>
              ))}
          </div>
        </section>
      </section>

      <style>{`
        .analyticsPage {
          max-width: 1520px;
          margin: 0 auto;
          padding: 28px 0 50px;
          color: #fff;
          display: grid;
          gap: 22px;
        }

        .analyticsHero {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: flex-start;
          padding: 40px 0 18px;
        }

        .analyticsHero p,
        .panelHead p {
          margin: 0 0 10px;
          color: #00e5ff;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 3px;
        }

        .analyticsHero h1 {
          margin: 0;
          font-size: clamp(42px, 6vw, 74px);
          line-height: 1.02;
        }

        .analyticsHero span {
          display: block;
          margin-top: 14px;
          color: #c5d2f2;
          font-size: 18px;
        }

        .analyticsHero > a {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 52px;
          padding: 0 24px;
          border-radius: 14px;
          color: #061020;
          font-weight: 950;
          text-decoration: none;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
        }

        .metricGrid {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 14px;
        }

        .metricCard,
        .panel,
        .decisionCard {
          border: 1px solid rgba(0, 229, 255, 0.2);
          background:
            radial-gradient(circle at 0% 0%, rgba(124, 77, 255, 0.12), transparent 34%),
            rgba(7, 12, 32, 0.86);
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.22);
        }

        .metricCard {
          min-height: 118px;
          border-radius: 18px;
          padding: 18px;
          display: grid;
          align-content: center;
          gap: 8px;
        }

        .metricCard span {
          color: #c5d2f2;
          font-weight: 850;
        }

        .metricCard strong {
          color: #00e5ff;
          font-size: 30px;
          line-height: 1;
        }

        .metricCard small {
          color: #9fb0d8;
          line-height: 1.4;
        }

        .analyticsGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .panel,
        .decisionCard {
          border-radius: 22px;
          overflow: hidden;
        }

        .panelHead {
          padding: 22px 22px 12px;
        }

        .panelHead h2 {
          margin: 0;
          font-size: 28px;
        }

        .funnelBox,
        .adviceList,
        .productList {
          display: grid;
          gap: 12px;
          padding: 18px 22px 22px;
          border-top: 1px solid rgba(255,255,255,.08);
        }

        .funnelBar {
          display: grid;
          gap: 10px;
          padding: 14px;
          border-radius: 16px;
          background: rgba(255,255,255,.055);
        }

        .funnelBar div {
          display: flex;
          justify-content: space-between;
          gap: 12px;
        }

        .funnelBar b {
          color: #fff;
        }

        .funnelBar span {
          color: #00e5ff;
          font-weight: 950;
        }

        .funnelBar i,
        .rowBar {
          height: 12px;
          border-radius: 999px;
          overflow: hidden;
          background: rgba(255,255,255,.1);
        }

        .funnelBar em,
        .rowBar i {
          display: block;
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #7c4dff, #00e5ff);
        }

        .adviceCard {
          padding: 16px;
          border-radius: 16px;
          background: rgba(255,255,255,.055);
          border: 1px solid rgba(255,255,255,.08);
        }

        .adviceCard.good {
          border-color: rgba(0, 229, 255, 0.35);
        }

        .adviceCard.warning {
          border-color: rgba(255, 199, 0, 0.35);
        }

        .adviceCard.danger {
          border-color: rgba(255, 71, 126, 0.35);
        }

        .adviceCard a {
          display: block;
          color: #fff;
          font-size: 17px;
          font-weight: 950;
          text-decoration: none;
          margin-bottom: 6px;
        }

        .adviceCard span {
          color: #9fb0d8;
        }

        .adviceCard p {
          color: #dce6ff;
          line-height: 1.65;
          margin: 12px 0 0;
        }

        .decisionGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
        }

        .decisionCard {
          padding: 22px;
          display: grid;
          gap: 12px;
        }

        .decisionCard h2 {
          margin: 0;
          font-size: 26px;
        }

        .decisionCard p {
          margin: 0 0 8px;
          color: #c5d2f2;
          line-height: 1.6;
        }

        .decisionCard a {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          color: #fff;
          text-decoration: none;
          padding: 12px;
          border-radius: 14px;
          background: rgba(255,255,255,.055);
        }

        .decisionCard span {
          color: #00e5ff;
          font-weight: 900;
        }

        .decisionCard small {
          color: #9fb0d8;
        }

        .productRow {
          display: grid;
          grid-template-columns: minmax(260px, 0.8fr) 1fr auto;
          gap: 14px;
          align-items: center;
          padding: 14px;
          border-radius: 16px;
          background: rgba(255,255,255,.055);
        }

        .productRow a {
          display: block;
          color: #fff;
          text-decoration: none;
          font-weight: 950;
          line-height: 1.35;
          margin-bottom: 6px;
        }

        .productRow span {
          color: #9fb0d8;
          font-size: 13px;
        }

        .productRow b {
          color: #00e5ff;
          white-space: nowrap;
        }

        .detailTable {
          padding: 18px 22px 22px;
          border-top: 1px solid rgba(255,255,255,.08);
          overflow-x: auto;
        }

        .detailHead,
        .detailRow {
          min-width: 900px;
          display: grid;
          grid-template-columns: 2fr repeat(6, 0.7fr);
          gap: 12px;
          align-items: center;
        }

        .detailHead {
          color: #9fb0d8;
          font-size: 12px;
          text-transform: uppercase;
          padding-bottom: 14px;
        }

        .detailRow {
          padding: 14px 0;
          border-top: 1px solid rgba(255,255,255,.08);
        }

        .detailRow a {
          color: #fff;
          font-weight: 900;
          text-decoration: none;
        }

        .detailRow span {
          color: #dce6ff;
        }

        .emptyBox {
          padding: 16px;
          color: #9fb0d8;
        }

        @media (max-width: 1180px) {
          .metricGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .analyticsGrid,
          .decisionGrid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .analyticsHero {
            display: grid;
          }

          .metricGrid {
            grid-template-columns: 1fr;
          }

          .productRow {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}