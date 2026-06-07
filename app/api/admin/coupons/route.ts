import { NextResponse } from "next/server";
import { createAuthServerClient } from "../../../../lib/supabase-auth/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const auth = await createAuthServerClient();

  const {
    data: { user },
  } = await auth.auth.getUser();

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!user?.email || !adminEmail || user.email.toLowerCase() !== adminEmail) {
    return null;
  }

  return user;
}

function cleanCouponPayload(body: any) {
  return {
    code: String(body.code || "").trim().toUpperCase(),
    title: String(body.title || "").trim(),
    description: body.description ? String(body.description).trim() : null,
    discount_type: String(body.discount_type || "fixed"),
    discount_value: Number(body.discount_value || 0),
    max_discount:
      body.max_discount === "" || body.max_discount === null || body.max_discount === undefined
        ? null
        : Number(body.max_discount),
    min_order_amount: Number(body.min_order_amount || 0),
    usage_limit:
      body.usage_limit === "" || body.usage_limit === null || body.usage_limit === undefined
        ? null
        : Number(body.usage_limit),
    per_customer_limit: Number(body.per_customer_limit || 1),
    customer_rule: String(body.customer_rule || "public"),
    required_completed_orders: Number(body.required_completed_orders || 0),
    required_total_items: Number(body.required_total_items || 0),
    required_points: Number(body.required_points || 0),
    is_active: Boolean(body.is_active),
    starts_at: body.starts_at ? body.starts_at : null,
    expires_at: body.expires_at ? body.expires_at : null,
    updated_at: new Date().toISOString(),
  };
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: "Không có quyền truy cập." }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ coupons: data || [] });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: "Không có quyền tạo mã." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const payload = cleanCouponPayload(body);

  if (!payload.code || !payload.title) {
    return NextResponse.json(
      { message: "Vui lòng nhập mã và tên ưu đãi." },
      { status: 400 }
    );
  }

  if (!["fixed", "percent", "free_shipping"].includes(payload.discount_type)) {
    return NextResponse.json(
      { message: "Loại giảm giá không hợp lệ." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("coupons")
    .insert(payload)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ coupon: data, message: "Đã tạo mã giảm giá." });
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: "Không có quyền cập nhật mã." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "").trim();

  if (!id) {
    return NextResponse.json({ message: "Thiếu ID mã giảm giá." }, { status: 400 });
  }

  const payload = cleanCouponPayload(body);

  if (!payload.code || !payload.title) {
    return NextResponse.json(
      { message: "Vui lòng nhập mã và tên ưu đãi." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("coupons")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ coupon: data, message: "Đã cập nhật mã giảm giá." });
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: "Không có quyền tắt mã." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "").trim();

  if (!id) {
    return NextResponse.json({ message: "Thiếu ID mã giảm giá." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("coupons")
    .update({
      is_active: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ coupon: data, message: "Đã tắt mã giảm giá." });
}
