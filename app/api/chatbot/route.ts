import { NextResponse } from "next/server";
import { createAuthServerClient } from "@/lib/supabase-auth/server";
import { supabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function money(value: number) {
  return Number(value || 0).toLocaleString("vi-VN") + "đ";
}

async function getOrCreateConversation(sessionId: string, pageUrl: string) {
  const auth = await createAuthServerClient();
  const {
    data: { user },
  } = await auth.auth.getUser();

  const { data: existing } = await supabaseAdmin
    .from("chat_conversations")
    .select("*")
    .eq("session_id", sessionId)
    .maybeSingle();

  if (existing) {
    await supabaseAdmin
      .from("chat_conversations")
      .update({
        user_id: user?.id || existing.user_id || null,
        customer_email: user?.email || existing.customer_email || null,
        page_url: pageUrl || existing.page_url || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    return existing;
  }

  const { data: created, error } = await supabaseAdmin
    .from("chat_conversations")
    .insert({
      session_id: sessionId,
      user_id: user?.id || null,
      customer_email: user?.email || null,
      page_url: pageUrl || null,
      status: "open",
    })
    .select()
    .single();

  if (error || !created) {
    throw new Error(error?.message || "Không tạo được cuộc trò chuyện.");
  }

  return created;
}

async function saveMessage(conversationId: string, sender: string, message: string) {
  await supabaseAdmin.from("chat_messages").insert({
    conversation_id: conversationId,
    sender,
    message,
  });

  await supabaseAdmin
    .from("chat_conversations")
    .update({
      last_message: message,
      last_sender: sender,
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId);
}

async function findAdminFaq(message: string) {
  const { data } = await supabaseAdmin
    .from("chatbot_faqs")
    .select("*")
    .eq("is_active", true)
    .order("priority", { ascending: true });

  const cleanMessage = normalize(message);

  for (const faq of data || []) {
    const keywords = String(faq.keywords || "")
      .split(/[,;\n]/)
      .map((item) => normalize(item.trim()))
      .filter(Boolean);

    const question = normalize(String(faq.question || ""));

    if (question && cleanMessage.includes(question)) {
      return faq;
    }

    if (keywords.some((keyword) => cleanMessage.includes(keyword))) {
      return faq;
    }
  }

  return null;
}

function extractMaxPrice(message: string) {
  const clean = normalize(message);
  const match = clean.match(/(\d+)\s*(k|nghin|ngan|000)?/);

  if (!match) return null;

  let value = Number(match[1] || 0);

  if (match[2] === "k" || match[2] === "nghin" || match[2] === "ngan") {
    value = value * 1000;
  }

  if (value > 0 && value < 10000) {
    value = value * 1000;
  }

  if (clean.includes("duoi") || clean.includes("tam") || clean.includes("khoang")) {
    return value;
  }

  return null;
}

async function productSuggestion(message: string) {
  const clean = normalize(message);
  const shouldSearch =
    clean.includes("san pham") ||
    clean.includes("mau") ||
    clean.includes("gunpla") ||
    clean.includes("gundam") ||
    clean.includes("duoi") ||
    clean.includes("tu van") ||
    clean.includes("goi y");

  if (!shouldSearch) return null;

  const maxPrice = extractMaxPrice(message);

  let query = supabaseAdmin
    .from("products")
    .select("id,name,slug,price,status,stock_quantity,badge,is_active")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(20);

  const { data, error } = await query;

  if (error) return null;

  let products = data || [];

  if (maxPrice) {
    products = products.filter((item) => Number(item.price || 0) <= maxPrice);
  }

  products = products
    .filter((item) => String(item.status || "").toLowerCase() !== "hết hàng")
    .slice(0, 4);

  if (!products.length) {
    return "Mình chưa tìm thấy sản phẩm phù hợp trong tầm giá này. Bạn có thể thử tăng ngân sách hoặc xem toàn bộ sản phẩm tại /san-pham.";
  }

  const lines = products.map((item, index) => {
    return (
      String(index + 1) +
      ". " +
      item.name +
      " - " +
      money(Number(item.price || 0)) +
      " → /" +
      item.slug
    );
  });

  return "Mình gợi ý cho bạn vài mẫu phù hợp:\n" + lines.join("\n");
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const message = String(body.message || "").trim();
    const sessionId = String(body.sessionId || "").trim();
    const pageUrl = String(body.pageUrl || "").trim();

    if (!message) {
      return NextResponse.json({ reply: "Bạn nhập câu hỏi để mình hỗ trợ nhé." });
    }

    if (!sessionId) {
      return NextResponse.json({ reply: "Thiếu session chat. Bạn tải lại trang rồi thử lại nhé." }, { status: 400 });
    }

    const conversation = await getOrCreateConversation(sessionId, pageUrl);

    await saveMessage(conversation.id, "customer", message);

    const faq = await findAdminFaq(message);
    let reply = "";

    if (faq) {
      reply = String(faq.answer || "");

      if (faq.link_url) {
        reply += "\n" + (faq.link_label || "Xem thêm") + ": " + faq.link_url;
      }
    }

    if (!reply) {
      const productReply = await productSuggestion(message);
      if (productReply) reply = productReply;
    }

    if (!reply) {
      reply =
        "Mình đã ghi nhận câu hỏi này và chuyển cho admin HMECHA. Trong lúc chờ, bạn có thể hỏi mình về sản phẩm, phí ship, thanh toán, mã giảm giá hoặc điểm tích lũy.";
    }

    await saveMessage(conversation.id, "bot", reply);

    return NextResponse.json({
      conversationId: conversation.id,
      reply,
    });
  } catch (error) {
    console.error("Chatbot error:", error);

    return NextResponse.json(
      { reply: "Bot đang gặp lỗi xử lý. Bạn thử gửi lại giúp mình nhé." },
      { status: 500 }
    );
  }
}
