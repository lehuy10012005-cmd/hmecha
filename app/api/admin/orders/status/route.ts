import { NextRequest, NextResponse } from "next/server";
import { createAuthServerClient } from "../../../../../lib/supabase-auth/server";
import { supabaseAdmin } from "../../../../../lib/supabase-admin";
import { awardPointsForCompletedOrder } from "../../../../../lib/customerRewards";
import {
  createAfterSaleVoucher,
  sendOrderStatusEmail,
} from "../../../../../lib/afterSaleMarketing";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const supabase = await createAuthServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!user || !adminEmail || user.email?.trim().toLowerCase() !== adminEmail) {
    return null;
  }

  return user;
}

function isCompletedStatus(status: string) {
  const value = String(status || "").trim();
  return value === "Hoàn thành" || value === "completed" || value === "Hoan thanh";
}

export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  const body = await request.json();

  const orderId = String(body.orderId || "").trim();
  const status = String(body.status || "").trim();

  if (!orderId || !status) {
    return NextResponse.json(
      { message: "Thiếu orderId hoặc status." },
      { status: 400 }
    );
  }

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .update({
      status,
    })
    .eq("id", orderId)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }

  let rewardResult: any = null;
  let voucherResult: any = null;
  let emailResult: any = null;

  if (isCompletedStatus(status)) {
    rewardResult = await awardPointsForCompletedOrder(orderId).catch((err) => ({
      awarded: false,
      message: err?.message || "Không cộng được điểm.",
    }));

    voucherResult = await createAfterSaleVoucher(orderId).catch((err) => ({
      created: false,
      voucher: null,
      message: err?.message || "Không tạo được voucher hậu mãi.",
    }));
  }

  emailResult = await sendOrderStatusEmail(orderId, status, {
    voucher: voucherResult?.voucher || null,
    rewardMessage: rewardResult?.message || null,
  }).catch((err) => ({
    sent: false,
    skipped: false,
    message: err?.message || "Không gửi được email trạng thái.",
  }));

  return NextResponse.json({
    order,
    reward: rewardResult,
    voucher: voucherResult,
    email: emailResult,
    message:
      isCompletedStatus(status) && rewardResult?.awarded
        ? rewardResult.message
        : "Đã cập nhật trạng thái đơn hàng.",
  });
}