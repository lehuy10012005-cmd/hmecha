import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

type PendingCookie = { name: string; value: string; options?: CookieOptions };
function safeNext(input: unknown) { const value = String(input || "/tai-khoan"); return value.startsWith("/") && !value.startsWith("//") ? value : "/tai-khoan"; }

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const redirectTo = safeNext(body.next);
  if (!email || !password) return NextResponse.json({ message: "Vui lòng nhập email và mật khẩu." }, { status: 400 });

  const pendingCookies: PendingCookie[] = [];
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll: () => request.cookies.getAll(), setAll: (cookies) => { pendingCookies.push(...cookies); } },
  });
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return NextResponse.json({ message: "Email hoặc mật khẩu không đúng, hoặc email chưa được xác nhận." }, { status: 401 });
  const response = NextResponse.json({ success: true, redirectTo });
  pendingCookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  return response;
}
