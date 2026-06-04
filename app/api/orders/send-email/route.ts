import { NextResponse } from "next/server";
import { createAuthServerClient } from "../../../../lib/supabase-auth/server";
import { sendOrderEmail } from "../../../../lib/sendOrderEmail";
export async function POST(request: Request) {
  const auth = await createAuthServerClient(); const { data: { user } } = await auth.auth.getUser();
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!user?.email || !adminEmail || user.email.toLowerCase() !== adminEmail) return NextResponse.json({ message: "Bạn không có quyền gửi email đơn hàng." }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  if (!body.orderId) return NextResponse.json({ message: "Thiếu orderId." }, { status: 400 });
  try { return NextResponse.json(await sendOrderEmail(body.orderId)); }
  catch (error: unknown) { return NextResponse.json({ message: error instanceof Error ? error.message : "Không gửi được email." }, { status: 500 }); }
}
