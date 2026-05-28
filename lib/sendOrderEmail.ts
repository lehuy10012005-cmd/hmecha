import nodemailer from "nodemailer";
import { supabase } from "./supabase";

function formatPrice(price: number) {
  return Number(price || 0).toLocaleString("vi-VN") + "₫";
}

export async function sendOrderEmail(orderId: string) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
  const notifyEmail = process.env.ORDER_NOTIFY_EMAIL;

  if (!gmailUser || !gmailAppPassword || !notifyEmail) {
    throw new Error("Thiếu cấu hình Gmail trong .env.local");
  }

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    throw new Error("Không tìm thấy đơn hàng để gửi email.");
  }

  if (order.email_sent) {
    return {
      skipped: true,
      message: "Email đã được gửi trước đó.",
    };
  }

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId);

  if (itemsError) {
    throw new Error("Không lấy được sản phẩm trong đơn.");
  }

  const paymentMethod =
    order.payment_method === "vnpay"
      ? "VNPAY / QR"
      : order.payment_method === "cod"
      ? "COD - Thanh toán khi nhận hàng"
      : order.payment_method || "Chưa rõ";

  const productRows = (items || [])
    .map(
      (item: any) => `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;">
            ${item.product_name}
          </td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:center;">
            ${item.quantity}
          </td>
          <td style="padding:10px;border-bottom:1px solid #e5e7eb;text-align:right;">
            ${formatPrice(item.product_price)}
          </td>
        </tr>
      `
    )
    .join("");

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f7fb;padding:28px;color:#111827;">
    <div style="max-width:760px;margin:auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e5e7eb;">
      
      <div style="background:linear-gradient(135deg,#050816,#111827);padding:26px 30px;color:white;">
        <div style="font-size:13px;letter-spacing:2px;color:#00e5ff;font-weight:800;">
          HMECHA STORE
        </div>
        <h1 style="margin:10px 0 6px;font-size:28px;line-height:1.25;">
          Cảm ơn bạn đã đặt hàng tại HMECHA
        </h1>
        <p style="margin:0;color:#dce6ff;font-size:15px;">
          Đơn hàng của bạn đã được ghi nhận. HMECHA sẽ kiểm tra và xử lý trong thời gian sớm nhất.
        </p>
      </div>

      <div style="padding:28px 30px;">
        <p style="font-size:16px;margin:0 0 18px;">
          Xin chào <b>${order.customer_name || "bạn"}</b>,
        </p>

        <p style="line-height:1.7;margin:0 0 22px;color:#374151;">
          HMECHA đã nhận được đơn hàng của bạn. Dưới đây là thông tin chi tiết đơn hàng để bạn tiện theo dõi.
        </p>

        <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-bottom:26px;">
          <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;padding:14px;">
            <div style="font-size:12px;color:#64748b;margin-bottom:6px;">Mã đơn hàng</div>
            <div style="font-weight:800;color:#0f172a;">#${String(order.id).slice(0, 8).toUpperCase()}</div>
          </div>

          <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;padding:14px;">
            <div style="font-size:12px;color:#64748b;margin-bottom:6px;">Trạng thái</div>
            <div style="font-weight:800;color:#0891b2;">${order.status || "Đang xử lý"}</div>
          </div>

          <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;padding:14px;">
            <div style="font-size:12px;color:#64748b;margin-bottom:6px;">Phương thức thanh toán</div>
            <div style="font-weight:800;color:#0f172a;">${paymentMethod}</div>
          </div>

          <div style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:14px;padding:14px;">
            <div style="font-size:12px;color:#64748b;margin-bottom:6px;">Tổng thanh toán</div>
            <div style="font-weight:900;color:#e11d48;font-size:18px;">${formatPrice(order.total)}</div>
          </div>
        </div>

        <h2 style="font-size:19px;margin:0 0 14px;color:#111827;">Thông tin nhận hàng</h2>

        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;padding:18px;margin-bottom:26px;line-height:1.8;">
          <div><b>Khách hàng:</b> ${order.customer_name || ""}</div>
          <div><b>Số điện thoại:</b> ${order.customer_phone || ""}</div>
          <div><b>Email:</b> ${order.customer_email || "Không có"}</div>
          <div><b>Địa chỉ:</b> ${order.customer_address || ""}</div>
          <div><b>Ghi chú:</b> ${order.note || "Không có"}</div>
        </div>

        <h2 style="font-size:19px;margin:0 0 14px;color:#111827;">Sản phẩm đã đặt</h2>

        <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
          <thead>
            <tr style="background:#0f172a;color:white;">
              <th style="padding:13px;text-align:left;font-size:14px;">Sản phẩm</th>
              <th style="padding:13px;text-align:center;font-size:14px;">Số lượng</th>
              <th style="padding:13px;text-align:right;font-size:14px;">Đơn giá</th>
            </tr>
          </thead>
          <tbody>
            ${productRows}
          </tbody>
        </table>

        <div style="margin-top:24px;padding:18px;border-radius:14px;background:#ecfeff;border:1px solid #a5f3fc;">
          <div style="font-weight:800;color:#0e7490;margin-bottom:8px;">
            Bước tiếp theo
          </div>
          <div style="color:#155e75;line-height:1.7;">
            ${
              order.payment_method === "vnpay"
                ? "Đơn hàng đã được thanh toán qua VNPAY. HMECHA sẽ chuẩn bị sản phẩm và xử lý giao hàng sớm nhất."
                : "HMECHA sẽ liên hệ xác nhận đơn hàng trước khi giao. Bạn vui lòng giữ điện thoại để shop có thể liên hệ khi cần."
            }
          </div>
        </div>

        <p style="margin:26px 0 0;color:#475569;line-height:1.7;">
          Nếu thông tin đơn hàng có sai sót, bạn có thể phản hồi lại email này để HMECHA hỗ trợ điều chỉnh.
        </p>

        <p style="margin:18px 0 0;color:#111827;font-weight:700;">
          Trân trọng,<br/>
          HMECHA Store
        </p>
      </div>

      <div style="background:#f8fafc;border-top:1px solid #e5e7eb;padding:18px 30px;color:#64748b;font-size:13px;line-height:1.6;">
        Email này được gửi tự động sau khi bạn đặt hàng tại HMECHA. 
        Vui lòng không chia sẻ thông tin đơn hàng cho người khác nếu không cần thiết.
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
console.log("GMAIL USER:", gmailUser);
console.log("ORDER NOTIFY EMAIL:", notifyEmail);
console.log("SENDING EMAIL FOR ORDER:", orderId);
 const customerEmail = order.customer_email?.trim();

await transporter.sendMail({
  from: `"HMECHA Website" <${gmailUser}>`,
  to: customerEmail || notifyEmail,
  bcc: notifyEmail,
  replyTo: customerEmail || gmailUser,
  subject: `[HMECHA] Xác nhận đơn hàng #${String(order.id)
    .slice(0, 8)
    .toUpperCase()}`,
  html,
});
console.log("EMAIL SENT SUCCESSFULLY");
  await supabase
    .from("orders")
    .update({
      email_sent: true,
      email_sent_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  return {
    skipped: false,
    message: "Đã gửi email đơn hàng.",
  };
}