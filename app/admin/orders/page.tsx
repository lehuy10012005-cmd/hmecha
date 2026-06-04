"use client";

import { useEffect, useState } from "react";

type OrderItem = {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
};

type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_address: string;
  note: string;
  payment_method: string;
  subtotal: number;
  shipping_fee: number;
  total: number;
  status: string;
  created_at: string;
  order_items: OrderItem[];
};

function formatPrice(price: number) {
  return price.toLocaleString("vi-VN") + "₫";
}

function formatDate(date: string) {
  return new Date(date).toLocaleString("vi-VN");
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    setLoading(true);
    const response = await fetch("/api/admin/orders", { cache: "no-store" });
    const result = await response.json();
    if (!response.ok) {
      alert("Lỗi tải đơn hàng: " + (result.message || "Không rõ lỗi."));
      setLoading(false);
      return;
    }
    setOrders(result.orders || []);
    setLoading(false);
  }

  async function updateStatus(orderId: string, status: string) {
    const response = await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    const result = await response.json();
    if (!response.ok) {
      alert("Lỗi cập nhật trạng thái: " + (result.message || "Không rõ lỗi."));
      return;
    }
    loadOrders();
  }

  useEffect(() => {
    loadOrders();
  }, []);

  return (
    <main className="ordersPage">
      <div className="top">
        <p>HMECHA ADMIN</p>
        <h1>Quản lý đơn hàng</h1>
        <span>Xem đơn khách đặt và cập nhật trạng thái xử lý.</span>
      </div>

      {loading ? (
        <section className="emptyBox">Đang tải đơn hàng...</section>
      ) : orders.length === 0 ? (
        <section className="emptyBox">
          <h2>Chưa có đơn hàng nào</h2>
          <p>Khi khách đặt hàng ở checkout, đơn sẽ hiện ở đây.</p>
        </section>
      ) : (
        <section className="ordersList">
          {orders.map((order) => (
            <article className="orderCard" key={order.id}>
              <div className="orderHead">
                <div>
                  <h2>{order.customer_name}</h2>
                  <p>{formatDate(order.created_at)}</p>
                </div>

                <select
                  value={order.status}
                  onChange={(e) => updateStatus(order.id, e.target.value)}
                >
                  <option>Chờ xác nhận</option>
                  <option>Đã xác nhận</option>
                  <option>Đang giao</option>
                  <option>Hoàn thành</option>
                  <option>Đã hủy</option>
                </select>
              </div>

              <div className="customerInfo">
                <div>
                  <b>Số điện thoại</b>
                  <span>{order.customer_phone}</span>
                </div>

                <div>
                  <b>Email</b>
                  <span>{order.customer_email || "Không có"}</span>
                </div>

                <div>
                  <b>Địa chỉ</b>
                  <span>{order.customer_address}</span>
                </div>

                <div>
                  <b>Thanh toán</b>
                  <span>{order.payment_method === "cod" ? "COD" : "Chuyển khoản"}</span>
                </div>
              </div>

              {order.note && (
                <div className="note">
                  <b>Ghi chú:</b> {order.note}
                </div>
              )}

              <div className="items">
                <h3>Sản phẩm trong đơn</h3>

                {order.order_items?.map((item) => (
                  <div className="item" key={item.id}>
                    <span>{item.product_name}</span>
                    <b>
                      {item.quantity} × {formatPrice(item.product_price)}
                    </b>
                  </div>
                ))}
              </div>

              <div className="summary">
                <div>
                  <span>Tạm tính</span>
                  <b>{formatPrice(order.subtotal)}</b>
                </div>

                <div>
                  <span>Phí vận chuyển</span>
                  <b>
                    {order.shipping_fee === 0
                      ? "Miễn phí"
                      : formatPrice(order.shipping_fee)}
                  </b>
                </div>

                <div className="total">
                  <span>Tổng cộng</span>
                  <b>{formatPrice(order.total)}</b>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      <style>{`
        .ordersPage {
          max-width: 1180px;
        }

        .top {
          margin-bottom: 28px;
        }

        .top p {
          margin: 0;
          color: #00e5ff;
          font-weight: 950;
          letter-spacing: 2px;
        }

        .top h1 {
          margin: 8px 0;
          font-size: 44px;
          line-height: 1.1;
        }

        .top span {
          color: #b8c4e6;
        }

        .emptyBox {
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(0,229,255,.2);
          border-radius: 22px;
          padding: 34px;
          color: #dce6ff;
          text-align: center;
        }

        .emptyBox h2 {
          margin-top: 0;
          color: white;
        }

        .ordersList {
          display: grid;
          gap: 20px;
        }

        .orderCard {
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(0,229,255,.2);
          border-radius: 22px;
          overflow: hidden;
          box-shadow: 0 0 34px rgba(124,77,255,.12);
        }

        .orderHead {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: center;
          padding: 20px 22px;
          border-bottom: 1px solid rgba(255,255,255,.1);
          background: rgba(0,0,0,.2);
        }

        .orderHead h2 {
          margin: 0 0 6px;
          font-size: 24px;
        }

        .orderHead p {
          margin: 0;
          color: #9fb0d8;
        }

        select {
          border: 1px solid rgba(0,229,255,.28);
          outline: none;
          border-radius: 12px;
          padding: 12px 14px;
          background: white;
          color: #111827;
          font-weight: 900;
        }

        .customerInfo {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          padding: 20px 22px;
          border-bottom: 1px solid rgba(255,255,255,.1);
        }

        .customerInfo div {
          display: grid;
          gap: 5px;
        }

        .customerInfo b {
          color: #00e5ff;
        }

        .customerInfo span {
          color: #dce6ff;
        }

        .note {
          padding: 16px 22px;
          color: #dce6ff;
          border-bottom: 1px solid rgba(255,255,255,.1);
        }

        .note b {
          color: #ff78d2;
        }

        .items {
          padding: 20px 22px;
          border-bottom: 1px solid rgba(255,255,255,.1);
        }

        .items h3 {
          margin: 0 0 14px;
          color: #00e5ff;
        }

        .item {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding: 12px 0;
          border-top: 1px solid rgba(255,255,255,.08);
          color: #dce6ff;
        }

        .item b {
          color: #ff78d2;
          white-space: nowrap;
        }

        .summary {
          padding: 20px 22px;
          display: grid;
          gap: 12px;
        }

        .summary div {
          display: flex;
          justify-content: space-between;
          color: #dce6ff;
        }

        .summary .total {
          padding-top: 14px;
          border-top: 1px solid rgba(255,255,255,.12);
          font-size: 22px;
        }

        .summary .total b {
          color: #00e5ff;
          font-size: 28px;
        }

        @media (max-width: 760px) {
          .orderHead {
            display: block;
          }

          .orderHead select {
            margin-top: 14px;
            width: 100%;
          }

          .customerInfo {
            grid-template-columns: 1fr;
          }

          .item {
            display: block;
          }

          .item b {
            display: block;
            margin-top: 6px;
          }
        }
      `}</style>
    </main>
  );
}