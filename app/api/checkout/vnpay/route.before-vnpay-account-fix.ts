import { NextResponse } from "next/server";
import crypto from "crypto";
import qs from "qs";
import { supabase } from "../../../../lib/supabase"; import { createAuthServerClient } from "../../../../lib/supabase-auth/server";

type CartItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  quantity: number;
};

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function formatDate(date: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}

function sortObject(obj: Record<string, string | number>) {
  const sorted: Record<string, string> = {};
  const keys: string[] = [];

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      keys.push(encodeURIComponent(key));
    }
  }

  keys.sort();

  for (const key of keys) {
    sorted[key] = encodeURIComponent(String(obj[key])).replace(/%20/g, "+");
  }

  return sorted;
}

export async function POST(request: Request) {
  try {
    const authSupabase = await createAuthServerClient(); const { data: { user } } = await authSupabase.auth.getUser(); const body = await request.json();

    const cart: CartItem[] = body.cart || [];
    const customer = body.customer || {};
    const coupon = body.coupon || null;

    if (!cart.length) {
      return NextResponse.json({ message: "Giá» hÃ ng Ä‘ang trá»‘ng." }, { status: 400 });
    }

    if (!customer.name || !customer.phone || !customer.address) {
      return NextResponse.json({ message: "Thiáº¿u thÃ´ng tin khÃ¡ch hÃ ng." }, { status: 400 });
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
      ? ` | MÃ£ giáº£m giÃ¡: ${String(coupon.code).toUpperCase()} (-${discountAmount.toLocaleString("vi-VN")}Ä‘)`
      : "";

    const txnRef = Date.now().toString();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_email: customer.email || user?.email || null,
        customer_address: customer.address,
        note: `${customer.note || ""}${couponNote}`,
        subtotal,
        shipping_fee: shippingFee,
        total,
        status: "Chá» thanh toÃ¡n",
        payment_method: "vnpay",
        payment_status: "pending",
        vnpay_txn_ref: txnRef,
      })
      .select()
      .single();

    if (orderError) {
      return NextResponse.json({ message: orderError.message }, { status: 500 });
    }

    const orderItems = cart.map((item) => ({
      order_id: order.id,
      product_id: isUuid(item.id) ? item.id : null,
      product_name: item.name,
      product_price: item.price,
      quantity: item.quantity,
    }));

    const { error: itemError } = await supabase.from("order_items").insert(orderItems);

    if (itemError) {
      return NextResponse.json({ message: itemError.message }, { status: 500 });
    }

    const tmnCode = (process.env.VNPAY_TMN_CODE || "").trim();
    const secretKey = (process.env.VNPAY_HASH_SECRET || "").trim();
    const vnpUrl = (process.env.VNPAY_URL || "").trim();

    const returnUrl = (
      process.env.VNPAY_RETURN_URL || "http://localhost:3000/payment/vnpay-return"
    ).trim();

    if (!tmnCode || !secretKey || !vnpUrl) {
      return NextResponse.json(
        { message: "Thiáº¿u cáº¥u hÃ¬nh VNPAY trong .env.local." },
        { status: 500 }
      );
    }

    const vnpParams: Record<string, string | number> = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: tmnCode,
      vnp_Locale: "vn",
      vnp_CurrCode: "VND",
      vnp_TxnRef: txnRef,
      vnp_OrderInfo: `Thanh toan don hang HMECHA ${txnRef}`,
      vnp_OrderType: "other",
      vnp_Amount: total * 100,
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: "127.0.0.1",
      vnp_CreateDate: formatDate(new Date()),
    };

    const sortedParams = sortObject(vnpParams);

    const signData = qs.stringify(sortedParams, {
      encode: false,
    });

    const secureHash = crypto
      .createHmac("sha512", secretKey)
      .update(Buffer.from(signData, "utf-8"))
      .digest("hex");

    sortedParams.vnp_SecureHash = secureHash;

    const paymentUrl =
      vnpUrl +
      "?" +
      qs.stringify(sortedParams, {
        encode: false,
      });

    return NextResponse.json({
      orderId: order.id,
      paymentUrl,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Lá»—i táº¡o thanh toÃ¡n VNPAY." },
      { status: 500 }
    );
  }
}