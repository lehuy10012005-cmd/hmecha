import { NextRequest, NextResponse } from "next/server";
import { products, formatPrice } from "../../../data/products";

export const dynamic = "force-dynamic";

type PriceRange = {
  min?: number;
  max?: number;
};

function normalizeText(value: string) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function hasAny(text: string, keywords: string[]) {
  return keywords.some((keyword) => text.includes(keyword));
}

function money(value: number) {
  return formatPrice(value).replace("₫", "đ");
}

function parseNumber(value: string) {
  const normalized = value.replace(",", ".");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}

function moneyValue(numberText: string, unitText?: string) {
  const number = parseNumber(numberText);
  const unit = normalizeText(unitText || "");

  if (!number) return 0;

  if (unit.includes("trieu") || unit === "tr") {
    return Math.round(number * 1000000);
  }

  if (unit.includes("nghin") || unit === "k") {
    return Math.round(number * 1000);
  }

  if (number < 1000) return Math.round(number * 1000);

  return Math.round(number);
}

function extractRequestedCount(text: string) {
  const match = text.match(/(\d+)\s*(san pham|sp|mon|mau|lua chon|goi y)/i);
  const count = match?.[1] ? Number(match[1]) : 3;

  if (!Number.isFinite(count)) return 3;
  return Math.max(1, Math.min(8, count));
}

function extractPriceRange(text: string): PriceRange {
  const range: PriceRange = {};
  const unit = "(trieu|tr|k|nghin)?";
  const number = "(\\d+(?:[.,]\\d+)?)";

  const between = text.match(
    new RegExp(`(?:tu|trong khoang)\\s*${number}\\s*${unit}\\s*(?:den|toi|-|va)\\s*${number}\\s*${unit}`, "i")
  );

  if (between) {
    range.min = moneyValue(between[1], between[2] || between[4]);
    range.max = moneyValue(between[3], between[4] || between[2]);
  }

  const lower = text.match(
    new RegExp(`(?:tren|hon|lon hon|tu)\\s*${number}\\s*${unit}`, "i")
  );

  if (lower) {
    range.min = moneyValue(lower[1], lower[2]);
  }

  const upper = text.match(
    new RegExp(`(?:duoi|nho hon|toi da|khong qua|tam)\\s*${number}\\s*${unit}`, "i")
  );

  if (upper) {
    range.max = moneyValue(upper[1], upper[2]);
  }

  if (hasAny(text, ["duoi 500", "500k"]) && !range.max) {
    range.max = 500000;
  }

  if (hasAny(text, ["tren 1 trieu", "hon 1 trieu"]) && !range.min) {
    range.min = 1000000;
  }

  if (hasAny(text, ["duoi 2 trieu", "nho hon 2 trieu"]) && !range.max) {
    range.max = 2000000;
  }

  return range;
}

function productMatchesKeyword(product: (typeof products)[number], text: string) {
  const haystack = normalizeText(
    `${product.name} ${product.category} ${product.brand} ${product.status} ${product.sku}`
  );

  const keywordMap = [
    ["hg", [" hg ", "1/144", "high grade"]],
    ["rg", [" rg ", "real grade"]],
    ["mg", [" mg ", "1/100", "master grade"]],
    ["pg", [" pg ", "1/60", "perfect grade"]],
    ["sd", [" sd ", "sdw", "sd gundam"]],
    ["30mm", ["30mm", "30 minutes"]],
    ["metal build", ["metal build"]],
    ["mecha girl", ["mecha girl", "girl", "sisu", "luluce"]],
    ["pokemon", ["pokemon", "poke"]],
    ["onepiece", ["onepiece", "one piece"]],
    ["phu kien", ["phu kien", "decal", "tools", "option parts", "accessory"]],
  ] as const;

  const activeGroups = keywordMap.filter(([keyword, aliases]) => {
    return text.includes(keyword) || aliases.some((alias) => text.includes(alias.trim()));
  });

  if (!activeGroups.length) return true;

  return activeGroups.some(([, aliases]) => {
    return aliases.some((alias) => haystack.includes(alias.trim()));
  });
}

function findProducts(message: string) {
  const text = normalizeText(message);
  const count = extractRequestedCount(text);
  const range = extractPriceRange(text);

  const wantInStock = hasAny(text, ["con hang", "hang san", "co san"]);
  const wantPreorder = hasAny(text, ["preorder", "dat truoc", "sap ve"]);
  const wantSale = hasAny(text, ["sale", "khuyen mai", "giam gia"]);

  let result = products.filter((product) => {
    if (!product.price || product.price <= 0) return false;

    if (range.min && product.price < range.min) return false;
    if (range.max && product.price > range.max) return false;

    if (!productMatchesKeyword(product, text)) return false;

    const status = normalizeText(product.status || "");
    const badge = normalizeText(product.badge || "");

    if (wantInStock && !status.includes("con hang")) return false;
    if (wantPreorder && !status.includes("dat truoc") && !badge.includes("pre")) return false;
    if (wantSale && !badge.includes("sale") && !badge.includes("flash")) return false;

    return true;
  });

  result = result.sort((a, b) => {
    const aStock = normalizeText(a.status || "").includes("con hang") ? 0 : 1;
    const bStock = normalizeText(b.status || "").includes("con hang") ? 0 : 1;

    if (aStock !== bStock) return aStock - bStock;

    if (hasAny(text, ["re nhat", "gia thap", "gia re"])) return a.price - b.price;
    if (hasAny(text, ["dat nhat", "cao cap", "gia cao"])) return b.price - a.price;

    return a.price - b.price;
  });

  return result.slice(0, count);
}

function describePriceRange(range: PriceRange) {
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
    return "Mình chưa tìm thấy sản phẩm đúng yêu cầu đó. Bạn thử đổi khoảng giá, dòng sản phẩm như HG/RG/MG, hoặc hỏi 'gợi ý 3 sản phẩm còn hàng' nhé.";
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

function shouldRecommendProducts(text: string) {
  return hasAny(text, [
    "san pham",
    "sp",
    "mon",
    "mau",
    "goi y",
    "de xuat",
    "tu van",
    "mua mo hinh",
    "duoi",
    "tren",
    "trieu",
    "500k",
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
  ]);
}

function getReply(message: string) {
  const text = normalizeText(message);

  if (!text) {
    return "Bạn nhập nội dung cần hỏi nhé. HMECHA có thể hỗ trợ về sản phẩm, phí ship, thanh toán, mã giảm giá, đặt hàng hoặc bảo hành.";
  }

  if (shouldRecommendProducts(text)) {
    return buildProductReply(message);
  }

  if (hasAny(text, ["xin chao", "hello", "hi", "chao", "alo"])) {
    return "Chào bạn, mình là HMECHA Assistant. Bạn cần tư vấn mô hình, hỏi phí ship, thanh toán hay tình trạng đơn hàng?";
  }

  if (hasAny(text, ["link", "duong dan", "xem o dau"])) {
    return "Bạn hãy nói rõ mẫu sản phẩm hoặc khoảng giá bạn muốn xem, ví dụ: 'cho mình 2 sản phẩm trên 1 triệu dưới 2 triệu'. Mình sẽ gửi kèm link xem chi tiết ngay trong câu trả lời.";
  }

  if (hasAny(text, ["gi cung duoc", "sao cung duoc", "tuy", "bat ky"])) {
    return buildProductReply("gợi ý 3 sản phẩm còn hàng");
  }

  if (hasAny(text, ["ship", "giao hang", "van chuyen", "phi giao", "phi ship"])) {
    return "HMECHA hỗ trợ giao hàng toàn quốc. Phí ship phụ thuộc vào địa chỉ nhận hàng và sẽ được kiểm tra ở bước checkout. Một số chương trình khuyến mãi có thể hỗ trợ freeship.";
  }

  if (hasAny(text, ["thanh toan", "cod", "vnpay", "qr", "chuyen khoan"])) {
    return "Website hỗ trợ COD khi nhận hàng và VNPAY/QR sandbox. Khi checkout, bạn chọn phương thức phù hợp rồi làm theo hướng dẫn trên màn hình.";
  }

  if (hasAny(text, ["ma giam gia", "voucher", "coupon", "khuyen mai", "sale", "flash sale"])) {
    return "Bạn có thể nhập mã giảm giá ở trang checkout. Nếu mã hợp lệ và đúng điều kiện, hệ thống sẽ tự trừ vào tổng tiền đơn hàng.";
  }

  if (hasAny(text, ["dat hang", "mua hang", "checkout", "gio hang", "them vao gio"])) {
    return "Để đặt hàng, bạn chọn sản phẩm, bấm Mua ngay hoặc Thêm vào giỏ, sau đó điền thông tin nhận hàng ở trang checkout và chọn phương thức thanh toán.";
  }

  if (hasAny(text, ["don hang", "kiem tra don", "trang thai don", "ma don"])) {
    return "Bạn có thể đăng nhập tài khoản và vào mục Đơn hàng của tôi để xem trạng thái đơn. Nếu cần shop kiểm tra nhanh, bạn gửi mã đơn hàng và số điện thoại đặt hàng.";
  }

  if (hasAny(text, ["bao hanh", "doi tra", "loi", "thieu part", "giao sai", "hong"])) {
    return "Nếu sản phẩm lỗi, thiếu part hoặc giao sai, bạn nên giữ hộp, runner và chụp ảnh/video tình trạng sản phẩm. Sau đó liên hệ HMECHA để được hỗ trợ kiểm tra.";
  }

  if (hasAny(text, ["admin", "nhan vien", "tu van vien", "gap shop", "lien he"])) {
    return "Bạn có thể để lại nội dung cần hỗ trợ, mã đơn nếu có và số điện thoại. HMECHA sẽ kiểm tra và phản hồi cho bạn sớm nhất có thể.";
  }

  return "Mình đã nhận được câu hỏi của bạn. Bạn có thể hỏi theo mẫu như: 'cho mình 2 sản phẩm trên 1 triệu dưới 2 triệu', 'phí ship bao nhiêu', 'có mã giảm giá không' hoặc 'kiểm tra đơn hàng'.";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = String(body.message || "");
    const reply = getReply(message);

    return NextResponse.json({
      intent: "basic",
      reply,
    });
  } catch {
    return NextResponse.json(
      {
        intent: "error",
        reply: "Chatbot đang gặp lỗi xử lý. Bạn thử gửi lại tin nhắn nhé.",
      },
      { status: 500 }
    );
  }
}