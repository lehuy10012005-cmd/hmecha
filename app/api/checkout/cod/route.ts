import { NextResponse } from "next/server";
import { createAuthServerClient } from "../../../../lib/supabase-auth/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";
import { sendOrderEmail } from "../../../../lib/sendOrderEmail";
import { validateCartStock } from "../../../../lib/checkoutStock";

type CartItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(request: Request) {
  try {
    const auth = await createAuthServerClient();

    const {
      data: { user },
    } = await auth.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { message: "Bạn cần đăng nhập trước khi thanh toán." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const cart: CartItem[] = body.cart || [];
    const customer = body.customer || {};
    const coupon = body.coupon || null;

    if (!cart.length) {
      return NextResponse.json(
        { message: "Giỏ hàng đang trống." },
        { status: 400 }
      );
    }

    if (!customer.name || !customer.phone || !customer.address) {
      return NextResponse.json(
        { message: "Vui lòng nhập đầy đủ thông tin nhận hàng." },
        { status: 400 }
      );
    }

    const stockCheck = await validateCartStock(cart);

    if (!stockCheck.ok) {
      return NextResponse.json(
        {
          message: stockCheck.message,
          items: stockCheck.items,
        },
        { status: 409 }
      );
    }
    const subtotal = cart.reduce(
      (sum, item) => sum + Number(item.price) * Number(item.quantity),
      0
    );

    const shippingFee = subtotal >= 1000000 ? 0 : 30000;

    const discountAmount = Math.min(
      Math.max(0, Number(coupon?.discountAmount || 0)),
      subtotal + shippingFee
    );

    const total = Math.max(0, subtotal + shippingFee - discountAmount);

    const couponNote = coupon?.code
      ? ` | Mã giảm giá: ${String(coupon.code).toUpperCase()} (-${discountAmount.toLocaleString("vi-VN")}đ)`
      : "";

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_id: user.id,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_email: user.email || customer.email || null,
        customer_address: customer.address,
        note: `${customer.note || ""}${couponNote}`,
        payment_method: "cod",
        payment_status: "cod",
        subtotal,
        shipping_fee: shippingFee,
        total,
        status: "Chờ xác nhận",
      })
      .select()
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { message: orderError?.message || "Không tạo được đơn COD." },
        { status: 500 }
      );
    }

    const items = cart.map((item) => ({
      order_id: order.id,
      product_id: isUuid(item.id) ? item.id : null,
      product_name: item.name,
      product_price: item.price,
      quantity: item.quantity,
    }));

    const { error: itemError } = await supabaseAdmin
      .from("order_items")
      .insert(items);

    if (itemError) {
      return NextResponse.json(
        { message: "Đã tạo đơn nhưng lỗi lưu sản phẩm: " + itemError.message },
        { status: 500 }
      );
    }
try {
      await sendOrderEmail(order.id);
    } catch (emailError) {
      console.error("COD email failed:", emailError);
    }

    return NextResponse.json({
      orderId: order.id,
      successUrl:
        `/order-success?method=cod&total=${total}&order=${encodeURIComponent(order.id)}&content=COD`,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Lỗi tạo đơn COD." },
      { status: 500 }
    );
  }
}
