"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type AnyRecord = Record<string, any>;

type AccountProfile = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

type AccountOrderItem = {
  name: string;
  quantity: number;
  price: number;
};

type AccountOrder = {
  id: string;
  code: string;
  createdAt: string;
  status: string;
  payment: string;
  total: number;
  items: AccountOrderItem[];
};

function formatPrice(value: number) {
  return Number(value || 0).toLocaleString("vi-VN") + "₫";
}

function formatDate(value: string) {
  if (!value) return "Không rõ ngày";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("vi-VN");
}

function getProfileName(user: AnyRecord | null, profile: AnyRecord | null) {
  return (
    profile?.full_name ||
    profile?.name ||
    profile?.customer_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")?.[0] ||
    "Khách hàng HMECHA"
  );
}

function normalizeOrderItems(order: AnyRecord): AccountOrderItem[] {
  const rawItems =
    order.order_items ||
    order.items ||
    order.cart_items ||
    order.products ||
    order.orderDetails ||
    [];

  if (!Array.isArray(rawItems)) return [];

  return rawItems.map((item: AnyRecord) => ({
    name:
      item.product_name ||
      item.name ||
      item.product?.name ||
      item.title ||
      "Sản phẩm HMECHA",
    quantity: Number(item.quantity || item.qty || 1),
    price: Number(item.price || item.unit_price || item.product_price || 0),
  }));
}

function normalizeOrder(order: AnyRecord): AccountOrder {
  const id = String(order.id || order.order_id || order.code || Math.random());

  return {
    id,
    code:
      order.order_code ||
      order.order_number ||
      order.code ||
      `HM-${id.slice(0, 8).toUpperCase()}`,
    createdAt: order.created_at || order.createdAt || order.date || "",
    status:
      order.status ||
      order.order_status ||
      order.payment_status ||
      "Chờ xử lý",
    payment:
      order.payment_method ||
      order.payment ||
      order.method ||
      "Chưa cập nhật",
    total: Number(
      order.total ||
        order.total_amount ||
        order.final_total ||
        order.amount ||
        order.grand_total ||
        0
    ),
    items: normalizeOrderItems(order),
  };
}

function getStatusClass(status: string) {
  const text = status.toLowerCase();

  if (text.includes("hoàn") || text.includes("giao") || text.includes("paid")) {
    return "success";
  }

  if (text.includes("hủy") || text.includes("cancel")) {
    return "danger";
  }

  return "pending";
}

export default function AccountPage() {
  const [profile, setProfile] = useState<AccountProfile>({
    name: "Khách hàng HMECHA",
    email: "",
    phone: "",
    address: "",
  });

  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [loginRequired, setLoginRequired] = useState(false);

  useEffect(() => {
    async function loadAccount() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoginRequired(true);
        setLoading(false);
        return;
      }

      let profileData: AnyRecord | null = null;

      try {
        const profileResponse = await fetch("/api/account/profile", {
          cache: "no-store",
        });

        const profileJson = await profileResponse.json();

        if (profileJson?.profile) {
          profileData = profileJson.profile;
        }
      } catch {
        profileData = null;
      }

      setProfile({
        name: getProfileName(user, profileData),
        email: profileData?.email || user.email || "",
        phone: profileData?.phone || profileData?.customer_phone || "",
        address: profileData?.address || "",
      });

      let loadedOrders: AccountOrder[] = [];

      try {
        const response = await fetch("/api/account/orders", {
          cache: "no-store",
        });

        if (response.ok) {
          const data = await response.json();

          const rawOrders =
            data.orders ||
            data.data ||
            data.orderList ||
            [];

          if (Array.isArray(rawOrders)) {
            loadedOrders = rawOrders.map(normalizeOrder);
          }
        }
      } catch {
        loadedOrders = [];
      }

      if (loadedOrders.length === 0 && user.email) {
        const emailQueries = [
          { column: "customer_email", value: user.email },
          { column: "email", value: user.email },
          { column: "user_id", value: user.id },
        ];

        for (const query of emailQueries) {
          const { data, error } = await supabase
            .from("orders")
            .select("*")
            .eq(query.column, query.value)
            .order("created_at", { ascending: false })
            .limit(20);

          if (!error && Array.isArray(data)) {
            loadedOrders = data.map(normalizeOrder);
            break;
          }
        }
      }

      setOrders(loadedOrders);
      setLoading(false);
    }

    loadAccount();
  }, []);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const pendingOrders = orders.filter((order) => {
      const status = order.status.toLowerCase();
      return !status.includes("hủy") && !status.includes("hoàn") && !status.includes("giao");
    }).length;

    return {
      totalOrders,
      totalSpent,
      pendingOrders,
    };
  }, [orders]);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loginRequired) {
    return (
      <main className="hmAccountPage">
        <div className="loginBox">
          <h1>Bạn cần đăng nhập</h1>
          <p>Vui lòng đăng nhập để xem thông tin tài khoản và đơn hàng.</p>

          <div>
            <Link href="/login">Đăng nhập</Link>
            <Link href="/">Quay về trang chủ</Link>
          </div>
        </div>

        <style jsx>{`
          .hmAccountPage {
            min-height: 100vh;
            display: grid;
            place-items: center;
            background: #f4f5f7;
            padding: 24px;
            font-family: Arial, "Helvetica Neue", sans-serif;
          }

          .loginBox {
            width: min(520px, 100%);
            padding: 34px;
            border-radius: 18px;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
          }

          .loginBox h1 {
            margin: 0 0 10px;
            color: #111827;
            font-size: 32px;
            font-weight: 900;
          }

          .loginBox p {
            margin: 0 0 22px;
            color: #4b5563;
            line-height: 1.7;
          }

          .loginBox div {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }

          .loginBox a {
            min-height: 44px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0 18px;
            border-radius: 10px;
            text-decoration: none;
            font-weight: 800;
          }

          .loginBox a:first-child {
            color: #ffffff;
            background: #d32f2f;
          }

          .loginBox a:last-child {
            color: #111827;
            background: #ffffff;
            border: 1px solid #e5e7eb;
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="hmAccountPage">
      <aside className="hmSidebar">
        <Link href="/" className="hmLogo">
          HMECHA
        </Link>

        <div className="hmUserMini">
          <strong>{profile.name}</strong>
          <span>{profile.email || "Chưa cập nhật email"}</span>
        </div>

        <nav>
          <a href="#overview" className="active">Tổng quan</a>
          <a href="#orders">Đơn hàng của tôi</a>
          <a href="#member">Thông tin thành viên</a>
        </nav>

        <button type="button" onClick={handleLogout}>
          Đăng xuất
        </button>
      </aside>

      <section className="hmContent">
        <div className="hmTopbar">
          <div>
            <span>HMECHA MEMBER</span>
            <h1>Xin chào, {profile.name}!</h1>
            <p>
              Theo dõi đơn hàng, thông tin thành viên và quyền lợi mua sắm của bạn
              tại HMECHA.
            </p>
          </div>

          <Link href="/" className="shopBtn">
            Tiếp tục mua sắm →
          </Link>
        </div>

        <div id="overview" className="statGrid">
          <article>
            <span>Tổng đơn hàng</span>
            <strong>{loading ? "..." : stats.totalOrders}</strong>
            <p>Số đơn đã đặt tại HMECHA</p>
          </article>

          <article>
            <span>Tổng chi tiêu</span>
            <strong>{loading ? "..." : formatPrice(stats.totalSpent)}</strong>
            <p>Tổng giá trị các đơn hàng</p>
          </article>

          <article>
            <span>Đang xử lý</span>
            <strong>{loading ? "..." : stats.pendingOrders}</strong>
            <p>Đơn hàng chờ xác nhận/giao hàng</p>
          </article>
        </div>

        <div className="mainGrid">
          <section id="member" className="memberPanel">
            <div className="sectionHead">
              <span />
              <div>
                <h2>Thông tin thành viên</h2>
                <p>Thông tin cơ bản của tài khoản mua hàng.</p>
              </div>
            </div>

            <div className="memberCardClean">
              <div className="avatar">
                {profile.name.slice(0, 1).toUpperCase()}
              </div>

              <div>
                <h3>{profile.name}</h3>
                <p>Khách hàng HMECHA</p>
              </div>

              <dl>
                <div>
                  <dt>Email</dt>
                  <dd>{profile.email || "Chưa cập nhật"}</dd>
                </div>

                <div>
                  <dt>Số điện thoại</dt>
                  <dd>{profile.phone || "Chưa cập nhật"}</dd>
                </div>

                <div>
                  <dt>Địa chỉ</dt>
                  <dd>{profile.address || "Chưa cập nhật"}</dd>
                </div>
              </dl>
            </div>
          </section>

          <section id="orders" className="ordersPanelClean">
            <div className="sectionHead ordersHead">
              <span />
              <div>
                <h2>Đơn hàng gần đây</h2>
                <p>Kiểm tra trạng thái, sản phẩm và tổng tiền đơn hàng.</p>
              </div>
            </div>

            {loading ? (
              <div className="emptyState">Đang tải đơn hàng...</div>
            ) : orders.length === 0 ? (
              <div className="emptyState">
                <h3>Chưa có đơn hàng</h3>
                <p>Bạn chưa đặt đơn nào tại HMECHA.</p>
                <Link href="/">Mua sắm ngay</Link>
              </div>
            ) : (
              <div className="orderList">
                {orders.map((order) => (
                  <article className="orderCardClean" key={order.id}>
                    <header>
                      <div>
                        <h3>{order.code}</h3>
                        <p>Đặt ngày {formatDate(order.createdAt)}</p>
                      </div>

                      <span className={`status ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </header>

                    <div className="orderItems">
                      {order.items.length === 0 ? (
                        <div className="orderProduct">
                          <strong>Đơn hàng HMECHA</strong>
                          <span>{formatPrice(order.total)}</span>
                        </div>
                      ) : (
                        order.items.map((item, index) => (
                          <div className="orderProduct" key={`${order.id}-${index}`}>
                            <div>
                              <strong>{item.name}</strong>
                              <small>x{item.quantity}</small>
                            </div>

                            <span>{formatPrice(item.price * item.quantity)}</span>
                          </div>
                        ))
                      )}
                    </div>

                    <footer>
                      <span>Phương thức: {order.payment}</span>

                      <strong>
                        Tổng cộng: <b>{formatPrice(order.total)}</b>
                      </strong>
                    </footer>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </section>

      <style jsx>{`
        .hmAccountPage {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 280px 1fr;
          background: #f4f5f7;
          color: #111827;
          font-family: Arial, "Helvetica Neue", sans-serif;
        }

        .hmAccountPage * {
          box-sizing: border-box;
          font-family: Arial, "Helvetica Neue", sans-serif;
        }

        .hmSidebar {
          position: sticky;
          top: 0;
          height: 100vh;
          padding: 28px 22px;
          background: #ffffff;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }

        .hmLogo {
          color: #d32f2f;
          text-decoration: none;
          font-size: 26px;
          line-height: 1;
          font-weight: 950;
          letter-spacing: 3px;
        }

        .hmUserMini {
          padding: 16px;
          border-radius: 14px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
        }

        .hmUserMini strong {
          display: block;
          color: #111827;
          font-size: 15px;
          margin-bottom: 5px;
        }

        .hmUserMini span {
          display: block;
          color: #6b7280;
          font-size: 13px;
          line-height: 1.35;
          word-break: break-word;
        }

        .hmSidebar nav {
          display: grid;
          gap: 10px;
        }

        .hmSidebar nav a,
        .hmSidebar button {
          width: 100%;
          min-height: 46px;
          display: flex;
          align-items: center;
          padding: 0 14px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          color: #111827;
          text-decoration: none;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: 0.18s ease;
        }

        .hmSidebar nav a:hover,
        .hmSidebar nav a.active {
          color: #d32f2f;
          border-color: #f3b1b1;
          background: #fff5f5;
        }

        .hmSidebar button {
          margin-top: auto;
          justify-content: center;
          color: #ffffff;
          background: #d32f2f;
          border-color: #d32f2f;
        }

        .hmSidebar button:hover {
          background: #b91c1c;
          border-color: #b91c1c;
        }

        .hmContent {
          padding: 42px 48px 70px;
        }

        .hmTopbar {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
          margin-bottom: 28px;
        }

        .hmTopbar span {
          display: inline-block;
          margin-bottom: 10px;
          color: #d32f2f;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .hmTopbar h1 {
          margin: 0;
          color: #111827;
          font-size: clamp(34px, 4vw, 54px);
          line-height: 1.08;
          font-weight: 850;
          letter-spacing: -1px;
        }

        .hmTopbar p {
          max-width: 680px;
          margin: 16px 0 0;
          color: #4b5563;
          font-size: 16px;
          line-height: 1.7;
        }

        .shopBtn {
          flex: 0 0 auto;
          min-height: 46px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0 18px;
          border-radius: 12px;
          color: #ffffff;
          background: #d32f2f;
          text-decoration: none;
          font-weight: 900;
          box-shadow: 0 8px 18px rgba(211, 47, 47, 0.14);
        }

        .shopBtn:hover {
          background: #b91c1c;
        }

        .statGrid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px;
          margin-bottom: 24px;
        }

        .statGrid article,
        .memberPanel,
        .ordersPanelClean {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
        }

        .statGrid article {
          padding: 20px;
        }

        .statGrid span {
          display: block;
          color: #6b7280;
          font-size: 13px;
          font-weight: 800;
          margin-bottom: 10px;
        }

        .statGrid strong {
          display: block;
          color: #111827;
          font-size: 28px;
          line-height: 1.1;
          font-weight: 950;
          margin-bottom: 8px;
        }

        .statGrid p {
          margin: 0;
          color: #6b7280;
          font-size: 13px;
          line-height: 1.45;
        }

        .mainGrid {
          display: grid;
          grid-template-columns: 360px minmax(0, 1fr);
          gap: 24px;
          align-items: start;
        }

        .memberPanel,
        .ordersPanelClean {
          padding: 24px;
        }

        .sectionHead {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 20px;
          padding-bottom: 18px;
          border-bottom: 1px solid #edf0f3;
        }

        .sectionHead > span {
          width: 4px;
          height: 34px;
          border-radius: 99px;
          background: #d32f2f;
          flex: 0 0 auto;
        }

        .sectionHead h2 {
          margin: 0;
          color: #111827;
          font-size: 22px;
          line-height: 1.2;
          font-weight: 900;
          letter-spacing: -0.2px;
        }

        .sectionHead p {
          margin: 7px 0 0;
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
        }

        .memberCardClean {
          display: grid;
          gap: 18px;
        }

        .avatar {
          width: 66px;
          height: 66px;
          display: grid;
          place-items: center;
          border-radius: 18px;
          color: #ffffff;
          background: #d32f2f;
          font-size: 28px;
          font-weight: 950;
        }

        .memberCardClean h3 {
          margin: 0 0 5px;
          color: #111827;
          font-size: 22px;
          line-height: 1.25;
          font-weight: 900;
        }

        .memberCardClean p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .memberCardClean dl {
          display: grid;
          gap: 12px;
          margin: 0;
        }

        .memberCardClean dl div {
          padding: 14px;
          border-radius: 12px;
          background: #f9fafb;
          border: 1px solid #edf0f3;
        }

        .memberCardClean dt {
          margin-bottom: 5px;
          color: #6b7280;
          font-size: 12px;
          font-weight: 800;
        }

        .memberCardClean dd {
          margin: 0;
          color: #111827;
          font-size: 14px;
          font-weight: 800;
          word-break: break-word;
        }

        .orderList {
          display: grid;
          gap: 16px;
        }

        .orderCardClean {
          overflow: hidden;
          border-radius: 16px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
        }

        .orderCardClean header {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
          padding: 18px 20px;
          background: #fafafa;
          border-bottom: 1px solid #edf0f3;
        }

        .orderCardClean h3 {
          margin: 0 0 5px;
          color: #d32f2f;
          font-size: 15px;
          font-weight: 950;
        }

        .orderCardClean header p {
          margin: 0;
          color: #6b7280;
          font-size: 13px;
        }

        .status {
          flex: 0 0 auto;
          min-height: 30px;
          display: inline-flex;
          align-items: center;
          padding: 0 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 900;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          color: #374151;
        }

        .status.pending {
          color: #92400e;
          background: #fff8ed;
          border-color: #fed7aa;
        }

        .status.success {
          color: #166534;
          background: #ecfdf3;
          border-color: #bbf7d0;
        }

        .status.danger {
          color: #b91c1c;
          background: #fff5f5;
          border-color: #f3b1b1;
        }

        .orderItems {
          display: grid;
          gap: 0;
        }

        .orderProduct {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding: 15px 20px;
          border-bottom: 1px solid #f1f3f5;
        }

        .orderProduct:last-child {
          border-bottom: 0;
        }

        .orderProduct strong {
          display: block;
          color: #111827;
          font-size: 14px;
          line-height: 1.45;
          font-weight: 850;
        }

        .orderProduct small {
          display: inline-flex;
          margin-top: 6px;
          color: #6b7280;
          font-size: 12px;
          font-weight: 800;
        }

        .orderProduct span {
          flex: 0 0 auto;
          color: #ff5722;
          font-size: 14px;
          font-weight: 950;
          white-space: nowrap;
        }

        .orderCardClean footer {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding: 16px 20px;
          background: #fafafa;
          border-top: 1px solid #edf0f3;
          color: #6b7280;
          font-size: 14px;
        }

        .orderCardClean footer strong {
          color: #111827;
          font-weight: 850;
        }

        .orderCardClean footer b {
          color: #ff5722;
          font-weight: 950;
        }

        .emptyState {
          padding: 24px;
          border-radius: 14px;
          background: #f9fafb;
          border: 1px dashed #d1d5db;
          color: #6b7280;
        }

        .emptyState h3 {
          margin: 0 0 8px;
          color: #111827;
          font-size: 20px;
          font-weight: 900;
        }

        .emptyState p {
          margin: 0 0 16px;
          color: #6b7280;
          line-height: 1.6;
        }

        .emptyState a {
          color: #d32f2f;
          font-weight: 900;
          text-decoration: none;
        }

        @media (max-width: 1100px) {
          .hmAccountPage {
            grid-template-columns: 1fr;
          }

          .hmSidebar {
            position: static;
            height: auto;
            border-right: 0;
            border-bottom: 1px solid #e5e7eb;
          }

          .hmSidebar nav {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .hmSidebar button {
            margin-top: 0;
          }

          .hmContent {
            padding: 30px 20px 60px;
          }

          .mainGrid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 760px) {
          .hmTopbar {
            display: block;
          }

          .shopBtn {
            margin-top: 18px;
          }

          .statGrid {
            grid-template-columns: 1fr;
          }

          .hmSidebar nav {
            grid-template-columns: 1fr;
          }

          .memberPanel,
          .ordersPanelClean {
            padding: 18px;
          }

          .orderCardClean header,
          .orderCardClean footer,
          .orderProduct {
            flex-direction: column;
          }

          .orderProduct span {
            white-space: normal;
          }
        }
      `}</style>
    </main>
  );
}
