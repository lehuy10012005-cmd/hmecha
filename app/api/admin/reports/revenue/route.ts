import { NextResponse } from "next/server";
import { createAuthServerClient } from "../../../../../lib/supabase-auth/server";
import { supabaseAdmin } from "../../../../../lib/supabase-admin";

export const dynamic = "force-dynamic";

type Order = {
  id: string;
  total: number | null;
  subtotal: number | null;
  shipping_fee: number | null;
  status: string | null;
  payment_method: string | null;
  payment_status: string | null;
  created_at: string;
};

async function requireAdmin() {
  const auth = await createAuthServerClient();

  const {
    data: { user },
  } = await auth.auth.getUser();

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!user?.email || !adminEmail || user.email.toLowerCase() !== adminEmail) {
    return false;
  }

  return true;
}

function getDateKey(value: string) {
  const date = new Date(value);
  const vnDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);
  return vnDate.toISOString().slice(0, 10);
}

function makeDateRange(days: number) {
  const result: string[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);

    const vnDate = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    result.push(vnDate.toISOString().slice(0, 10));
  }

  return result;
}

export async function GET(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: "Không có quyền truy cập." }, { status: 403 });
  }

  const url = new URL(request.url);
  const days = Math.min(Math.max(Number(url.searchParams.get("days") || 30), 1), 365);

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days + 1);
  fromDate.setHours(0, 0, 0, 0);

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("id,total,subtotal,shipping_fee,status,payment_method,payment_status,created_at")
    .gte("created_at", fromDate.toISOString())
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  const orders = (data || []) as Order[];

  const completedOrders = orders.filter((order) => order.status === "Hoàn thành");
  const pendingOrders = orders.filter((order) => order.status === "Chờ xác nhận");
  const confirmedOrders = orders.filter((order) =>
    ["Đã xác nhận", "Đang giao", "Đã thanh toán"].includes(order.status || "")
  );
  const cancelledOrders = orders.filter((order) =>
    ["Đã hủy", "Thanh toán thất bại"].includes(order.status || "")
  );

  const range = makeDateRange(days);

  const dailyMap = new Map<
    string,
    {
      date: string;
      revenue: number;
      completedOrders: number;
      pendingRevenue: number;
      pendingOrders: number;
      expectedRevenue: number;
      expectedOrders: number;
      cancelledOrders: number;
    }
  >();

  for (const date of range) {
    dailyMap.set(date, {
      date,
      revenue: 0,
      completedOrders: 0,
      pendingRevenue: 0,
      pendingOrders: 0,
      expectedRevenue: 0,
      expectedOrders: 0,
      cancelledOrders: 0,
    });
  }

  for (const order of orders) {
    const dateKey = getDateKey(order.created_at);
    const row =
      dailyMap.get(dateKey) ||
      {
        date: dateKey,
        revenue: 0,
        completedOrders: 0,
        pendingRevenue: 0,
        pendingOrders: 0,
        expectedRevenue: 0,
        expectedOrders: 0,
        cancelledOrders: 0,
      };

    const total = Number(order.total || 0);

    if (order.status === "Hoàn thành") {
      row.revenue += total;
      row.completedOrders += 1;
      row.expectedRevenue += total;
      row.expectedOrders += 1;
    }

    if (order.status === "Chờ xác nhận") {
      row.pendingRevenue += total;
      row.pendingOrders += 1;
    }

    if (["Đã xác nhận", "Đang giao", "Đã thanh toán"].includes(order.status || "")) {
      row.expectedRevenue += total;
      row.expectedOrders += 1;
    }

    if (["Đã hủy", "Thanh toán thất bại"].includes(order.status || "")) {
      row.cancelledOrders += 1;
    }

    dailyMap.set(dateKey, row);
  }

  const daily = Array.from(dailyMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  const revenue = completedOrders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const expectedRevenue = [...completedOrders, ...confirmedOrders].reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );
  const pendingRevenue = pendingOrders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  return NextResponse.json({
    rangeDays: days,
    summary: {
      revenue,
      expectedRevenue,
      pendingRevenue,
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      pendingOrders: pendingOrders.length,
      confirmedOrders: confirmedOrders.length,
      cancelledOrders: cancelledOrders.length,
      averageOrderValue:
        completedOrders.length > 0 ? Math.round(revenue / completedOrders.length) : 0,
    },
    daily,
  });
}
