const fs = require("fs");

function write(path, content) {
  fs.writeFileSync(path, content, "utf8");
  console.log("Updated " + path);
}

function read(path) {
  return fs.readFileSync(path, "utf8");
}

/* 1. Robust customer reward helper */
write("lib/customerRewards.ts", `import { supabaseAdmin } from "./supabase-admin";

type OrderItem = {
  quantity: number | null;
};

type Order = {
  id: string;
  customer_id: string | null;
  customer_email: string | null;
  total: number | null;
  status: string | null;
  points_awarded: boolean | null;
  order_items?: OrderItem[];
};

function calculateTier(points: number, completedOrders: number, lifetimeSpent: number) {
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

async function resolveCustomerId(order: Order) {
  if (order.customer_id) return order.customer_id;

  const email = order.customer_email?.trim().toLowerCase();

  if (!email) return null;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("id,email")
    .eq("email", email)
    .maybeSingle();

  if (profile?.id) {
    await supabaseAdmin
      .from("orders")
      .update({ customer_id: profile.id })
      .eq("id", order.id);

    return profile.id as string;
  }

  return null;
}

export async function awardPointsForCompletedOrder(orderId: string) {
  const { data: orderData, error: orderError } = await supabaseAdmin
    .from("orders")
    .select("id,customer_id,customer_email,total,status,points_awarded,order_items(quantity)")
    .eq("id", orderId)
    .single();

  if (orderError || !orderData) {
    return {
      awarded: false,
      message: orderError?.message || "Không tìm thấy đơn hàng.",
    };
  }

  const order = orderData as Order;

  if (order.points_awarded) {
    return {
      awarded: false,
      message: "Đơn này đã được cộng điểm trước đó.",
    };
  }

  if (order.status !== "Hoàn thành") {
    return {
      awarded: false,
      message: "Đơn chưa ở trạng thái Hoàn thành.",
    };
  }

  const customerId = await resolveCustomerId(order);

  if (!customerId) {
    return {
      awarded: false,
      message: "Không tìm được tài khoản khách để cộng điểm.",
    };
  }

  const total = Number(order.total || 0);
  const earnedPoints = Math.floor(total / 10000);
  const completedItems =
    order.order_items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0;

  const { data: currentPointRow } = await supabaseAdmin
    .from("customer_points")
    .select("*")
    .eq("user_id", customerId)
    .maybeSingle();

  const currentPoints = Number(currentPointRow?.points || 0);
  const currentLifetimePoints = Number(currentPointRow?.lifetime_points || 0);
  const currentLifetimeSpent = Number(currentPointRow?.lifetime_spent || 0);
  const currentCompletedOrders = Number(currentPointRow?.completed_orders || 0);
  const currentCompletedItems = Number(currentPointRow?.completed_items || 0);

  const nextPoints = currentPoints + earnedPoints;
  const nextLifetimePoints = currentLifetimePoints + earnedPoints;
  const nextLifetimeSpent = currentLifetimeSpent + total;
  const nextCompletedOrders = currentCompletedOrders + 1;
  const nextCompletedItems = currentCompletedItems + completedItems;
  const nextTier = calculateTier(nextPoints, nextCompletedOrders, nextLifetimeSpent);

  const payload = {
    user_id: customerId,
    points: nextPoints,
    lifetime_points: nextLifetimePoints,
    lifetime_spent: nextLifetimeSpent,
    completed_orders: nextCompletedOrders,
    completed_items: nextCompletedItems,
    tier: nextTier,
    updated_at: new Date().toISOString(),
  };

  if (currentPointRow?.id) {
    const { error } = await supabaseAdmin
      .from("customer_points")
      .update(payload)
      .eq("user_id", customerId);

    if (error) {
      return { awarded: false, message: error.message };
    }
  } else {
    const { error } = await supabaseAdmin
      .from("customer_points")
      .insert(payload);

    if (error) {
      return { awarded: false, message: error.message };
    }
  }

  await supabaseAdmin
    .from("orders")
    .update({
      customer_id: customerId,
      points_awarded: true,
      points_awarded_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  return {
    awarded: true,
    earnedPoints,
    completedItems,
    tier: nextTier,
    message: "Đã cộng " + earnedPoints + " điểm cho khách.",
  };
}
`);

/* 2. Admin orders API: update status + award points */
write("app/api/admin/orders/route.ts", `import { NextResponse } from "next/server";
import { createAuthServerClient } from "../../../../lib/supabase-auth/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { awardPointsForCompletedOrder } from "../../../../lib/customerRewards";

export const dynamic = "force-dynamic";

const allowedStatuses = [
  "Chờ xác nhận",
  "Chờ thanh toán",
  "Đã thanh toán",
  "Đã xác nhận",
  "Đang giao",
  "Hoàn thành",
  "Đã hủy",
  "Thanh toán thất bại",
];

async function isAdmin() {
  const auth = await createAuthServerClient();

  const {
    data: { user },
  } = await auth.auth.getUser();

  const admin = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  return Boolean(user?.email && admin && user.email.toLowerCase() === admin);
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { message: "Không có quyền truy cập." },
      { status: 403 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("orders")
    .select("*,order_items(id,product_name,product_price,quantity)")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ orders: data || [] });
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json(
      { message: "Không có quyền cập nhật." },
      { status: 403 }
    );
  }

  const { orderId, status } = await request.json().catch(() => ({}));

  if (!orderId || !allowedStatuses.includes(status)) {
    return NextResponse.json(
      { message: "Trạng thái không hợp lệ." },
      { status: 400 }
    );
  }

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  let reward = null;

  if (status === "Hoàn thành") {
    reward = await awardPointsForCompletedOrder(orderId);
  }

  return NextResponse.json({
    success: true,
    order,
    reward,
    message: reward?.awarded
      ? reward.message
      : "Đã cập nhật trạng thái đơn hàng.",
  });
}
`);

/* 3. Email route: allow admin OR order owner */
write("app/api/orders/send-email/route.ts", `import { NextResponse } from "next/server";
import { createAuthServerClient } from "../../../../lib/supabase-auth/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { sendOrderEmail } from "../../../../lib/sendOrderEmail";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  if (!body.orderId) {
    return NextResponse.json({ message: "Thiếu orderId." }, { status: 400 });
  }

  const auth = await createAuthServerClient();

  const {
    data: { user },
  } = await auth.auth.getUser();

  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .select("id,customer_id,customer_email")
    .eq("id", body.orderId)
    .maybeSingle();

  if (orderError || !order) {
    return NextResponse.json(
      { message: orderError?.message || "Không tìm thấy đơn hàng." },
      { status: 404 }
    );
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const userEmail = user?.email?.trim().toLowerCase() || "";
  const orderEmail = order.customer_email?.trim().toLowerCase() || "";

  const isAdmin = Boolean(userEmail && adminEmail && userEmail === adminEmail);
  const isOwnerById = Boolean(user?.id && order.customer_id === user.id);
  const isOwnerByEmail = Boolean(userEmail && orderEmail && userEmail === orderEmail);

  if (!isAdmin && !isOwnerById && !isOwnerByEmail) {
    return NextResponse.json(
      { message: "Bạn không có quyền gửi email đơn hàng này." },
      { status: 403 }
    );
  }

  try {
    return NextResponse.json(await sendOrderEmail(body.orderId));
  } catch (error: unknown) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Không gửi được email." },
      { status: 500 }
    );
  }
}
`);

/* 4. Admin order page: alert reward */
{
  const path = "app/admin/orders/page.tsx";
  let text = read(path);

  if (!text.includes("result.reward?.awarded")) {
    text = text.replace(
      "loadOrders(); } useEffect",
      "if (result.reward?.awarded) { alert(result.reward.message); } loadOrders(); } useEffect"
    );
  }

  write(path, text);
}

/* 5. Customer account dashboard: order fallback + real points */
{
  const path = "app/tai-khoan/page.tsx";
  let text = read(path);

  if (!text.includes("memberPoints")) {
    text = text.replace(
      "const { data: ordersData } = await supabase",
      `const { data: pointRow } = await supabase
    .from("customer_points")
    .select("points,lifetime_points,lifetime_spent,completed_orders,completed_items,tier")
    .eq("user_id", user!.id)
    .maybeSingle();

  const memberPoints = Number(pointRow?.points || 0);
  const memberTier = pointRow?.tier || "Rookie Builder";

  const { data: ordersData } = await supabase`
    );
  }

  text = text.replace(
    `.eq("customer_id", user!.id)
    .order("created_at", { ascending: false })`,
    `.or(\`customer_id.eq.\${user!.id},customer_email.eq.\${user!.email || ""}\`)
    .order("created_at", { ascending: false })`
  );

  text = text.replace("Cấp thành viên: Rookie Builder", "Cấp thành viên: {memberTier}");
  text = text.replace("Điểm tích lũy: 0 điểm", "Điểm tích lũy: {memberPoints} điểm");

  write(path, text);
}

/* 6. Customer orders list: fallback by email */
{
  const path = "app/tai-khoan/don-hang/page.tsx";
  let text = read(path);

  text = text.replace(
    `.eq("customer_id", user.id)`,
    `.or(\`customer_id.eq.\${user.id},customer_email.eq.\${user.email || ""}\`)`
  );

  text = text.replace(
    `.eq("customer_id", user!.id)`,
    `.or(\`customer_id.eq.\${user!.id},customer_email.eq.\${user!.email || ""}\`)`
  );

  write(path, text);
}

/* 7. Customer order detail: fallback by email */
{
  const path = "app/tai-khoan/don-hang/[id]/page.tsx";
  let text = read(path);

  text = text.replace(
    `.eq("id", id).eq("customer_id", user.id).maybeSingle()`,
    `.eq("id", id).or(\`customer_id.eq.\${user.id},customer_email.eq.\${user.email || ""}\`).maybeSingle()`
  );

  write(path, text);
}

console.log("Stage 6 core fixes completed.");