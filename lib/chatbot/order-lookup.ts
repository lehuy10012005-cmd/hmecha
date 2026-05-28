import { supabase } from "@/lib/supabase";
import { extractOrderId, extractPhone } from "./intent";

type OrderItem = {
  product_name: string;
  product_price: number;
  quantity: number;
};

type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  payment_method: string;
  payment_status: string | null;
  status: string;
  total: number;
  created_at: string;
  order_items?: OrderItem[];
};

function formatPrice(price: number) {
  return Number(price || 0).toLocaleString("vi-VN") + "₫";
}

function maskPhone(phone: string) {
  if (!phone) return "";
  return phone.slice(0, 3) + "***" + phone.slice(-3);
}

export async function lookupOrderForChat(message: string) {
  const orderId = extractOrderId(message);
  const phone = extractPhone(message);

  if (!orderId || !phone) {
    return "Để kiểm tra đơn hàng an toàn, bạn gửi giúp mình mã đơn và số điện thoại đã đặt nhé. Ví dụ: “Kiểm tra đơn <mã đơn> - 09xxxxxxxx”.";
  }

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      customer_name,
      customer_phone,
      payment_method,
      payment_status,
      status,
      total,
      created_at,
      order_items (
        product_name,
        product_price,
        quantity
      )
    `
    )
    .eq("id", orderId)
    .eq("customer_phone", phone)
    .maybeSingle();

  if (error) {
    console.error("Chatbot order lookup error:", error);
    return "Mình chưa kiểm tra được đơn hàng do lỗi kết nối dữ liệu. Bạn thử lại sau hoặc liên hệ shop để được hỗ trợ nhanh nhé.";
  }

  const order = data as Order | null;

  if (!order) {
    return "Mình chưa tìm thấy đơn hàng khớp với mã đơn và số điện thoại này. Bạn kiểm tra lại mã đơn hoặc số điện thoại đã nhập nhé.";
  }

  const items = order.order_items?.length
    ? order.order_items
        .slice(0, 4)
        .map((item) => `- ${item.quantity} × ${item.product_name}`)
        .join("\n")
    : "- Đang cập nhật sản phẩm trong đơn";

  const method = order.payment_method?.toLowerCase();
  const paymentText = method === "cod" ? "COD" : "VNPAY/chuyển khoản";
  const paidText = order.payment_status ? ` (${order.payment_status})` : "";

  return `Mình tìm thấy đơn của ${order.customer_name} (${maskPhone(
    order.customer_phone
  )}):\nTrạng thái: ${order.status}\nThanh toán: ${paymentText}${paidText}\nTổng tiền: ${formatPrice(
    order.total
  )}\nSản phẩm:\n${items}\n\nNếu cần đổi thông tin giao hàng, bạn nên liên hệ shop sớm trước khi đơn được giao.`;
}