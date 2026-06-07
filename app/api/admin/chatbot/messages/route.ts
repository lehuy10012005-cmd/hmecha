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


export async function GET(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: "Không có quyền truy cập." }, { status: 403 });
  }

  const url = new URL(request.url);
  const conversationId = String(url.searchParams.get("conversationId") || "").trim();

  if (!conversationId) {
    return NextResponse.json({ messages: [] });
  }

  const { data, error } = await supabaseAdmin
    .from("chat_messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ messages: data || [] });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: "Không có quyền trả lời." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const conversationId = String(body.conversationId || "").trim();
  const message = String(body.message || "").trim();

  if (!conversationId || !message) {
    return NextResponse.json({ message: "Thiếu nội dung trả lời." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("chat_messages")
    .insert({
      conversation_id: conversationId,
      sender: "admin",
      message,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  await supabaseAdmin
    .from("chat_conversations")
    .update({
      status: "open",
      last_message: message,
      last_sender: "admin",
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId);

  return NextResponse.json({ message: data });
}
