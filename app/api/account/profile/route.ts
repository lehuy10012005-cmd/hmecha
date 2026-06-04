import { NextResponse } from "next/server";
import { createAuthServerClient } from "../../../../lib/supabase-auth/server";
export async function GET() {
  const supabase = await createAuthServerClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ message: "Chưa đăng nhập." }, { status: 401 });
  const { data, error } = await supabase.from("profiles").select("full_name,phone,email").eq("id", user.id).maybeSingle();
  if (error) return NextResponse.json({ message: error.message }, { status: 500 });
  return NextResponse.json({ profile: { full_name: data?.full_name || "", phone: data?.phone || "", email: user.email || data?.email || "" } });
}
