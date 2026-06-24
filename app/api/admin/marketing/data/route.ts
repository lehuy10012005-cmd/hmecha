import { NextResponse } from "next/server";
import { createAuthServerClient } from "../../../../../lib/supabase-auth/server";
import { supabaseAdmin } from "../../../../../lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function isAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!adminEmail) return true;

  const auth = await createAuthServerClient();
  const {
    data: { user },
  } = await auth.auth.getUser();

  return Boolean(user?.email && user.email.toLowerCase() === adminEmail);
}

function normalizeStatus(status: any) {
  return String(status || "").trim().toLowerCase();
}

function isCompletedStatus(status: any) {
  const value = normalizeStatus(status);

  return (
    value === "hoàn thành" ||
    value === "hoan thanh" ||
    value === "completed" ||
    value === "complete"
  );
}

function daysSince(dateValue: any) {
  const time = new Date(dateValue || Date.now()).getTime();

  if (!Number.isFinite(time)) return 0;

  return Math.floor((Date.now() - time) / (1000 * 60 * 60 * 24));
}

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { ok: false, message: "Không có quyền truy cập." },
        { status: 403 }
      );
    }

    const warnings: string[] = [];

    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id,name,slug,price,category,status,stock_quantity,badge,is_active,created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(300);

    if (productsError) warnings.push("Không tải được sản phẩm: " + productsError.message);

    const { data: subscribersRaw, error: subscribersError } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("id,email,name,source,is_active,created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(500);

    if (subscribersError) {
      console.warn("Newsletter subscribers table is not available:", subscribersError.message);
    }

    const { data: ordersRaw, error: ordersError } = await supabaseAdmin
      .from("orders")
      .select("id,customer_email,customer_name,status,created_at")
      .order("created_at", { ascending: false })
      .limit(1000);

    if (ordersError) warnings.push("Không tải được đơn hàng: " + ordersError.message);

    const subscribers = (subscribersRaw || [])
      .filter((item: any) => item.email)
      .map((item: any) => ({
        id: `newsletter:${item.email}`,
        email: String(item.email).trim().toLowerCase(),
        name: item.name || "",
        source: "newsletter",
        label: "Đăng ký nhận tin",
        createdAt: item.created_at,
      }));

    const buyersByEmail = new Map<string, any>();

    for (const order of ordersRaw || []) {
      const email = String(order.customer_email || "").trim().toLowerCase();
      if (!email || !isCompletedStatus(order.status)) continue;

      const existed = buyersByEmail.get(email);
      const orderDate = new Date(order.created_at || 0).getTime();
      const existedDate = new Date(existed?.lastOrderAt || 0).getTime();

      if (!existed || orderDate > existedDate) {
        buyersByEmail.set(email, {
          id: `buyer:${email}`,
          email,
          name: order.customer_name || existed?.name || "",
          source: "buyer",
          label: "Khách đã mua",
          lastOrderAt: order.created_at,
          daysSinceLastOrder: daysSince(order.created_at),
          completedOrderCount: (existed?.completedOrderCount || 0) + 1,
        });
      } else {
        existed.completedOrderCount = (existed.completedOrderCount || 0) + 1;
      }
    }

    const buyers = Array.from(buyersByEmail.values());

    return NextResponse.json({
      ok: true,
      warnings,
      products: products || [],
      recipients: {
        newsletter: subscribers,
        buyers,
        inactive30: buyers.filter((item) => item.daysSinceLastOrder >= 30),
        inactive60: buyers.filter((item) => item.daysSinceLastOrder >= 60),
        inactive90: buyers.filter((item) => item.daysSinceLastOrder >= 90),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        message: error?.message || "Không tải được dữ liệu marketing.",
      },
      { status: 500 }
    );
  }
}