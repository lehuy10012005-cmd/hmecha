import { NextRequest, NextResponse } from "next/server";
import { products, formatPrice } from "../../../data/products";
import { findFaqAnswer } from "../../../lib/chatbot/faq";

export const dynamic = "force-dynamic";

type PriceRange = {
  min?: number;
  max?: number;
  target?: number;
  mode?: "max" | "min" | "range" | "around" | "none";
};

function normalizeText(value: string) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^\p{L}\p{N}\s.,-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(normalizeText(keyword)));
}

function money(value: number) {
  return formatPrice(Math.round(value)).replace("₫", "đ");
}

function parseNumber(value: string) {
  const normalized = String(value || "").replace(",", ".");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}

function moneyValue(numberText: string, unitText?: string) {
  const number = parseNumber(numberText);
  const unit = normalizeText(unitText || "");

  if (!number) return 0;

  if (unit.includes("trieu") || unit === "tr" || unit === "m") {
    return Math.round(number * 1000000);
  }

  if (unit.includes("nghin") || unit.includes("ngan") || unit === "k") {
    return Math.round(number * 1000);
  }

  if (number < 10000) {
    return Math.round(number * 1000);
  }

  return Math.round(number);
}

function extractRequestedCount(text: string) {
  const match = text.match(/(\d+)\s*(san pham|sp|mon|mau|lua chon|goi y)/i);
  const count = match?.[1] ? Number(match[1]) : 3;

  if (!Number.isFinite(count)) return 3;
  return Math.max(1, Math.min(8, count));
}

function getFirstMoneyValue(text: string) {
  const match = text.match(/(\d+(?:[.,]\d+)?)\s*(trieu|tr|m|k|nghin|ngan|d|vnd)?/i);
  if (!match) return 0;
  return moneyValue(match[1], match[2]);
}

function extractPriceRange(text: string): PriceRange {
  const range: PriceRange = { mode: "none" };
  const unit = "(trieu|tr|m|k|nghin|ngan|d|vnd)?";
  const number = "(\\d+(?:[.,]\\d+)?)";

  const between = text.match(
    new RegExp(`(?:tu|trong khoang|khoang)\\s*${number}\\s*${unit}\\s*(?:den|toi|-|va)\\s*${number}\\s*${unit}`, "i")
  );

  if (between) {
    range.min = moneyValue(between[1], between[2] || between[4]);
    range.max = moneyValue(between[3], between[4] || between[2]);
    range.mode = "range";
    return range;
  }

  const lower = text.match(
    new RegExp(`(?:tren|hon|lon hon|tu)\\s*${number}\\s*${unit}`, "i")
  );

  if (lower) {
    range.min = moneyValue(lower[1], lower[2]);
    range.mode = "min";
  }

  const upper = text.match(
    new RegExp(`(?:duoi|nho hon|toi da|khong qua)\\s*${number}\\s*${unit}`, "i")
  );

  if (upper) {
    range.max = moneyValue(upper[1], upper[2]);
    range.mode = range.min ? "range" : "max";
  }

  if (range.min || range.max) return range;

  const amount = getFirstMoneyValue(text);

  if (amount > 0 && hasAny(text, ["gia", "tam gia", "ngan sach", "trieu", "k", "vnd", "d"])) {
    const tolerance = amount >= 1000000 ? 0.15 : 0.2;

    range.target = amount;
    range.min = Math.max(0, Math.round(amount * (1 - tolerance)));
    range.max = Math.round(amount * (1 + tolerance));
    range.mode = "around";

    return range;
  }

  return range;
}

function productMatchesKeyword(product: (typeof products)[number], text: string) {
  const haystack = normalizeText(
    `${product.name} ${product.category} ${product.brand} ${product.status} ${product.sku} ${product.badge || ""}`
  );

  const keywordMap = [
    ["hg", ["hg", "1/144", "high grade"]],
    ["rg", ["rg", "real grade"]],
    ["mg", ["mg", "1/100", "master grade"]],
    ["pg", ["pg", "1/60", "perfect grade"]],
    ["sd", ["sd", "sdw", "sd gundam"]],
    ["30mm", ["30mm", "30 minutes"]],
    ["metal build", ["metal build"]],
    ["gundam", ["gundam"]],
    ["gunpla", ["gunpla", "gundam"]],
    ["bandai", ["bandai"]],
    ["pokemon", ["pokemon", "poke"]],
    ["onepiece", ["onepiece", "one piece"]],
    ["moc khoa", ["moc khoa"]],
    ["phu kien", ["phu kien", "decal", "tool", "option parts", "accessory"]],
  ] as const;

  const activeGroups = keywordMap.filter(([keyword, aliases]) => {
    return text.includes(keyword) || aliases.some((alias) => text.includes(alias));
  });

  if (!activeGroups.length) return true;

  return activeGroups.some(([, aliases]) => {
    return aliases.some((alias) => haystack.includes(alias));
  });
}

function findProducts(message: string) {
  const text = normalizeText(message);
  const count = extractRequestedCount(text);
  const range = extractPriceRange(text);

  const wantInStock = hasAny(text, ["con hang", "hang san", "co san"]);
  const wantPreorder = hasAny(text, ["preorder", "dat truoc", "sap ve"]);
  const wantSale = hasAny(text, ["sale", "khuyen mai", "san pham giam gia", "dang giam"]);

  let result = products.filter((product) => {
    if (!product.price || product.price <= 0) return false;

    if (range.min && product.price < range.min) return false;
    if (range.max && product.price > range.max) return false;

    if (!productMatchesKeyword(product, text)) return false;

    const status = normalizeText(product.status || "");
    const badge = normalizeText(product.badge || "");

    if (wantInStock && !status.includes("con hang")) return false;
    if (wantPreorder && !status.includes("dat truoc") && !badge.includes("pre")) return false;
    if (wantSale && !badge.includes("sale") && !badge.includes("flash") && !normalizeText(product.name).includes("sale")) return false;

    return true;
  });

  result = result.sort((a, b) => {
    const aInStock = normalizeText(a.status || "").includes("con hang") ? 0 : 1;
    const bInStock = normalizeText(b.status || "").includes("con hang") ? 0 : 1;

    if (aInStock !== bInStock) return aInStock - bInStock;

    if (range.mode === "around" && range.target) {
      return Math.abs(a.price - range.target) - Math.abs(b.price - range.target);
    }

    if (hasAny(text, ["re nhat", "gia thap", "gia re"])) return a.price - b.price;
    if (hasAny(text, ["dat nhat", "cao cap", "gia cao"])) return b.price - a.price;

    if (range.mode === "max") return b.price - a.price;
    if (range.mode === "min") return a.price - b.price;

    return a.price - b.price;
  });

  return result.slice(0, count);
}

function describePriceRange(range: PriceRange) {
  if (range.mode === "around" && range.target) return `quanh mức ${money(range.target)}`;
  if (range.min && range.max) return `trong khoảng ${money(range.min)} - ${money(range.max)}`;
  if (range.min) return `giá trên ${money(range.min)}`;
  if (range.max) return `giá dưới ${money(range.max)}`;
  return "phù hợp";
}

function buildProductReply(message: string) {
  const text = normalizeText(message);
  const count = extractRequestedCount(text);
  const range = extractPriceRange(text);
  const matched = findProducts(message);

  if (!matched.length) {
    if (range.mode === "around" && range.target) {
      return `Mình chưa thấy sản phẩm nào quanh mức ${money(range.target)}. Bạn có thể thử hỏi “dưới ${money(range.target)}”, “trên ${money(range.target)}” hoặc chọn khoảng giá khác nhé.`;
    }

    if (range.min || range.max) {
      return `Mình chưa tìm thấy sản phẩm ${describePriceRange(range)}. Bạn thử đổi khoảng giá hoặc hỏi “gợi ý 3 sản phẩm còn hàng” nhé.`;
    }

    return "Mình chưa tìm thấy sản phẩm đúng yêu cầu đó. Bạn thử hỏi theo dòng HG/RG/MG, tên Gundam, hoặc khoảng giá như “dưới 500k” nhé.";
  }

  const intro = `Mình gợi ý ${matched.length} sản phẩm ${describePriceRange(range)}:`;

  const list = matched
    .map((product, index) => {
      const status = product.status || "Chưa rõ";
      return `${index + 1}. ${product.name} - ${money(product.price)} (${status})\nXem: /${product.slug}`;
    })
    .join("\n\n");

  const more =
    matched.length < count
      ? "\n\nHiện mình chỉ tìm được từng đó sản phẩm phù hợp với điều kiện bạn nhập."
      : "";

  return `${intro}\n\n${list}${more}`;
}

function isServiceQuestion(text: string) {
  return hasAny(text, [
    "shop ban gi",
    "hmecha la gi",
    "dia chi",
    "hotline",
    "lien he",
    "facebook",
    "tiktok",
    "instagram",
    "shopee",
    "phi ship",
    "ship",
    "giao hang",
    "van chuyen",
    "freeship",
    "thanh toan",
    "cod",
    "vnpay",
    "qr",
    "ma giam gia",
    "voucher",
    "coupon",
    "quen mat khau",
    "doi mat khau",
    "ma xac nhan",
    "otp",
    "tai khoan",
    "dang nhap",
    "dang ky",
    "don hang",
    "trang thai don",
    "kiem tra don",
    "danh gia",
    "review",
    "binh luan",
    "doi tra",
    "bao hanh",
    "giao sai",
    "bi loi",
    "mop hop",
    "admin",
    "nhan vien",
    "tu van vien",
    "nguoi that",
  ]);
}

function shouldRecommendProducts(text: string) {
  if (isServiceQuestion(text)) return false;

  const hasMoney = /(\d+(?:[.,]\d+)?)\s*(trieu|tr|m|k|nghin|ngan|d|vnd)?/i.test(text);

  return (
    hasMoney ||
    hasAny(text, [
      "san pham",
      "sp",
      "mon",
      "mau",
      "goi y",
      "de xuat",
      "tu van san pham",
      "mua mo hinh",
      "mo hinh",
      "gundam",
      "gunpla",
      "duoi",
      "tren",
      "tam gia",
      "ngan sach",
      "hg",
      "rg",
      "mg",
      "pg",
      "sd",
      "30mm",
      "pokemon",
      "onepiece",
      "gia re",
      "gia tot",
      "con hang",
      "preorder",
      "dat truoc",
    ])
  );
}

function getFallbackReply() {
  return "Mình chưa hiểu rõ câu hỏi đó. Bạn có thể hỏi ngắn hơn như: “shop bán gì”, “phí ship bao nhiêu”, “có mã giảm giá không”, “tôi quên mật khẩu”, “đánh giá sản phẩm ở đâu” hoặc “gợi ý sản phẩm dưới 500k”.";
}

function getReply(message: string) {
  const text = normalizeText(message);

  if (!text) {
    return "Bạn nhập nội dung cần hỏi nhé. HMECHA có thể hỗ trợ về sản phẩm, phí ship, thanh toán, mã giảm giá, đặt hàng, tài khoản và đổi trả.";
  }

  if (hasAny(text, ["xin chao", "hello", "hi", "chao", "alo"])) {
    return "Chào bạn, mình là HMECHA Assistant. Bạn cần tư vấn sản phẩm, phí ship, mã giảm giá, tài khoản hay gặp admin?";
  }

  if (isServiceQuestion(text)) {
    const faqAnswer = findFaqAnswer(message);
    if (faqAnswer) return faqAnswer;
  }

  if (shouldRecommendProducts(text)) {
    return buildProductReply(message);
  }

  const faqAnswer = findFaqAnswer(message);
  if (faqAnswer) return faqAnswer;

  if (hasAny(text, ["gi cung duoc", "sao cung duoc", "tuy", "bat ky"])) {
    return buildProductReply("gợi ý 3 sản phẩm còn hàng");
  }

  return getFallbackReply();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = String(body.message || "");
    const reply = getReply(message);

    return NextResponse.json({
      intent: "hmecha_chatbot",
      reply,
    });
  } catch (error) {
    console.error("Chatbot route error:", error);

    return NextResponse.json(
      {
        intent: "error",
        reply: "Chatbot đang gặp lỗi xử lý. Bạn thử gửi lại tin nhắn nhé.",
      },
      { status: 500 }
    );
  }
}