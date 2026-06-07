import { NextRequest, NextResponse } from "next/server";
import { createAuthServerClient } from "../../../../../lib/supabase-auth/server";
import { supabaseAdmin } from "../../../../../lib/supabase-admin";
import { awardPointsForCompletedOrder } from "../../../../../lib/customerRewards";

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

  let rewardResult = null;

  if (status === "Hoàn thành") {
    rewardResult = await awardPointsForCompletedOrder(orderId);
  }

  return NextResponse.json({
    order,
    reward: rewardResult,
    message:
      status === "Hoàn thành" && rewardResult?.awarded
        ? rewardResult.message
        : "Đã cập nhật trạng thái đơn hàng.",
  });
}