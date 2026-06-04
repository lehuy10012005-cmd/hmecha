import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

type PendingCookie = { name: string; value: string; options?: CookieOptions };
function safeNext(input: unknown) { const value = String(input || "/tai-khoan"); return value.startsWith("/") && !value.startsWith("//") ? value : "/tai-khoan"; }

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const fullName = String(body.fullName || "").trim();
  const phone = String(body.phone || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const redirectTo = safeNext(body.next);

  if (!fullName || !phone || !email || !password) return NextResponse.json({ message: "Vui lòng nhập đầy đủ thông tin." }, { status: 400 });
  if (password.length < 6) return NextResponse.json({ message: "Mật khẩu phải có ít nhất 6 ký tự." }, { status: 400 });

  const pendingCookies: PendingCookie[] = [];
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll: () => request.cookies.getAll(), setAll: (cookies) => { pendingCookies.push(...cookies); } },
  });
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, phone } } });
  if (error) return NextResponse.json({ message: error.message || "Không tạo được tài khoản." }, { status: 400 });
  const response = NextResponse.json({ success: true, requiresConfirmation: !data.session, redirectTo });
  pendingCookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  return response;
}
