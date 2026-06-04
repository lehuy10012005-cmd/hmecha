import { NextResponse } from "next/server";
import crypto from "crypto";
import qs from "qs";
import { createAuthServerClient } from "../../../../lib/supabase-auth/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";

type CartItem = { id: string; name: string; slug: string; price: number; image: string; quantity: number };
const isUuid = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
function formatDate(date: Date) { const pad = (n: number) => String(n).padStart(2, "0"); return date.getFullYear().toString() + pad(date.getMonth()+1) + pad(date.getDate()) + pad(date.getHours()) + pad(date.getMinutes()) + pad(date.getSeconds()); }
function sortObject(obj: Record<string, string | number>) { const sorted: Record<string,string> = {}; Object.keys(obj).sort().forEach(key => { sorted[key] = encodeURIComponent(String(obj[key])).replace(/%20/g, "+"); }); return sorted; }
export async function POST(request: Request) {
  try {
    const auth = await createAuthServerClient(); const { data: { user } } = await auth.auth.getUser();
    if (!user) return NextResponse.json({ message: "Bạn cần đăng nhập trước khi thanh toán." }, { status: 401 });
    const body = await request.json(); const cart: CartItem[] = body.cart || []; const customer = body.customer || {};
    if (!cart.length) return NextResponse.json({ message: "Giỏ hàng đang trống." }, { status: 400 });
    if (!customer.name || !customer.phone || !customer.address) return NextResponse.json({ message: "Thiếu thông tin khách hàng." }, { status: 400 });
    const subtotal = cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0); const shippingFee = subtotal >= 1000000 ? 0 : 30000; const total = subtotal + shippingFee; const txnRef = Date.now().toString();
    const { data: order, error: orderError } = await supabaseAdmin.from("orders").insert({
      customer_id: user.id, customer_name: customer.name, customer_phone: customer.phone, customer_email: user.email || customer.email || null,
      customer_address: customer.address, note: customer.note || null, subtotal, shipping_fee: shippingFee, total,
      status: "Chờ thanh toán", payment_method: "vnpay", payment_status: "pending", vnpay_txn_ref: txnRef,
    }).select().single();
    if (orderError || !order) return NextResponse.json({ message: orderError?.message || "Không tạo được đơn VNPAY." }, { status: 500 });
    const { error: itemError } = await supabaseAdmin.from("order_items").insert(cart.map(item => ({ order_id: order.id, product_id: isUuid(item.id) ? item.id : null, product_name: item.name, product_price: item.price, quantity: item.quantity })));
    if (itemError) return NextResponse.json({ message: itemError.message }, { status: 500 });
    const tmnCode = (process.env.VNPAY_TMN_CODE || "").trim(); const secretKey = (process.env.VNPAY_HASH_SECRET || "").trim(); const vnpUrl = (process.env.VNPAY_URL || "").trim(); const returnUrl = (process.env.VNPAY_RETURN_URL || "http://localhost:3000/payment/vnpay-return").trim();
    if (!tmnCode || !secretKey || !vnpUrl) return NextResponse.json({ message: "Thiếu cấu hình VNPAY trong .env.local." }, { status: 500 });
    const params: Record<string,string|number> = { vnp_Version:"2.1.0", vnp_Command:"pay", vnp_TmnCode:tmnCode, vnp_Locale:"vn", vnp_CurrCode:"VND", vnp_TxnRef:txnRef, vnp_OrderInfo:`Thanh toan don hang HMECHA ${txnRef}`, vnp_OrderType:"other", vnp_Amount:total*100, vnp_ReturnUrl:returnUrl, vnp_IpAddr:"127.0.0.1", vnp_CreateDate:formatDate(new Date()) };
    const sorted = sortObject(params); const signData = qs.stringify(sorted, { encode: false }); sorted.vnp_SecureHash = crypto.createHmac("sha512", secretKey).update(Buffer.from(signData,"utf-8")).digest("hex");
    return NextResponse.json({ orderId: order.id, paymentUrl: vnpUrl + "?" + qs.stringify(sorted, { encode: false }) });
  } catch (error: unknown) { return NextResponse.json({ message: error instanceof Error ? error.message : "Lỗi tạo thanh toán VNPAY." }, { status: 500 }); }
}
