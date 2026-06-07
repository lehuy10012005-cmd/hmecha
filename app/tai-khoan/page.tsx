import Link from "next/link";
import { createAuthServerClient } from "../../lib/supabase-auth/server";
import CustomerVoucherPanel from "../../components/customer/CustomerVoucherPanel";
export const dynamic = "force-dynamic";

type OrderItem = {
  product_name: string;
  product_price: number;
  quantity: number;
};

type Order = {
  id: string;
  total: number;
  status: string;
  payment_method: string;
  created_at: string;
  order_items: OrderItem[] | null;
};

const money = (value: number) =>
  Number(value || 0).toLocaleString("vi-VN") + "₫";

const date = (value: string) => new Date(value).toLocaleDateString("vi-VN");

function shortMemberCode(id?: string) {
  if (!id) return "HM-MEMBER";
  return `HM-${id.slice(0, 8).toUpperCase()}`;
}

function statusClass(status: string) {
  const normalized = status.toLowerCase();

  if (normalized.includes("hoàn") || normalized.includes("thành công")) {
    return "success";
  }

  if (normalized.includes("hủy") || normalized.includes("thất bại")) {
    return "danger";
  }

  return "pending";
}

export default async function CustomerAccountPage() {
  const supabase = await createAuthServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name,email,phone")
    .eq("id", user!.id)
    .maybeSingle();

  const { data: ordersData } = await supabase
    .from("orders")
    .select(
      "id,total,status,payment_method,created_at,order_items(product_name,product_price,quantity)"
    )
    .eq("customer_id", user!.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const orders = (ordersData || []) as Order[];

  const customerName =
    profile?.full_name || user?.email?.split("@")[0] || "Thành viên HMECHA";

  const email = profile?.email || user?.email || "Chưa cập nhật";
  const phone = profile?.phone || "Chưa cập nhật";

  return (
    <section className="accountDashboard">
      <div className="topbar">
        <div>
          <p className="eyebrow">HMECHA MEMBER</p>
          <h1>Xin chào, {customerName}!</h1>
          <p className="intro">
            Đây là khu vực theo dõi đơn hàng, thông tin thành viên và các quyền
            lợi mua sắm của bạn tại HMECHA.
          </p>
        </div>

        <Link className="continueShopping" href="/">
          Tiếp tục mua sắm →
        </Link>
      </div>

      <div className="dashboardGrid">
        <aside className="memberPanel">
          <div className="memberCard">
            <div className="memberCardGlow" />

            <div className="memberCardTop">
              <div>
                <span>THẺ THÀNH VIÊN HMECHA</span>
                <h2>{customerName}</h2>
              </div>

              <div className="avatar">HM</div>
            </div>

            <div className="memberCode">
              <div>
                <small>Mã số thành viên</small>
                <strong>{shortMemberCode(user?.id)}</strong>
              </div>

              <span>ROOKIE</span>
            </div>
          </div>

          <div className="memberInfo">
            <div>
              <span>Cấp thành viên:</span>
              <strong>Rookie Builder</strong>
            </div>

            <div>
              <span>Điểm tích lũy:</span>
              <strong className="cyan">0 điểm</strong>
            </div>

            <div>
              <span>Email đăng ký:</span>
              <strong>{email}</strong>
            </div>

            <div>
              <span>Số điện thoại:</span>
              <strong>{phone}</strong>
            </div>
          </div>

          <div className="benefits">
            <h3>✦ Đặc quyền HMECHA của bạn</h3>

            <ul>
              <li>Theo dõi đơn hàng và trạng thái thanh toán.</li>
              <li>Ưu tiên nhận thông báo preorder mô hình mới.</li>
              <li>Tích điểm, voucher và hạng thành viên sẽ được mở rộng sau.</li>
            </ul>
          </div>
        </aside>

        <section className="orderPanel">
          <div className="orderHeader">
            <div>
              <p>LỊCH SỬ ĐƠN HÀNG</p>
              <h2>Đơn hàng gần đây</h2>
              <span>
                Kiểm tra trạng thái đóng gói, thanh toán và tổng tiền đơn hàng.
              </span>
            </div>

            <Link href="/tai-khoan/don-hang">Xem tất cả</Link>
          </div>

          {orders.length === 0 ? (
            <div className="emptyOrders">
              <div className="emptyIcon">□</div>
              <h3>Bạn chưa có đơn hàng nào</h3>
              <p>
                Hãy chọn mẫu Gundam yêu thích, sau khi đặt hàng đơn sẽ xuất
                hiện ở đây.
              </p>
              <Link href="/">Mua sắm ngay</Link>
            </div>
          ) : (
            <div className="ordersList">
              {orders.map((order) => {
                const items = order.order_items || [];

                return (
                  <Link
                    className="orderCard"
                    href={`/tai-khoan/don-hang/${order.id}`}
                    key={order.id}
                  >
                    <div className="orderCardTop">
                      <div>
                        <strong>HM-ORD-{order.id.slice(0, 6).toUpperCase()}</strong>
                        <span>Đặt ngày: {date(order.created_at)}</span>
                      </div>

                      <b className={`status ${statusClass(order.status)}`}>
                        {order.status}
                      </b>
                    </div>

                    <div className="orderItems">
                      {items.length > 0 ? (
                        items.slice(0, 2).map((item, index) => (
                          <div className="orderItem" key={`${item.product_name}-${index}`}>
                            <div>
                              <strong>{item.product_name}</strong>
                              <span>Số lượng: {item.quantity}</span>
                            </div>

                            <b>{money(item.product_price * item.quantity)}</b>
                          </div>
                        ))
                      ) : (
                        <p className="noItem">Đơn hàng đang được cập nhật sản phẩm.</p>
                      )}
                    </div>

                    <div className="orderTotal">
                      <span>
                        Phương thức thanh toán:{" "}
                        <b>{order.payment_method === "cod" ? "COD" : "VNPAY"}</b>
                      </span>

                      <strong>Tổng thanh toán: {money(order.total)}</strong>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <div style={{ marginTop: 28 }}>
        <CustomerVoucherPanel />
      </div>
      <style>{`
        .accountDashboard {
          color: #ffffff;
        }

        .topbar {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 22px;
          margin-bottom: 34px;
        }

        .eyebrow {
          margin: 0 0 12px;
          color: #00e5ff;
          font-size: 13px;
          font-weight: 950;
          letter-spacing: 3px;
        }

        h1 {
          margin: 0;
          font-size: clamp(34px, 5vw, 54px);
          line-height: 1.08;
        }

        .intro {
          max-width: 760px;
          margin: 20px 0 0;
          color: #b7c5e8;
          line-height: 1.75;
          font-size: 17px;
        }

        .continueShopping {
          white-space: nowrap;
          padding: 14px 20px;
          border-radius: 14px;
          color: #061020;
          text-decoration: none;
          font-weight: 950;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
          box-shadow: 0 0 24px rgba(0, 229, 255, 0.24);
        }

        .dashboardGrid {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 28px;
          align-items: start;
        }

        .memberPanel,
        .orderPanel {
          border: 1px solid rgba(0, 229, 255, 0.18);
          border-radius: 26px;
          background: rgba(255, 255, 255, 0.055);
          box-shadow: 0 0 34px rgba(124, 77, 255, 0.12);
        }

        .memberPanel {
          padding: 24px;
        }

        .memberCard {
          position: relative;
          overflow: hidden;
          padding: 22px;
          min-height: 190px;
          border-radius: 22px;
          background:
            radial-gradient(circle at 88% 20%, rgba(255, 79, 216, 0.28), transparent 30%),
            linear-gradient(135deg, #7c4dff, #00e5ff);
          color: #061020;
        }

        .memberCardGlow {
          position: absolute;
          right: -40px;
          bottom: -60px;
          width: 170px;
          height: 170px;
          border-radius: 999px;
          border: 28px solid rgba(255,255,255,0.15);
        }

        .memberCardTop {
          position: relative;
          z-index: 1;
          display: flex;
          justify-content: space-between;
          gap: 18px;
        }

        .memberCardTop span {
          display: inline-flex;
          padding: 7px 10px;
          border-radius: 8px;
          background: rgba(5, 8, 22, 0.16);
          color: #ffffff;
          font-size: 11px;
          font-weight: 950;
          letter-spacing: 1px;
        }

        .memberCardTop h2 {
          margin: 13px 0 0;
          color: #ffffff;
          font-size: 22px;
        }

        .avatar {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          color: #ffffff;
          background: rgba(5, 8, 22, 0.22);
          font-weight: 950;
        }

        .memberCode {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 14px;
          margin-top: 46px;
          padding-top: 16px;
          border-top: 1px solid rgba(255,255,255,0.28);
        }

        .memberCode small {
          display: block;
          color: rgba(255,255,255,0.78);
          font-size: 11px;
          font-weight: 850;
          text-transform: uppercase;
        }

        .memberCode strong {
          color: #ffffff;
          font-family: Consolas, monospace;
          letter-spacing: 1px;
        }

        .memberCode span {
          padding: 5px 10px;
          border-radius: 999px;
          color: #061020;
          background: #ffe169;
          font-size: 11px;
          font-weight: 950;
        }

        .memberInfo {
          display: grid;
          gap: 0;
          margin-top: 22px;
        }

        .memberInfo div {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          padding: 13px 0;
          border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .memberInfo span {
          color: #91a4d2;
          font-weight: 800;
        }

        .memberInfo strong {
          color: #ffffff;
          text-align: right;
          word-break: break-word;
        }

        .memberInfo .cyan {
          color: #00e5ff;
        }

        .benefits {
          margin-top: 24px;
          padding: 18px;
          border-radius: 18px;
          background: rgba(0, 229, 255, 0.06);
          border: 1px solid rgba(0, 229, 255, 0.14);
        }

        .benefits h3 {
          margin: 0 0 12px;
          color: #00e5ff;
          font-size: 15px;
        }

        .benefits ul {
          margin: 0;
          padding-left: 18px;
          color: #c5d2f2;
          line-height: 1.7;
          font-size: 14px;
        }

        .orderPanel {
          padding: 28px;
        }

        .orderHeader {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 24px;
        }

        .orderHeader p {
          margin: 0 0 8px;
          color: #00e5ff;
          font-size: 13px;
          font-weight: 950;
          letter-spacing: 2px;
        }

        .orderHeader h2 {
          margin: 0 0 8px;
          font-size: 28px;
        }

        .orderHeader span {
          color: #9fb0d8;
        }

        .orderHeader a {
          color: #00e5ff;
          text-decoration: none;
          font-weight: 950;
        }

        .ordersList {
          display: grid;
          gap: 18px;
        }

        .orderCard {
          display: block;
          overflow: hidden;
          border-radius: 20px;
          border: 1px solid rgba(0, 229, 255, 0.16);
          background: rgba(5, 8, 22, 0.72);
          color: #ffffff;
          text-decoration: none;
        }

        .orderCard:hover {
          border-color: rgba(0, 229, 255, 0.48);
          box-shadow: 0 0 24px rgba(0, 229, 255, 0.12);
        }

        .orderCardTop {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          padding: 18px 20px;
          background: rgba(255, 255, 255, 0.045);
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .orderCardTop strong {
          display: block;
          margin-bottom: 6px;
        }

        .orderCardTop span {
          color: #91a4d2;
          font-size: 13px;
        }

        .status {
          align-self: flex-start;
          padding: 7px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 950;
          white-space: nowrap;
        }

        .status.pending {
          color: #ffd36e;
          background: rgba(255, 184, 52, 0.14);
          border: 1px solid rgba(255, 184, 52, 0.3);
        }

        .status.success {
          color: #50efa0;
          background: rgba(37, 194, 110, 0.15);
          border: 1px solid rgba(37, 194, 110, 0.28);
        }

        .status.danger {
          color: #ff96a5;
          background: rgba(255, 75, 100, 0.14);
          border: 1px solid rgba(255, 75, 100, 0.26);
        }

        .orderItems {
          padding: 18px 20px;
          display: grid;
          gap: 12px;
        }

        .orderItem {
          display: flex;
          justify-content: space-between;
          gap: 18px;
        }

        .orderItem strong {
          display: block;
          color: #ffffff;
        }

        .orderItem span,
        .noItem {
          color: #91a4d2;
          font-size: 13px;
        }

        .orderItem b {
          color: #00e5ff;
          white-space: nowrap;
        }

        .orderTotal {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          padding: 17px 20px;
          border-top: 1px dashed rgba(0, 229, 255, 0.18);
          color: #aebde2;
        }

        .orderTotal strong {
          color: #ff78d2;
        }

        .emptyOrders {
          padding: 54px 24px;
          text-align: center;
          border-radius: 20px;
          border: 1px dashed rgba(0, 229, 255, 0.28);
          background: rgba(5, 8, 22, 0.55);
        }

        .emptyIcon {
          width: 58px;
          height: 58px;
          display: grid;
          place-items: center;
          margin: 0 auto 16px;
          border-radius: 50%;
          color: #00e5ff;
          background: rgba(0, 229, 255, 0.1);
        }

        .emptyOrders h3 {
          margin: 0;
          color: #ffffff;
        }

        .emptyOrders p {
          color: #9fb0d8;
        }

        .emptyOrders a {
          display: inline-flex;
          margin-top: 14px;
          padding: 13px 20px;
          border-radius: 13px;
          color: #061020;
          text-decoration: none;
          font-weight: 950;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
        }

        @media (max-width: 1150px) {
          .dashboardGrid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .topbar,
          .orderHeader,
          .orderCardTop,
          .orderTotal,
          .orderItem {
            flex-direction: column;
          }

          .continueShopping {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </section>
  );
}