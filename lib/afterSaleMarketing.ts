import nodemailer from "nodemailer";
import { supabaseAdmin } from "./supabase-admin";

function formatPrice(price: number) {
  return Number(price || 0).toLocaleString("vi-VN") + "₫";
}

function normalizeStatus(status: string) {
  const value = String(status || "").trim();

  if (value === "Hoàn thành" || value === "completed") return "Hoàn thành";
  if (value === "Đã xác nhận" || value === "confirmed") return "Đã xác nhận";
  if (value === "Đang đóng gói" || value === "packing") return "Đang đóng gói";
  if (value === "Đang giao hàng" || value === "shipping") return "Đang giao hàng";
  if (value === "Đã hủy" || value === "cancelled" || value === "canceled") return "Đã hủy";
  if (value === "Chờ thanh toán" || value === "pending_payment") return "Chờ thanh toán";

  return value || "Đang xử lý";
}

function statusMessage(status: string) {
  const clean = normalizeStatus(status);

  if (clean === "Đã xác nhận") {
    return {
      title: "Đơn hàng của bạn đã được xác nhận",
      message:
        "HMECHA đã kiểm tra thông tin đơn hàng và bắt đầu xử lý. Shop sẽ chuẩn bị sản phẩm trong thời gian sớm nhất.",
      color: "#0891b2",
    };
  }

  if (clean === "Đang đóng gói") {
    return {
      title: "Đơn hàng đang được đóng gói",
      message:
        "Sản phẩm của bạn đang được HMECHA chuẩn bị và đóng gói cẩn thận trước khi giao cho đơn vị vận chuyển.",
      color: "#7c3aed",
    };
  }

  if (clean === "Đang giao hàng") {
    return {
      title: "Đơn hàng đang được giao",
      message:
        "Đơn hàng đã được chuyển sang giai đoạn giao hàng. Bạn vui lòng chú ý điện thoại để nhận hàng khi shipper liên hệ.",
      color: "#2563eb",
    };
  }

  if (clean === "Hoàn thành") {
    return {
      title: "Cảm ơn bạn đã mua hàng tại HMECHA",
      message:
        "Đơn hàng đã hoàn thành. HMECHA cảm ơn bạn đã tin tưởng và hy vọng sản phẩm sẽ giúp bộ sưu tập của bạn nổi bật hơn.",
      color: "#16a34a",
    };
  }

  if (clean === "Đã hủy") {
    return {
      title: "Đơn hàng đã được hủy",
      message:
        "Đơn hàng của bạn đã được cập nhật sang trạng thái hủy. Nếu đây là nhầm lẫn, bạn có thể liên hệ lại HMECHA để được hỗ trợ.",
      color: "#dc2626",
    };
  }

  return {
    title: "Trạng thái đơn hàng đã được cập nhật",
    message:
      "HMECHA vừa cập nhật trạng thái đơn hàng của bạn. Bạn có thể theo dõi thêm trong trang tài khoản.",
    color: "#0891b2",
  };
}

async function resolveCustomerId(order: any) {
  if (order.customer_id) return order.customer_id as string;

  const email = String(order.customer_email || "").trim().toLowerCase();
  if (!email) return null;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id,email")
    .eq("email", email)
    .maybeSingle();

  if (profile?.id) {
    await supabaseAdmin
      .from("orders")
      .update({ customer_id: profile.id })
      .eq("id", order.id);

    return profile.id as string;
  }

  return null;
}

function makeVoucherCode(orderId: string) {
  return "THANK-" + String(orderId || "").replace(/-/g, "").slice(0, 8).toUpperCase();
}

export async function createAfterSaleVoucher(orderId: string) {
  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error || !order) {
    return {
      created: false,
      voucher: null,
      message: error?.message || "Không tìm thấy đơn hàng để tạo voucher.",
    };
  }

  if (normalizeStatus(order.status) !== "Hoàn thành") {
    return {
      created: false,
      voucher: null,
      message: "Đơn chưa hoàn thành nên chưa tạo voucher hậu mãi.",
    };
  }

  const code = makeVoucherCode(orderId);

  const { data: existed } = await supabaseAdmin
    .from("coupons")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (existed) {
    return {
      created: false,
      voucher: existed,
      message: "Voucher hậu mãi đã tồn tại.",
    };
  }

  const customerId = await resolveCustomerId(order);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30);

  const { data: coupon, error: couponError } = await supabaseAdmin
    .from("coupons")
    .insert({
      code,
      title: "Cảm ơn sau mua - Giảm 10%",
      description:
        "Voucher tự động dành cho khách hàng sau khi đơn hàng hoàn thành. Áp dụng cho lần mua tiếp theo tại HMECHA.",
      discount_type: "percent",
      discount_value: 10,
      max_discount: 50000,
      min_order_amount: 300000,
      usage_limit: 1,
      used_count: 0,
      per_customer_limit: 1,
      customer_rule: "after_sale",
      required_completed_orders: 0,
      required_total_items: 0,
      required_points: 0,
      assigned_user_id: customerId,
      is_active: true,
      starts_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (couponError || !coupon) {
    return {
      created: false,
      voucher: null,
      message: couponError?.message || "Không tạo được voucher hậu mãi.",
    };
  }

  return {
    created: true,
    voucher: coupon,
    message: "Đã tạo voucher hậu mãi " + code + ".",
  };
}

export async function sendOrderStatusEmail(
  orderId: string,
  status: string,
  options?: {
    voucher?: any | null;
    rewardMessage?: string | null;
  }
) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
  const notifyEmail = process.env.ORDER_NOTIFY_EMAIL;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://hmecha.vercel.app";

  if (!gmailUser || !gmailAppPassword) {
    return {
      sent: false,
      skipped: true,
      message: "Thiếu cấu hình Gmail nên bỏ qua email trạng thái.",
    };
  }

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error || !order) {
    return {
      sent: false,
      skipped: true,
      message: error?.message || "Không tìm thấy đơn hàng để gửi email trạng thái.",
    };
  }

  const customerEmail = String(order.customer_email || "").trim();
  const toEmail = customerEmail || notifyEmail;

  if (!toEmail) {
    return {
      sent: false,
      skipped: true,
      message: "Đơn hàng không có email khách và không có email nhận thông báo.",
    };
  }

  const cleanStatus = normalizeStatus(status);
  const info = statusMessage(cleanStatus);
  const voucher = options?.voucher || null;
  const shortOrderId = String(order.id).slice(0, 8).toUpperCase();

  const voucherHtml =
    cleanStatus === "Hoàn thành" && voucher?.code
      ? `
        <div style="margin-top:22px;padding:18px;border-radius:16px;background:#fff7ed;border:1px solid #fed7aa;">
          <div style="font-size:13px;font-weight:800;color:#c2410c;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">
            Quà cảm ơn dành cho bạn
          </div>
          <div style="font-size:18px;font-weight:900;color:#111827;margin-bottom:8px;">
            Mã giảm giá lần sau: <span style="color:#ea580c;">${voucher.code}</span>
          </div>
          <div style="color:#7c2d12;line-height:1.7;">
            Giảm 10%, tối đa 50.000đ cho đơn từ 300.000đ. Mã có hiệu lực trong 30 ngày và chỉ dùng 1 lần.
          </div>
        </div>
      `
      : "";

  const reviewHtml =
    cleanStatus === "Hoàn thành"
      ? `
        <div style="margin-top:18px;padding:18px;border-radius:16px;background:#ecfeff;border:1px solid #a5f3fc;">
          <div style="font-size:17px;font-weight:900;color:#0e7490;margin-bottom:8px;">
            Bạn đánh giá sản phẩm giúp HMECHA nhé
          </div>
          <div style="color:#155e75;line-height:1.7;margin-bottom:14px;">
            Phản hồi của bạn giúp shop cải thiện dịch vụ và giúp khách hàng mới yên tâm hơn khi mua mô hình tại HMECHA.
          </div>
          <a href="${siteUrl}/tai-khoan/don-hang/${order.id}" style="display:inline-block;background:#0891b2;color:white;text-decoration:none;font-weight:800;padding:11px 16px;border-radius:12px;">
            Xem đơn hàng & đánh giá
          </a>
        </div>
      `
      : "";

  const suggestHtml =
    cleanStatus === "Hoàn thành"
      ? `
        <div style="margin-top:18px;padding:18px;border-radius:16px;background:#f8fafc;border:1px solid #e5e7eb;">
          <div style="font-size:17px;font-weight:900;color:#111827;margin-bottom:8px;">
            Gợi ý cho lần mua tiếp theo
          </div>
          <div style="color:#475569;line-height:1.7;">
            Nếu bạn đang hoàn thiện bộ sưu tập, có thể xem thêm kìm cắt, decal, đế trưng bày, phụ kiện custom hoặc các mô hình cùng dòng.
          </div>
          <a href="${siteUrl}/products" style="display:inline-block;margin-top:14px;background:#111827;color:white;text-decoration:none;font-weight:800;padding:11px 16px;border-radius:12px;">
            Xem thêm sản phẩm
          </a>
        </div>
      `
      : "";

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f7fb;padding:28px;color:#111827;">
    <div style="max-width:720px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:linear-gradient(135deg,#050816,#111827);padding:26px 30px;color:white;">
        <div style="font-size:13px;letter-spacing:2px;color:#00e5ff;font-weight:800;">HMECHA STORE</div>
        <h1 style="margin:10px 0 6px;font-size:27px;line-height:1.25;">${info.title}</h1>
        <p style="margin:0;color:#dce6ff;font-size:15px;line-height:1.7;">${info.message}</p>
      </div>

      <div style="padding:28px 30px;">
        <p style="font-size:16px;margin:0 0 18px;">
          Xin chào <b>${order.customer_name || "bạn"}</b>,
        </p>

        <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-bottom:22px;">
          <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;padding:14px;">
            <div style="font-size:12px;color:#64748b;margin-bottom:6px;">Mã đơn hàng</div>
            <div style="font-weight:900;color:#0f172a;">#${shortOrderId}</div>
          </div>

          <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;padding:14px;">
            <div style="font-size:12px;color:#64748b;margin-bottom:6px;">Trạng thái mới</div>
            <div style="font-weight:900;color:${info.color};">${cleanStatus}</div>
          </div>

          <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;padding:14px;">
            <div style="font-size:12px;color:#64748b;margin-bottom:6px;">Tổng thanh toán</div>
            <div style="font-weight:900;color:#e11d48;font-size:18px;">${formatPrice(order.total)}</div>
          </div>

          <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;padding:14px;">
            <div style="font-size:12px;color:#64748b;margin-bottom:6px;">Hỗ trợ</div>
            <div style="font-weight:900;color:#0f172a;">HMECHA Store</div>
          </div>
        </div>

        ${voucherHtml}
        ${reviewHtml}
        ${suggestHtml}

        <p style="margin:24px 0 0;color:#475569;line-height:1.7;">
          Nếu bạn cần hỗ trợ thêm về đơn hàng, vui lòng phản hồi lại email này để HMECHA kiểm tra.
        </p>

        <p style="margin:18px 0 0;color:#111827;font-weight:700;">
          Trân trọng,<br/>
          HMECHA Store
        </p>
      </div>

      <div style="background:#f8fafc;border-top:1px solid #e5e7eb;padding:18px 30px;color:#64748b;font-size:13px;line-height:1.6;">
        Email này được gửi tự động khi trạng thái đơn hàng của bạn được cập nhật tại HMECHA.
      </div>
    </div>
  </div>
  `;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });

  await transporter.sendMail({
    from: `"HMECHA Store" <${gmailUser}>`,
    to: toEmail,
    bcc: customerEmail && notifyEmail && notifyEmail !== toEmail ? notifyEmail : undefined,
    replyTo: customerEmail || gmailUser,
    subject: `[HMECHA] Cập nhật đơn hàng #${shortOrderId}: ${cleanStatus}`,
    html,
  });

  return {
    sent: true,
    skipped: false,
    message: "Đã gửi email cập nhật trạng thái đơn hàng.",
  };
}