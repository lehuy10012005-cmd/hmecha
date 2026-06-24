import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
      return NextResponse.json(
        {
          ok: false,
          message:
            "Chưa lưu được email. Nếu đây là lần đầu dùng Marketing, hãy chạy file supabase-marketing-email.sql trong Supabase SQL Editor.",
          detail: error.message,
        },
        { status: 500 }
      );
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