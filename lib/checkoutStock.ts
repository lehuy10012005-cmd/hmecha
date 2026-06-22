import { supabaseAdmin } from "./supabase-admin";

type CartItem = {
  id: string;
  name?: string;
  quantity: number;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export async function validateCartStock(cart: CartItem[]) {
  const requiredMap = new Map<
    string,
    {
      quantity: number;
      name: string;
    }
  >();

  for (const item of cart || []) {
    const id = String(item.id || "").trim();
    const quantity = Math.max(0, Number(item.quantity || 0));

    if (!id || !isUuid(id)) continue;

    const current = requiredMap.get(id);

    requiredMap.set(id, {
      quantity: (current?.quantity || 0) + quantity,
      name: item.name || current?.name || "Sản phẩm",
    });
  }

  const ids = Array.from(requiredMap.keys());

  if (!ids.length) {
    return {
      ok: true,
      message: "",
      items: [],
    };
  }

  const { data, error } = await supabaseAdmin
    .from("products")
    .select("id,name,stock_quantity,status")
    .in("id", ids);

  if (error) {
    return {
      ok: false,
      message: "Không kiểm tra được tồn kho. Vui lòng thử lại sau.",
      items: [],
    };
  }

  const productMap = new Map((data || []).map((product: any) => [product.id, product]));

  const problems: string[] = [];
  const problemItems: any[] = [];

  for (const [id, required] of requiredMap.entries()) {
    const product: any = productMap.get(id);

    if (!product) {
      problems.push(`- ${required.name}: sản phẩm không còn tồn tại trong hệ thống.`);
      problemItems.push({
        id,
        name: required.name,
        requested: required.quantity,
        available: 0,
      });
      continue;
    }

    const status = String(product.status || "").toLowerCase();
    const stock = Math.max(0, Number(product.stock_quantity || 0));
    const available = status.includes("hết hàng") ? 0 : stock;

    if (required.quantity <= 0) {
      problems.push(`- ${product.name || required.name}: số lượng không hợp lệ.`);
      problemItems.push({
        id,
        name: product.name || required.name,
        requested: required.quantity,
        available,
      });
      continue;
    }

    if (required.quantity > available) {
      problems.push(
        `- ${product.name || required.name}: chỉ còn ${available} sản phẩm, bạn đang chọn ${required.quantity}.`
      );

      problemItems.push({
        id,
        name: product.name || required.name,
        requested: required.quantity,
        available,
      });
    }
  }

  if (problems.length) {
    return {
      ok: false,
      message:
        "Không đủ hàng trong kho:\n" +
        problems.join("\n") +
        "\nVui lòng giảm số lượng trước khi thanh toán.",
      items: problemItems,
    };
  }

  return {
    ok: true,
    message: "",
    items: [],
  };
}