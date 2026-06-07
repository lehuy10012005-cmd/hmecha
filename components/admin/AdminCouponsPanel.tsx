"use client";

import { useEffect, useMemo, useState } from "react";

type Coupon = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  max_discount: number | null;
  min_order_amount: number;
  usage_limit: number | null;
  used_count: number;
  per_customer_limit: number;
  customer_rule: string;
  required_completed_orders: number;
  required_total_items: number;
  required_points: number;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
};

const emptyForm = {
  id: "",
  code: "",
  title: "",
  description: "",
  discount_type: "fixed",
  discount_value: 0,
  max_discount: "",
  min_order_amount: 0,
  usage_limit: "",
  per_customer_limit: 1,
  customer_rule: "public",
  required_completed_orders: 0,
  required_total_items: 0,
  required_points: 0,
  is_active: true,
  starts_at: "",
  expires_at: "",
};

function money(value: number | string | null | undefined) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

function typeLabel(type: string) {
  if (type === "percent") return "Giảm phần trăm";
  if (type === "free_shipping") return "Miễn phí ship";
  return "Giảm tiền";
}

function ruleLabel(rule: string) {
  if (rule === "new_customer") return "Khách mới";
  if (rule === "loyal_customer") return "Khách thân thiết";
  if (rule === "points_exchange") return "Đổi điểm";
  return "Công khai";
}

export default function AdminCouponsPanel() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [form, setForm] = useState<any>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadCoupons() {
    setLoading(true);

    const response = await fetch("/api/admin/coupons", { cache: "no-store" });
    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Không tải được danh sách mã.");
      setLoading(false);
      return;
    }

    setCoupons(data.coupons || []);
    setLoading(false);
  }

  useEffect(() => {
    loadCoupons();
  }, []);

  const stats = useMemo(() => {
    return {
      total: coupons.length,
      active: coupons.filter((item) => item.is_active).length,
      inactive: coupons.filter((item) => !item.is_active).length,
      used: coupons.reduce((sum, item) => sum + Number(item.used_count || 0), 0),
    };
  }, [coupons]);

  function updateField(field: string, value: any) {
    setForm((current: any) => ({
      ...current,
      [field]: value,
    }));
  }

  function editCoupon(coupon: Coupon) {
    setForm({
      id: coupon.id,
      code: coupon.code,
      title: coupon.title,
      description: coupon.description || "",
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      max_discount: coupon.max_discount || "",
      min_order_amount: coupon.min_order_amount,
      usage_limit: coupon.usage_limit || "",
      per_customer_limit: coupon.per_customer_limit,
      customer_rule: coupon.customer_rule,
      required_completed_orders: coupon.required_completed_orders,
      required_total_items: coupon.required_total_items,
      required_points: coupon.required_points,
      is_active: coupon.is_active,
      starts_at: coupon.starts_at || "",
      expires_at: coupon.expires_at || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveCoupon(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);

    const response = await fetch("/api/admin/coupons", {
      method: form.id ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await response.json();
    setSaving(false);

    if (!response.ok) {
      alert(data.message || "Không lưu được mã giảm giá.");
      return;
    }

    alert(data.message || "Đã lưu mã giảm giá.");
    setForm(emptyForm);
    loadCoupons();
  }

  async function disableCoupon(id: string) {
    if (!confirm("Tắt mã giảm giá này?")) return;

    const response = await fetch("/api/admin/coupons", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Không tắt được mã.");
      return;
    }

    loadCoupons();
  }

  return (
    <div className="couponAdmin">
      <section className="hero">
        <div>
          <p>HMECHA ADMIN</p>
          <h1>Mã giảm giá</h1>
          <span>Tạo, chỉnh sửa và theo dõi voucher dùng trong checkout.</span>
        </div>
      </section>

      <section className="stats">
        <div>
          <span>Tổng mã</span>
          <strong>{stats.total}</strong>
        </div>
        <div>
          <span>Đang bật</span>
          <strong>{stats.active}</strong>
        </div>
        <div>
          <span>Đã tắt</span>
          <strong>{stats.inactive}</strong>
        </div>
        <div>
          <span>Lượt dùng</span>
          <strong>{stats.used}</strong>
        </div>
      </section>

      <section className="formCard">
        <h2>{form.id ? "Sửa mã giảm giá" : "Tạo mã giảm giá mới"}</h2>

        <form onSubmit={saveCoupon} className="couponForm">
          <label>
            <span>Mã giảm giá</span>
            <input
              value={form.code}
              onChange={(event) => updateField("code", event.target.value.toUpperCase())}
              placeholder="VD: MECHA50"
            />
          </label>

          <label>
            <span>Tên ưu đãi</span>
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              placeholder="VD: Giảm 50K"
            />
          </label>

          <label className="wide">
            <span>Mô tả</span>
            <input
              value={form.description}
              onChange={(event) => updateField("description", event.target.value)}
              placeholder="VD: Áp dụng cho đơn từ 700.000đ"
            />
          </label>

          <label>
            <span>Loại giảm</span>
            <select
              value={form.discount_type}
              onChange={(event) => updateField("discount_type", event.target.value)}
            >
              <option value="fixed">Giảm tiền</option>
              <option value="percent">Giảm phần trăm</option>
              <option value="free_shipping">Miễn phí ship</option>
            </select>
          </label>

          <label>
            <span>Giá trị giảm</span>
            <input
              type="number"
              value={form.discount_value}
              onChange={(event) => updateField("discount_value", Number(event.target.value))}
            />
          </label>

          <label>
            <span>Giảm tối đa</span>
            <input
              type="number"
              value={form.max_discount}
              onChange={(event) => updateField("max_discount", event.target.value)}
              placeholder="Bỏ trống nếu không giới hạn"
            />
          </label>

          <label>
            <span>Đơn tối thiểu</span>
            <input
              type="number"
              value={form.min_order_amount}
              onChange={(event) => updateField("min_order_amount", Number(event.target.value))}
            />
          </label>

          <label>
            <span>Giới hạn tổng lượt</span>
            <input
              type="number"
              value={form.usage_limit}
              onChange={(event) => updateField("usage_limit", event.target.value)}
              placeholder="Bỏ trống nếu không giới hạn"
            />
          </label>

          <label>
            <span>Mỗi khách dùng</span>
            <input
              type="number"
              value={form.per_customer_limit}
              onChange={(event) => updateField("per_customer_limit", Number(event.target.value))}
            />
          </label>

          <label>
            <span>Nhóm khách</span>
            <select
              value={form.customer_rule}
              onChange={(event) => updateField("customer_rule", event.target.value)}
            >
              <option value="public">Công khai</option>
              <option value="new_customer">Khách mới</option>
              <option value="loyal_customer">Khách thân thiết</option>
              <option value="points_exchange">Đổi điểm</option>
            </select>
          </label>

          <label>
            <span>Cần đơn hoàn thành</span>
            <input
              type="number"
              value={form.required_completed_orders}
              onChange={(event) =>
                updateField("required_completed_orders", Number(event.target.value))
              }
            />
          </label>

          <label>
            <span>Cần sản phẩm đã mua</span>
            <input
              type="number"
              value={form.required_total_items}
              onChange={(event) => updateField("required_total_items", Number(event.target.value))}
            />
          </label>

          <label>
            <span>Cần điểm</span>
            <input
              type="number"
              value={form.required_points}
              onChange={(event) => updateField("required_points", Number(event.target.value))}
            />
          </label>

          <label>
            <span>Trạng thái</span>
            <select
              value={form.is_active ? "true" : "false"}
              onChange={(event) => updateField("is_active", event.target.value === "true")}
            >
              <option value="true">Đang bật</option>
              <option value="false">Tạm tắt</option>
            </select>
          </label>

          <div className="actions wide">
            <button type="submit" disabled={saving}>
              {saving ? "Đang lưu..." : form.id ? "Lưu thay đổi" : "Tạo mã"}
            </button>

            {form.id ? (
              <button type="button" className="ghost" onClick={() => setForm(emptyForm)}>
                Hủy sửa
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="listCard">
        <h2>Danh sách mã giảm giá</h2>

        {loading ? (
          <p className="empty">Đang tải dữ liệu...</p>
        ) : coupons.length === 0 ? (
          <p className="empty">Chưa có mã giảm giá.</p>
        ) : (
          <div className="couponList">
            {coupons.map((coupon) => (
              <article key={coupon.id} className="couponRow">
                <div>
                  <div className="codeLine">
                    <strong>{coupon.code}</strong>
                    <span className={coupon.is_active ? "on" : "off"}>
                      {coupon.is_active ? "Đang bật" : "Đã tắt"}
                    </span>
                  </div>

                  <h3>{coupon.title}</h3>
                  <p>{coupon.description || "Không có mô tả."}</p>

                  <div className="meta">
                    <span>{typeLabel(coupon.discount_type)}</span>
                    <span>
                      {coupon.discount_type === "percent"
                        ? coupon.discount_value + "%"
                        : money(coupon.discount_value)}
                    </span>
                    <span>Đơn từ {money(coupon.min_order_amount)}</span>
                    <span>{ruleLabel(coupon.customer_rule)}</span>
                    <span>Đã dùng {coupon.used_count || 0}</span>
                  </div>
                </div>

                <div className="rowActions">
                  <button type="button" onClick={() => editCoupon(coupon)}>
                    Sửa
                  </button>
                  <button type="button" className="danger" onClick={() => disableCoupon(coupon.id)}>
                    Tắt
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <style>{`
        .couponAdmin {
          color: #ffffff;
          display: grid;
          gap: 22px;
        }

        .hero,
        .formCard,
        .listCard,
        .stats div,
        .couponRow {
          border: 1px solid rgba(0, 229, 255, 0.2);
          background:
            radial-gradient(circle at 0% 0%, rgba(124,77,255,.14), transparent 34%),
            rgba(7, 12, 32, 0.84);
          box-shadow: 0 18px 42px rgba(0,0,0,.22);
        }

        .hero {
          border-radius: 24px;
          padding: 30px;
        }

        .hero p {
          color: #00e5ff;
          font-weight: 950;
          letter-spacing: 4px;
          margin: 0 0 8px;
        }

        .hero h1 {
          margin: 0;
          font-size: clamp(38px, 5vw, 64px);
          line-height: 1.05;
        }

        .hero span {
          display: block;
          color: #c5d2f2;
          margin-top: 12px;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
        }

        .stats div {
          border-radius: 18px;
          padding: 18px;
        }

        .stats span {
          color: #9fb0d8;
          display: block;
          margin-bottom: 8px;
        }

        .stats strong {
          color: #00e5ff;
          font-size: 30px;
        }

        .formCard,
        .listCard {
          border-radius: 22px;
          padding: 22px;
        }

        .formCard h2,
        .listCard h2 {
          margin: 0 0 18px;
          font-size: 28px;
        }

        .couponForm {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .couponForm label {
          display: grid;
          gap: 8px;
        }

        .couponForm label.wide,
        .actions.wide {
          grid-column: 1 / -1;
        }

        .couponForm span {
          color: #c5d2f2;
          font-weight: 850;
        }

        .couponForm input,
        .couponForm select {
          min-height: 48px;
          border-radius: 13px;
          border: 1px solid rgba(0, 229, 255, 0.22);
          background: rgba(5, 8, 22, 0.9);
          color: #ffffff;
          padding: 0 14px;
          outline: none;
        }

        .actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .actions button,
        .rowActions button {
          min-height: 44px;
          border: 0;
          border-radius: 12px;
          padding: 0 18px;
          font-weight: 950;
          cursor: pointer;
          color: #061020;
          background: linear-gradient(135deg, #7c4dff, #00e5ff);
        }

        .actions button.ghost {
          color: #ffffff;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.16);
        }

        .couponList {
          display: grid;
          gap: 12px;
        }

        .couponRow {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          border-radius: 18px;
          padding: 18px;
        }

        .codeLine {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .codeLine strong {
          color: #00e5ff;
          font-size: 22px;
        }

        .codeLine span {
          border-radius: 999px;
          padding: 6px 10px;
          font-size: 12px;
          font-weight: 950;
        }

        .codeLine .on {
          color: #061020;
          background: #00e5ff;
        }

        .codeLine .off {
          color: #ffffff;
          background: rgba(255,255,255,.16);
        }

        .couponRow h3 {
          margin: 10px 0 6px;
        }

        .couponRow p {
          color: #c5d2f2;
          margin: 0 0 12px;
        }

        .meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .meta span {
          color: #dce6ff;
          border-radius: 999px;
          padding: 7px 10px;
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(0,229,255,.14);
          font-size: 13px;
        }

        .rowActions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .rowActions button.danger {
          background: linear-gradient(135deg, #ff4fd8, #7c4dff);
          color: #ffffff;
        }

        .empty {
          color: #c5d2f2;
        }

        @media (max-width: 980px) {
          .stats,
          .couponForm {
            grid-template-columns: 1fr;
          }

          .couponRow {
            flex-direction: column;
          }

          .rowActions {
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
