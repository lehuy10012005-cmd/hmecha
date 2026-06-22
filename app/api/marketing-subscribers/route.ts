import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { supabaseAdmin } from "../../../lib/supabase-admin";

export const dynamic = "force-dynamic";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = String(body.email || "").trim().toLowerCase();
    const source = String(body.source || "product_page").trim();
    const productId = String(body.productId || "").trim();
    const productName = String(body.productName || "").trim();
    const productSlug = String(body.productSlug || "").trim();

    if (!email || !isEmail(email)) {
      return NextResponse.json(
        { message: "Email không hợp lệ." },
        { status: 400 }
      );
    }

    let savedToDatabase = false;
    let databaseMessage = "";

    try {
      const { error } = await supabaseAdmin
        .from("marketing_subscribers")
        .upsert(
          {
            email,
            source,
            product_id: productId || null,
            product_name: productName || null,
            product_slug: productSlug || null,
            status: "subscribed",
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "email",
          }
        );

      if (error) {
        databaseMessage = error.message;
      } else {
        savedToDatabase = true;
      }
    } catch (err: any) {
      databaseMessage = err?.message || "Không lưu được vào database.";
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
    const notifyEmail = process.env.ORDER_NOTIFY_EMAIL || process.env.ADMIN_EMAIL;

    if (gmailUser && gmailAppPassword && notifyEmail) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: gmailUser,
          pass: gmailAppPassword,
        },
      });

      await transporter.sendMail({
        from: `"HMECHA Website" <${gmailUser}>`,
        to: notifyEmail,
        subject: `[HMECHA] Khách đăng ký nhận khuyến mãi`,
        html: `
          <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f7fb;padding:24px;color:#111827;">
            <div style="max-width:680px;margin:auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden;">
              <div style="background:#050816;color:white;padding:22px;">
                <div style="font-size:13px;letter-spacing:2px;color:#00e5ff;font-weight:800;">HMECHA MARKETING SUBSCRIBER</div>
                <h1 style="margin:8px 0 0;font-size:24px;">Có khách đăng ký nhận khuyến mãi</h1>
              </div>

              <div style="padding:22px;line-height:1.7;">
                <p><b>Email khách:</b> ${email}</p>
                <p><b>Nguồn đăng ký:</b> ${source}</p>
                <p><b>Sản phẩm đang xem:</b> ${productName || "Không có"}</p>
                <p><b>Slug:</b> ${productSlug || "Không có"}</p>
                <p><b>Database:</b> ${
                  savedToDatabase
                    ? "Đã lưu vào bảng marketing_subscribers."
                    : "Chưa lưu được vào database. Lý do: " + (databaseMessage || "chưa rõ")
                }</p>
              </div>
            </div>
          </div>
        `,
      });
    }

    return NextResponse.json({
      ok: true,
      savedToDatabase,
      message:
        "Đã đăng ký nhận khuyến mãi. HMECHA sẽ gửi email khi có mã giảm giá, flash sale hoặc hàng mới về.",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error?.message || "Không thể đăng ký nhận khuyến mãi.",
      },
      { status: 500 }
    );
  }
}