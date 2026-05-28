import { NextRequest, NextResponse } from "next/server";
import { detectIntent } from "@/lib/chatbot/intent";
import { findFaqAnswer } from "@/lib/chatbot/faq";
import { searchProductsForChat } from "@/lib/chatbot/product-search";
import { lookupOrderForChat } from "@/lib/chatbot/order-lookup";
import { answerBeginnerAdvice } from "@/lib/chatbot/beginner-advice";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = String(body?.message || "").trim();

    if (!message) {
      return NextResponse.json({
        intent: "empty",
        reply: "Bạn nhập câu hỏi để mình hỗ trợ nhé.",
      });
    }

    const intent = detectIntent(message);

    if (intent === "greeting") {
      return NextResponse.json({
        intent,
        reply:
          "Chào bạn 👋 Mình là bot hỗ trợ HMECHA. Bạn có thể hỏi mình về sản phẩm, giá, tồn kho, phí ship, thanh toán, đổi trả, tư vấn người mới hoặc kiểm tra đơn hàng.",
      });
    }

    if (intent === "human_support") {
      return NextResponse.json({
        intent,
        reply:
          "Bạn có thể liên hệ trực tiếp shop qua hotline hoặc nút liên hệ trên website để nhân viên tư vấn nhanh hơn. Nếu cần tư vấn sản phẩm, bạn gửi tên mẫu hoặc ngân sách, mình vẫn có thể gợi ý trước cho bạn.",
      });
    }

    if (intent === "order_lookup") {
      const reply = await lookupOrderForChat(message);
      return NextResponse.json({ intent, reply });
    }

    if (intent === "beginner_advice") {
      const reply = answerBeginnerAdvice(message);
      return NextResponse.json({ intent, reply });
    }

    if (intent === "faq") {
      const faqAnswer = findFaqAnswer(message);

      return NextResponse.json({
        intent,
        reply:
          faqAnswer ||
          "Mình chưa có câu trả lời chắc chắn cho phần này. Bạn có thể hỏi rõ hơn về phí ship, thanh toán, đổi trả, preorder, hàng chính hãng hoặc cách đặt hàng nhé.",
      });
    }

    if (intent === "product_search") {
      const reply = await searchProductsForChat(message);
      return NextResponse.json({ intent, reply });
    }

    return NextResponse.json({
      intent: "unknown",
      reply:
        "Mình chưa chắc câu này. Bạn có thể hỏi theo mẫu: “Có RX-78 không?”, “Sản phẩm dưới 500k”, “Người mới nên mua mẫu nào?”, “Phí ship bao nhiêu?”, hoặc “Kiểm tra đơn <mã đơn> - <số điện thoại>”.",
    });
  } catch (error) {
    console.error("Chatbot API error:", error);

    return NextResponse.json(
      {
        reply: "Bot đang gặp lỗi xử lý. Bạn thử gửi lại câu hỏi giúp mình nhé.",
      },
      { status: 500 }
    );
  }
}