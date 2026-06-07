import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sessionId = String(url.searchParams.get("sessionId") || "").trim();

  if (!sessionId) {
    return NextResponse.json({ messages: [] });
  }

  const { data: conversation } = await supabaseAdmin
    .from("chat_conversations")
    .select("id,status")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (!conversation) {
    return NextResponse.json({ messages: [] });
  }

  const { data, error } = await supabaseAdmin
    .from("chat_messages")
    .select("id,sender,message,created_at")
    .eq("conversation_id", conversation.id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ message: error.message, messages: [] }, { status: 500 });
  }

  return NextResponse.json({
    conversationId: conversation.id,
    status: conversation.status,
    messages: data || [],
  });
}
