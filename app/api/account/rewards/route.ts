import { NextResponse } from "next/server";
import { createAuthServerClient } from "../../../../lib/supabase-auth/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";

export const dynamic = "force-dynamic";

function randomCode(prefix: string) {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return prefix.toUpperCase() + "-" + random;
}

export async function GET() {
  const auth = await createAuthServerClient();

  const {
    data: { user },
  } = await auth.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Bạn cần đăng nhập.", rewards: [], points: null },
      { status: 401 }
    );
  }

  const { data: pointRow } = await supabaseAdmin
    .from("customer_points")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: rewards, error: rewardError } = await supabaseAdmin
    .from("point_rewards")
    .select("*")
    .eq("is_active", true)
    .order("required_points", { ascending: true });

  if (rewardError) {
    return NextResponse.json({ message: rewardError.message }, { status: 500 });
  }

  const { data: myCoupons } = await supabaseAdmin
    .from("coupons")
    .select("*")
    .eq("assigned_user_id", user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json({
    points: {
      points: Number(pointRow?.points || 0),
      lifetimePoints: Number(pointRow?.lifetime_points || 0),
      tier: pointRow?.tier || "Rookie Builder",
    },
    rewards: rewards || [],
    myCoupons: myCoupons || [],
  });
}

export async function POST(request: Request) {
  const auth = await createAuthServerClient();

  const {
    data: { user },
  } = await auth.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Bạn cần đăng nhập để đổi điểm." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const rewardId = String(body.rewardId || "").trim();

  if (!rewardId) {
    return NextResponse.json({ message: "Thiếu phần quà cần đổi." }, { status: 400 });
  }

  const { data: reward, error: rewardError } = await supabaseAdmin
    .from("point_rewards")
    .select("*")
    .eq("id", rewardId)
    .eq("is_active", true)
    .maybeSingle();

  if (rewardError || !reward) {
    return NextResponse.json(
      { message: rewardError?.message || "Không tìm thấy phần quà." },
      { status: 404 }
    );
  }

  const { data: pointRow, error: pointError } = await supabaseAdmin
    .from("customer_points")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (pointError) {
    return NextResponse.json({ message: pointError.message }, { status: 500 });
  }

  const currentPoints = Number(pointRow?.points || 0);
  const requiredPoints = Number(reward.required_points || 0);

  if (currentPoints < requiredPoints) {
    return NextResponse.json(
      { message: "Bạn chưa đủ điểm để đổi voucher này." },
      { status: 400 }
    );
  }

  const code = randomCode(reward.code_prefix || "POINT");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + Number(reward.expires_in_days || 30));

  const { data: coupon, error: couponError } = await supabaseAdmin
    .from("coupons")
    .insert({
      code,
      title: reward.title,
      description: reward.description,
      discount_type: reward.discount_type,
      discount_value: Number(reward.discount_value || 0),
      max_discount: reward.max_discount,
      min_order_amount: Number(reward.min_order_amount || 0),
      usage_limit: 1,
      used_count: 0,
      per_customer_limit: 1,
      customer_rule: "points_exchange",
      required_completed_orders: 0,
      required_total_items: 0,
      required_points: 0,
      assigned_user_id: user.id,
      source_reward_id: reward.id,
      redeemed_points: requiredPoints,
      is_active: true,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (couponError || !coupon) {
    return NextResponse.json(
      { message: couponError?.message || "Không tạo được voucher." },
      { status: 500 }
    );
  }

  const nextPoints = currentPoints - requiredPoints;

  const { error: updatePointError } = await supabaseAdmin
    .from("customer_points")
    .update({
      points: nextPoints,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id);

  if (updatePointError) {
    return NextResponse.json(
      { message: updatePointError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    coupon,
    points: nextPoints,
    message: "Đổi điểm thành công. Voucher đã được thêm vào tài khoản.",
  });
}
