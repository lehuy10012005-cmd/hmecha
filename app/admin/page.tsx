import Link from "next/link";
import { supabaseAdmin as supabase } from "../../lib/supabase-admin";

export const dynamic = "force-dynamic";

type Item = {
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
  note: string | null;
  order_items: Item[] | null;
};

type ProductRank = {
  quantity: number;
  revenue: number;
  orders: number;
};

const money = (value: number) =>
  Number(value || 0).toLocaleString("vi-VN") + "₫";

const percent = (value: number) =>
  `${Number.isFinite(value) ? value.toFixed(1) : "0.0"}%`;

const dateLabel = (value: string) => {
  try {
    return new Date(value).toLocaleDateString("vi-VN");
  } catch {
    return value;
  }
};

function normalize(value: unknown) {
  return String(value || "").trim().toLowerCase();
}

function counted(order: Order) {
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

function isPending(order: Order) {
  return ["Chờ xác nhận", "Chờ thanh toán", "Đã xác nhận", "Đang giao"].includes(
    order.status || ""
  );
}

function isFailed(order: Order) {
  return ["Đã hủy", "Thanh toán thất bại"].includes(order.status || "");
}

function shortId(id: string) {
  return "#" + String(id || "").slice(0, 8).toUpperCase();
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

function MiniBar({
  value,
  max,
  label,
  sub,
}: {
  value: number;
  max: number;
  label: string;
  sub?: string;
}) {
  const height = Math.max(8, Math.round((value / Math.max(max, 1)) * 120));

  return (
    <div className="miniBar">
      <span>{money(value)}</span>
      <div className="barTrack">
        <i style={{ height }} />
      </div>
      <b>{label}</b>
      {sub ? <small>{sub}</small> : null}
    </div>
  );
}

function HorizontalBar({
  label,
  value,
  max,
  caption,
}: {
  label: string;
  value: number;
  max: number;
  caption?: string;
}) {
  const width = Math.max(4, Math.round((value / Math.max(max, 1)) * 100));

  return (
    <div className="hBar">
      <div>
        <strong>{label}</strong>
        <span>{caption}</span>
      </div>
      <div className="hTrack">
        <i style={{ width: `${width}%` }} />
      </div>
      <b>{money(value)}</b>
    </div>
  );
}

function StatusPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="statusPill">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default async function AdminDashboardPage() {
  const [{ count: productCount }, { data }] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select(
        "id,total,subtotal,shipping_fee,payment_method,payment_status,status,created_at,customer_name,note,order_items(product_name,product_price,quantity)"
      )
      .order("created_at", { ascending: false }),
  ]);

  const orders = (data || []) as Order[];
  const revenueOrders = orders.filter(counted);
  const demoOrders = orders.filter((order) => String(order.note || "").includes("[DEMO-DASHBOARD]"));

  const totalRevenue = revenueOrders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  const now = new Date();

  const monthlyRevenue = revenueOrders
    .filter((order) => monthKey(new Date(order.created_at)) === monthKey(now))
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthRevenue = revenueOrders
    .filter((order) => monthKey(new Date(order.created_at)) === monthKey(previousMonthDate))
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const monthGrowth =
    previousMonthRevenue > 0
      ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
      : monthlyRevenue > 0
      ? 100
      : 0;

  const codRevenue = revenueOrders
    .filter((order) => normalize(order.payment_method) === "cod")
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const vnpayRevenue = revenueOrders
    .filter((order) => normalize(order.payment_method) === "vnpay")
    .reduce((sum, order) => sum + Number(order.total || 0), 0);

  const pending = orders.filter(isPending).length;
  const failed = orders.filter(isFailed).length;
  const completed = orders.filter((order) => normalize(order.status) === "hoàn thành").length;
  const paid = orders.filter((order) => normalize(order.status) === "đã thanh toán").length;
  const todayOrders = orders.filter((order) => sameDay(new Date(order.created_at), now)).length;
  const averageOrderValue = revenueOrders.length ? totalRevenue / revenueOrders.length : 0;
  const completionRate = orders.length ? (revenueOrders.length / orders.length) * 100 : 0;

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const revenue = revenueOrders
      .filter((order) => {
        const o = new Date(order.created_at);
        return o.getMonth() === d.getMonth() && o.getFullYear() === d.getFullYear();
      })
      .reduce((sum, order) => sum + Number(order.total || 0), 0);

    return {
      label: `T${d.getMonth() + 1}/${String(d.getFullYear()).slice(-2)}`,
      revenue,
    };
  });

  const daily = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - 13 + i);

    const dayOrders = revenueOrders.filter((order) => sameDay(new Date(order.created_at), d));
    const revenue = dayOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);

    return {
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      revenue,
      orders: dayOrders.length,
    };
  });

  const maxMonth = Math.max(...months.map((month) => month.revenue), 1);
  const maxDay = Math.max(...daily.map((day) => day.revenue), 1);

  const ranking = new Map<string, ProductRank>();

  revenueOrders.forEach((order) =>
    (order.order_items || []).forEach((item) => {
      const name = item.product_name || "Sản phẩm chưa đặt tên";
      const current = ranking.get(name) || { quantity: 0, revenue: 0, orders: 0 };

      current.quantity += Number(item.quantity || 0);
      current.revenue += Number(item.quantity || 0) * Number(item.product_price || 0);
      current.orders += 1;

      ranking.set(name, current);
    })
  );

  const topByQuantity = [...ranking.entries()]
    .sort((a, b) => b[1].quantity - a[1].quantity)
    .slice(0, 5);

  const topByRevenue = [...ranking.entries()]
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 6);

  const maxProductRevenue = Math.max(...topByRevenue.map(([, value]) => value.revenue), 1);

  const recommendations: string[] = [];

  if (pending > 0) {
    recommendations.push(
      `Có ${pending} đơn cần xử lý. Nên ưu tiên gọi xác nhận các đơn COD và kiểm tra trạng thái thanh toán VNPAY.`
    );
  }

  if (monthGrowth >= 20) {
    recommendations.push(
      `Doanh thu tháng này đang tăng ${percent(monthGrowth)} so với tháng trước. Có thể đẩy thêm Flash Sale để giữ đà tăng.`
    );
  } else if (monthGrowth < 0) {
    recommendations.push(
      `Doanh thu tháng này đang giảm ${percent(Math.abs(monthGrowth))}. Nên thêm mã giảm giá ngắn hạn hoặc ghim sản phẩm bán chạy lên đầu trang.`
    );
  } else {
    recommendations.push(
      `Doanh thu tháng này khá ổn định. Nên theo dõi thêm sản phẩm có tỷ lệ mua cao để đưa vào banner hoặc gợi ý.`
    );
  }

  if (vnpayRevenue > codRevenue) {
    recommendations.push(
      "VNPAY đang tạo doanh thu tốt hơn COD. Nên đặt VNPAY/QR làm lựa chọn mặc định ở checkout để tăng tốc độ chốt đơn."
    );
  } else {
    recommendations.push(
      "COD vẫn là kênh quan trọng. Nên tối ưu quy trình gọi xác nhận để giảm đơn hủy và tăng tỷ lệ hoàn thành."
    );
  }

  if (topByQuantity[0]) {
    recommendations.push(
      `Sản phẩm bán chạy nhất hiện là “${topByQuantity[0][0]}”. Nên ghim mẫu này ở trang chủ hoặc dùng làm sản phẩm kéo traffic.`
    );
  }

  return (
    <main className="dashboardPage">
      <section className="hero">
        <div>
          <p>HMECHA ADMIN</p>
          <h1>Dashboard doanh thu</h1>
          <span>Theo dõi doanh thu đã thu, đơn hàng, sản phẩm bán chạy và gợi ý vận hành.</span>
        </div>

        <div className="heroActions">
          <Link href="/admin/orders">Quản lý đơn hàng</Link>
          <Link href="/admin/products/new">+ Thêm sản phẩm</Link>
        </div>
      </section>

      <section className="statsGrid">
        <div className="statCard primary">
          <span>Tổng doanh thu đã thu</span>
          <strong>{money(totalRevenue)}</strong>
          <small>VNPAY đã trả tiền + COD hoàn thành</small>
        </div>

        <div className="statCard">
          <span>Doanh thu tháng này</span>
          <strong>{money(monthlyRevenue)}</strong>
          <small>
            {monthGrowth >= 0 ? "Tăng" : "Giảm"} {percent(Math.abs(monthGrowth))} so với tháng trước
          </small>
        </div>

        <div className="statCard">
          <span>Tổng đơn hàng</span>
          <strong>{orders.length}</strong>
          <small>{pending} đơn cần xử lý</small>
        </div>

        <div className="statCard">
          <span>Sản phẩm</span>
          <strong>{productCount || 0}</strong>
          <small>Đang quản lý trong kho</small>
        </div>

        <div className="statCard">
          <span>COD hoàn thành</span>
          <strong>{money(codRevenue)}</strong>
          <small>Chỉ tính đơn hoàn thành</small>
        </div>

        <div className="statCard">
          <span>VNPAY đã thanh toán</span>
          <strong>{money(vnpayRevenue)}</strong>
          <small>Chỉ tính payment_status paid</small>
        </div>

        <div className="statCard">
          <span>Giá trị đơn trung bình</span>
          <strong>{money(averageOrderValue)}</strong>
          <small>AOV = doanh thu / đơn đã thu</small>
        </div>

        <div className="statCard">
          <span>Tỷ lệ đơn đã thu</span>
          <strong>{percent(completionRate)}</strong>
          <small>{revenueOrders.length}/{orders.length} đơn hợp lệ doanh thu</small>
        </div>

        <div className="statCard">
          <span>Đơn hôm nay</span>
          <strong>{todayOrders}</strong>
          <small>Theo ngày hiện tại</small>
        </div>

        <div className="statCard">
          <span>Dữ liệu demo</span>
          <strong>{demoOrders.length}</strong>
          <small>Đơn ảo dùng làm dashboard sinh động</small>
        </div>
      </section>

      <section className="dashboardGrid">
        <div className="panel chartPanel">
          <div className="panelHead">
            <p>DOANH THU</p>
            <h2>6 tháng gần nhất</h2>
          </div>

          <div className="barChart">
            {months.map((month) => (
              <MiniBar
                key={month.label}
                value={month.revenue}
                max={maxMonth}
                label={month.label}
              />
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panelHead">
            <p>SẢN PHẨM</p>
            <h2>Bán chạy nhất</h2>
          </div>

          <div className="rankList">
            {topByQuantity.length ? (
              topByQuantity.map(([name, value], index) => (
                <div className="rankItem" key={name}>
                  <i>#{index + 1}</i>
                  <div>
                    <strong>{name}</strong>
                    <small>{value.quantity} sản phẩm đã bán</small>
                  </div>
                  <b>{money(value.revenue)}</b>
                </div>
              ))
            ) : (
              <div className="emptyBox">Chưa có đơn hợp lệ để xếp hạng.</div>
            )}
          </div>
        </div>
      </section>

      <section className="dashboardGrid">
        <div className="panel wide">
          <div className="panelHead">
            <p>DOANH THU NGẮN HẠN</p>
            <h2>14 ngày gần nhất</h2>
          </div>

          <div className="barChart dailyChart">
            {daily.map((day) => (
              <MiniBar
                key={day.label}
                value={day.revenue}
                max={maxDay}
                label={day.label}
                sub={`${day.orders} đơn`}
              />
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panelHead">
            <p>TRẠNG THÁI ĐƠN</p>
            <h2>Cơ cấu xử lý</h2>
          </div>

          <div className="statusGrid">
            <StatusPill label="Hoàn thành" value={completed} />
            <StatusPill label="Đã thanh toán" value={paid} />
            <StatusPill label="Đang xử lý" value={pending} />
            <StatusPill label="Hủy / thất bại" value={failed} />
          </div>
        </div>
      </section>

      <section className="dashboardGrid">
        <div className="panel">
          <div className="panelHead">
            <p>THANH TOÁN</p>
            <h2>Doanh thu theo phương thức</h2>
          </div>

          <div className="paymentBars">
            <HorizontalBar
              label="COD hoàn thành"
              value={codRevenue}
              max={Math.max(codRevenue, vnpayRevenue, 1)}
              caption="Khách trả tiền khi nhận hàng"
            />
            <HorizontalBar
              label="VNPAY đã thanh toán"
              value={vnpayRevenue}
              max={Math.max(codRevenue, vnpayRevenue, 1)}
              caption="QR / thanh toán online"
            />
          </div>
        </div>

        <div className="panel">
          <div className="panelHead">
            <p>GỢI Ý CHỦ SHOP</p>
            <h2>Nên làm gì tiếp?</h2>
          </div>

          <div className="adviceList">
            {recommendations.map((item) => (
              <div key={item} className="adviceItem">
                <span>⚡</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel widePanel">
        <div className="panelHead">
          <p>SẢN PHẨM THEO DOANH THU</p>
          <h2>Sản phẩm nên ưu tiên đẩy bán</h2>
        </div>

        <div className="productRevenueList">
          {topByRevenue.length ? (
            topByRevenue.map(([name, value]) => (
              <HorizontalBar
                key={name}
                label={name}
                value={value.revenue}
                max={maxProductRevenue}
                caption={`${value.quantity} sản phẩm · ${value.orders} đơn`}
              />
            ))
          ) : (
            <div className="emptyBox">Chưa có dữ liệu doanh thu theo sản phẩm.</div>
          )}
        </div>
      </section>

      <section className="panel orderPanel">
        <div className="panelHead rowHead">
          <div>
            <p>ĐƠN HÀNG</p>
            <h2>Mới nhất</h2>
          </div>
          <Link href="/admin/orders">Xem tất cả →</Link>
        </div>

        <div className="orderTable">
          <div className="tableHead">
            <span>Mã đơn</span>
            <span>Khách hàng</span>
            <span>Ngày tạo</span>
            <span>Thanh toán</span>
            <span>Trạng thái</span>
            <span>Tổng tiền</span>
          </div>

          {orders.slice(0, 7).map((order) => (
            <div className="tableRow" key={order.id}>
              <b>{shortId(order.id)}</b>
              <span>{order.customer_name || "Khách HMECHA"}</span>
              <span>{dateLabel(order.created_at)}</span>
              <span>{String(order.payment_method || "").toUpperCase()}</span>
              <span>{order.status}</span>
              <strong>{money(Number(order.total || 0))}</strong>
            </div>
          ))}
        </div>
      </section>

      <style>{`
        .dashboardPage {
          max-width: 1500px;
          margin: 0 auto;
          color: #fff;
          display: grid;
          gap: 20px;
        }

        .hero {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: flex-start;
          padding: 28px 0 8px;
        }

        .hero p,
        .panelHead p {
          margin: 0 0 8px;
          color: #00e5ff;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 3px;
        }

        .hero h1 {
          margin: 0;
          font-size: clamp(36px, 5vw, 58px);
          line-height: 1.05;
        }

        .hero span {
          display: block;
          margin-top: 12px;
          color: #c5d2f2;
        }

        .heroActions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .heroActions a,
        .rowHead a {
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 18px;
          border-radius: 12px;
          text-decoration: none;
          color: #061020;
          font-weight: 950;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
        }

        .statsGrid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 14px;
        }

        .statCard,
        .panel {
          border: 1px solid rgba(0, 229, 255, 0.2);
          background:
            radial-gradient(circle at 0% 0%, rgba(124, 77, 255, 0.12), transparent 34%),
            rgba(7, 12, 32, 0.86);
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.22);
        }

        .statCard {
          min-height: 118px;
          padding: 18px;
          border-radius: 18px;
          display: grid;
          align-content: center;
          gap: 8px;
        }

        .statCard.primary {
          border-color: rgba(0, 229, 255, 0.55);
          box-shadow: 0 0 28px rgba(0, 229, 255, 0.14);
        }

        .statCard span {
          color: #c5d2f2;
          font-size: 13px;
          font-weight: 850;
        }

        .statCard strong {
          color: #00e5ff;
          font-size: 28px;
          line-height: 1;
        }

        .statCard small {
          color: #9fb0d8;
          font-size: 12px;
          line-height: 1.4;
        }

        .dashboardGrid {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(360px, 0.65fr);
          gap: 18px;
        }

        .panel {
          border-radius: 22px;
          overflow: hidden;
        }

        .panel.wide,
        .widePanel {
          min-width: 0;
        }

        .panelHead {
          padding: 22px 22px 12px;
        }

        .panelHead h2 {
          margin: 0;
          font-size: 26px;
        }

        .rowHead {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: center;
        }

        .barChart {
          min-height: 220px;
          padding: 18px 22px 24px;
          display: flex;
          align-items: flex-end;
          gap: 16px;
          border-top: 1px solid rgba(255,255,255,.08);
        }

        .dailyChart {
          gap: 10px;
          overflow-x: auto;
        }

        .miniBar {
          flex: 1;
          min-width: 54px;
          display: grid;
          gap: 8px;
          justify-items: center;
        }

        .miniBar span {
          min-height: 28px;
          font-size: 11px;
          color: #c5d2f2;
          text-align: center;
        }

        .miniBar b {
          color: #fff;
          font-size: 12px;
        }

        .miniBar small {
          color: #9fb0d8;
          font-size: 10px;
        }

        .barTrack {
          height: 132px;
          width: 36px;
          border-radius: 999px 999px 8px 8px;
          background: rgba(255,255,255,.08);
          display: flex;
          align-items: flex-end;
          overflow: hidden;
        }

        .barTrack i {
          display: block;
          width: 100%;
          border-radius: 999px 999px 8px 8px;
          background: linear-gradient(180deg, #00e5ff, #7c4dff);
          box-shadow: 0 0 18px rgba(0,229,255,.3);
        }

        .rankList,
        .adviceList,
        .paymentBars,
        .productRevenueList {
          display: grid;
          gap: 12px;
          padding: 18px 22px 22px;
          border-top: 1px solid rgba(255,255,255,.08);
        }

        .rankItem {
          display: grid;
          grid-template-columns: 42px 1fr auto;
          gap: 12px;
          align-items: center;
          padding: 14px;
          border-radius: 14px;
          background: rgba(255,255,255,.055);
        }

        .rankItem i {
          color: #00e5ff;
          font-style: normal;
          font-weight: 950;
        }

        .rankItem strong {
          display: block;
          line-height: 1.35;
        }

        .rankItem small {
          color: #9fb0d8;
        }

        .rankItem b,
        .tableRow strong {
          color: #ff78d2;
        }

        .statusGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          padding: 18px 22px 22px;
          border-top: 1px solid rgba(255,255,255,.08);
        }

        .statusPill {
          padding: 16px;
          border-radius: 16px;
          background: rgba(255,255,255,.055);
          border: 1px solid rgba(255,255,255,.08);
        }

        .statusPill span {
          display: block;
          color: #9fb0d8;
          margin-bottom: 8px;
        }

        .statusPill strong {
          color: #00e5ff;
          font-size: 28px;
        }

        .hBar {
          display: grid;
          grid-template-columns: minmax(190px, 0.5fr) 1fr auto;
          gap: 12px;
          align-items: center;
          padding: 13px;
          border-radius: 14px;
          background: rgba(255,255,255,.055);
        }

        .hBar strong {
          display: block;
        }

        .hBar span {
          color: #9fb0d8;
          font-size: 12px;
        }

        .hTrack {
          height: 12px;
          border-radius: 999px;
          overflow: hidden;
          background: rgba(255,255,255,.1);
        }

        .hTrack i {
          display: block;
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, #7c4dff, #00e5ff);
        }

        .hBar b {
          color: #00e5ff;
        }

        .adviceItem {
          display: grid;
          grid-template-columns: 34px 1fr;
          gap: 10px;
          padding: 14px;
          border-radius: 14px;
          background: rgba(0,229,255,.07);
          border: 1px solid rgba(0,229,255,.12);
        }

        .adviceItem p {
          margin: 0;
          color: #dce6ff;
          line-height: 1.6;
        }

        .orderPanel {
          margin-bottom: 30px;
        }

        .orderTable {
          padding: 0 22px 22px;
        }

        .tableHead,
        .tableRow {
          display: grid;
          grid-template-columns: 1fr 1.2fr 0.9fr 0.8fr 1fr 1fr;
          gap: 12px;
          align-items: center;
        }

        .tableHead {
          padding: 14px 0;
          color: #9fb0d8;
          font-size: 12px;
          text-transform: uppercase;
        }

        .tableRow {
          padding: 14px 0;
          border-top: 1px solid rgba(255,255,255,.08);
        }

        .tableRow b {
          color: #fff;
        }

        .emptyBox {
          padding: 16px;
          color: #9fb0d8;
        }

        @media (max-width: 1180px) {
          .statsGrid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .dashboardGrid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 720px) {
          .hero {
            display: grid;
          }

          .statsGrid {
            grid-template-columns: 1fr;
          }

          .tableHead {
            display: none;
          }

          .tableRow,
          .hBar {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}