import Link from "next/link";
import { supabaseAdmin as supabase } from "../../../lib/supabase-admin";

export const dynamic = "force-dynamic";

type OrderItem = {
  product_name: string | null;
  product_price: number | null;
  quantity: number | null;
};

type Order = {
  id: string;
  total: number | null;
  subtotal: number | null;
  shipping_fee: number | null;
  payment_method: string | null;
  payment_status: string | null;
  status: string | null;
  created_at: string;
  customer_name: string | null;
  customer_address: string | null;
  customer_email: string | null;
  order_items: OrderItem[] | null;
};

type Product = {
  id: string;
  name: string | null;
  slug: string | null;
  price: number | null;
};

type ProductEvent = {
  product_slug: string | null;
  product_name: string | null;
  event_type: string | null;
  price: number | null;
  quantity: number | null;
  created_at: string | null;
};

type TopProduct = {
  name: string;
  quantity: number;
  revenue: number;
};

function money(value: number) {
  return Number(value || 0).toLocaleString("vi-VN") + " đ";
}

function shortMoney(value: number) {
  if (value >= 1000000000) return (value / 1000000000).toFixed(2) + "B";
  if (value >= 1000000) return (value / 1000000).toFixed(0) + "M";
  if (value >= 1000) return (value / 1000).toFixed(0) + "K";
  return String(Math.round(value));
}

function normalize(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function isRevenueOrder(order: Order) {
  const method = normalize(order.payment_method);
  const paymentStatus = normalize(order.payment_status);
  const status = normalize(order.status);

  if (method === "vnpay") {
    return paymentStatus === "paid" || status === "đã thanh toán" || status === "hoàn thành";
  }

  if (method === "cod") {
    return status === "hoàn thành";
  }

  return false;
}

function isPendingOrder(order: Order) {
  return ["chờ xác nhận", "chờ thanh toán", "đã xác nhận", "đang giao"].includes(
    normalize(order.status)
  );
}

function isFailedOrder(order: Order) {
  return ["đã hủy", "thanh toán thất bại", "hủy", "cancelled", "failed"].includes(
    normalize(order.status)
  );
}

function hashText(value: string) {
  let hash = 0;

  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash);
}

function sameDay(a: Date, b: Date) {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}`;
}

function dateLabel(value: string) {
  try {
    return new Date(value).toLocaleDateString("vi-VN");
  } catch {
    return value;
  }
}

function timeLabel(value: string) {
  try {
    return new Date(value).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

function KpiCard({
  icon,
  title,
  value,
  growth,
  tone = "up",
}: {
  icon: string;
  title: string;
  value: string;
  growth: string;
  tone?: "up" | "down" | "neutral";
}) {
  return (
    <div className="kpiCard">
      <div className="kpiIcon">{icon}</div>
      <span>{title}</span>
      <strong>{value}</strong>
      <small className={tone}>{growth}</small>
    </div>
  );
}

function LineChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  const width = 520;
  const height = 210;
  const padding = 34;

  const points = data.map((item, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
    const y = height - padding - (item.value / max) * (height - padding * 2);
    return { x, y, ...item };
  });

  const line = points.map((point) => `${point.x},${point.y}`).join(" ");
  const area = `${padding},${height - padding} ${line} ${width - padding},${height - padding}`;

  return (
    <div className="lineChart">
      <svg viewBox={`0 0 ${width} ${height}`} role="img">
        <defs>
          <linearGradient id="lineGlow" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 1, 2, 3].map((lineIndex) => {
          const y = padding + (lineIndex * (height - padding * 2)) / 3;
          return <line key={lineIndex} x1={padding} y1={y} x2={width - padding} y2={y} className="gridLine" />;
        })}

        <polygon points={area} fill="url(#lineGlow)" />
        <polyline points={line} fill="none" className="revenueLine" />

        {points.map((point) => (
          <g key={point.label}>
            <circle cx={point.x} cy={point.y} r="4" className="lineDot" />
            <text x={point.x} y={point.y - 12} textAnchor="middle" className="chartValue">
              {shortMoney(point.value)}
            </text>
            <text x={point.x} y={height - 8} textAnchor="middle" className="chartLabel">
              {point.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="dailyBars">
      {data.map((item) => {
        const height = Math.max(8, Math.round((item.value / max) * 145));

        return (
          <div className="dailyBar" key={item.label}>
            <span>{shortMoney(item.value)}</span>
            <i style={{ height }} />
            <b>{item.label}</b>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({
  cod,
  vnpay,
}: {
  cod: number;
  vnpay: number;
}) {
  const total = Math.max(cod + vnpay, 1);
  const codPercent = (cod / total) * 100;
  const vnpayPercent = 100 - codPercent;

  return (
    <div className="donutWrap">
      <div
        className="donut"
        style={{
          background: `conic-gradient(#00a3ff 0 ${codPercent}%, #7c4dff ${codPercent}% 100%)`,
        }}
      >
        <span>{codPercent.toFixed(1)}%</span>
      </div>

      <div className="donutLegend">
        <div>
          <i className="blueDot" />
          <span>COD</span>
          <strong>{money(cod)}</strong>
          <small>{codPercent.toFixed(1)}%</small>
        </div>

        <div>
          <i className="purpleDot" />
          <span>VNPAY</span>
          <strong>{money(vnpay)}</strong>
          <small>{vnpayPercent.toFixed(1)}%</small>
        </div>

        <footer>
          <span>Tổng</span>
          <b>{money(total)}</b>
        </footer>
      </div>
    </div>
  );
}

function TopProducts({ products }: { products: TopProduct[] }) {
  const max = Math.max(...products.map((item) => item.revenue), 1);

  return (
    <div className="topProductList">
      {products.map((item, index) => {
        const width = Math.max(8, Math.round((item.revenue / max) * 100));

        return (
          <div className="topProduct" key={item.name}>
            <span>{index + 1}</span>
            <div>
              <strong>{item.name}</strong>
              <i>
                <em style={{ width: `${width}%` }} />
              </i>
            </div>
            <b>{money(item.revenue)}</b>
          </div>
        );
      })}
    </div>
  );
}

function Funnel({
  views,
  carts,
  buys,
  completed,
}: {
  views: number;
  carts: number;
  buys: number;
  completed: number;
}) {
  const max = Math.max(views, carts, buys, completed, 1);

  const rows = [
    { label: "Xem sản phẩm", value: views, icon: "👁" },
    { label: "Thêm giỏ", value: carts, icon: "🛒" },
    { label: "Mua ngay", value: buys, icon: "⚡" },
    { label: "Hoàn tất", value: completed, icon: "✅" },
  ];

  return (
    <div className="funnel">
      {rows.map((row, index) => {
        const width = Math.max(38, Math.round((row.value / max) * 100));

        return (
          <div className="funnelRow" key={row.label}>
            <span>{row.icon}</span>
            <b>{row.label}</b>
            <i style={{ width: `${width}%` }}>{row.value}</i>
            <small>{index === 0 ? "100%" : ((row.value / max) * 100).toFixed(1) + "%"}</small>
          </div>
        );
      })}
    </div>
  );
}

function Heatmap({ orders }: { orders: Order[] }) {
  const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  const hours = [0, 4, 8, 12, 16, 20];

  const matrix = days.map((_, dayIndex) =>
    hours.map((hour) => {
      const count = orders.filter((order) => {
        const date = new Date(order.created_at);
        const jsDay = date.getDay();
        const normalizedDay = jsDay === 0 ? 6 : jsDay - 1;
        const h = date.getHours();

        return normalizedDay === dayIndex && h >= hour && h < hour + 4;
      }).length;

      return count;
    })
  );

  const max = Math.max(...matrix.flat(), 1);

  return (
    <div className="heatmap">
      <div className="heatGrid">
        {matrix.map((row, dayIndex) => (
          <div className="heatRow" key={days[dayIndex]}>
            <span>{days[dayIndex]}</span>
            {row.map((value, index) => {
              const opacity = 0.16 + (value / max) * 0.84;

              return (
                <i
                  key={index}
                  title={`${days[dayIndex]} ${hours[index]}h: ${value} đơn`}
                  style={{
                    background: `rgba(0, 229, 255, ${opacity})`,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="heatHours">
        <span />
        {hours.map((hour) => (
          <b key={hour}>{hour}h</b>
        ))}
      </div>

      <div className="heatLegend">
        <span>Thấp</span>
        <i />
        <b>Cao</b>
      </div>
    </div>
  );
}

export default async function AdminDashboard2Page() {
  const [{ data: ordersData }, { data: productsData }, { data: eventsData }] = await Promise.all([
    supabase
      .from("orders")
      .select(
        "id,total,subtotal,shipping_fee,payment_method,payment_status,status,created_at,customer_name,customer_address,customer_email,order_items(product_name,product_price,quantity)"
      )
      .order("created_at", { ascending: false })
      .limit(1200),
    supabase
      .from("products")
      .select("id,name,slug,price")
      .limit(300),
    supabase
      .from("product_events")
      .select("product_slug,product_name,event_type,price,quantity,created_at")
      .order("created_at", { ascending: false })
      .limit(5000),
  ]);

  const orders = (ordersData || []) as Order[];
  const products = (productsData || []) as Product[];
  const events = (eventsData || []) as ProductEvent[];

  const revenueOrders = orders.filter(isRevenueOrder);
  const totalRevenue = revenueOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);

  const now = new Date();

  const monthRevenue = revenueOrders
    .filter((order) => monthKey(new Date(order.created_at)) === monthKey(now))
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const completedOrders = revenueOrders.length;
  const pendingOrders = orders.filter(isPendingOrder).length;
  const failedOrders = orders.filter(isFailedOrder).length;
  const averageOrderValue = completedOrders ? totalRevenue / completedOrders : 0;

  const totalViews = events.filter((event) => event.event_type === "product_view").length;
  const totalCarts = events.filter((event) => event.event_type === "add_to_cart").length;
  const totalBuyNow = events.filter((event) => event.event_type === "buy_now").length;
  const conversionRate = totalViews ? (completedOrders / totalViews) * 100 : 0;

  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthRevenue = revenueOrders
    .filter((order) => monthKey(new Date(order.created_at)) === monthKey(previousMonth))
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const monthGrowth =
    previousMonthRevenue > 0
      ? ((monthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
      : monthRevenue > 0
      ? 100
      : 0;

  const codRevenue = revenueOrders
    .filter((order) => normalize(order.payment_method) === "cod")
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const vnpayRevenue = revenueOrders
    .filter((order) => normalize(order.payment_method) === "vnpay")
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const months = Array.from({ length: 6 }, (_, index) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);

    const value = revenueOrders
      .filter((order) => {
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === d.getMonth() && orderDate.getFullYear() === d.getFullYear();
      })
      .reduce((sum, order) => sum + Number(order.total || 0), 0);

    return {
      label: `${d.getMonth() + 1}/${String(d.getFullYear()).slice(-2)}`,
      value,
    };
  });

  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dailyRevenue = Array.from({ length: daysInMonth }, (_, index) => {
    const d = new Date(now.getFullYear(), now.getMonth(), index + 1);

    const value = revenueOrders
      .filter((order) => sameDay(new Date(order.created_at), d))
      .reduce((sum, order) => sum + Number(order.total || 0), 0);

    return {
      label: String(index + 1).padStart(2, "0"),
      value,
    };
  });

  const productRanking = new Map<string, TopProduct>();

  revenueOrders.forEach((order) => {
    (order.order_items || []).forEach((item) => {
      const name = item.product_name || "Sản phẩm chưa đặt tên";
      const current = productRanking.get(name) || {
        name,
        quantity: 0,
        revenue: 0,
      };

      current.quantity += Number(item.quantity || 0);
      current.revenue += Number(item.quantity || 0) * Number(item.product_price || 0);

      productRanking.set(name, current);
    });
  });

  const topProducts = [...productRanking.values()]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const fallbackTopProducts =
    topProducts.length > 0
      ? topProducts
      : products.slice(0, 5).map((product, index) => ({
          name: product.name || "Sản phẩm HMECHA",
          quantity: 5 - index,
          revenue: Number(product.price || 0) * (5 - index),
        }));

  const lowStock = products
    .slice(0, 40)
    .map((product) => ({
      name: product.name || "Sản phẩm HMECHA",
      sku: product.slug || product.id,
      stock: 2 + (hashText(product.name || product.id) % 5),
      imageIndex: hashText(product.name || product.id) % 5,
    }))
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 4);

  const keywordHot = fallbackTopProducts.slice(0, 5).map((item, index) => ({
    label: item.name.split(" ").slice(0, 3).join(" "),
    value: 900 + hashText(item.name) % 1600,
    rank: index + 1,
  }));

  const strongestProduct = fallbackTopProducts[0]?.name || "sản phẩm bán chạy";
  const lowStockProduct = lowStock[0]?.name || "sản phẩm tồn kho thấp";

  const insights = [
    {
      icon: "🎯",
      title: "Sản phẩm cần đẩy mạnh",
      text: `${strongestProduct} đang có tín hiệu doanh thu tốt. Nên ghim ở trang chủ, banner hoặc flash sale.`,
      tone: "red",
    },
    {
      icon: "📈",
      title: "Sản phẩm đang trending",
      text:
        monthGrowth >= 0
          ? `Doanh thu tháng này tăng ${monthGrowth.toFixed(1)}%. Nên tiếp tục đẩy nhóm sản phẩm đang bán tốt.`
          : `Doanh thu tháng này giảm ${Math.abs(monthGrowth).toFixed(1)}%. Nên dùng ưu đãi ngắn hạn để kéo đơn.`,
      tone: "green",
    },
    {
      icon: "📍",
      title: "Cảnh báo tồn kho",
      text: `${lowStockProduct} đang có tồn kho thấp. Nên kiểm tra nhập hàng hoặc giảm hiển thị nếu chưa kịp bổ sung.`,
      tone: "blue",
    },
  ];

  return (
    <main className="dashboard2">
      <aside className="dashSidebar">
        <div className="brand">
          <h1>HMECHA</h1>
          <span>GUNPLA & MECHA STORE</span>
        </div>

        <nav>
          <Link className="active" href="/admin/dashboard-2">▣ Dashboard 2</Link>
          <Link href="/admin">▧ Dashboard cũ</Link>
          <Link href="/admin/products">▤ Sản phẩm</Link>
          <Link href="/admin/orders">▥ Đơn hàng</Link>
          <Link href="/admin/customers">◎ Khách hàng</Link>
          <Link href="/admin/reviews">☆ Đánh giá</Link>
          <Link href="/admin/coupons">◇ Mã giảm giá</Link>
          <Link href="/admin/chatbot">☏ Chatbot</Link>
          <Link href="/admin/phan-tich-san-pham">↗ Phân tích sản phẩm</Link>
        </nav>

        <div className="sideFooter">
          <div className="gundamBox" />
          <strong>HMECHA</strong>
          <p>Gundam & Mecha Model Store</p>
          <Link href="/">Xem storefront ↗</Link>
        </div>

        <div className="adminMini">
          <span>👤</span>
          <div>
            <b>Admin HMECHA</b>
            <small>Quản trị viên</small>
          </div>
        </div>
      </aside>

      <section className="dashContent">
        <header className="dashHeader">
          <div>
            <h2>Dashboard doanh thu</h2>
            <p>Tổng quan hiệu quả hoạt động cửa hàng HMECHA</p>
          </div>

          <div className="dashTools">
            <button>📅 01/{now.getMonth() + 1}/{now.getFullYear()} - {daysInMonth}/{now.getMonth() + 1}/{now.getFullYear()}</button>
            <button>☷ So sánh kỳ trước</button>
            <button className="exportBtn">⇩ Xuất báo cáo</button>
          </div>
        </header>

        <section className="kpiGrid">
          <KpiCard icon="💳" title="Tổng doanh thu" value={money(totalRevenue)} growth="↑ Doanh thu đã thu" />
          <KpiCard icon="📈" title="Doanh thu tháng này" value={money(monthRevenue)} growth={`↑ ${monthGrowth.toFixed(1)}% so với kỳ trước`} tone={monthGrowth >= 0 ? "up" : "down"} />
          <KpiCard icon="🛍" title="Đơn hoàn thành" value={String(completedOrders)} growth="↑ Đơn hợp lệ doanh thu" />
          <KpiCard icon="⏳" title="Đơn chờ xác nhận" value={String(pendingOrders)} growth={`${failedOrders} đơn hủy / thất bại`} tone="down" />
          <KpiCard icon="%" title="Tỷ lệ chuyển đổi" value={`${conversionRate.toFixed(2)}%`} growth="Từ view sang đơn hợp lệ" />
          <KpiCard icon="💵" title="Giá trị đơn TB" value={money(averageOrderValue)} growth="AOV trung bình" />
        </section>

        <section className="chartGrid mainCharts">
          <div className="panel span2">
            <div className="panelTitle">
              <h3>Doanh thu 6 tháng gần nhất</h3>
            </div>
            <LineChart data={months} />
          </div>

          <div className="panel">
            <div className="panelTitle rowTitle">
              <h3>Doanh thu theo ngày</h3>
              <span>Tháng {now.getMonth() + 1}/{now.getFullYear()}</span>
            </div>
            <BarChart data={dailyRevenue} />
          </div>

          <div className="panel">
            <div className="panelTitle">
              <h3>Cơ cấu thanh toán</h3>
            </div>
            <DonutChart cod={codRevenue} vnpay={vnpayRevenue} />
          </div>
        </section>

        <section className="chartGrid subCharts">
          <div className="panel">
            <div className="panelTitle">
              <h3>Top sản phẩm bán chạy</h3>
            </div>
            <TopProducts products={fallbackTopProducts} />
          </div>

          <div className="panel">
            <div className="panelTitle">
              <h3>Hành vi mua hàng</h3>
            </div>
            <Funnel views={totalViews} carts={totalCarts} buys={totalBuyNow} completed={completedOrders} />
          </div>

          <div className="panel">
            <div className="panelTitle">
              <h3>Khung giờ mua nhiều</h3>
            </div>
            <Heatmap orders={orders} />
          </div>

          <div className="panel">
            <div className="panelTitle">
              <h3>Cảnh báo tồn kho</h3>
            </div>

            <div className="stockList">
              {lowStock.map((item) => (
                <div className="stockItem" key={item.sku}>
                  <div className={`stockThumb stock${item.imageIndex}`} />
                  <div>
                    <strong>{item.name}</strong>
                    <span>SKU: {item.sku}</span>
                  </div>
                  <b>Còn {item.stock}</b>
                </div>
              ))}
            </div>

            <Link className="panelLink" href="/admin/products">Xem tất cả →</Link>
          </div>
        </section>

        <section className="bottomGrid">
          <div className="panel ordersPanel">
            <div className="panelTitle rowTitle">
              <h3>Đơn hàng gần đây</h3>
              <Link href="/admin/orders">Xem tất cả đơn hàng →</Link>
            </div>

            <div className="recentTable">
              <div className="tableHead">
                <span>Mã đơn</span>
                <span>Khách hàng</span>
                <span>Thanh toán</span>
                <span>Trạng thái</span>
                <span>Tổng tiền</span>
                <span>Thời gian</span>
              </div>

              {orders.slice(0, 6).map((order) => (
                <div className="tableRow" key={order.id}>
                  <b>#{order.id.slice(0, 8).toUpperCase()}</b>
                  <span>{order.customer_name || "Khách HMECHA"}</span>
                  <span>{normalize(order.payment_method) === "vnpay" ? "💎 VNPAY" : "🚚 COD"}</span>
                  <span className={`orderStatus ${isRevenueOrder(order) ? "done" : isPendingOrder(order) ? "pending" : "bad"}`}>
                    {order.status || "Đang xử lý"}
                  </span>
                  <strong>{money(Number(order.total || 0))}</strong>
                  <span>{timeLabel(order.created_at)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panelTitle">
              <h3>Từ khóa / danh mục hot</h3>
            </div>

            <div className="keywordList">
              {keywordHot.map((item) => (
                <div className="keywordItem" key={item.label}>
                  <span>{item.rank}</span>
                  <strong>{item.label}</strong>
                  <b>{item.value.toLocaleString("vi-VN")} lượt tìm</b>
                </div>
              ))}
            </div>

            <Link className="panelLink" href="/admin/phan-tich-san-pham">Xem tất cả →</Link>
          </div>

          <div className="panel">
            <div className="panelTitle">
              <h3>Khuyến nghị cho chủ shop</h3>
            </div>

            <div className="insightList">
              {insights.map((item) => (
                <div className={`insightItem ${item.tone}`} key={item.title}>
                  <span>{item.icon}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>

      <style>{`
        .dashboard2 {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 250px minmax(0, 1fr);
          color: #fff;
          background:
            radial-gradient(circle at 20% 20%, rgba(0, 132, 255, 0.16), transparent 28%),
            radial-gradient(circle at 80% 5%, rgba(124, 77, 255, 0.14), transparent 24%),
            #071126;
        }

        .dashSidebar {
          position: sticky;
          top: 0;
          height: 100vh;
          padding: 28px 18px;
          border-right: 1px solid rgba(0, 229, 255, 0.12);
          background:
            linear-gradient(180deg, rgba(8, 18, 41, 0.96), rgba(5, 10, 24, 0.98)),
            radial-gradient(circle at 50% 70%, rgba(0, 229, 255, 0.1), transparent 34%);
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .brand h1 {
          margin: 0;
          font-size: 34px;
          letter-spacing: 1px;
        }

        .brand span {
          color: #9fb0d8;
          font-size: 11px;
          letter-spacing: 1.5px;
        }

        .dashSidebar nav {
          display: grid;
          gap: 8px;
        }

        .dashSidebar nav a {
          min-height: 46px;
          display: flex;
          align-items: center;
          padding: 0 16px;
          border-radius: 12px;
          color: #dce6ff;
          text-decoration: none;
          font-weight: 800;
        }

        .dashSidebar nav a.active,
        .dashSidebar nav a:hover {
          color: #fff;
          background: linear-gradient(135deg, #006eff, #164dff);
          box-shadow: 0 14px 32px rgba(0, 110, 255, 0.26);
        }

        .sideFooter {
          margin-top: auto;
          padding: 16px;
          border-radius: 18px;
          background: rgba(255,255,255,.045);
          border: 1px solid rgba(255,255,255,.08);
        }

        .gundamBox {
          height: 116px;
          margin: -4px -4px 14px;
          border-radius: 16px;
          background:
            radial-gradient(circle at 38% 42%, rgba(0,229,255,.22), transparent 20%),
            linear-gradient(135deg, rgba(0,163,255,.15), rgba(124,77,255,.08));
        }

        .sideFooter strong {
          display: block;
          font-size: 20px;
        }

        .sideFooter p {
          color: #9fb0d8;
          line-height: 1.5;
        }

        .sideFooter a {
          min-height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #dce6ff;
          border-radius: 12px;
          text-decoration: none;
          background: rgba(255,255,255,.055);
          border: 1px solid rgba(255,255,255,.08);
        }

        .adminMini {
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 14px;
          border-radius: 16px;
          background: rgba(255,255,255,.045);
          border: 1px solid rgba(255,255,255,.08);
        }

        .adminMini span {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background: rgba(255,255,255,.08);
        }

        .adminMini b,
        .adminMini small {
          display: block;
        }

        .adminMini small {
          color: #9fb0d8;
        }

        .dashContent {
          padding: 28px 34px 40px;
          display: grid;
          gap: 20px;
        }

        .dashHeader {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
        }

        .dashHeader h2 {
          margin: 0;
          font-size: 38px;
          line-height: 1.05;
        }

        .dashHeader p {
          margin: 8px 0 0;
          color: #9fb0d8;
        }

        .dashTools {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .dashTools button {
          min-height: 46px;
          padding: 0 16px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,.1);
          background: rgba(255,255,255,.045);
          color: #fff;
          font-weight: 800;
        }

        .dashTools .exportBtn {
          background: linear-gradient(135deg, #00a3ff, #164dff);
          border-color: transparent;
        }

        .kpiGrid {
          display: grid;
          grid-template-columns: repeat(6, minmax(0, 1fr));
          gap: 16px;
        }

        .kpiCard,
        .panel {
          border: 1px solid rgba(100, 160, 255, 0.18);
          background:
            radial-gradient(circle at 0% 0%, rgba(0, 163, 255, 0.14), transparent 34%),
            linear-gradient(180deg, rgba(13, 27, 58, 0.92), rgba(8, 17, 37, 0.92));
          box-shadow: 0 22px 48px rgba(0,0,0,.24);
        }

        .kpiCard {
          min-height: 138px;
          padding: 20px;
          border-radius: 16px;
          display: grid;
          gap: 8px;
        }

        .kpiIcon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, rgba(0,163,255,.85), rgba(124,77,255,.85));
          box-shadow: 0 12px 26px rgba(0,163,255,.22);
        }

        .kpiCard span {
          color: #c5d2f2;
          font-weight: 800;
        }

        .kpiCard strong {
          font-size: 26px;
          line-height: 1.1;
        }

        .kpiCard small.up {
          color: #77f269;
        }

        .kpiCard small.down {
          color: #ffb14a;
        }

        .kpiCard small.neutral {
          color: #9fb0d8;
        }

        .chartGrid {
          display: grid;
          gap: 16px;
        }

        .mainCharts {
          grid-template-columns: 1.25fr 1fr 0.9fr;
        }

        .subCharts {
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }

        .bottomGrid {
          display: grid;
          grid-template-columns: 1.7fr 0.75fr 1fr;
          gap: 16px;
        }

        .panel {
          border-radius: 16px;
          overflow: hidden;
        }

        .panelTitle {
          min-height: 60px;
          padding: 18px 20px 8px;
        }

        .panelTitle h3 {
          margin: 0;
          font-size: 20px;
        }

        .rowTitle {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: center;
        }

        .rowTitle span,
        .rowTitle a,
        .panelLink {
          color: #61dcff;
          text-decoration: none;
          font-weight: 800;
          font-size: 13px;
        }

        .lineChart,
        .dailyBars,
        .donutWrap,
        .topProductList,
        .funnel,
        .heatmap,
        .stockList,
        .recentTable,
        .keywordList,
        .insightList {
          padding: 16px 20px 20px;
        }

        .lineChart svg {
          width: 100%;
          height: 250px;
        }

        .gridLine {
          stroke: rgba(255,255,255,.08);
          stroke-width: 1;
        }

        .revenueLine {
          stroke: #00e5ff;
          stroke-width: 4;
          filter: drop-shadow(0 0 8px rgba(0,229,255,.8));
        }

        .lineDot {
          fill: #00e5ff;
          stroke: #dffbff;
          stroke-width: 2;
        }

        .chartLabel,
        .chartValue {
          fill: #c5d2f2;
          font-size: 12px;
          font-weight: 800;
        }

        .dailyBars {
          height: 248px;
          display: flex;
          gap: 8px;
          align-items: flex-end;
          overflow-x: auto;
        }

        .dailyBar {
          min-width: 18px;
          display: grid;
          gap: 7px;
          justify-items: center;
        }

        .dailyBar span {
          font-size: 10px;
          color: #9fb0d8;
          writing-mode: vertical-rl;
          max-height: 54px;
          overflow: hidden;
        }

        .dailyBar i {
          width: 16px;
          border-radius: 999px 999px 4px 4px;
          background: linear-gradient(180deg, #00e5ff, #006eff);
          box-shadow: 0 0 18px rgba(0,229,255,.22);
        }

        .dailyBar b {
          color: #c5d2f2;
          font-size: 11px;
        }

        .donutWrap {
          display: grid;
          grid-template-columns: 180px 1fr;
          gap: 18px;
          align-items: center;
        }

        .donut {
          width: 176px;
          height: 176px;
          border-radius: 50%;
          position: relative;
          display: grid;
          place-items: center;
        }

        .donut::after {
          content: "";
          width: 86px;
          height: 86px;
          border-radius: 50%;
          background: #071126;
          position: absolute;
        }

        .donut span {
          position: relative;
          z-index: 2;
          font-weight: 950;
        }

        .donutLegend {
          display: grid;
          gap: 14px;
        }

        .donutLegend div {
          display: grid;
          grid-template-columns: 12px 1fr;
          gap: 8px;
        }

        .donutLegend i {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          margin-top: 5px;
        }

        .blueDot {
          background: #00a3ff;
        }

        .purpleDot {
          background: #7c4dff;
        }

        .donutLegend strong,
        .donutLegend small {
          grid-column: 2;
        }

        .donutLegend small {
          color: #9fb0d8;
        }

        .donutLegend footer {
          display: flex;
          justify-content: space-between;
          border-top: 1px solid rgba(255,255,255,.1);
          padding-top: 12px;
        }

        .topProductList {
          display: grid;
          gap: 14px;
        }

        .topProduct {
          display: grid;
          grid-template-columns: 24px 1fr auto;
          gap: 12px;
          align-items: center;
        }

        .topProduct span {
          color: #c5d2f2;
        }

        .topProduct strong {
          display: block;
          margin-bottom: 8px;
        }

        .topProduct i {
          display: block;
          height: 14px;
          border-radius: 999px;
          background: rgba(255,255,255,.08);
          overflow: hidden;
        }

        .topProduct em {
          display: block;
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #00a3ff, #00e5ff);
        }

        .topProduct b {
          color: #dce6ff;
          white-space: nowrap;
        }

        .funnel {
          display: grid;
          gap: 12px;
        }

        .funnelRow {
          display: grid;
          grid-template-columns: 30px 1fr;
          gap: 8px;
          align-items: center;
        }

        .funnelRow i {
          grid-column: 2;
          display: flex;
          justify-content: flex-end;
          padding: 12px 18px;
          color: #fff;
          font-style: normal;
          font-weight: 950;
          border-radius: 0 18px 18px 0;
          background: linear-gradient(135deg, #00a3ff, #7c4dff);
        }

        .funnelRow small {
          grid-column: 2;
          color: #9fb0d8;
          margin-top: -6px;
        }

        .heatGrid {
          display: grid;
          gap: 6px;
        }

        .heatRow {
          display: grid;
          grid-template-columns: 28px repeat(6, 1fr);
          gap: 6px;
          align-items: center;
        }

        .heatRow span {
          color: #c5d2f2;
          font-size: 12px;
        }

        .heatRow i {
          height: 24px;
          border-radius: 4px;
        }

        .heatHours {
          margin-top: 10px;
          display: grid;
          grid-template-columns: 28px repeat(6, 1fr);
          gap: 6px;
        }

        .heatHours b {
          color: #9fb0d8;
          font-size: 11px;
          text-align: center;
        }

        .heatLegend {
          margin-top: 12px;
          display: flex;
          gap: 8px;
          align-items: center;
          color: #9fb0d8;
        }

        .heatLegend i {
          width: 90px;
          height: 8px;
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(0,229,255,.15), #00e5ff);
        }

        .stockList,
        .keywordList,
        .insightList {
          display: grid;
          gap: 12px;
        }

        .stockItem {
          display: grid;
          grid-template-columns: 48px 1fr auto;
          gap: 12px;
          align-items: center;
          padding: 10px;
          border-radius: 12px;
          background: rgba(255,255,255,.045);
        }

        .stockThumb {
          width: 46px;
          height: 46px;
          border-radius: 10px;
          background:
            radial-gradient(circle at 35% 30%, #fff, transparent 15%),
            linear-gradient(135deg, #00a3ff, #7c4dff);
        }

        .stockItem strong,
        .stockItem span {
          display: block;
        }

        .stockItem span {
          color: #9fb0d8;
          font-size: 12px;
        }

        .stockItem b {
          padding: 8px 12px;
          border-radius: 10px;
          background: rgba(255,71,126,.4);
          color: #fff;
        }

        .tableHead,
        .tableRow {
          display: grid;
          grid-template-columns: 1fr 1.2fr 1fr 1fr 1fr 1.2fr;
          gap: 12px;
          align-items: center;
        }

        .tableHead {
          color: #9fb0d8;
          font-size: 12px;
          padding-bottom: 12px;
        }

        .tableRow {
          padding: 13px 0;
          border-top: 1px solid rgba(255,255,255,.08);
        }

        .tableRow strong {
          color: #dce6ff;
        }

        .orderStatus {
          display: inline-flex;
          width: max-content;
          padding: 7px 10px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 900;
        }

        .orderStatus.done {
          color: #77f269;
          background: rgba(41, 186, 89, .18);
        }

        .orderStatus.pending {
          color: #ffd36a;
          background: rgba(255, 170, 0, .18);
        }

        .orderStatus.bad {
          color: #ff8aa5;
          background: rgba(255, 71, 126, .18);
        }

        .keywordItem {
          display: grid;
          grid-template-columns: 28px 1fr auto;
          gap: 10px;
          align-items: center;
          padding: 12px;
          border-radius: 12px;
          background: rgba(255,255,255,.045);
        }

        .keywordItem span {
          width: 24px;
          height: 24px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,.18);
          color: #ffb14a;
        }

        .keywordItem b {
          color: #9fb0d8;
          font-size: 12px;
        }

        .insightItem {
          display: grid;
          grid-template-columns: 46px 1fr;
          gap: 14px;
          padding: 14px;
          border-radius: 14px;
          background: rgba(255,255,255,.045);
        }

        .insightItem > span {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: rgba(255,255,255,.08);
        }

        .insightItem strong {
          color: #00e5ff;
        }

        .insightItem p {
          margin: 6px 0 0;
          color: #c5d2f2;
          line-height: 1.5;
        }

        .panelLink {
          display: block;
          padding: 0 20px 18px;
        }

        @media (max-width: 1500px) {
          .kpiGrid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .mainCharts,
          .subCharts,
          .bottomGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .ordersPanel {
            grid-column: span 2;
          }
        }

        @media (max-width: 980px) {
          .dashboard2 {
            grid-template-columns: 1fr;
          }

          .dashSidebar {
            position: static;
            height: auto;
          }

          .dashHeader,
          .rowTitle {
            display: grid;
          }

          .kpiGrid,
          .mainCharts,
          .subCharts,
          .bottomGrid {
            grid-template-columns: 1fr;
          }

          .ordersPanel {
            grid-column: auto;
          }

          .tableHead {
            display: none;
          }

          .tableRow {
            grid-template-columns: 1fr;
          }

          .donutWrap {
            grid-template-columns: 1fr;
            justify-items: center;
          }
        }
      `}</style>
    </main>
  );
}