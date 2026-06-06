import { NextRequest, NextResponse } from "next/server";
import { createAuthServerClient } from "../../../lib/supabase-auth/server";
import { supabaseAdmin } from "../../../lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const productSlug = request.nextUrl.searchParams.get("productSlug");

  if (!productSlug) {
    return NextResponse.json({ reviews: [] });
  }

  const { data, error } = await supabaseAdmin
    .from("product_reviews")
    .select("*")
    .eq("product_slug", productSlug)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message, reviews: [] },
      { status: 500 }
    );
  }

  return NextResponse.json({ reviews: data || [] });
}

export async function POST(request: NextRequest) {
  const supabase = await createAuthServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const body = await request.json();

  const productSlug = String(body.productSlug || "").trim();
  const productId = String(body.productId || "").trim();
  const productName = String(body.productName || "").trim();
  const rating = Number(body.rating || 0);
  const content = String(body.content || "").trim();

  let customerName = String(body.customerName || "").trim();
  let customerEmail = String(body.customerEmail || "").trim();
  let customerPhone = String(body.customerPhone || "").trim();

  if (!productSlug) {
    return NextResponse.json({ error: "Thiếu mã sản phẩm." }, { status: 400 });
  }

  if (!rating || rating < 1 || rating > 5) {
    return NextResponse.json(
      { error: "Vui lòng chọn số sao từ 1 đến 5." },
      { status: 400 }
    );
  }

  if (!customerName || customerName.length < 2) {
    return NextResponse.json(
      { error: "Vui lòng nhập họ tên." },
      { status: 400 }
    );
  }

  if (!customerPhone || customerPhone.length < 8) {
    return NextResponse.json(
      { error: "Vui lòng nhập số điện thoại hợp lệ." },
      { status: 400 }
    );
  }

  if (content.length < 5) {
    return NextResponse.json(
      { error: "Nội dung bình luận nên có ít nhất 5 ký tự." },
      { status: 400 }
    );
  }

  let userId = null;

  if (user) {
    userId = user.id;

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name, email, phone")
      .eq("id", user.id)
      .maybeSingle();

    customerName =
      customerName ||
      profile?.full_name ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Khách hàng HMECHA";

    customerEmail = customerEmail || profile?.email || user.email || "";
    customerPhone = customerPhone || profile?.phone || "";
  }

  const { data, error } = await supabaseAdmin
    .from("product_reviews")
    .insert({
      product_id: productId,
      product_slug: productSlug,
      product_name: productName,
      user_id: userId,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      rating,
      content,
      status: "approved",
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ review: data });
}
