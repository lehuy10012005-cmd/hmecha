import { NextResponse } from "next/server";
import { createAuthServerClient } from "@/lib/supabase-auth/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const auth = await createAuthServerClient();

  const {
    data: { user },
  } = await auth.auth.getUser();

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!user?.email || !adminEmail || user.email.toLowerCase() !== adminEmail) {
    return false;
  }

  return true;
}


export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: "Không có quyền truy cập." }, { status: 403 });
  }

  const { data, error } = await supabaseAdmin
    .from("chat_conversations")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(80);

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ conversations: data || [] });
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: "Không có quyền cập nhật." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "").trim();
  const status = String(body.status || "open").trim();

  if (!id) {
    return NextResponse.json({ message: "Thiếu ID cuộc trò chuyện." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("chat_conversations")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ conversation: data });
}
