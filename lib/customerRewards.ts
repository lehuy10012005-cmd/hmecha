import { supabaseAdmin } from "./supabase-admin";

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
