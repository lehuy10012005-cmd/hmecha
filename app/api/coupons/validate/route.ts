import { NextRequest, NextResponse } from "next/server";
import { createAuthServerClient } from "../../../../lib/supabase-auth/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";

export const dynamic = "force-dynamic";

type Coupon = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  discount_type: "fixed" | "percent" | "free_shipping";
  discount_value: number;
  max_discount: number | null;
  min_order_amount: number;
  usage_limit: number | null;
  used_count: number;
  per_customer_limit: number;
  customer_rule: string;
  required_completed_orders: number;
  required_total_items: number;
  required_points: number;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
};

function calculateDiscount(coupon: Coupon, subtotal: number, shippingFee: number) {
  if (coupon.discount_type === "fixed") {
    return Math.min(Number(coupon.discount_value || 0), subtotal);
  }

  if (coupon.discount_type === "percent") {
    const rawDiscount = subtotal * (Number(coupon.discount_value || 0) / 100);
    const maxDiscount = coupon.max_discount ? Number(coupon.max_discount) : rawDiscount;

    return Math.min(rawDiscount, maxDiscount, subtotal);
  }

  if (coupon.discount_type === "free_shipping") {
    const maxDiscount = coupon.max_discount ? Number(coupon.max_discount) : shippingFee;

    return Math.min(shippingFee, maxDiscount);
  }

  return 0;
}

export async function POST(request: NextRequest) {
  const supabase = await createAuthServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const body = await request.json();

  const code = String(body.code || "").trim().toUpperCase();
  const subtotal = Number(body.subtotal || 0);
  const shippingFee = Number(body.shippingFee || 0);
  const customerEmail = String(body.customerEmail || user?.email || "").trim().toLowerCase();

  if (!code) {
    return NextResponse.json(
      { error: "Vui lòng nhập mã giảm giá." },
      { status: 400 }
    );
  }

  if (subtotal <= 0) {
    return NextResponse.json(
      { error: "Giỏ hàng chưa có sản phẩm." },
      { status: 400 }
    );
  }

  const { data: couponData, error } = await supabaseAdmin
    .from("coupons")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!couponData) {
    return NextResponse.json(
      { error: "Mã giảm giá không tồn tại." },
      { status: 404 }
    );
  }

  const coupon = couponData as Coupon;

  if (!coupon.is_active) {
    return NextResponse.json(
      { error: "Mã giảm giá này đang tạm tắt." },
      { status: 400 }
    );
  }

  const now = Date.now();

  if (coupon.starts_at && new Date(coupon.starts_at).getTime() > now) {
    return NextResponse.json(
      { error: "Mã giảm giá chưa đến thời gian sử dụng." },
      { status: 400 }
    );
  }

  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < now) {
    return NextResponse.json(
      { error: "Mã giảm giá đã hết hạn." },
      { status: 400 }
    );
  }

  if (Number(coupon.min_order_amount || 0) > subtotal) {
    return NextResponse.json(
      {
        error: `Đơn hàng cần tối thiểu ${Number(coupon.min_order_amount).toLocaleString("vi-VN")}đ để dùng mã này.`,
      },
      { status: 400 }
    );
  }

  if (coupon.usage_limit && Number(coupon.used_count || 0) >= Number(coupon.usage_limit)) {
    return NextResponse.json(
      { error: "Mã giảm giá đã hết lượt sử dụng." },
      { status: 400 }
    );
  }

  if (coupon.per_customer_limit > 0 && (user?.id || customerEmail)) {
    let query = supabaseAdmin
      .from("coupon_redemptions")
      .select("id", { count: "exact", head: true })
      .eq("code", code);

    if (user?.id) {
      query = query.eq("user_id", user.id);
    } else if (customerEmail) {
      query = query.eq("customer_email", customerEmail);
    }

    const { count } = await query;

    if (Number(count || 0) >= Number(coupon.per_customer_limit || 1)) {
      return NextResponse.json(
        { error: "Bạn đã sử dụng mã này rồi." },
        { status: 400 }
      );
    }
  }

  if (coupon.customer_rule !== "public" && user?.id) {
    const { data: pointRow } = await supabaseAdmin
      .from("customer_points")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const completedOrders = Number(pointRow?.completed_orders || 0);
    const completedItems = Number(pointRow?.completed_items || 0);
    const points = Number(pointRow?.points || 0);

    if (coupon.customer_rule === "new_customer" && completedOrders > 0) {
      return NextResponse.json(
        { error: "Mã này chỉ dành cho khách hàng mới." },
        { status: 400 }
      );
    }

    if (coupon.required_completed_orders > completedOrders) {
      return NextResponse.json(
        { error: `Bạn cần có ít nhất ${coupon.required_completed_orders} đơn hoàn thành để dùng mã này.` },
        { status: 400 }
      );
    }

    if (coupon.required_total_items > completedItems) {
      return NextResponse.json(
        { error: `Bạn cần mua ít nhất ${coupon.required_total_items} sản phẩm để dùng mã này.` },
        { status: 400 }
      );
    }

    if (coupon.required_points > points) {
      return NextResponse.json(
        { error: `Bạn cần có ít nhất ${coupon.required_points} điểm để đổi mã này.` },
        { status: 400 }
      );
    }
  }

  const discountAmount = Math.max(0, Math.round(calculateDiscount(coupon, subtotal, shippingFee)));
  const finalTotal = Math.max(0, subtotal + shippingFee - discountAmount);

  return NextResponse.json({
    coupon: {
      id: coupon.id,
      code: coupon.code,
      title: coupon.title,
      description: coupon.description,
      discountType: coupon.discount_type,
      discountValue: Number(coupon.discount_value || 0),
      maxDiscount: coupon.max_discount ? Number(coupon.max_discount) : null,
      minOrderAmount: Number(coupon.min_order_amount || 0),
    },
    discountAmount,
    finalTotal,
    message: `Áp dụng mã ${coupon.code} thành công.`,
  });
}