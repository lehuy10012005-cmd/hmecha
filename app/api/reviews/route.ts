import { NextRequest, NextResponse } from "next/server";
import { createAuthServerClient } from "../../../lib/supabase-auth/server";
import { supabaseAdmin } from "../../../lib/supabase-admin";

export const dynamic = "force-dynamic";

function normalizeText(value: unknown) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function isBadOrder(order: any) {
  const status = normalizeText(order?.status);
  const paymentStatus = normalizeText(order?.payment_status);

  return (
    status.includes("huy") ||
    status.includes("that bai") ||
    status.includes("cancel") ||
    paymentStatus.includes("that bai") ||
    paymentStatus.includes("failed")
  );
}

function orderHasProduct(order: any, productSlug: string, productName: string) {
  const items = Array.isArray(order?.order_items) ? order.order_items : [];

  const targetName = normalizeText(productName);
  const targetSlug = normalizeText(productSlug).replace(/-/g, " ");

  return items.some((item: any) => {
    const itemName = normalizeText(item?.product_name);

    if (!itemName) return false;

    return (
      itemName === targetName ||
      itemName.includes(targetName) ||
      targetName.includes(itemName) ||
      itemName.includes(targetSlug)
    );
  });
}

async function userPurchasedProduct(user: any, productSlug: string, productName: string) {
  const email = String(user?.email || "").trim();

  const { data: idOrders, error: idError } = await supabaseAdmin
    .from("orders")
    .select("id,status,payment_status,customer_id,customer_email,order_items(product_name)")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });

  if (idError) {
    throw new Error(idError.message);
  }

  let emailOrders: any[] = [];

  if (email) {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("id,status,payment_status,customer_id,customer_email,order_items(product_name)")
      .ilike("customer_email", email)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    emailOrders = data || [];
  }

  const orders = [...(idOrders || []), ...emailOrders];

  return orders.some((order) => {
    if (isBadOrder(order)) return false;
    return orderHasProduct(order, productSlug, productName);
  });
}

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

  if (!user) {
    return NextResponse.json(
      { error: "Bạn cần đăng nhập và mua sản phẩm này trước khi bình luận." },
      { status: 401 }
    );
  }

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

  if (content.length < 5) {
    return NextResponse.json(
      { error: "Nội dung bình luận nên có ít nhất 5 ký tự." },
      { status: 400 }
    );
  }

  const hasPurchased = await userPurchasedProduct(user, productSlug, productName);

  if (!hasPurchased) {
    return NextResponse.json(
      {
        error:
          "Bạn chỉ có thể bình luận sau khi đã mua sản phẩm này bằng tài khoản hiện tại.",
      },
      { status: 403 }
    );
  }

  const { data: oldReview } = await supabaseAdmin
    .from("product_reviews")
    .select("id")
    .eq("product_slug", productSlug)
    .eq("user_id", user.id)
    .maybeSingle();

  if (oldReview) {
    return NextResponse.json(
      { error: "Bạn đã bình luận sản phẩm này rồi." },
      { status: 409 }
    );
  }

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

  const { data, error } = await supabaseAdmin
    .from("product_reviews")
    .insert({
      product_id: productId,
      product_slug: productSlug,
      product_name: productName,
      user_id: user.id,
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