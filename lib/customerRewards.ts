import { supabaseAdmin } from "./supabase-admin";

type OrderItem = {
  quantity: number | null;
};

type Order = {
  id: string;
  customer_id: string | null;
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

export async function awardPointsForCompletedOrder(orderId: string) {
  const { data: orderData, error: orderError } = await supabaseAdmin
    .from("orders")
    .select(`
      id,
      customer_id,
      total,
      status,
      points_awarded,
      order_items (
        quantity
      )
    `)
    .eq("id", orderId)
    .single();

  if (orderError || !orderData) {
    return {
      awarded: false,
      message: orderError?.message || "Không tìm thấy đơn hàng.",
    };
  }

  const order = orderData as Order;

  if (!order.customer_id) {
    return {
      awarded: false,
      message: "Đơn này chưa gắn customer_id nên không cộng điểm.",
    };
  }

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

  const total = Number(order.total || 0);
  const earnedPoints = Math.floor(total / 10000);
  const completedItems =
    order.order_items?.reduce((sum, item) => sum + Number(item.quantity || 0), 0) || 0;

  const { data: currentPointRow } = await supabaseAdmin
    .from("customer_points")
    .select("*")
    .eq("user_id", order.customer_id)
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

  if (currentPointRow?.id) {
    const { error: updateError } = await supabaseAdmin
      .from("customer_points")
      .update({
        points: nextPoints,
        lifetime_points: nextLifetimePoints,
        lifetime_spent: nextLifetimeSpent,
        completed_orders: nextCompletedOrders,
        completed_items: nextCompletedItems,
        tier: nextTier,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", order.customer_id);

    if (updateError) {
      return {
        awarded: false,
        message: updateError.message,
      };
    }
  } else {
    const { error: insertError } = await supabaseAdmin.from("customer_points").insert({
      user_id: order.customer_id,
      points: nextPoints,
      lifetime_points: nextLifetimePoints,
      lifetime_spent: nextLifetimeSpent,
      completed_orders: nextCompletedOrders,
      completed_items: nextCompletedItems,
      tier: nextTier,
      updated_at: new Date().toISOString(),
    });

    if (insertError) {
      return {
        awarded: false,
        message: insertError.message,
      };
    }
  }

  await supabaseAdmin
    .from("orders")
    .update({
      points_awarded: true,
      points_awarded_at: new Date().toISOString(),
    })
    .eq("id", order.id);

  return {
    awarded: true,
    earnedPoints,
    completedItems,
    tier: nextTier,
    message: `Đã cộng ${earnedPoints} điểm cho khách.`,
  };
}