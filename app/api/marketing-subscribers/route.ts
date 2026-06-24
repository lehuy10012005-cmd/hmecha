import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { supabaseAdmin } from "../../../lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://hmecha.vercel.app"
  ).replace(/\/$/, "");
}

async function notifyAdmin(input: {
  email: string;
  name?: string | null;
  source: string;
}) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("Thiếu GMAIL_USER hoặc GMAIL_APP_PASSWORD.");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });

  const now = new Date().toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
  });

  await transporter.sendMail({
    from: `"HMECHA Website" <${user}>`,
    to: user,
    subject: "Có khách đăng ký nhận tin HMECHA",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:640px;margin:auto">
        <h2 style="color:#dc2626">Có khách đăng ký nhận tin HMECHA</h2>
        <div style="border:1px solid #e5e7eb;border-radius:14px;padding:16px;background:#f9fafb">
          <p><b>Email khách:</b> ${input.email}</p>
          ${input.name ? `<p><b>Tên:</b> ${input.name}</p>` : ""}
          <p><b>Nguồn:</b> ${input.source}</p>
          <p><b>Thời gian:</b> ${now}</p>
          <p><b>Website:</b> ${getBaseUrl()}</p>
        </div>
        <p style="color:#6b7280;font-size:13px">
          Bạn có thể copy email này vào trang Admin Marketing để gửi thông báo sản phẩm mới.
        </p>
      </div>
    `,
    text: `Khách đăng ký nhận tin HMECHA: ${input.email}`,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const email = String(body.email || "").trim().toLowerCase();
    const name = String(body.name || "").trim() || null;
    const source = String(body.source || "footer").trim() || "footer";

    if (!email || !isEmail(email)) {
      return NextResponse.json(
        { ok: false, message: "Email không hợp lệ." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .upsert(
        {
          email,
          name,
          source,
          product_id: body.productId ? String(body.productId) : null,
          product_name: body.productName ? String(body.productName) : null,
          product_slug: body.productSlug ? String(body.productSlug) : null,
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "email" }
      );

    if (error) {
      console.warn("Newsletter table fallback:", error.message);

      await notifyAdmin({ email, name, source });

      return NextResponse.json({
        ok: true,
        fallback: true,
        message: "Đã đăng ký nhận tin. HMECHA sẽ gửi thông tin sản phẩm mới qua email của bạn.",
      });
    }

    return NextResponse.json({
      ok: true,
      message: "Đã đăng ký nhận tin từ HMECHA.",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        message: error?.message || "Không đăng ký được email.",
      },
      { status: 500 }
    );
  }
}