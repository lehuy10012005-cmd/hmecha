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

function normalizeStatus(status: string, stock: number) {
  if (status) return status;
  if (stock <= 0) return "Hết hàng";
  return "Còn hàng";
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: "Không có quyền truy cập." }, { status: 403 });
  }

  const { data: products, error } = await supabaseAdmin
    .from("products")
    .select(
      "id,name,slug,sku,price,brand,category,status,stock_quantity,low_stock_threshold,badge,created_at,stock_updated_at,product_images(image_url,sort_order)"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const { data: orderItems } = await supabaseAdmin
    .from("order_items")
    .select("product_id,quantity");

  const soldMap = new Map<string, number>();

  for (const item of orderItems || []) {
    if (!item.product_id) continue;

    const current = soldMap.get(item.product_id) || 0;
    soldMap.set(item.product_id, current + Number(item.quantity || 0));
  }

  const items = (products || []).map((product: any) => {
    const stock = Number(product.stock_quantity || 0);
    const threshold = Number(product.low_stock_threshold || 3);

    return {
      ...product,
      sold_count: soldMap.get(product.id) || 0,
      stock_level:
        stock <= 0
          ? "out"
          : stock <= threshold
          ? "low"
          : "normal",
    };
  });

  return NextResponse.json({ products: items });
}

export async function PATCH(request: Request) {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json({ message: "Không có quyền cập nhật." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));

  const productId = String(body.productId || "").trim();
  const action = String(body.action || "set").trim();
  const note = String(body.note || "").trim();

  if (!productId) {
    return NextResponse.json({ message: "Thiếu sản phẩm cần cập nhật." }, { status: 400 });
  }

  const { data: oldProduct, error: oldError } = await supabaseAdmin
    .from("products")
    .select("id,name,sku,status,stock_quantity,low_stock_threshold")
    .eq("id", productId)
    .single();

  if (oldError || !oldProduct) {
    return NextResponse.json(
      { message: oldError?.message || "Không tìm thấy sản phẩm." },
      { status: 404 }
    );
  }

  const beforeStock = Number(oldProduct.stock_quantity || 0);
  const beforeStatus = String(oldProduct.status || "");

  let afterStock = beforeStock;

  if (action === "increase") {
    afterStock = beforeStock + Math.max(0, Number(body.quantity || 0));
  } else if (action === "decrease") {
    afterStock = Math.max(0, beforeStock - Math.max(0, Number(body.quantity || 0)));
  } else if (action === "set") {
    afterStock = Math.max(0, Number(body.stockQuantity || 0));
  }

  const afterStatus = normalizeStatus(String(body.status || ""), afterStock);

  const threshold =
    body.lowStockThreshold === undefined || body.lowStockThreshold === null
      ? Number(oldProduct.low_stock_threshold || 3)
      : Math.max(0, Number(body.lowStockThreshold || 0));

  const { data: updatedProduct, error: updateError } = await supabaseAdmin
    .from("products")
    .update({
      stock_quantity: afterStock,
      status: afterStatus,
      low_stock_threshold: threshold,
      stock_updated_at: new Date().toISOString(),
    })
    .eq("id", productId)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ message: updateError.message }, { status: 500 });
  }

  await supabaseAdmin.from("inventory_logs").insert({
    product_id: productId,
    product_name: oldProduct.name,
    sku: oldProduct.sku,
    action,
    before_stock: beforeStock,
    after_stock: afterStock,
    quantity_change: afterStock - beforeStock,
    before_status: beforeStatus,
    after_status: afterStatus,
    note: note || "Admin cập nhật tồn kho",
    admin_email: admin.email,
    source: "admin",
  });

  return NextResponse.json({
    product: updatedProduct,
    message: "Đã cập nhật tồn kho.",
  });
}
