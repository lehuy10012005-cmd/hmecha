import { supabaseAdmin } from "./supabase-admin";

type OrderStockResult = {
  ok: boolean;
  action: "deducted" | "restored" | "none";
  message: string;
  details?: Array<{
    product_id: string;
    before_stock: number;
    after_stock: number;
    quantity_change: number;
  }>;
};

type OrderItemForStock = {
  product_id: string | null;
  product_name: string | null;
  quantity: number | null;
};

type ProductForStock = {
  id: string;
  name: string;
  sku: string | null;
  status: string | null;
  stock_quantity: number | null;
};

function normalizeText(value: unknown) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ")
    .trim();
}

export function isStockDeductStatus(status: unknown) {
  const value = normalizeText(status);

  return (
    value === "hoan thanh" ||
    value === "da hoan thanh" ||
    value === "completed" ||
    value === "complete"
  );
}

export function isCancelledOrderStatus(status: unknown) {
  const value = normalizeText(status);

  return (
    value === "da huy" ||
    value === "huy" ||
    value === "cancelled" ||
    value === "canceled" ||
    value === "cancel"
  );
}

function getNextStatus(currentStatus: unknown, nextStock: number) {
  const status = String(currentStatus || "").trim();
  const normalized = normalizeText(status);

  if (nextStock <= 0) {
    return "Hết hàng";
  }

  if (!status || normalized.includes("het hang")) {
    return "Còn hàng";
  }

  return status;
}

async function writeInventoryLog(input: {
  product_id: string;
  product_name: string;
  sku: string | null;
  before_stock: number;
  after_stock: number;
  quantity_change: number;
  before_status: string | null;
  after_status: string;
  note: string;
  source: string;
}) {
  try {
    const { error } = await supabaseAdmin.from("inventory_logs").insert({
      product_id: input.product_id,
      product_name: input.product_name,
      sku: input.sku,
      action: input.quantity_change < 0 ? "decrease" : "increase",
      before_stock: input.before_stock,
      after_stock: input.after_stock,
      quantity_change: input.quantity_change,
      before_status: input.before_status,
      after_status: input.after_status,
      note: input.note,
      source: input.source,
    });

    if (error) {
      console.warn("Không ghi được lịch sử kho:", error.message);
    }
  } catch {
    // Không để lỗi inventory_logs làm hỏng luồng cập nhật đơn.
  }
}

async function findProductForOrderItem(item: OrderItemForStock) {
  const productId = String(item.product_id || "").trim();
  const productName = String(item.product_name || "").trim();

  if (productId) {
    const { data } = await supabaseAdmin
      .from("products")
      .select("id,name,sku,status,stock_quantity")
      .eq("id", productId)
      .maybeSingle<ProductForStock>();

    if (data) return data;
  }

  if (productName) {
    const { data } = await supabaseAdmin
      .from("products")
      .select("id,name,sku,status,stock_quantity")
      .eq("name", productName)
      .maybeSingle<ProductForStock>();

    if (data) return data;

    const { data: similarProducts } = await supabaseAdmin
      .from("products")
      .select("id,name,sku,status,stock_quantity")
      .ilike("name", `%${productName.slice(0, 40)}%`)
      .limit(1);

    if (similarProducts?.[0]) return similarProducts[0] as ProductForStock;
  }

  return null;
}

async function changeStockForOrder(
  orderId: string,
  mode: "deduct" | "restore",
  source: string
): Promise<OrderStockResult> {
  const { data: items, error: itemsError } = await supabaseAdmin
    .from("order_items")
    .select("product_id,product_name,quantity")
    .eq("order_id", orderId);

  if (itemsError) {
    return {
      ok: false,
      action: "none",
      message: "Không đọc được sản phẩm trong đơn: " + itemsError.message,
    };
  }

  const validItems = ((items || []) as OrderItemForStock[]).filter((item) => {
    const quantity = Number(item.quantity || 0);

    return quantity > 0 && (item.product_id || item.product_name);
  });

  if (!validItems.length) {
    return {
      ok: true,
      action: "none",
      message: "Đơn hàng không có sản phẩm hợp lệ để cập nhật kho.",
    };
  }

  const details: OrderStockResult["details"] = [];

  for (const item of validItems) {
    const quantity = Math.max(0, Number(item.quantity || 0));
    const product = await findProductForOrderItem(item);

    if (!product) {
      return {
        ok: false,
        action: "none",
        message:
          "Không tìm thấy sản phẩm để cập nhật kho: " +
          (item.product_name || item.product_id || "Không rõ"),
      };
    }

    const beforeStock = Math.max(0, Number(product.stock_quantity || 0));
    const quantityChange = mode === "deduct" ? -quantity : quantity;
    const afterStock = Math.max(0, beforeStock + quantityChange);
    const afterStatus = getNextStatus(product.status, afterStock);

    const { error: updateError } = await supabaseAdmin
      .from("products")
      .update({
        stock_quantity: afterStock,
        status: afterStatus,
        stock_updated_at: new Date().toISOString(),
      })
      .eq("id", product.id);

    if (updateError) {
      return {
        ok: false,
        action: "none",
        message: `Không cập nhật được kho của ${product.name}: ${updateError.message}`,
      };
    }

    await writeInventoryLog({
      product_id: product.id,
      product_name: product.name || "Sản phẩm",
      sku: product.sku || null,
      before_stock: beforeStock,
      after_stock: afterStock,
      quantity_change: quantityChange,
      before_status: product.status || null,
      after_status: afterStatus,
      note:
        mode === "deduct"
          ? `Tự động trừ kho khi đơn ${orderId} hoàn thành`
          : `Tự động hoàn kho khi đơn ${orderId} bị hủy`,
      source,
    });

    details.push({
      product_id: product.id,
      before_stock: beforeStock,
      after_stock: afterStock,
      quantity_change: quantityChange,
    });
  }

  await supabaseAdmin
    .from("orders")
    .update({
      stock_deducted: mode === "deduct",
      stock_deducted_at: mode === "deduct" ? new Date().toISOString() : null,
    })
    .eq("id", orderId);

  return {
    ok: true,
    action: mode === "deduct" ? "deducted" : "restored",
    message:
      mode === "deduct"
        ? "Đã tự động trừ kho theo đơn hàng."
        : "Đã tự động cộng trả kho theo đơn hủy.",
    details,
  };
}

export async function syncOrderStockForStatus(
  orderId: string,
  status: string,
  source = "order-status"
): Promise<OrderStockResult> {
  const { data: order, error: orderError } = await supabaseAdmin
    .from("orders")
    .select("id,stock_deducted")
    .eq("id", orderId)
    .maybeSingle();

  if (orderError || !order) {
    return {
      ok: false,
      action: "none",
      message: orderError?.message || "Không tìm thấy đơn hàng.",
    };
  }

  const alreadyDeducted = Boolean(order.stock_deducted);

  if (isStockDeductStatus(status)) {
    if (alreadyDeducted) {
      return {
        ok: true,
        action: "none",
        message: "Kho của đơn này đã được trừ trước đó, không trừ lại.",
      };
    }

    return changeStockForOrder(orderId, "deduct", source);
  }

  if (isCancelledOrderStatus(status)) {
    if (!alreadyDeducted) {
      return {
        ok: true,
        action: "none",
        message: "Đơn chưa trừ kho nên không cần hoàn kho.",
      };
    }

    return changeStockForOrder(orderId, "restore", source);
  }

  return {
    ok: true,
    action: "none",
    message: "Trạng thái này không cần thay đổi tồn kho.",
  };
}