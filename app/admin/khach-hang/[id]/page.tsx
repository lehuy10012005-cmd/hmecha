import Link from "next/link";
import { redirect } from "next/navigation";
import { createAuthServerClient } from "../../../../lib/supabase-auth/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

type Order = {
  id: string;
  total: number | null;
  status: string | null;
  payment_method: string | null;
  created_at: string;
};

async function requireAdmin() {
  const supabase = await createAuthServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!user) redirect("/admin-login");

  if (!adminEmail || user.email?.trim().toLowerCase() !== adminEmail) {
    redirect("/admin-login");
  }
}

function money(value: number) {
  return Number(value || 0).toLocaleString("vi-VN") + "₫";
}

function date(value?: string | null) {
  if (!value) return "Chưa có";
  return new Date(value).toLocaleDateString("vi-VN");
}

function paymentMethod(value?: string | null) {
  if (!value) return "Chưa cập nhật";

  const text = value.toLowerCase();

  if (text === "cod") return "COD";
  if (text.includes("vnpay")) return "VNPAY";
  if (text.includes("bank")) return "Chuyển khoản";

  return value;
}

export default async function AdminCustomerDetailPage({ params }: PageProps) {
  await requireAdmin();

  const { id } = await params;

  const { data: authUserData, error: authUserError } =
    await supabaseAdmin.auth.admin.getUserById(id);

  if (authUserError || !authUserData.user) {
    redirect("/admin/khach-hang");
  }

  const authUser = authUserData.user;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, email, phone")
    .eq("id", id)
    .maybeSingle();

  const { data: ordersData } = await supabaseAdmin
    .from("orders")
    .select("id, total, status, payment_method, created_at")
    .eq("customer_id", id)
    .order("created_at", { ascending: false });

  const orders = (ordersData || []) as Order[];

  const customerName =
    profile?.full_name ||
    authUser.user_metadata?.full_name ||
    authUser.email?.split("@")[0] ||
    "Khách hàng HMECHA";

  const customerEmail = profile?.email || authUser.email || "Chưa có email";
  const customerPhone = profile?.phone || "Chưa cập nhật";

  const totalSpent = orders.reduce((sum, order) => {
    return sum + Number(order.total || 0);
  }, 0);

  return (
    <main className="detailPage">
      <div className="container">
        <div className="topbar">
          <div>
            <p>HMECHA CUSTOMER</p>
            <h1>{customerName}</h1>
            <span>Chi tiết tài khoản, liên hệ và lịch sử đơn hàng.</span>
          </div>

          <Link href="/admin/khach-hang">← Danh sách khách hàng</Link>
        </div>

        <section className="profileGrid">
          <div className="profileCard">
            <div className="avatar">{customerName.slice(0, 1).toUpperCase()}</div>

            <h2>{customerName}</h2>
            <p>{customerEmail}</p>

            <div className="infoRows">
              <div>
                <span>Số điện thoại</span>
                <strong>{customerPhone}</strong>
              </div>

              <div>
                <span>Ngày tạo tài khoản</span>
                <strong>{date(authUser.created_at)}</strong>
              </div>

              <div>
                <span>Đăng nhập gần nhất</span>
                <strong>{date(authUser.last_sign_in_at)}</strong>
              </div>

              <div>
                <span>Mã khách hàng</span>
                <strong>{authUser.id.slice(0, 8).toUpperCase()}</strong>
              </div>
            </div>
          </div>

          <div className="summaryGrid">
            <div>
              <span>Tổng đơn hàng</span>
              <strong>{orders.length}</strong>
            </div>

            <div>
              <span>Tổng giá trị đã mua</span>
              <strong>{money(totalSpent)}</strong>
            </div>

            <div>
              <span>Điểm tích lũy</span>
              <strong>0 điểm</strong>
            </div>

            <div>
              <span>Hạng thành viên</span>
              <strong>Rookie Builder</strong>
            </div>
          </div>
        </section>

        <section className="ordersCard">
          <div className="ordersHead">
            <h2>Lịch sử đơn hàng</h2>
            <p>Toàn bộ đơn hàng được ghi nhận theo tài khoản khách hàng này.</p>
          </div>

          {orders.length === 0 ? (
            <div className="emptyBox">Khách hàng này chưa có đơn hàng.</div>
          ) : (
            <div className="ordersList">
              {orders.map((order) => (
                <div className="orderItem" key={order.id}>
                  <div>
                    <strong>HM-ORD-{order.id.slice(0, 6).toUpperCase()}</strong>
                    <span>Đặt ngày: {date(order.created_at)}</span>
                  </div>

                  <div>
                    <span>Thanh toán</span>
                    <strong>{paymentMethod(order.payment_method)}</strong>
                  </div>

                  <div>
                    <span>Trạng thái</span>
                    <strong>{order.status || "Chưa cập nhật"}</strong>
                  </div>

                  <div>
                    <span>Tổng tiền</span>
                    <strong className="cyan">{money(Number(order.total || 0))}</strong>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <style>{`
        .detailPage {
          min-height: 100vh;
          padding: 36px 24px 80px;
          color: #ffffff;
          background:
            radial-gradient(circle at 8% 0%, rgba(124, 77, 255, 0.24), transparent 34%),
            radial-gradient(circle at 92% 8%, rgba(0, 229, 255, 0.16), transparent 30%),
            linear-gradient(180deg, #050816 0%, #0b1434 48%, #050816 100%);
        }

        .container {
          max-width: 1380px;
          margin: 0 auto;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          align-items: flex-start;
          margin-bottom: 28px;
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
          font-size: clamp(36px, 5vw, 58px);
          line-height: 1.05;
        }

        .topbar span {
          display: block;
          margin-top: 14px;
          color: #c5d2f2;
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

        .profileGrid {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 22px;
          margin-bottom: 24px;
        }

        .profileCard,
        .summaryGrid div,
        .ordersCard {
          border: 1px solid rgba(0, 229, 255, 0.2);
          background: rgba(7, 12, 32, 0.84);
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.24);
        }

        .profileCard {
          border-radius: 24px;
          padding: 26px;
        }

        .avatar {
          width: 74px;
          height: 74px;
          display: grid;
          place-items: center;
          border-radius: 22px;
          color: #061020;
          font-size: 30px;
          font-weight: 950;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
        }

        .profileCard h2 {
          margin: 18px 0 8px;
          font-size: 28px;
        }

        .profileCard p {
          margin: 0 0 20px;
          color: #9fb0d8;
        }

        .infoRows div {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding: 14px 0;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .infoRows span {
          color: #9fb0d8;
        }

        .infoRows strong {
          text-align: right;
        }

        .summaryGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 16px;
        }

        .summaryGrid div {
          border-radius: 22px;
          padding: 24px;
        }

        .summaryGrid span {
          display: block;
          color: #9fb0d8;
          margin-bottom: 12px;
        }

        .summaryGrid strong {
          color: #00e5ff;
          font-size: 28px;
        }

        .ordersCard {
          border-radius: 24px;
          overflow: hidden;
        }

        .ordersHead {
          padding: 24px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .ordersHead h2 {
          margin: 0 0 8px;
          font-size: 26px;
        }

        .ordersHead p {
          margin: 0;
          color: #9fb0d8;
        }

        .orderItem {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr 1fr;
          gap: 18px;
          padding: 20px 24px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }

        .orderItem span {
          display: block;
          color: #9fb0d8;
          font-size: 13px;
          margin-bottom: 6px;
        }

        .cyan {
          color: #00e5ff !important;
        }

        .emptyBox {
          margin: 24px;
          padding: 42px 20px;
          text-align: center;
          color: #b9c8ed;
          border-radius: 18px;
          border: 1px dashed rgba(0, 229, 255, 0.25);
          background: rgba(255, 255, 255, 0.04);
        }

        @media (max-width: 950px) {
          .topbar {
            flex-direction: column;
          }

          .profileGrid,
          .summaryGrid,
          .orderItem {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}