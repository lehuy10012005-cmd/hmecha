import { NextResponse } from "next/server";
import { createAuthServerClient } from "../../../../lib/supabase-auth/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";

export const dynamic = "force-dynamic";

type Coupon = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  max_discount: number | null;
  min_order_amount: number;
  customer_rule: string;
  required_completed_orders: number;
  required_total_items: number;
  required_points: number;
  is_active: boolean;
  expires_at: string | null;
};

function getTier(points: number, completedOrders: number, lifetimeSpent: number) {
  if (points >= 500 || completedOrders >= 10 || lifetimeSpent >= 5000000) {
    return "Master Builder";
  }

  if (points >= 200 || completedOrders >= 5 || lifetimeSpent >= 2500000) {
    return "Pro Builder";
  }

  if (points >= 80 || completedOrders >= 2 || lifetimeSpent >= 1000000) {
    return "Builder Member";
  }

  return "Rookie Builder";
}

function formatRequirement(coupon: Coupon) {
  const requirements: string[] = [];

  if (coupon.customer_rule === "new_customer") {
    requirements.push("Chỉ dành cho khách mới");
  }

  if (coupon.required_completed_orders > 0) {
    requirements.push(`Cần ${coupon.required_completed_orders} đơn hoàn thành`);
  }

  if (coupon.required_total_items > 0) {
    requirements.push(`Cần mua ${coupon.required_total_items} sản phẩm`);
  }

  if (coupon.required_points > 0) {
    requirements.push(`Cần ${coupon.required_points} điểm tích lũy`);
  }

  if (coupon.min_order_amount > 0) {
    requirements.push(`Đơn tối thiểu ${Number(coupon.min_order_amount).toLocaleString("vi-VN")}đ`);
  }

  return requirements.length ? requirements.join(" · ") : "Có thể dùng ngay";
}

function isUnlocked(
  coupon: Coupon,
  points: number,
  completedOrders: number,
  completedItems: number
) {
  if (!coupon.is_active) return false;

  if (coupon.customer_rule === "public") return true;

  if (coupon.customer_rule === "new_customer" && completedOrders > 0) {
    return false;
  }

  if (coupon.required_completed_orders > completedOrders) return false;
  if (coupon.required_total_items > completedItems) return false;
  if (coupon.required_points > points) return false;

  return true;
}

export async function GET() {
  const supabase = await createAuthServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Unauthorized", vouchers: [], points: null },
      { status: 401 }
    );
  }

  const userEmail = user.email?.toLowerCase() || "";

  const { data: pointRow } = await supabaseAdmin
    .from("customer_points")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  const points = Number(pointRow?.points || 0);
  const lifetimePoints = Number(pointRow?.lifetime_points || 0);
  const lifetimeSpent = Number(pointRow?.lifetime_spent || 0);
  const completedOrders = Number(pointRow?.completed_orders || 0);
  const completedItems = Number(pointRow?.completed_items || 0);

  const { data: couponsData, error: couponsError } = await supabaseAdmin
    .from("coupons")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (couponsError) {
    return NextResponse.json(
      { error: couponsError.message, vouchers: [] },
      { status: 500 }
    );
  }

  const { data: usedData } = await supabaseAdmin
    .from("coupon_redemptions")
    .select("code, created_at, discount_amount")
    .or(`user_id.eq.${user.id},customer_email.eq.${userEmail}`);

  const usedMap = new Map<string, any>();

  (usedData || []).forEach((item) => {
    usedMap.set(String(item.code).toUpperCase(), item);
  });

  const vouchers = ((couponsData || []) as Coupon[]).map((coupon) => {
    const used = usedMap.get(coupon.code.toUpperCase());
    const unlocked = isUnlocked(coupon, points, completedOrders, completedItems);

    let status: "available" | "locked" | "used" = "available";

    if (used) {
      status = "used";
    } else if (!unlocked) {
      status = "locked";
    }

    return {
      id: coupon.id,
      code: coupon.code,
      title: coupon.title,
      description: coupon.description,
      discountType: coupon.discount_type,
      discountValue: Number(coupon.discount_value || 0),
      maxDiscount: coupon.max_discount ? Number(coupon.max_discount) : null,
      minOrderAmount: Number(coupon.min_order_amount || 0),
      customerRule: coupon.customer_rule,
      requiredCompletedOrders: Number(coupon.required_completed_orders || 0),
      requiredTotalItems: Number(coupon.required_total_items || 0),
      requiredPoints: Number(coupon.required_points || 0),
      expiresAt: coupon.expires_at,
      requirementText: formatRequirement(coupon),
      status,
      usedAt: used?.created_at || null,
      usedDiscountAmount: used?.discount_amount || 0,
    };
  });

  return NextResponse.json({
    points: {
      points,
      lifetimePoints,
      lifetimeSpent,
      completedOrders,
      completedItems,
      tier: pointRow?.tier || getTier(points, completedOrders, lifetimeSpent),
    },
    vouchers,
  });
}