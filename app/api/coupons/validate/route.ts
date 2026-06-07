import { NextResponse } from "next/server";
import { createAuthServerClient } from "../../../../lib/supabase-auth/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";

export const dynamic = "force-dynamic";

function calculateDiscount(coupon: any, subtotal: number, shippingFee: number) {
  const type = coupon.discount_type;
  const value = Number(coupon.discount_value || 0);
  const maxDiscount = coupon.max_discount ? Number(coupon.max_discount) : null;

  if (type === "free_shipping") {
    return Math.max(0, Number(shippingFee || 0));
  }

  if (type === "percent") {
    const raw = Math.floor((subtotal * value) / 100);
    return maxDiscount ? Math.min(raw, maxDiscount) : raw;
  }

  return value;
}

export async function POST(request: Request) {
  const auth = await createAuthServerClient();

  const {
    data: { user },
  } = await auth.auth.getUser();

  const body = await request.json().catch(() => ({}));

  const code = String(body.code || "").trim().toUpperCase();
  const subtotal = Number(body.subtotal || 0);
  const shippingFee = Number(body.shippingFee || 0);

  if (!code) {
    return NextResponse.json({ error: "Vui lòng nhập mã giảm giá." }, { status: 400 });
  }

  const { data: coupon, error } = await supabaseAdmin
    .from("coupons")
    .select("*")
    .eq("code", code)
    .eq("is_active", true)
    .maybeSingle();

  if (error || !coupon) {
    return NextResponse.json(
      { error: "Mã giảm giá không tồn tại hoặc đã tắt." },
      { status: 404 }
    );
  }

  if (coupon.assigned_user_id && coupon.assigned_user_id !== user?.id) {
    return NextResponse.json(
      { error: "Mã này chỉ dành cho tài khoản khác." },
      { status: 403 }
    );
  }

  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) {
    return NextResponse.json({ error: "Mã giảm giá đã hết hạn." }, { status: 400 });
  }

  if (coupon.starts_at && new Date(coupon.starts_at).getTime() > Date.now()) {
    return NextResponse.json({ error: "Mã giảm giá chưa đến thời gian sử dụng." }, { status: 400 });
  }

  if (coupon.usage_limit && Number(coupon.used_count || 0) >= Number(coupon.usage_limit)) {
    return NextResponse.json({ error: "Mã giảm giá đã hết lượt sử dụng." }, { status: 400 });
  }

  if (subtotal < Number(coupon.min_order_amount || 0)) {
    return NextResponse.json(
      {
        error:
          "Đơn hàng chưa đạt tối thiểu " +
          Number(coupon.min_order_amount || 0).toLocaleString("vi-VN") +
          "đ.",
      },
      { status: 400 }
    );
  }

  const discountAmount = Math.min(
    calculateDiscount(coupon, subtotal, shippingFee),
    subtotal + shippingFee
  );

  return NextResponse.json({
    coupon: {
      id: coupon.id,
      code: coupon.code,
      title: coupon.title,
      discountType: coupon.discount_type,
    },
    discountAmount,
    message: "Áp dụng mã thành công.",
  });
}
