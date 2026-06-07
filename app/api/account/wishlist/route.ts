import { NextResponse } from "next/server";
import { createAuthServerClient } from "../../../../lib/supabase-auth/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";

export const dynamic = "force-dynamic";

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

async function getUser() {
  const auth = await createAuthServerClient();

  const {
    data: { user },
  } = await auth.auth.getUser();

  return user;
}

export async function GET(request: Request) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Bạn cần đăng nhập.", items: [] },
      { status: 401 }
    );
  }

  const url = new URL(request.url);
  const productSlug = String(url.searchParams.get("productSlug") || "").trim();

  let query = supabaseAdmin
    .from("product_wishlists")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (productSlug) {
    query = query.eq("product_slug", productSlug);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ message: error.message, items: [] }, { status: 500 });
  }

  return NextResponse.json({
    items: data || [],
    active: productSlug ? Boolean(data?.length) : false,
  });
}

export async function POST(request: Request) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Bạn cần đăng nhập để lưu sản phẩm yêu thích." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const product = body.product || {};

  const productSlug = String(product.slug || "").trim();

  if (!productSlug || !product.name) {
    return NextResponse.json(
      { message: "Thiếu thông tin sản phẩm." },
      { status: 400 }
    );
  }

  const payload = {
    user_id: user.id,
    product_id: product.id && isUuid(String(product.id)) ? product.id : null,
    product_slug: productSlug,
    product_name: String(product.name || ""),
    product_price: Number(product.price || 0),
    product_image: product.image || product.images?.[0] || null,
    product_status: product.status || null,
    product_brand: product.brand || null,
    product_category: product.category || null,
  };

  const { data, error } = await supabaseAdmin
    .from("product_wishlists")
    .upsert(payload, { onConflict: "user_id,product_slug" })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    item: data,
    active: true,
    message: "Đã thêm vào yêu thích.",
  });
}

export async function DELETE(request: Request) {
  const user = await getUser();

  if (!user) {
    return NextResponse.json(
      { message: "Bạn cần đăng nhập." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const productSlug = String(body.productSlug || "").trim();

  if (!productSlug) {
    return NextResponse.json(
      { message: "Thiếu sản phẩm cần xóa." },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from("product_wishlists")
    .delete()
    .eq("user_id", user.id)
    .eq("product_slug", productSlug);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({
    active: false,
    message: "Đã bỏ khỏi yêu thích.",
  });
}
