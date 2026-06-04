import { NextResponse } from "next/server";
import { createAuthServerClient } from "../../../../lib/supabase-auth/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
const allowedStatuses = ["Chờ xác nhận", "Chờ thanh toán", "Đã thanh toán", "Đã xác nhận", "Đang giao", "Hoàn thành", "Đã hủy", "Thanh toán thất bại"];
async function isAdmin() { const auth = await createAuthServerClient(); const { data: { user } } = await auth.auth.getUser(); const admin = process.env.ADMIN_EMAIL?.trim().toLowerCase(); return Boolean(user?.email && admin && user.email.toLowerCase() === admin); }
export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ message: "Không có quyền truy cập." }, { status: 403 });
  const { data, error } = await supabaseAdmin.from("orders").select("*,order_items(id,product_name,product_price,quantity)").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ orders: data || [] });
}
export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ message: "Không có quyền cập nhật." }, { status: 403 });
  const { orderId, status } = await request.json().catch(() => ({}));
  if (!orderId || !allowedStatuses.includes(status)) return NextResponse.json({ message: "Trạng thái không hợp lệ." }, { status: 400 });
  const { error } = await supabaseAdmin.from("orders").update({ status }).eq("id", orderId);
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
