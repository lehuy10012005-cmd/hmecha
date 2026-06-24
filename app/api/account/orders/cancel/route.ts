import { NextResponse } from "next/server";
import { createAuthServerClient } from "../../../../../lib/supabase-auth/server";
import { supabaseAdmin } from "../../../../../lib/supabase-admin";
import { syncOrderStockForStatus } from "../../../../../lib/orderStock";

export const dynamic = "force-dynamic";

function normalizeText(value: unknown) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ")
    .trim();
}

function canCustomerCancel(status: unknown, paymentStatus: unknown) {
  const orderStatus = normalizeText(status);
  const paidStatus = normalizeText(paymentStatus);

  if (paidStatus === "paid") {
    return false;
  }

  return (
    orderStatus === "cho xac nhan" ||
    orderStatus === "cho thanh toan" ||
    orderStatus === "pending"
  );
}

export async function PATCH(request: Request) {
  const auth = await createAuthServerClient();

  const {
    data: { user },
  } = await auth.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Bạn cần đăng nhập để hủy đơn." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const orderId = String(body.orderId || "").trim();

  if (!orderId) {
    return NextResponse.json(
      { message: "Thiếu mã đơn hàng." },
      { status: 400 }
    );
  }

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("id,customer_id,customer_email,status,payment_status,stock_deducted")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) {
    return NextResponse.json(
      { message: error?.message || "Không tìm thấy đơn hàng." },
      { status: 404 }
    );
  }

  const userEmail = user.email?.trim().toLowerCase() || "";
  const orderEmail = order.customer_email?.trim().toLowerCase() || "";
  const isOwner =
    order.customer_id === user.id ||
    Boolean(userEmail && orderEmail && userEmail === orderEmail);

  if (!isOwner) {
    return NextResponse.json(
      { message: "Bạn không có quyền hủy đơn này." },
      { status: 403 }
    );
  }

  if (!canCustomerCancel(order.status, order.payment_status)) {
    return NextResponse.json(
      {
        message:
          "Đơn hàng đã được xử lý hoặc đã thanh toán, bạn cần liên hệ shop để hủy.",
      },
      { status: 400 }
    );
  }

  const { data: updatedOrder, error: updateError } = await supabaseAdmin
    .from("orders")
    .update({
      status: "Đã hủy",
    })
    .eq("id", orderId)
    .select("*")
    .single();

  if (updateError) {
    return NextResponse.json(
      { message: updateError.message },
      { status: 500 }
    );
  }

  const stockResult = await syncOrderStockForStatus(
    orderId,
    "Đã hủy",
    "customer-cancel"
  );

  if (!stockResult.ok) {
    return NextResponse.json(
      {
        order: updatedOrder,
        stock: stockResult,
        message:
          "Đơn đã hủy nhưng hoàn kho bị lỗi: " + stockResult.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    order: updatedOrder,
    stock: stockResult,
    message: "Đã hủy đơn hàng.",
  });
}