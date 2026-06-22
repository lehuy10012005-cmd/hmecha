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
    const productId = String(body.productId || "").trim();
    const productName = String(body.productName || "").trim();
    const productSlug = String(body.productSlug || "").trim();

    if (!email || !isEmail(email)) {
      return NextResponse.json(
        { message: "Email không hợp lệ." },
        { status: 400 }
      );
    }

    if (!productId || !productName) {
      return NextResponse.json(
        { message: "Thiếu thông tin sản phẩm." },
        { status: 400 }
      );
    }

    let savedToDatabase = false;
    let databaseMessage = "";

    try {
      const { error } = await supabaseAdmin
        .from("product_notifications")
        .upsert(
          {
            email,
            product_id: productId,
            product_name: productName,
            product_slug: productSlug,
            status: "waiting",
            source: "product_detail",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "email,product_id",
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
        subject: `[HMECHA] Khách đăng ký báo hàng về: ${productName}`,
        html: `
          <div style="font-family:Arial,Helvetica,sans-serif;background:#f4f7fb;padding:24px;color:#111827;">
            <div style="max-width:680px;margin:auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:18px;overflow:hidden;">
              <div style="background:#050816;color:white;padding:22px;">
                <div style="font-size:13px;letter-spacing:2px;color:#00e5ff;font-weight:800;">HMECHA PRODUCT NOTIFICATION</div>
                <h1 style="margin:8px 0 0;font-size:24px;">Có khách muốn nhận thông báo khi hàng về</h1>
              </div>

              <div style="padding:22px;line-height:1.7;">
                <p><b>Email khách:</b> ${email}</p>
                <p><b>Sản phẩm:</b> ${productName}</p>
                <p><b>Mã sản phẩm:</b> ${productId}</p>
                <p><b>Slug:</b> ${productSlug || "Không có"}</p>
                <p><b>Database:</b> ${
                  savedToDatabase
                    ? "Đã lưu vào bảng product_notifications."
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
        "Đã ghi nhận email của bạn. HMECHA sẽ thông báo khi sản phẩm có hàng hoặc mở preorder.",
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        message: error?.message || "Không thể đăng ký nhận thông báo.",
      },
      { status: 500 }
    );
  }
}