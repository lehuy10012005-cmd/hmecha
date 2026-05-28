import { NextResponse } from "next/server";
import { sendOrderEmail } from "../../../../lib/sendOrderEmail";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const orderId = body.orderId;

    console.log("SEND EMAIL API CALLED:", orderId);

    if (!orderId) {
      return NextResponse.json(
        { message: "Thiếu orderId." },
        { status: 400 }
      );
    }

    const result = await sendOrderEmail(orderId);

    console.log("SEND EMAIL RESULT:", result);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("SEND EMAIL API ERROR:", error);

    return NextResponse.json(
      { message: error?.message || "Không gửi được email." },
      { status: 500 }
    );
  }
}