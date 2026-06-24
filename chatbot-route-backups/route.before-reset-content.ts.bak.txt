import { NextRequest, NextResponse } from "next/server";
import { detectIntent } from "@/lib/chatbot/intent";
import { findFaqAnswer } from "@/lib/chatbot/faq";
import { searchProductsForChat } from "@/lib/chatbot/product-search";
import { lookupOrderForChat } from "@/lib/chatbot/order-lookup";
import { answerBeginnerAdvice } from "@/lib/chatbot/beginner-advice";

export const dynamic = "force-dynamic";

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
          "Dạ, HMECHA xin chào bạn. Mình có thể hỗ trợ bạn về sản phẩm, giá, tồn kho, phí ship, thanh toán, mã giảm giá, điểm tích lũy, đơn hàng hoặc tư vấn cho người mới chơi Gunpla.",
      });
    }

    if (intent === "human_support") {
      return NextResponse.json({
        intent,
        reply:
          "Mình đã ghi nhận bạn muốn gặp admin tư vấn. Bạn hãy gửi rõ nhu cầu nhé, ví dụ: ngân sách, dòng mô hình muốn mua, mã đơn hàng hoặc sản phẩm đang phân vân. Admin sẽ dễ hỗ trợ chính xác hơn.",
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
          "Mình chưa có câu trả lời chắc chắn cho phần này. Bạn có thể hỏi rõ hơn về phí ship, thanh toán, đổi trả, preorder, mã giảm giá, điểm tích lũy hoặc cách đặt hàng nhé.",
      });
    }

    if (intent === "product_search") {
      const reply = await searchProductsForChat(message);
      return NextResponse.json({ intent, reply });
    }

    const faqAnswer = findFaqAnswer(message);

    if (faqAnswer) {
      return NextResponse.json({
        intent: "faq",
        reply: faqAnswer,
      });
    }

    return NextResponse.json({
      intent: "unknown",
      reply:
        "Mình chưa chắc câu này. Bạn có thể hỏi theo các mẫu sau:\n\n- Sản phẩm dưới 500k\n- Người mới nên mua mẫu nào?\n- Phí ship bao nhiêu?\n- Có mã giảm giá không?\n- Điểm tích lũy dùng sao?\n- Kiểm tra đơn hàng #mã_đơn\n- Gặp admin tư vấn",
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