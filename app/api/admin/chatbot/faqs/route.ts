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
    .from("chatbot_faqs")
    .select("*")
    .order("priority", { ascending: true });

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ faqs: data || [] });
}

export async function POST(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: "Không có quyền tạo câu trả lời." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));

  const payload = {
    question: String(body.question || "").trim(),
    keywords: String(body.keywords || "").trim(),
    answer: String(body.answer || "").trim(),
    category: String(body.category || "general").trim(),
    link_label: body.link_label ? String(body.link_label).trim() : null,
    link_url: body.link_url ? String(body.link_url).trim() : null,
    priority: Number(body.priority || 10),
    is_active: Boolean(body.is_active),
    updated_at: new Date().toISOString(),
  };

  if (!payload.question || !payload.answer) {
    return NextResponse.json({ message: "Vui lòng nhập câu hỏi và câu trả lời." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("chatbot_faqs")
    .insert(payload)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ faq: data, message: "Đã tạo câu trả lời bot." });
}

export async function PATCH(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: "Không có quyền sửa câu trả lời." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "").trim();

  if (!id) {
    return NextResponse.json({ message: "Thiếu ID." }, { status: 400 });
  }

  const payload = {
    question: String(body.question || "").trim(),
    keywords: String(body.keywords || "").trim(),
    answer: String(body.answer || "").trim(),
    category: String(body.category || "general").trim(),
    link_label: body.link_label ? String(body.link_label).trim() : null,
    link_url: body.link_url ? String(body.link_url).trim() : null,
    priority: Number(body.priority || 10),
    is_active: Boolean(body.is_active),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from("chatbot_faqs")
    .update(payload)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ faq: data, message: "Đã cập nhật câu trả lời bot." });
}

export async function DELETE(request: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ message: "Không có quyền tắt câu trả lời." }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "").trim();

  if (!id) {
    return NextResponse.json({ message: "Thiếu ID." }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from("chatbot_faqs")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ faq: data, message: "Đã tắt câu trả lời." });
}
