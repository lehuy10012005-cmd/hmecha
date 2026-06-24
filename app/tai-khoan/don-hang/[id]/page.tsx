import Link from "next/link";
import CustomerCancelOrderButton from "../../../../components/customer/CustomerCancelOrderButton";
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

  const cleanOrderStatus = displayStatusText(order.status);
  const canCustomerCancelOrder = ["Chờ xác nhận", "Chờ thanh toán"].includes(cleanOrderStatus) && String(order.payment_status || "").toLowerCase() !== "paid";

  const isCompletedOrder =
    cleanOrderStatus === "Hoàn thành" ||
    String(order.status || "").toLowerCase() === "completed";

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
            <strong>{displayStatusText(order.status) || "Đang cập nhật"}</strong>
          </div>

          <div>
            <span>Thanh toán</span>
            <strong>
              {order.payment_method === "cod" ? "COD" : "VNPAY / QR"}
            </strong>
          </div>

          <div>
            <span>Tình trạng thanh toán</span>
            <strong>{displayStatusText(order.payment_status) || "Đang cập nhật"}</strong>
          </div>
        </section>

        {canCustomerCancelOrder ? (
          <CustomerCancelOrderButton orderId={order.id} />
        ) : null}

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
        {isCompletedOrder ? (
          <section className="reviewReminder">
            <div>
              <p>AFTER-SALE CARE</p>
              <h2>Đánh giá sản phẩm để nhận thêm quyền lợi</h2>
              <span>
                Cảm ơn bạn đã hoàn tất đơn hàng tại HMECHA. Bạn có thể chia sẻ trải nghiệm về sản phẩm đã mua để giúp shop cải thiện dịch vụ và giúp khách hàng mới yên tâm hơn.
              </span>

              <ul>
                <li>Nhận thêm điểm thưởng cho tài khoản thành viên.</li>
                <li>Giúp HMECHA cải thiện chất lượng đóng gói và tư vấn.</li>
                <li>Hỗ trợ người mua mới chọn mô hình phù hợp hơn.</li>
              </ul>
            </div>

            <Link className="reviewButton" href="/products">
              Đánh giá sản phẩm
            </Link>
          </section>
        ) : null}

        {isCompletedOrder ? (
          <section className="afterSaleSuggest">
            <div className="suggestHead">
              <p>NEXT BUILD SUGGESTION</p>
              <h2>Gợi ý phụ kiện cho lần build tiếp theo</h2>
              <span>
                Sau khi hoàn tất đơn hàng, HMECHA gợi ý thêm một số phụ kiện thường được dùng khi lắp ráp và trưng bày mô hình.
              </span>
            </div>

            <div className="suggestGrid">
              <Link href="/products" className="suggestCard">
                <b>Kìm cắt mô hình</b>
                <span>Hỗ trợ tách part gọn hơn, hạn chế làm xước chi tiết.</span>
              </Link>

              <Link href="/products" className="suggestCard">
                <b>Decal & sticker</b>
                <span>Tăng độ chi tiết và giúp mô hình nhìn nổi bật hơn khi trưng bày.</span>
              </Link>

              <Link href="/products" className="suggestCard">
                <b>Đế trưng bày</b>
                <span>Phù hợp cho các mẫu có dáng bay, pose hành động hoặc cần cố định chắc hơn.</span>
              </Link>

              <Link href="/products" className="suggestCard">
                <b>Phụ kiện custom</b>
                <span>Gợi ý thêm vũ khí, hiệu ứng, tay thay thế hoặc chi tiết nâng cấp.</span>
              </Link>

              <Link href="/products" className="suggestCard">
                <b>Mô hình cùng dòng</b>
                <span>Tiếp tục hoàn thiện bộ sưu tập theo series hoặc cùng cấp HG, RG, MG.</span>
              </Link>
            </div>
          </section>
        ) : null}
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


        .reviewReminder {
          margin-top: 18px;
          padding: 26px;
          border-radius: 22px;
          border: 1px solid rgba(0, 229, 255, 0.24);
          background:
            radial-gradient(circle at 0% 0%, rgba(0,229,255,.16), transparent 34%),
            radial-gradient(circle at 100% 0%, rgba(124,77,255,.18), transparent 36%),
            rgba(7, 12, 32, 0.88);
          box-shadow: 0 18px 42px rgba(0,0,0,.24);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .reviewReminder p {
          margin: 0 0 8px;
          color: #00e5ff;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 4px;
        }

        .reviewReminder h2 {
          margin: 0 0 10px;
          color: #ffffff;
          font-size: clamp(26px, 3vw, 38px);
          line-height: 1.12;
        }

        .reviewReminder span {
          display: block;
          max-width: 820px;
          color: #c5d2f2;
          line-height: 1.7;
        }

        .reviewReminder ul {
          margin: 18px 0 0;
          padding-left: 18px;
          color: #dce6ff;
          line-height: 1.8;
        }

        .reviewReminder li {
          margin: 4px 0;
        }

        .reviewButton {
          flex: 0 0 auto;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 0 22px;
          border-radius: 999px;
          color: #050816;
          background: linear-gradient(135deg, #00e5ff, #7c4dff);
          text-decoration: none;
          font-weight: 950;
          box-shadow: 0 14px 30px rgba(0,229,255,.22);
        }

        .reviewButton:hover {
          transform: translateY(-1px);
          filter: brightness(1.08);
        }

        .afterSaleSuggest {
          margin-top: 18px;
          padding: 26px;
          border-radius: 22px;
          border: 1px solid rgba(124, 77, 255, 0.28);
          background:
            radial-gradient(circle at 0% 0%, rgba(124,77,255,.18), transparent 34%),
            radial-gradient(circle at 100% 0%, rgba(255,102,217,.12), transparent 36%),
            rgba(7, 12, 32, 0.88);
          box-shadow: 0 18px 42px rgba(0,0,0,.24);
        }

        .suggestHead {
          margin-bottom: 20px;
        }

        .suggestHead p {
          margin: 0 0 8px;
          color: #ff66d9;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 4px;
        }

        .suggestHead h2 {
          margin: 0 0 10px;
          color: #ffffff;
          font-size: clamp(26px, 3vw, 38px);
          line-height: 1.12;
        }

        .suggestHead span {
          display: block;
          max-width: 860px;
          color: #c5d2f2;
          line-height: 1.7;
        }

        .suggestGrid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 12px;
        }

        .suggestCard {
          min-height: 150px;
          padding: 18px;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(255,255,255,.055);
          color: #ffffff;
          text-decoration: none;
          transition: .2s ease;
        }

        .suggestCard:hover {
          transform: translateY(-3px);
          border-color: rgba(0,229,255,.42);
          background: rgba(0,229,255,.08);
        }

        .suggestCard b {
          display: block;
          margin-bottom: 10px;
          color: #ffffff;
          font-size: 16px;
        }

        .suggestCard span {
          display: block;
          color: #c5d2f2;
          font-size: 13px;
          line-height: 1.6;
        }
        @media (max-width: 980px) {
          .statusGrid,
          .contentGrid,
          .reviewReminder,
          .afterSaleSuggest,
          .suggestGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
