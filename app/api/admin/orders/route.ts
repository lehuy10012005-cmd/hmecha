import { NextResponse } from "next/server";
import { createAuthServerClient } from "../../../../lib/supabase-auth/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { awardPointsForCompletedOrder } from "../../../../lib/customerRewards";
import { isStockDeductStatus, syncOrderStockForStatus } from "../../../../lib/orderStock";

export const dynamic = "force-dynamic";

const allowedStatuses = [
  "Chờ xác nhận",
  "Chờ thanh toán",
  "Đã thanh toán",
  "Đã xác nhận",
  "Đang giao",
  "Hoàn thành",
  "Đã hoàn thành",
  "Đã hủy",
  "Thanh toán thất bại",
];

async function isAdmin() {
  const auth = await createAuthServerClient();

  const {
    data: { user },
  } = await auth.auth.getUser();

  const admin = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  return Boolean(user?.email && admin && user.email.toLowerCase() === admin);
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { message: "Không có quyền truy cập." },
      { status: 403 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*,order_items(id,product_name,product_price,quantity)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: data || [] });
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { message: "Không có quyền cập nhật." },
      { status: 403 }
    );
  }

  const { orderId, status } = await request.json().catch(() => ({}));

  if (!orderId || !allowedStatuses.includes(status)) {
    return NextResponse.json(
      { message: "Trạng thái không hợp lệ." },
      { status: 400 }
    );
  }

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const stockResult = await syncOrderStockForStatus(orderId, status, "admin-orders");

  if (!stockResult.ok) {
    return NextResponse.json(
      {
        success: false,
        order,
        stock: stockResult,
        message: stockResult.message,
      },
      { status: 500 }
    );
  }

  let reward = null;

  if (isStockDeductStatus(status)) {
    reward = await awardPointsForCompletedOrder(orderId);
  }

  return NextResponse.json({
    success: true,
    order,
    reward,
    stock: stockResult,
    message: reward?.awarded
      ? reward.message + " " + stockResult.message
      : "Đã cập nhật trạng thái đơn hàng. " + stockResult.message,
  });
}