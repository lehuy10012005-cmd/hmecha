import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createAuthServerClient } from "../../../../lib/supabase-auth/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";

function displayStatusText(value: unknown) {
  const text = String(value || "");
  const lower = text.toLowerCase();

  if (lower === "pending") return "Chờ xác nhận";
  if (lower === "paid") return "Đã thanh toán";
  if (lower === "completed" || lower === "complete") return "Hoàn thành";
  if (lower === "cancelled" || lower === "canceled") return "Đã hủy";

  if (text.includes("Chá") || text.includes("toÃ") || text.includes("xÃ") || text.includes("nhá") || text.includes("Ä") || text.includes("Ã")) {
    if (text.includes("thanh")) return "Chờ thanh toán";
    if (text.includes("xÃ") || text.includes("xac")) return "Chờ xác nhận";
    if (text.includes("Ä") || text.includes("Ã£")) return "Đã thanh toán";
    return "Chờ xác nhận";
  }

  return text
    .replaceAll("Chá» thanh toÃ¡n", "Chờ thanh toán")
    .replaceAll("Chá» xÃ¡c nháº­n", "Chờ xác nhận")
    .replaceAll("ÄÃ£ thanh toÃ¡n", "Đã thanh toán")
    .replaceAll("HoÃ n thÃ nh", "Hoàn thành");
}
export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type Item = {
  product_name: string;
  product_price: number;
  quantity: number;
};

type Order = {
  id: string;
  customer_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  customer_address: string | null;
  note: string | null;
  payment_method: string | null;
  payment_status: string | null;
  status: string | null;
  subtotal: number | null;
  shipping_fee: number | null;
  total: number | null;
  created_at: string;
  order_items: Item[] | null;
};

const money = (value: number | null | undefined) =>
  Number(value || 0).toLocaleString("vi-VN") + "₫";

const date = (value: string) => new Date(value).toLocaleString("vi-VN");

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  const supabase = await createAuthServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/dang-nhap?next=/tai-khoan/don-hang/" + encodeURIComponent(id));
  }

  const { data: orderData, error } = await supabaseAdmin
    .from("orders")
    .select(
      "id,customer_id,customer_name,customer_phone,customer_email,customer_address,note,payment_method,payment_status,status,subtotal,shipping_fee,total,created_at,order_items(product_name,product_price,quantity)"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !orderData) {
    notFound();
  }

  const order = orderData as Order;

  const userEmail = user.email?.trim().toLowerCase() || "";
  const orderEmail = order.customer_email?.trim().toLowerCase() || "";

  const isOwnerById = order.customer_id === user.id;
  const isOwnerByEmail = Boolean(userEmail && orderEmail && userEmail === orderEmail);

  if (!isOwnerById && !isOwnerByEmail) {
    notFound();
  }

  const items = order.order_items || [];

  return (
    <main className="orderDetailPage">
      <div className="container">
        <Link className="backLink" href="/tai-khoan/don-hang">
          ← Quay lại đơn hàng
        </Link>

        <section className="hero">
          <p>ORDER DETAIL</p>
          <h1>Đơn #{order.id.slice(0, 8).toUpperCase()}</h1>
          <span>Đặt lúc {date(order.created_at)}</span>
        </section>

        <section className="statusGrid">
          <div>
            <span>Trạng thái đơn</span>
            <strong>{order.status || "Đang cập nhật"}</strong>
          </div>

          <div>
            <span>Thanh toán</span>
            <strong>
              {order.payment_method === "cod" ? "COD" : "VNPAY / QR"}
            </strong>
          </div>

          <div>
            <span>Tình trạng thanh toán</span>
            <strong>{order.payment_status || "Đang cập nhật"}</strong>
          </div>
        </section>

        <section className="contentGrid">
          <div className="card">
            <h2>Sản phẩm đã mua</h2>

            <div className="itemList">
              {items.map((item, index) => (
                <div className="item" key={index}>
                  <div>
                    <strong>{item.product_name}</strong>
                    <span>
                      {item.quantity} × {money(item.product_price)}
                    </span>
                  </div>

                  <b>{money(item.quantity * item.product_price)}</b>
                </div>
              ))}
            </div>

            <div className="summary">
              <div>
                <span>Tạm tính</span>
                <b>{money(order.subtotal)}</b>
              </div>

              <div>
                <span>Phí vận chuyển</span>
                <b>{Number(order.shipping_fee || 0) === 0 ? "Miễn phí" : money(order.shipping_fee)}</b>
              </div>

              <div className="total">
                <span>Tổng cộng</span>
                <strong>{money(order.total)}</strong>
              </div>
            </div>
          </div>

          <div className="card">
            <h2>Thông tin nhận hàng</h2>

            <div className="infoList">
              <div>
                <span>Người nhận</span>
                <strong>{order.customer_name || "Không có"}</strong>
              </div>

              <div>
                <span>Số điện thoại</span>
                <strong>{order.customer_phone || "Không có"}</strong>
              </div>

              <div>
                <span>Email</span>
                <strong>{order.customer_email || "Không có"}</strong>
              </div>

              <div>
                <span>Địa chỉ</span>
                <strong>{order.customer_address || "Không có"}</strong>
              </div>

              {order.note ? (
                <div>
                  <span>Ghi chú</span>
                  <strong>{order.note}</strong>
                </div>
              ) : null}
            </div>
          </div>
        </section>
      </div>

      <style>{`
        .orderDetailPage {
          min-height: 100vh;
          padding: 34px 20px 80px;
          color: #ffffff;
          background:
            radial-gradient(circle at 12% 0%, rgba(124,77,255,.2), transparent 30%),
            radial-gradient(circle at 90% 0%, rgba(0,229,255,.16), transparent 30%),
            linear-gradient(180deg, #050816 0%, #081226 100%);
        }

        .container {
          max-width: 1380px;
          margin: 0 auto;
        }

        .backLink {
          display: inline-flex;
          margin-bottom: 24px;
          color: #00e5ff;
          text-decoration: none;
          font-weight: 900;
        }

        .hero,
        .statusGrid div,
        .card {
          border: 1px solid rgba(0, 229, 255, 0.2);
          background:
            radial-gradient(circle at 0% 0%, rgba(124,77,255,.14), transparent 34%),
            rgba(7, 12, 32, 0.84);
          box-shadow: 0 18px 42px rgba(0,0,0,.22);
        }

        .hero {
          padding: 28px;
          border-radius: 22px;
          margin-bottom: 22px;
        }

        .hero p {
          margin: 0 0 8px;
          color: #00e5ff;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 4px;
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

        .statusGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 18px;
        }

        .statusGrid div {
          border-radius: 18px;
          padding: 20px;
        }

        .statusGrid span,
        .infoList span {
          display: block;
          color: #9fb0d8;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .statusGrid strong {
          color: #00e5ff;
          font-size: 18px;
        }

        .contentGrid {
          display: grid;
          grid-template-columns: 1.35fr 1fr;
          gap: 18px;
        }

        .card {
          border-radius: 22px;
          padding: 24px;
        }

        .card h2 {
          margin: 0 0 22px;
          font-size: 28px;
        }

        .itemList {
          display: grid;
          gap: 0;
        }

        .item {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding: 18px 0;
          border-bottom: 1px solid rgba(255,255,255,.12);
        }

        .item strong {
          display: block;
          color: #ffffff;
          margin-bottom: 8px;
        }

        .item span {
          color: #c5d2f2;
        }

        .item b {
          color: #ff66d9;
          white-space: nowrap;
        }

        .summary {
          margin-top: 18px;
          display: grid;
          gap: 12px;
        }

        .summary div {
          display: flex;
          justify-content: space-between;
          gap: 16px;
        }

        .summary .total {
          margin-top: 10px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,.16);
          font-size: 22px;
        }

        .summary .total strong {
          color: #00e5ff;
          font-size: 28px;
        }

        .infoList {
          display: grid;
          gap: 22px;
        }

        .infoList strong {
          display: block;
          color: #ffffff;
          line-height: 1.6;
        }

        @media (max-width: 980px) {
          .statusGrid,
          .contentGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
