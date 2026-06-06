import Link from "next/link";
import { redirect } from "next/navigation";
import { createAuthServerClient } from "../../../lib/supabase-auth/server";
import { supabaseAdmin } from "../../../lib/supabase-admin";

export const dynamic = "force-dynamic";

type Profile = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
};

type Order = {
  id: string;
  customer_id: string | null;
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

export default async function AdminCustomersPage() {
  await requireAdmin();

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  const { data: userList, error: userError } =
    await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 500,
    });

  if (userError) {
    throw new Error(userError.message);
  }

  const authUsers = (userList?.users || []).filter((user) => {
    return user.email?.trim().toLowerCase() !== adminEmail;
  });

  const customerIds = authUsers.map((user) => user.id);

  const { data: profiles } = customerIds.length
    ? await supabaseAdmin
        .from("profiles")
        .select("id, full_name, email, phone")
        .in("id", customerIds)
    : { data: [] as Profile[] };

  const { data: orders } = customerIds.length
    ? await supabaseAdmin
        .from("orders")
        .select("id, customer_id, total, status, payment_method, created_at")
        .in("customer_id", customerIds)
        .order("created_at", { ascending: false })
    : { data: [] as Order[] };

  const profilesById = new Map(
    ((profiles || []) as Profile[]).map((profile) => [profile.id, profile])
  );

  const ordersByCustomer = new Map<string, Order[]>();

  ((orders || []) as Order[]).forEach((order) => {
    if (!order.customer_id) return;

    const current = ordersByCustomer.get(order.customer_id) || [];
    current.push(order);
    ordersByCustomer.set(order.customer_id, current);
  });

  const customers = authUsers
    .map((authUser) => {
      const profile = profilesById.get(authUser.id);
      const customerOrders = ordersByCustomer.get(authUser.id) || [];

      const totalSpent = customerOrders.reduce((sum, order) => {
        return sum + Number(order.total || 0);
      }, 0);

      const latestOrder = customerOrders[0];

      return {
        id: authUser.id,
        name:
          profile?.full_name ||
          authUser.user_metadata?.full_name ||
          authUser.email?.split("@")[0] ||
          "Khách hàng HMECHA",
        email: profile?.email || authUser.email || "Chưa có email",
        phone: profile?.phone || "Chưa cập nhật",
        createdAt: authUser.created_at,
        lastSignInAt: authUser.last_sign_in_at,
        orderCount: customerOrders.length,
        totalSpent,
        latestOrder,
      };
    })
    .sort((a, b) => {
      return (
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
      );
    });

  const totalRevenue = customers.reduce((sum, customer) => {
    return sum + customer.totalSpent;
  }, 0);

  const totalOrders = customers.reduce((sum, customer) => {
    return sum + customer.orderCount;
  }, 0);

  return (
    <main className="adminCustomers">
      <div className="topbar">
        <div>
          <p>HMECHA ADMIN</p>
          <h1>Khách hàng</h1>
          <span>
            Theo dõi tài khoản khách hàng, lịch sử mua hàng và tổng giá trị đơn.
          </span>
        </div>

        <Link href="/admin">← Quay lại Admin</Link>
      </div>

      <section className="statsGrid">
        <div>
          <span>Tổng khách hàng</span>
          <strong>{customers.length}</strong>
        </div>

        <div>
          <span>Tổng đơn của khách</span>
          <strong>{totalOrders}</strong>
        </div>

        <div>
          <span>Tổng doanh thu khách</span>
          <strong>{money(totalRevenue)}</strong>
        </div>
      </section>

      <section className="tableCard">
        <div className="tableHead">
          <div>
            <h2>Danh sách tài khoản khách hàng</h2>
            <p>Dữ liệu lấy từ Supabase Auth, hồ sơ khách hàng và bảng đơn hàng.</p>
          </div>
        </div>

        {customers.length === 0 ? (
          <div className="emptyBox">Chưa có tài khoản khách hàng nào.</div>
        ) : (
          <div className="tableWrap">
            <table>
              <thead>
                <tr>
                  <th>Khách hàng</th>
                  <th>Liên hệ</th>
                  <th>Ngày tạo</th>
                  <th>Đăng nhập gần nhất</th>
                  <th>Đơn hàng</th>
                  <th>Tổng mua</th>
                  <th>Đơn gần nhất</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div className="customerCell">
                        <div className="avatar">
                          {customer.name.slice(0, 1).toUpperCase()}
                        </div>

                        <div>
                          <strong>{customer.name}</strong>
                          <span>ID: {customer.id.slice(0, 8)}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="mutedBlock">
                        <strong>{customer.email}</strong>
                        <span>{customer.phone}</span>
                      </div>
                    </td>

                    <td>{date(customer.createdAt)}</td>
                    <td>{date(customer.lastSignInAt)}</td>

                    <td>
                      <strong className="cyan">{customer.orderCount}</strong>
                    </td>

                    <td>
                      <strong>{money(customer.totalSpent)}</strong>
                    </td>

                    <td>
                      {customer.latestOrder ? (
                        <div className="mutedBlock">
                          <strong>
                            {money(Number(customer.latestOrder.total || 0))}
                          </strong>
                          <span>{customer.latestOrder.status || "Chưa cập nhật"}</span>
                        </div>
                      ) : (
                        <span className="muted">Chưa có</span>
                      )}
                    </td>

                    <td>
                      <Link
                        className="viewBtn"
                        href={`/admin/khach-hang/${customer.id}`}
                      >
                        Xem
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <style>{`
        .adminCustomers {
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

        .topbar a,
        .viewBtn {
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
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
        }

        .statsGrid div,
        .tableCard {
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

        .tableCard {
          max-width: 1480px;
          margin: 0 auto;
          border-radius: 24px;
          overflow: hidden;
        }

        .tableHead {
          padding: 24px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .tableHead h2 {
          margin: 0 0 8px;
          font-size: 26px;
        }

        .tableHead p {
          margin: 0;
          color: #9fb0d8;
        }

        .tableWrap {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1120px;
        }

        th,
        td {
          padding: 18px 20px;
          text-align: left;
          vertical-align: middle;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        th {
          color: #00e5ff;
          font-size: 13px;
          letter-spacing: 1px;
          text-transform: uppercase;
          background: rgba(255, 255, 255, 0.035);
        }

        td {
          color: #e8efff;
        }

        tr:hover td {
          background: rgba(0, 229, 255, 0.045);
        }

        .customerCell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .avatar {
          width: 42px;
          height: 42px;
          border-radius: 13px;
          display: grid;
          place-items: center;
          color: #061020;
          font-weight: 950;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
        }

        .customerCell strong,
        .mutedBlock strong {
          display: block;
          color: #ffffff;
          margin-bottom: 5px;
        }

        .customerCell span,
        .mutedBlock span,
        .muted {
          color: #95a6d1;
          font-size: 13px;
        }

        .cyan {
          color: #00e5ff !important;
        }

        .viewBtn {
          display: inline-flex;
          padding: 10px 16px;
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

        @media (max-width: 850px) {
          .topbar {
            flex-direction: column;
          }

          .statsGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}