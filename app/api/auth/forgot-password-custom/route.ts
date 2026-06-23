import { NextRequest, NextResponse } from "next/server";
import { createPasswordResetToken } from "../../../../lib/passwordResetToken";
import { supabaseAdmin } from "../../../../lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function findUserByEmail(email: string) {
  const target = email.trim().toLowerCase();

  for (let page = 1; page <= 10; page++) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: 1000,
    });

    if (error) {
      throw error;
    }

    const user = data.users.find(
      (item) => item.email?.toLowerCase() === target
    );

    if (user) return user;

    if (data.users.length < 1000) break;
  }

  return null;
}

async function sendResetEmail(email: string, resetUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    throw new Error("Thiếu RESEND_API_KEY nên chưa gửi được email.");
  }

  const from =
    process.env.RESEND_FROM_EMAIL ||
    process.env.RESEND_FROM ||
    "HMECHA <onboarding@resend.dev>";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: email,
      subject: "Đặt lại mật khẩu HMECHA",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111827">
          <h2 style="margin:0 0 12px;color:#dc2626">Đặt lại mật khẩu HMECHA</h2>
          <p>HMECHA nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
          <p>Bấm nút bên dưới để tạo mật khẩu mới. Link có hiệu lực trong 30 phút.</p>
          <p style="margin:28px 0">
            <a href="${resetUrl}" style="background:#dc2626;color:#fff;text-decoration:none;padding:13px 18px;border-radius:10px;font-weight:700;display:inline-block">
              Đổi mật khẩu
            </a>
          </p>
          <p style="font-size:13px;color:#6b7280">Nếu bạn không yêu cầu đổi mật khẩu, hãy bỏ qua email này.</p>
          <p style="font-size:13px;color:#6b7280;word-break:break-all">Link: ${resetUrl}</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Không gửi được email đặt lại mật khẩu.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { message: "Vui lòng nhập email hợp lệ." },
        { status: 400 }
      );
    }

    const user = await findUserByEmail(email);

    if (user) {
      const token = createPasswordResetToken(email);
      const origin = request.nextUrl.origin;
      const resetUrl = `${origin}/doi-mat-khau?token=${encodeURIComponent(token)}`;

      await sendResetEmail(email, resetUrl);
    }

    return NextResponse.json({
      message:
        "Nếu email này đã đăng ký tài khoản HMECHA, hệ thống sẽ gửi link đặt lại mật khẩu. Vui lòng kiểm tra hộp thư hoặc spam.",
    });
  } catch (error: any) {
    console.error("forgot-password-custom error:", error);

    return NextResponse.json(
      {
        message:
          error?.message ||
          "Không gửi được email đặt lại mật khẩu. Vui lòng thử lại.",
      },
      { status: 500 }
    );
  }
}