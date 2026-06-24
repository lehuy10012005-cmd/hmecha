import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createAuthServerClient } from "../../../../../lib/supabase-auth/server";
import { supabaseAdmin } from "../../../../../lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Product = {
  name: string;
  slug: string;
  price?: number;
  status?: string;
};

type Recipient = {
  email: string;
  name?: string;
};

async function isAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!adminEmail) return true;

  const auth = await createAuthServerClient();
  const {
    data: { user },
  } = await auth.auth.getUser();

  return Boolean(user?.email && user.email.toLowerCase() === adminEmail);
}

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://hmecha.vercel.app"
  ).replace(/\/$/, "");
}

function money(value: any) {
  const number = Number(value || 0);
  if (!number) return "";
  return number.toLocaleString("vi-VN") + "đ";
}

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("Thiếu GMAIL_USER hoặc GMAIL_APP_PASSWORD trong env.");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

function normalizeEmail(value: any) {
  return String(value || "").trim().toLowerCase();
}

function buildProductCards(products: Product[]) {
  const baseUrl = getBaseUrl();

  if (!products.length) {
    return `
      <p style="margin:0 0 16px;color:#374151;line-height:1.7">
        HMECHA vừa cập nhật thêm nhiều sản phẩm mới. Bạn ghé website để xem thêm nhé.
      </p>
    `;
  }

  return products
    .map((product) => {
      const url = `${baseUrl}/${String(product.slug || "").replace(/^\//, "")}`;

      return `
        <div style="border:1px solid #e5e7eb;border-radius:16px;padding:16px;margin:12px 0;background:#ffffff">
          <div style="font-size:16px;font-weight:800;color:#111827;margin-bottom:6px">
            ${product.name}
          </div>
          ${
            product.price
              ? `<div style="font-weight:800;color:#dc2626;margin-bottom:10px">${money(product.price)}</div>`
              : ""
          }
          <a href="${url}" style="display:inline-block;background:#dc2626;color:#fff;text-decoration:none;padding:10px 14px;border-radius:999px;font-weight:800">
            Xem sản phẩm
          </a>
        </div>
      `;
    })
    .join("");
}

function buildEmail(input: {
  type: string;
  recipient: Recipient;
  products: Product[];
  couponCode?: string;
}) {
  const baseUrl = getBaseUrl();
  const name = input.recipient.name || "bạn";
  const couponCode = input.couponCode || "COMEBACK10";

  if (input.type === "comeback") {
    const subject = "HMECHA có vài mẫu mới dành cho bạn";

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:680px;margin:auto;background:#f9fafb;padding:24px">
        <div style="background:#ffffff;border-radius:20px;padding:24px;border:1px solid #e5e7eb">
          <h2 style="color:#dc2626;margin:0 0 10px">Lâu rồi bạn chưa ghé HMECHA</h2>
          <p>Chào ${name},</p>
          <p>HMECHA vừa cập nhật thêm một số mẫu mô hình và sản phẩm mới. Nếu bạn đang muốn tìm mẫu để lắp hoặc trưng bày, có thể ghé lại website nhé.</p>

          <div style="border:1px solid #fecaca;border-radius:16px;padding:16px;margin:18px 0;background:#fff1f2">
            <div style="font-size:13px;font-weight:800;color:#991b1b;text-transform:uppercase">Mã quay lại</div>
            <div style="font-size:26px;font-weight:900;color:#dc2626;letter-spacing:1px">${couponCode}</div>
          </div>

          ${buildProductCards(input.products)}

          <a href="${baseUrl}" style="display:inline-block;margin-top:12px;background:#111827;color:white;text-decoration:none;padding:11px 16px;border-radius:999px;font-weight:800">
            Quay lại HMECHA
          </a>
        </div>
      </div>
    `;

    return { subject, html, text: `HMECHA có vài mẫu mới dành cho bạn. Mã quay lại: ${couponCode}. ${baseUrl}` };
  }

  const subject =
    input.products.length === 1
      ? `HMECHA vừa có hàng mới: ${input.products[0].name}`
      : "HMECHA vừa cập nhật sản phẩm mới";

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:680px;margin:auto;background:#f9fafb;padding:24px">
      <div style="background:#ffffff;border-radius:20px;padding:24px;border:1px solid #e5e7eb">
        <h2 style="color:#dc2626;margin:0 0 10px">HMECHA vừa có sản phẩm mới</h2>
        <p>Chào ${name},</p>
        <p>HMECHA vừa cập nhật sản phẩm mới/có hàng mới. Bạn có thể xem nhanh các mẫu bên dưới:</p>

        ${buildProductCards(input.products)}

        <a href="${baseUrl}" style="display:inline-block;margin-top:12px;background:#111827;color:white;text-decoration:none;padding:11px 16px;border-radius:999px;font-weight:800">
          Xem thêm tại HMECHA
        </a>
      </div>
    </div>
  `;

  return { subject, html, text: `HMECHA vừa cập nhật sản phẩm mới. Xem tại ${baseUrl}` };
}

async function logEmail(input: {
  type: string;
  recipient: Recipient;
  subject: string;
  products: Product[];
  status: string;
  error?: string;
}) {
  try {
    await supabaseAdmin.from("marketing_email_logs").insert({
      campaign_type: input.type,
      recipient_email: input.recipient.email,
      recipient_name: input.recipient.name || null,
      subject: input.subject,
      product_slugs: input.products.map((item) => item.slug).filter(Boolean),
      status: input.status,
      error_message: input.error || null,
      sent_at: new Date().toISOString(),
    });
  } catch {
    // Không chặn gửi mail nếu bảng log chưa có
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json(
        { ok: false, message: "Không có quyền gửi email." },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));

    const type = String(body.type || "new_product");
    const couponCode = String(body.couponCode || "COMEBACK10");
    const recipientsRaw = Array.isArray(body.recipients) ? body.recipients : [];
    const products = Array.isArray(body.products) ? body.products : [];

    const recipientsMap = new Map<string, Recipient>();

    for (const item of recipientsRaw) {
      const email = normalizeEmail(item.email);
      if (!email || !email.includes("@")) continue;

      recipientsMap.set(email, {
        email,
        name: item.name || "",
      });
    }

    const recipients = Array.from(recipientsMap.values()).slice(0, 80);

    if (!recipients.length) {
      return NextResponse.json(
        { ok: false, message: "Chưa chọn người nhận email." },
        { status: 400 }
      );
    }

    const transporter = getTransporter();
    const results: Array<{ email: string; ok: boolean; error?: string }> = [];

    for (const recipient of recipients) {
      const email = buildEmail({
        type,
        recipient,
        products,
        couponCode,
      });

      try {
        await transporter.sendMail({
          from: `"HMECHA" <${process.env.GMAIL_USER}>`,
          to: recipient.email,
          subject: email.subject,
          html: email.html,
          text: email.text,
        });

        results.push({ email: recipient.email, ok: true });

        await logEmail({
          type,
          recipient,
          subject: email.subject,
          products,
          status: "sent",
        });
      } catch (error: any) {
        results.push({
          email: recipient.email,
          ok: false,
          error: error?.message || "Gửi thất bại",
        });

        await logEmail({
          type,
          recipient,
          subject: email.subject,
          products,
          status: "failed",
          error: error?.message || "Gửi thất bại",
        });
      }
    }

    const successCount = results.filter((item) => item.ok).length;

    return NextResponse.json({
      ok: true,
      message: `Đã gửi thành công ${successCount}/${recipients.length} email.`,
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        message: error?.message || "Không gửi được chiến dịch email.",
      },
      { status: 500 }
    );
  }
}