import { NextRequest, NextResponse } from "next/server";
import { verifyPasswordResetToken } from "../../../../lib/passwordResetToken";
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const token = String(body.token || "");
    const password = String(body.password || "");

    if (password.length < 6) {
      return NextResponse.json(
        { message: "Mật khẩu mới phải có ít nhất 6 ký tự." },
        { status: 400 }
      );
    }

    const payload = verifyPasswordResetToken(token);
    const user = await findUserByEmail(payload.email);

    if (!user) {
      return NextResponse.json(
        { message: "Không tìm thấy tài khoản cần đổi mật khẩu." },
        { status: 404 }
      );
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password,
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      message: "Đổi mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.",
    });
  } catch (error: any) {
    console.error("reset-password-custom error:", error);

    return NextResponse.json(
      {
        message:
          error?.message ||
          "Không đổi được mật khẩu. Link có thể đã hết hạn, vui lòng gửi lại yêu cầu.",
      },
      { status: 400 }
    );
  }
}