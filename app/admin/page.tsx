import Link from "next/link";
import { supabaseAdmin as supabase } from "../../lib/supabase-admin";

export const dynamic = "force-dynamic";

type Item = { product_name: string; product_price: number; quantity: number };
type Order = { id: string; total: number; payment_method: string; payment_status: string | null; status: string; created_at: string; customer_name: string; order_items: Item[] | null };

const money = (value: number) => Number(value || 0).toLocaleString("vi-VN") + "₫";
const dateLabel = (value: string) => new Date(value).toLocaleDateString("vi-VN");
function counted(order: Order) { return order.payment_method === "vnpay" ? order.payment_status === "paid" : order.payment_method === "cod" && order.status === "Hoàn thành"; }

export default async function AdminDashboardPage() {
  const [{ count: productCount }, { data }] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("id,total,payment_method,payment_status,status,created_at,customer_name,order_items(product_name,product_price,quantity)").order("created_at", { ascending: false }),
  ]);
  const orders = (data || []) as Order[];
  const revenueOrders = orders.filter(counted);
  const totalRevenue = revenueOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const now = new Date();
  const monthlyRevenue = revenueOrders.filter(order => { const d = new Date(order.created_at); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).reduce((sum, order) => sum + Number(order.total || 0), 0);
  const codRevenue = revenueOrders.filter(order => order.payment_method === "cod").reduce((sum, order) => sum + Number(order.total || 0), 0);
  const vnpayRevenue = revenueOrders.filter(order => order.payment_method === "vnpay").reduce((sum, order) => sum + Number(order.total || 0), 0);
  const pending = orders.filter(order => ["Chờ xác nhận", "Chờ thanh toán", "Đã xác nhận", "Đang giao"].includes(order.status)).length;
  const failed = orders.filter(order => ["Đã hủy", "Thanh toán thất bại"].includes(order.status)).length;
  const months = Array.from({ length: 6 }, (_, i) => { const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1); const revenue = revenueOrders.filter(order => { const o = new Date(order.created_at); return o.getMonth() === d.getMonth() && o.getFullYear() === d.getFullYear(); }).reduce((sum, order) => sum + Number(order.total || 0), 0); return { label: `T${d.getMonth() + 1}/${String(d.getFullYear()).slice(-2)}`, revenue }; });
  const max = Math.max(...months.map(month => month.revenue), 1);
  const ranking = new Map<string, { quantity: number; revenue: number }>();
  revenueOrders.forEach(order => (order.order_items || []).forEach(item => { const current = ranking.get(item.product_name) || { quantity: 0, revenue: 0 }; current.quantity += Number(item.quantity); current.revenue += Number(item.quantity) * Number(item.product_price); ranking.set(item.product_name, current); }));
  const top = [...ranking.entries()].sort((a, b) => b[1].quantity - a[1].quantity).slice(0, 5);

  return <main className="dash">
    <header className="hero"><div><p>HMECHA ADMIN</p><h1>Dashboard doanh thu</h1><span>Theo dõi doanh thu đã thu, đơn hàng và sản phẩm bán chạy.</span></div><div className="actions"><Link href="/admin/orders">Quản lý đơn hàng</Link><Link className="primary" href="/admin/products/new">+ Thêm sản phẩm</Link></div></header>
    <section className="cards">
      <article className="active"><label>Tổng doanh thu đã thu</label><strong>{money(totalRevenue)}</strong><small>VNPAY đã trả tiền + COD hoàn thành</small></article>
      <article><label>Doanh thu tháng này</label><strong>{money(monthlyRevenue)}</strong><small>Tháng {now.getMonth() + 1}/{now.getFullYear()}</small></article>
      <article><label>Tổng đơn hàng</label><strong>{orders.length}</strong><small>{pending} đơn cần xử lý</small></article>
      <article><label>Sản phẩm</label><strong>{productCount || 0}</strong><small>Đang quản lý trong kho</small></article>
    </section>
    <section className="mini"><article><label>COD hoàn thành</label><strong>{money(codRevenue)}</strong></article><article><label>VNPAY đã thanh toán</label><strong>{money(vnpayRevenue)}</strong></article><article><label>Đơn đang xử lý</label><strong>{pending}</strong></article><article><label>Đơn hủy / thất bại</label><strong>{failed}</strong></article></section>
    <section className="grid">
      <article className="panel"><div className="title"><p>DOANH THU</p><h2>6 tháng gần nhất</h2></div><div className="chart">{months.map(month => <div className="column" key={month.label}><small>{money(month.revenue)}</small><div className="track"><div className="bar" style={{height: `${month.revenue ? Math.max(month.revenue / max * 100, 8) : 3}%`}} /></div><b>{month.label}</b></div>)}</div></article>
      <article className="panel"><div className="title"><p>SẢN PHẨM</p><h2>Bán chạy nhất</h2></div>{top.length ? top.map(([name, value], i) => <div className="rank" key={name}><em>#{i + 1}</em><div><b>{name}</b><small>{value.quantity} sản phẩm đã bán</small></div><strong>{money(value.revenue)}</strong></div>) : <p className="empty">Chưa có đơn hợp lệ để xếp hạng.</p>}</article>
    </section>
    <section className="panel latest"><div className="latestHead"><div className="title"><p>ĐƠN HÀNG</p><h2>Mới nhất</h2></div><Link href="/admin/orders">Xem tất cả →</Link></div><div className="table"><div className="tr head"><span>Mã đơn</span><span>Khách hàng</span><span>Ngày tạo</span><span>Thanh toán</span><span>Trạng thái</span><span>Tổng tiền</span></div>{orders.slice(0,5).map(order => <div className="tr" key={order.id}><b>#{order.id.slice(0,8).toUpperCase()}</b><span>{order.customer_name}</span><span>{dateLabel(order.created_at)}</span><span>{order.payment_method.toUpperCase()}</span><span>{order.status}</span><strong>{money(order.total)}</strong></div>)}</div></section>
    <style>{`
      .dash{max-width:1240px;color:#fff}.hero{display:flex;justify-content:space-between;gap:22px;margin-bottom:28px}.hero p,.title p{margin:0 0 8px;color:#00e5ff;font-size:12px;font-weight:950;letter-spacing:2px}.hero h1{font-size:44px;margin:0 0 10px}.hero span{color:#b8c4e6}.actions{display:flex;gap:12px}.actions a{height:fit-content;padding:14px 18px;border:1px solid rgba(255,255,255,.15);border-radius:13px;color:#dce6ff;text-decoration:none;font-weight:850}.actions .primary{background:linear-gradient(135deg,#7c4dff,#00e5ff);color:#061020;border:0}.cards,.mini{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:16px}.cards article,.mini article,.panel{padding:22px;border-radius:20px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1)}.cards .active{border-color:rgba(0,229,255,.45);background:linear-gradient(135deg,rgba(124,77,255,.18),rgba(0,229,255,.08))}label{display:block;color:#b8c4e6;text-transform:uppercase;font-size:12px;font-weight:850;letter-spacing:1px}.cards strong{display:block;font-size:30px;margin:16px 0 8px}.cards .active strong{color:#00e5ff}.cards small{color:#9eaed4}.mini strong{display:block;margin-top:12px;color:#ff78d2;font-size:22px}.grid{display:grid;grid-template-columns:1.18fr .82fr;gap:18px;margin:22px 0}.title h2{margin:0;font-size:22px}.chart{height:270px;display:grid;grid-template-columns:repeat(6,1fr);gap:10px;align-items:end;margin-top:22px}.column{text-align:center;min-width:0}.column small{display:block;min-height:30px;color:#aab9dd;font-size:11px}.track{height:190px;display:flex;justify-content:center;align-items:end;border-bottom:1px solid rgba(255,255,255,.14)}.bar{width:min(48px,80%);border-radius:12px 12px 2px 2px;background:linear-gradient(180deg,#00e5ff,#7c4dff)}.column b{display:block;margin-top:12px;font-size:12px}.rank{display:grid;grid-template-columns:40px 1fr auto;gap:10px;align-items:center;padding:13px;margin-top:11px;border-radius:14px;background:rgba(255,255,255,.05)}.rank em{color:#00e5ff;font-style:normal;font-weight:950}.rank b{display:block;font-size:13px}.rank small{color:#aab9dd}.rank strong{color:#ff78d2;font-size:13px}.empty{color:#aab9dd}.latestHead{display:flex;justify-content:space-between;align-items:center}.latestHead a{color:#00e5ff;text-decoration:none;font-weight:850}.table{margin-top:18px;overflow-x:auto}.tr{display:grid;grid-template-columns:1fr 1.4fr 1fr 1fr 1.2fr 1fr;gap:12px;padding:14px 0;border-top:1px solid rgba(255,255,255,.09);min-width:740px}.tr.head{color:#8fa0c8;font-size:12px;text-transform:uppercase;border-top:0}.tr strong{color:#ff78d2}@media(max-width:1000px){.cards,.mini{grid-template-columns:repeat(2,1fr)}.grid{grid-template-columns:1fr}.hero{display:block}.actions{margin-top:20px}}@media(max-width:650px){.cards,.mini{grid-template-columns:1fr}}
    `}</style>
  </main>;
}
