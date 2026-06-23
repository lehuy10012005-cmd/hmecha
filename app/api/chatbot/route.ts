import { NextRequest, NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";
import { findFaqAnswer } from "../../../lib/chatbot/faq";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type ChatProduct = {
  id?: string | number;
  name: string;
  slug: string;
  sku?: string | null;
  price: number;
  brand?: string | null;
  category?: string | null;
  status?: string | null;
  stock_quantity?: number | null;
  badge?: string | null;
};

type PriceRange = {
  min?: number;
  max?: number;
  target?: number;
  mode: "max" | "min" | "range" | "around" | "none";
};

type ProductFilters = {
  rawText: string;
  range: PriceRange;
  wantInStock: boolean;
  wantPreorder: boolean;
  wantSale: boolean;
  modelOnly: boolean;
};

type ProductContext = {
  filters: ProductFilters;
  shownSlugs: string[];
  lastCount: number;
  createdAt: number;
};

type FollowUpRequest = {
  count: number;
  mode: "replace" | "more";
};

const PRODUCT_CONTEXT_COOKIE = "hmecha_chatbot_product_context";

function normalizeText(value: string) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^\p{L}\p{N}\s.,/()\-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasAny(text: string, keywords: string[]) {
  const cleanText = normalizeText(text);
  return keywords.some((keyword) => cleanText.includes(normalizeText(keyword)));
}

function hasWord(text: string, word: string) {
  const cleanText = normalizeText(text);
  const safe = normalizeText(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|\\s)${safe}(\\s|$)`, "i").test(cleanText);
}

function money(value: number) {
  return `${Math.round(value).toLocaleString("vi-VN")}đ`;
}

function getRandomDefaultCount() {
  const options = [2, 3, 4, 5, 6];
  return options[Math.floor(Math.random() * options.length)];
}

function parseNumber(value: string) {
  const normalized = String(value || "").replace(",", ".");
  const number = Number(normalized);
  return Number.isFinite(number) ? number : 0;
}

function preprocessPriceText(text: string) {
  let result = normalizeText(text);

  result = result
    .replace(/(\d+)\s*(trieu|tri|tr|m)\s*(\d)\b/g, "$1.$3 trieu")
    .replace(/mot\s*(trieu|tri|tr|m)\s*ruoi/g, "1.5 trieu")
    .replace(/hai\s*(trieu|tri|tr|m)\s*ruoi/g, "2.5 trieu")
    .replace(/ba\s*(trieu|tri|tr|m)\s*ruoi/g, "3.5 trieu")
    .replace(/bon\s*(trieu|tri|tr|m)\s*ruoi/g, "4.5 trieu")
    .replace(/nam\s*(trieu|tri|tr|m)\s*ruoi/g, "5.5 trieu");

  result = result.replace(
    /(\d+(?:[.,]\d+)?)\s*(trieu|tri|tr|m)\s*ruoi/g,
    (_match, numberText) => `${parseNumber(numberText) + 0.5} trieu`
  );

  return result;
}

function moneyValue(numberText: string, unitText?: string) {
  const number = parseNumber(numberText);
  const unit = normalizeText(unitText || "");

  if (!number) return 0;

  if (unit.includes("trieu") || unit === "tri" || unit === "tr" || unit === "m") {
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

function hasPriceFilter(text: string) {
  const cleanText = preprocessPriceText(text);

  return (
    /\d+(?:[.,]\d+)?\s*(trieu|tri|tr|m|k|nghin|ngan|vnd|d)\b/i.test(cleanText) ||
    hasAny(cleanText, [
      "gia",
      "tam gia",
      "ngan sach",
      "budget",
      "duoi",
      "tren",
      "hon",
      "tu",
      "toi da",
      "khong qua",
      "mua duoc",
    ])
  );
}

function extractExplicitCount(text: string) {
  const cleanText = normalizeText(text);

  const match =
    cleanText.match(/(?:cho|goi y|lay|tim|tu van)\s*(?:toi|minh)?\s*(\d+)\s*(san pham|sp|mon|mau|lua chon|mo hinh)/i) ||
    cleanText.match(/(\d+)\s*(san pham|sp|mon|mau|lua chon|mo hinh)/i);

  if (!match?.[1]) return null;

  const count = Number(match[1]);
  if (!Number.isFinite(count)) return null;

  return Math.max(1, Math.min(10, count));
}

function extractRequestedCount(text: string) {
  if (hasAny(text, ["re nhat", "dat nhat", "cao nhat", "thap nhat"])) return 1;
  return extractExplicitCount(text) || getRandomDefaultCount();
}

function getFirstMoneyValue(text: string) {
  const priceText = preprocessPriceText(text);
  const match = priceText.match(/(\d+(?:[.,]\d+)?)\s*(trieu|tri|tr|m|k|nghin|ngan|d|vnd)?\b/i);

  if (!match) return 0;
  return moneyValue(match[1], match[2]);
}

function extractPriceRange(message: string): PriceRange {
  const text = preprocessPriceText(message);
  const range: PriceRange = { mode: "none" };
  const unit = "(trieu|tri|tr|m|k|nghin|ngan|d|vnd)?";
  const number = "(\\d+(?:[.,]\\d+)?)";

  const between = text.match(
    new RegExp(`(?:tu|tam|tam khoang|trong khoang|khoang)?\\s*${number}\\s*${unit}\\s*(?:den|toi|-|va)\\s*${number}\\s*${unit}`, "i")
  );

  if (between) {
    const sharedUnit = between[2] || between[4];

    range.min = moneyValue(between[1], sharedUnit);
    range.max = moneyValue(between[3], sharedUnit);
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

  if (amount > 0) {
    if (
      hasAny(text, [
        "toi co",
        "minh co",
        "ngan sach",
        "budget",
        "co tam",
        "co khoang",
        "mua duoc",
      ])
    ) {
      range.max = amount;
      range.mode = "max";
      return range;
    }

    if (hasAny(text, ["gia", "tam gia", "trieu", "tri", "k", "vnd", "co hang nao"])) {
      const tolerance = amount >= 1000000 ? 0.2 : 0.25;

      range.target = amount;
      range.min = Math.max(0, Math.round(amount * (1 - tolerance)));
      range.max = Math.round(amount * (1 + tolerance));
      range.mode = "around";
      return range;
    }
  }

  return range;
}

function wantsModelOnly(text: string) {
  const cleanText = normalizeText(text);

  return hasAny(cleanText, [
    "mo hinh thoi",
    "chi mo hinh",
    "san pham mo hinh",
    "goi y mo hinh",
    "tu van mo hinh",
    "mau mo hinh",
    "model kit",
    "gunpla thoi",
    "gundam thoi",
    "khong y la mo hinh",
    "khong mo hinh ay",
    "y la mo hinh",
  ]);
}

function parseFilters(message: string): ProductFilters {
  const text = preprocessPriceText(message);

  return {
    rawText: text,
    range: extractPriceRange(text),
    wantInStock: hasAny(text, ["con hang", "hang san", "co san"]),
    wantPreorder: hasAny(text, ["preorder", "dat truoc", "sap ve"]),
    wantSale: hasAny(text, ["sale", "khuyen mai", "dang giam", "giam gia"]),
    modelOnly: wantsModelOnly(text),
  };
}

function mergeModelOnlyFilter(previousFilters: ProductFilters, message: string): ProductFilters {
  return {
    ...previousFilters,
    rawText: `${previousFilters.rawText} ${preprocessPriceText(message)} mo hinh thoi`,
    modelOnly: true,
  };
}

function hasSpecificProductFilter(text: string) {
  return (
    hasAny(text, [
      "bandai",
      "gundam",
      "gunpla",
      "pokemon",
      "onepiece",
      "one piece",
      "grandship",
      "mechanicore",
      "metal build",
      "30mm",
    ]) ||
    hasWord(text, "hg") ||
    hasWord(text, "rg") ||
    hasWord(text, "mg") ||
    hasWord(text, "pg") ||
    hasWord(text, "sd")
  );
}

function getFollowUpRequest(text: string): FollowUpRequest | null {
  const cleanText = normalizeText(text);

  if (hasPriceFilter(cleanText) || hasSpecificProductFilter(cleanText) || wantsModelOnly(cleanText)) {
    return null;
  }

  const moreCountMatch =
    cleanText.match(/(?:^|\s)(?:cho them|them)\s*(\d+)(?:\s|$)/i);

  const replaceCountMatch =
    cleanText.match(/(?:^|\s)(?:thoi\s*)?(?:cho|lay|tim)?\s*(\d+)\s*(san pham|sp|mon|mau|lua chon)?\s*(?:di|nha|nhe|thoi)?(?:\s|$)/i);

  const morePhrase = hasAny(cleanText, [
    "khac di",
    "cai khac",
    "con cai khac",
    "con cai khac khong",
    "con cai nao khac",
    "cai nao khac",
    "mau khac",
    "con mau khac",
    "con mau khac khong",
    "mau nao khac",
    "san pham khac",
    "san pham nao khac",
    "khac nua",
    "khac nua khong",
    "con nua",
    "con nua khong",
    "con gi khac",
    "con khong",
    "nua khong",
    "nua di",
    "cho nua",
    "cho tiep",
    "tiep di",
    "tiep tuc",
    "them di",
    "cho them",
    "goi y them",
    "tu van them",
    "san pham nua",
    "mau nua",
    "vai san pham nua",
    "may san pham nua",
  ]);

  if (moreCountMatch?.[1]) {
    return {
      count: Math.max(1, Math.min(10, Number(moreCountMatch[1]))),
      mode: "more",
    };
  }

  if (morePhrase) {
    const count = replaceCountMatch?.[1]
      ? Math.max(1, Math.min(10, Number(replaceCountMatch[1])))
      : getRandomDefaultCount();

    return {
      count,
      mode: "more",
    };
  }

  if (replaceCountMatch?.[1]) {
    return {
      count: Math.max(1, Math.min(10, Number(replaceCountMatch[1]))),
      mode: "replace",
    };
  }

  return null;
}

function isAccessoryLikeProduct(product: ChatProduct) {
  const haystack = normalizeText(
    `${product.name} ${product.category || ""} ${product.brand || ""} ${product.sku || ""} ${product.badge || ""}`
  );

  return hasAny(haystack, [
    "keo dan",
    "cement",
    "extra thin",
    "tamiya",
    "panel line",
    "lo ke",
    "marker",
    "moc khoa",
    "keychain",
    "rubber mascot",
    "the bai",
    "card game",
    "premium card",
    "booster",
    "booster box",
    "custom parts",
    "option parts",
    "customize material",
    "decal",
    "phu kien",
    "accessory",
    "tool",
    "dung cu",
  ]);
}

function isModelLikeProduct(product: ChatProduct) {
  const haystack = normalizeText(
    `${product.name} ${product.category || ""} ${product.brand || ""} ${product.sku || ""} ${product.badge || ""}`
  );

  if (isAccessoryLikeProduct(product)) return false;

  return hasAny(haystack, [
    "gundam",
    "gunpla",
    "model kit",
    "1/144",
    "1/100",
    "1/60",
    "hg",
    "hguc",
    "hgbf",
    "hgtwfm",
    "hggq",
    "rg",
    "mg",
    "mgex",
    "mgsd",
    "pg",
    "sd",
    "sdw",
    "full mechanics",
    "figure-rise",
    "figure rise",
    "grandship collection",
    "grand ship collection",
    "onepiece grandship",
    "onepiece grand ship",
    "mechanicore",
    "re/100",
    "30ms",
    "30mf",
    "30mm",
    "pokemon",
  ]);
}

function getProductStatus(product: ChatProduct) {
  const status = normalizeText(product.status || "");

  if (status.includes("con hang")) return "Còn hàng";
  if (status.includes("het hang")) return "Hết hàng";
  if (status.includes("dat truoc") || status.includes("preorder")) return "Đặt trước";

  if (typeof product.stock_quantity === "number") {
    if (product.stock_quantity > 0) return "Còn hàng";
    if (product.stock_quantity <= 0) return "Hết hàng";
  }

  return product.status || "Chưa rõ";
}

function shuffleProducts<T>(items: T[]) {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index--) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    const current = result[index];
    result[index] = result[randomIndex];
    result[randomIndex] = current;
  }

  return result;
}

async function getCatalogProducts() {
  const { data, error } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      sku,
      price,
      brand,
      category,
      status,
      stock_quantity,
      badge,
      is_active,
      created_at
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    console.error("Chatbot products query error:", error.message);
    return [];
  }

  return (data || [])
    .map((item: any): ChatProduct => ({
      id: item.id,
      name: String(item.name || ""),
      slug: String(item.slug || ""),
      sku: item.sku,
      price: Number(item.price || 0),
      brand: item.brand,
      category: item.category,
      status: item.status,
      stock_quantity:
        typeof item.stock_quantity === "number"
          ? item.stock_quantity
          : Number.isFinite(Number(item.stock_quantity))
            ? Number(item.stock_quantity)
            : null,
      badge: item.badge,
    }))
    .filter((item) => item.name && item.slug && item.price > 0);
}

function productMatchesKeyword(product: ChatProduct, filters: ProductFilters) {
  const text = filters.rawText;
  const haystack = normalizeText(
    `${product.name} ${product.category || ""} ${product.brand || ""} ${product.status || ""} ${product.sku || ""} ${product.badge || ""}`
  );

  const keywordMap = [
    ["hg", ["hg", "hgtwfm", "hgbf", "hguc", "hggq", "high grade"]],
    ["rg", ["rg", "real grade"]],
    ["mg", ["mg", "mgex", "mgsd", "master grade"]],
    ["pg", ["pg", "perfect grade"]],
    ["sd", ["sd", "sdw", "sd gundam"]],
    ["30mm", ["30mm", "30 minutes"]],
    ["metal build", ["metal build"]],
    ["gundam", ["gundam"]],
    ["gunpla", ["gunpla", "gundam"]],
    ["bandai", ["bandai"]],
    ["pokemon", ["pokemon", "poke"]],
    ["onepiece", ["onepiece", "one piece"]],
    ["grandship", ["grandship", "grand ship"]],
    ["mechanicore", ["mechanicore"]],
    ["phu kien", ["phu kien", "decal", "tool", "option parts", "accessory"]],
  ] as const;

  const activeGroups = keywordMap.filter(([keyword, aliases]) => {
    return text.includes(keyword) || aliases.some((alias) => text.includes(normalizeText(alias)));
  });

  if (!activeGroups.length) return true;

  return activeGroups.some(([, aliases]) => {
    return aliases.some((alias) => haystack.includes(normalizeText(alias)));
  });
}

function findProducts(
  filters: ProductFilters,
  catalogProducts: ChatProduct[],
  options?: {
    count?: number;
    skipSlugs?: string[];
  }
) {
  const count = options?.count || getRandomDefaultCount();
  const skipSlugs = new Set(options?.skipSlugs || []);

  let result = catalogProducts.filter((product) => {
    if (!product.price || product.price <= 0) return false;
    if (skipSlugs.has(product.slug)) return false;

    if (filters.range.min && product.price < filters.range.min) return false;
    if (filters.range.max && product.price > filters.range.max) return false;

    if (filters.modelOnly && !isModelLikeProduct(product)) return false;
    if (!productMatchesKeyword(product, filters)) return false;

    const status = normalizeText(getProductStatus(product));
    const badge = normalizeText(product.badge || "");
    const name = normalizeText(product.name || "");

    if (filters.wantInStock && !status.includes("con hang")) return false;
    if (filters.wantPreorder && !status.includes("dat truoc") && !badge.includes("pre")) return false;
    if (filters.wantSale && !badge.includes("sale") && !badge.includes("flash") && !name.includes("sale")) return false;

    return true;
  });

  result = result.sort((a, b) => {
    const aInStock = normalizeText(getProductStatus(a)).includes("con hang") ? 0 : 1;
    const bInStock = normalizeText(getProductStatus(b)).includes("con hang") ? 0 : 1;

    if (aInStock !== bInStock) return aInStock - bInStock;

    if (filters.range.mode === "around" && filters.range.target) {
      return Math.abs(a.price - filters.range.target) - Math.abs(b.price - filters.range.target);
    }

    if (hasAny(filters.rawText, ["re nhat", "gia thap", "gia re"])) return a.price - b.price;
    if (hasAny(filters.rawText, ["dat nhat", "cao cap", "gia cao"])) return b.price - a.price;

    if (filters.range.mode === "max") return b.price - a.price;
    if (filters.range.mode === "min") return a.price - b.price;

    return a.price - b.price;
  });

  const strictOrder = hasAny(filters.rawText, [
    "re nhat",
    "gia thap nhat",
    "dat nhat",
    "gia cao nhat",
    "cao cap nhat",
  ]);

  if (!strictOrder) {
    const poolSize = Math.min(result.length, Math.max(count * 4, 20));
    const topPool = result.slice(0, poolSize);
    const rest = result.slice(poolSize);

    result = [...shuffleProducts(topPool), ...rest];
  }

  return result.slice(0, count);
}

function describePriceRange(range: PriceRange) {
  if (range.mode === "around" && range.target) return `quanh mức ${money(range.target)}`;
  if (range.min && range.max) return `trong khoảng ${money(range.min)} - ${money(range.max)}`;
  if (range.min) return `giá trên ${money(range.min)}`;
  if (range.max) return `giá dưới ${money(range.max)}`;
  return "phù hợp";
}

function describeFilters(filters: ProductFilters) {
  const parts: string[] = [];

  if (filters.modelOnly) parts.push("mô hình/model kit");

  const price = describePriceRange(filters.range);
  if (price !== "phù hợp") parts.push(price);

  if (filters.wantInStock) parts.push("còn hàng");

  return parts.length ? parts.join(", ") : "phù hợp";
}

function buildProductReply(
  filters: ProductFilters,
  catalogProducts: ChatProduct[],
  options?: {
    count?: number;
    skipSlugs?: string[];
    followUp?: boolean;
    isMore?: boolean;
  }
) {
  const count = options?.count || getRandomDefaultCount();
  const matched = findProducts(filters, catalogProducts, {
    count,
    skipSlugs: options?.skipSlugs,
  });

  if (!catalogProducts.length) {
    return {
      reply: "Mình chưa tải được dữ liệu sản phẩm từ hệ thống. Bạn thử lại sau vài giây nhé.",
      products: [],
    };
  }

  if (!matched.length) {
    if (options?.isMore) {
      return {
        reply: `Mình chưa thấy thêm sản phẩm khác ${describeFilters(filters)}. Bạn thử đổi khoảng giá hoặc nói rõ dòng sản phẩm như HG, RG, MG nhé.`,
        products: [],
      };
    }

    return {
      reply: `Mình chưa tìm thấy sản phẩm ${describeFilters(filters)}. Bạn thử đổi khoảng giá hoặc hỏi theo dòng như HG, RG, MG, SD nhé.`,
      products: [],
    };
  }

  const filterText = describeFilters(filters);

  const intro = options?.isMore
    ? `Mình gợi ý thêm ${matched.length} sản phẩm ${filterText}:`
    : options?.followUp
      ? `Mình gợi ý ${matched.length} sản phẩm theo điều kiện trước đó (${filterText}):`
      : `Mình gợi ý ${matched.length} sản phẩm ${filterText}:`;

  const list = matched
    .map((product, index) => {
      const status = getProductStatus(product);
      return `${index + 1}. ${product.name} - ${money(product.price)} (${status})\nXem: /${product.slug}`;
    })
    .join("\n\n");

  return {
    reply: `${intro}\n\n${list}`,
    products: matched,
  };
}

function isGreeting(text: string) {
  return (
    hasAny(text, ["xin chao", "chao shop", "chao hmecha", "hello", "alo"]) ||
    hasWord(text, "hi")
  );
}

function isServiceQuestion(text: string) {
  return hasAny(text, [
    "shop ban gi",
    "ban giay",
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
    "doi dia chi",
    "doi so dien thoai",
    "thong tin nhan hang",
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

function getSmartFaqReply(text: string) {
  if (
    hasAny(text, ["shop ban gi", "shop bann gi", "shop ban gif", "ban giay khong", "co phai ban giay"]) ||
    (hasAny(text, ["shop"]) && hasAny(text, ["ban gi", "ban gif", "ban gi vay"]))
  ) {
    return "HMECHA chuyên bán mô hình Gundam, Gunpla, Model Kit, phụ kiện lắp ráp, móc khóa và các sản phẩm sưu tầm liên quan đến Gundam. Shop không phải cửa hàng bán giày.";
  }

  if (hasAny(text, ["phi ship", "freeship", "mien phi van chuyen", "van chuyen", "giao hang"])) {
    return "Phí vận chuyển sẽ hiển thị ở giỏ hàng hoặc trang thanh toán. Một số đơn đủ điều kiện có thể được miễn phí vận chuyển, ví dụ đơn từ 1.000.000đ tùy chương trình đang áp dụng.";
  }

  if (hasAny(text, ["danh gia", "review", "binh luan", "so sao"])) {
    return "Bạn có thể đánh giá sản phẩm ở trang chi tiết sản phẩm. Hãy kéo xuống phần Đánh giá, chọn số sao, nhập nội dung nhận xét rồi gửi đánh giá.";
  }

  if (hasAny(text, ["mop hop", "bi loi", "giao sai", "nhan sai", "doi tra", "bao hanh", "hoan tien"])) {
    return "Nếu sản phẩm bị lỗi, móp hộp nặng, giao sai hoặc có vấn đề khi nhận hàng, bạn nên chụp ảnh/video và liên hệ HMECHA sớm qua hotline 0945632321 để shop kiểm tra và hỗ trợ theo chính sách đổi trả.";
  }

  if (
    hasAny(text, ["doi dia chi", "doi so dien thoai", "sua dia chi", "sua so dien thoai", "doi thong tin", "sua thong tin"]) ||
    (hasAny(text, ["dat roi", "don hang"]) && hasAny(text, ["dia chi", "so dien thoai", "trang thai"]))
  ) {
    return "Nếu bạn đã đặt hàng, hãy đăng nhập vào Tài khoản để xem trạng thái đơn. Nếu muốn đổi địa chỉ hoặc số điện thoại nhận hàng, bạn nên liên hệ HMECHA sớm qua hotline 0945632321 trước khi đơn được xử lý/giao đi.";
  }

  if (hasAny(text, ["trang thai don", "kiem tra don", "don hang cua toi", "xem don hang", "xem trang thai"])) {
    return "Bạn có thể đăng nhập tài khoản HMECHA và vào mục Tài khoản để xem lịch sử đơn hàng, chi tiết đơn và trạng thái xử lý.";
  }

  if (hasAny(text, ["quen mat khau", "doi mat khau", "ma xac nhan", "ma 6 so", "otp"])) {
    return "Bạn vào trang Quên mật khẩu, nhập email đã đăng ký. HMECHA sẽ gửi mã xác nhận 6 chữ số vào email. Sau đó nhập mã, mật khẩu mới và xác nhận để đổi mật khẩu.";
  }

  if (hasAny(text, ["ma giam gia", "voucher", "coupon", "khuyen mai", "giam gia"])) {
    return "Bạn có thể nhập mã giảm giá hoặc chọn voucher ở trang thanh toán. Nếu mã không trừ tiền, có thể mã đã hết hạn, đơn chưa đủ điều kiện hoặc mã đã được dùng trước đó.";
  }

  if (hasAny(text, ["cod", "vnpay", "thanh toan", "qr"])) {
    return "HMECHA hỗ trợ COD và VNPAY/QR. COD là thanh toán khi nhận hàng. VNPAY/QR phù hợp nếu bạn muốn thanh toán online nhanh hơn.";
  }

  return null;
}

function shouldRecommendProducts(text: string) {
  const cleanText = normalizeText(text);

  if (
    isServiceQuestion(cleanText) &&
    !hasAny(cleanText, [
      "toi co",
      "minh co",
      "ngan sach",
      "gia",
      "duoi",
      "tren",
      "tam",
      "khoang",
      "goi y",
      "san pham",
      "mau nao",
      "mua duoc",
      "mo hinh",
      "model kit",
    ])
  ) {
    return false;
  }

  return (
    hasPriceFilter(cleanText) ||
    wantsModelOnly(cleanText) ||
    hasAny(cleanText, [
      "san pham",
      "sp",
      "mon",
      "mau",
      "goi y",
      "de xuat",
      "tu van san pham",
      "tu van mo hinh",
      "mua mo hinh",
      "mo hinh",
      "model kit",
      "gundam",
      "gunpla",
      "bandai",
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
      "mua duoc",
    ])
  );
}

function getFallbackReply() {
  return "Mình chưa hiểu rõ câu hỏi đó. Bạn có thể hỏi ngắn hơn như: “shop bán gì”, “phí ship bao nhiêu”, “gợi ý sản phẩm dưới 500k”, “cho 5 mô hình dưới 1 triệu” hoặc “còn sản phẩm khác không”.";
}

function readProductContext(request: NextRequest): ProductContext | null {
  try {
    const raw = request.cookies.get(PRODUCT_CONTEXT_COOKIE)?.value;
    if (!raw) return null;

    const parsed = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as ProductContext;

    if (!parsed?.filters || Date.now() - parsed.createdAt > 1000 * 60 * 20) {
      return null;
    }

    return {
      filters: parsed.filters,
      shownSlugs: Array.isArray(parsed.shownSlugs) ? parsed.shownSlugs.slice(0, 40) : [],
      lastCount: Number(parsed.lastCount || 3),
      createdAt: parsed.createdAt,
    };
  } catch {
    return null;
  }
}

function encodeProductContext(context: ProductContext) {
  return Buffer.from(JSON.stringify(context)).toString("base64url");
}

async function getReply(message: string, previousContext: ProductContext | null) {
  const text = normalizeText(message);

  if (!text) {
    return {
      reply: "Bạn nhập nội dung cần hỏi nhé. HMECHA có thể hỗ trợ về sản phẩm, phí ship, thanh toán, mã giảm giá, đặt hàng, tài khoản và đổi trả.",
      productContext: previousContext,
    };
  }

  if (isGreeting(text)) {
    return {
      reply: "Chào bạn, mình là HMECHA Assistant. Bạn cần tư vấn sản phẩm, phí ship, mã giảm giá, tài khoản hay gặp admin?",
      productContext: previousContext,
    };
  }

  const smartFaq = getSmartFaqReply(text);
  if (smartFaq) {
    return {
      reply: smartFaq,
      productContext: previousContext,
    };
  }

  if (previousContext && wantsModelOnly(text) && !hasPriceFilter(text)) {
    const catalogProducts = await getCatalogProducts();
    const count = extractExplicitCount(text) || previousContext.lastCount || getRandomDefaultCount();
    const filters = mergeModelOnlyFilter(previousContext.filters, message);

    const productResult = buildProductReply(filters, catalogProducts, {
      count,
      followUp: true,
    });

    return {
      reply: productResult.reply,
      productContext: {
        filters,
        shownSlugs: productResult.products.map((item) => item.slug),
        lastCount: count,
        createdAt: Date.now(),
      },
    };
  }

  const followUpRequest = getFollowUpRequest(text);

  if (followUpRequest && previousContext) {
    const catalogProducts = await getCatalogProducts();
    const skipSlugs = followUpRequest.mode === "more" ? previousContext.shownSlugs : [];

    const productResult = buildProductReply(previousContext.filters, catalogProducts, {
      count: followUpRequest.count,
      skipSlugs,
      followUp: followUpRequest.mode === "replace",
      isMore: followUpRequest.mode === "more",
    });

    const nextShownSlugs =
      followUpRequest.mode === "more"
        ? [...previousContext.shownSlugs, ...productResult.products.map((item) => item.slug)]
        : productResult.products.map((item) => item.slug);

    return {
      reply: productResult.reply,
      productContext: {
        filters: previousContext.filters,
        shownSlugs: Array.from(new Set(nextShownSlugs)).slice(0, 40),
        lastCount: followUpRequest.count,
        createdAt: Date.now(),
      },
    };
  }

  if (followUpRequest && !previousContext) {
    const catalogProducts = await getCatalogProducts();
    const filters = parseFilters(`gợi ý ${followUpRequest.count} sản phẩm còn hàng`);

    const productResult = buildProductReply(filters, catalogProducts, {
      count: followUpRequest.count,
    });

    return {
      reply: productResult.reply,
      productContext: {
        filters,
        shownSlugs: productResult.products.map((item) => item.slug),
        lastCount: followUpRequest.count,
        createdAt: Date.now(),
      },
    };
  }

  if (shouldRecommendProducts(text)) {
    const catalogProducts = await getCatalogProducts();
    const filters = parseFilters(message);
    const count = extractRequestedCount(text);

    const productResult = buildProductReply(filters, catalogProducts, {
      count,
    });

    return {
      reply: productResult.reply,
      productContext: {
        filters,
        shownSlugs: productResult.products.map((item) => item.slug),
        lastCount: count,
        createdAt: Date.now(),
      },
    };
  }

  if (isServiceQuestion(text)) {
    const faqAnswer = findFaqAnswer(message);
    if (faqAnswer) {
      return {
        reply: faqAnswer,
        productContext: previousContext,
      };
    }
  }

  const faqAnswer = findFaqAnswer(message);
  if (faqAnswer) {
    return {
      reply: faqAnswer,
      productContext: previousContext,
    };
  }

  return {
    reply: getFallbackReply(),
    productContext: previousContext,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = String(body.message || "");
    const previousContext = readProductContext(request);
    const result = await getReply(message, previousContext);

    const response = NextResponse.json({
      intent: "hmecha_chatbot",
      reply: result.reply,
    });

    if (result.productContext) {
      response.cookies.set(PRODUCT_CONTEXT_COOKIE, encodeProductContext(result.productContext), {
        path: "/",
        maxAge: 60 * 20,
        sameSite: "lax",
      });
    }

    return response;
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