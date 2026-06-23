import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createPasswordResetChallenge } from "../../../../lib/passwordResetToken";
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

    if (error) throw error;

    const user = data.users.find(
      (item) => item.email?.toLowerCase() === target
    );

    if (user) return user;
    if (data.users.length < 1000) break;
  }

  return null;
}

async function sendCodeEmail(email: string, code: string) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, "");

  if (!gmailUser || !gmailPassword) {
    throw new Error("Thiếu GMAIL_USER hoặc GMAIL_APP_PASSWORD nên chưa gửi được email.");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailPassword,
    },
  });

  await transporter.sendMail({
    from: `"HMECHA" <${gmailUser}>`,
    to: email,
    subject: "Mã xác nhận đổi mật khẩu HMECHA",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#111827">
        <h2 style="margin:0 0 12px;color:#dc2626">Mã xác nhận đổi mật khẩu HMECHA</h2>

        <p>HMECHA nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>

        <p>Mã xác nhận của bạn là:</p>

        <div style="margin:22px 0;padding:18px 22px;border-radius:14px;background:#111827;color:#ffffff;font-size:34px;font-weight:900;letter-spacing:8px;text-align:center">
          ${code}
        </div>

        <p>Mã này có hiệu lực trong <b>10 phút</b>. Vui lòng không chia sẻ mã này cho người khác.</p>

        <p style="font-size:13px;color:#6b7280">
          Nếu bạn không yêu cầu đổi mật khẩu, hãy bỏ qua email này.
        </p>
      </div>
    `,
  });
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

    if (!user) {
      return NextResponse.json({
        message:
          "Nếu email này đã đăng ký tài khoản HMECHA, hệ thống sẽ gửi mã xác nhận. Vui lòng kiểm tra hộp thư hoặc spam.",
        challengeToken: "",
      });
    }

    const { code, challengeToken } = createPasswordResetChallenge(email);

    await sendCodeEmail(email, code);

    return NextResponse.json({
      message:
        "Mã xác nhận 6 chữ số đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư hoặc spam.",
      challengeToken,
    });
  } catch (error: any) {
    console.error("forgot-password-custom otp error:", error);

    return NextResponse.json(
      {
        message:
          error?.message ||
          "Không gửi được mã xác nhận. Vui lòng thử lại.",
      },
      { status: 500 }
    );
  }
}