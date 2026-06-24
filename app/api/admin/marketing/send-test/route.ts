import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MarketingType = "new_product" | "comeback";

function getBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://hmecha.vercel.app"
  ).replace(/\/$/, "");
}

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("Thiếu GMAIL_USER hoặc GMAIL_APP_PASSWORD trong env.");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
}

function money(value: string) {
  const number = Number(String(value || "").replace(/[^\d]/g, ""));
  if (!number) return "";
  return `${number.toLocaleString("vi-VN")}đ`;
}

function buildNewProductEmail(input: {
  customerName?: string;
  productName?: string;
  productPrice?: string;
  productSlug?: string;
}) {
  const baseUrl = getBaseUrl();
  const productName = input.productName?.trim() || "Sản phẩm mới tại HMECHA";
  const productPrice = money(input.productPrice || "");
  const productUrl = input.productSlug
    ? `${baseUrl}/${String(input.productSlug).replace(/^\//, "")}`
    : baseUrl;

  const subject = `HMECHA vừa có hàng mới: ${productName}`;

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:640px;margin:auto">
      <h2 style="color:#dc2626;margin-bottom:8px">HMECHA vừa có sản phẩm mới</h2>
      <p>Chào ${input.customerName || "bạn"},</p>
      <p>HMECHA vừa cập nhật một sản phẩm mới có thể bạn sẽ thích:</p>

      <div style="border:1px solid #e5e7eb;border-radius:14px;padding:18px;margin:18px 0;background:#fafafa">
        <h3 style="margin:0 0 8px">${productName}</h3>
        ${productPrice ? `<p style="margin:0 0 12px;font-weight:700;color:#dc2626">Giá: ${productPrice}</p>` : ""}
        <a href="${productUrl}" style="display:inline-block;background:#dc2626;color:white;text-decoration:none;padding:10px 16px;border-radius:999px;font-weight:700">
          Xem sản phẩm
        </a>
      </div>

      <p>Nếu bạn đang tìm Gundam, Gunpla hoặc model kit mới, hãy ghé HMECHA xem thêm nhé.</p>
      <p style="font-size:13px;color:#6b7280">Email này được gửi từ hệ thống marketing test của HMECHA.</p>
    </div>
  `;

  const text = `HMECHA vừa có sản phẩm mới: ${productName}. Xem tại: ${productUrl}`;

  return { subject, html, text };
}

function buildComebackEmail(input: {
  customerName?: string;
  couponCode?: string;
}) {
  const baseUrl = getBaseUrl();
  const couponCode = input.couponCode?.trim() || "COMEBACK10";

  const subject = "HMECHA có vài mẫu mới dành cho bạn";

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111827;max-width:640px;margin:auto">
      <h2 style="color:#dc2626;margin-bottom:8px">Lâu rồi chưa thấy bạn ghé HMECHA</h2>
      <p>Chào ${input.customerName || "bạn"},</p>
      <p>HMECHA vừa cập nhật thêm nhiều mẫu Gundam, Gunpla và model kit mới. Nếu bạn đang muốn tìm một mẫu để lắp hoặc trưng bày, có thể ghé lại website nhé.</p>

      <div style="border:1px solid #fecaca;border-radius:14px;padding:18px;margin:18px 0;background:#fff1f2">
        <p style="margin:0 0 8px">Mã quay lại dành cho bạn:</p>
        <div style="font-size:24px;font-weight:800;color:#dc2626;letter-spacing:1px">${couponCode}</div>
      </div>

      <a href="${baseUrl}" style="display:inline-block;background:#dc2626;color:white;text-decoration:none;padding:10px 16px;border-radius:999px;font-weight:700">
        Quay lại HMECHA
      </a>

      <p style="font-size:13px;color:#6b7280;margin-top:20px">Email này được gửi từ hệ thống remarketing test của HMECHA.</p>
    </div>
  `;

  const text = `HMECHA có vài mẫu mới dành cho bạn. Mã quay lại: ${couponCode}. Xem tại: ${baseUrl}`;

  return { subject, html, text };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const to = String(body.to || "").trim();
    const type = String(body.type || "new_product") as MarketingType;

    if (!to || !to.includes("@")) {
      return NextResponse.json(
        { ok: false, message: "Email người nhận không hợp lệ." },
        { status: 400 }
      );
    }

    const transporter = getTransporter();

    const email =
      type === "comeback"
        ? buildComebackEmail({
            customerName: body.customerName,
            couponCode: body.couponCode,
          })
        : buildNewProductEmail({
            customerName: body.customerName,
            productName: body.productName,
            productPrice: body.productPrice,
            productSlug: body.productSlug,
          });

    await transporter.sendMail({
      from: `"HMECHA" <${process.env.GMAIL_USER}>`,
      to,
      subject: email.subject,
      html: email.html,
      text: email.text,
    });

    return NextResponse.json({
      ok: true,
      message: `Đã gửi email test đến ${to}`,
    });
  } catch (error: any) {
    console.error("Marketing email test error:", error);

    return NextResponse.json(
      {
        ok: false,
        message:
          error?.message ||
          "Không gửi được email marketing test. Kiểm tra lại env Gmail.",
      },
      { status: 500 }
    );
  }
}