import { NextResponse } from "next/server";
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
