export type ChatIntent =
  | "product_search"
  | "order_lookup"
  | "faq"
  | "beginner_advice"
  | "greeting"
  | "human_support"
  | "unknown";

export function detectIntent(message: string): ChatIntent {
  const text = message.toLowerCase().trim();

  const isOnlyGreeting =
    /^(hi|hello|chào|alo|ê|shop ơi|xin chào|tư vấn với|tư vấn giúp)[\s!.]*$/i.test(
      text
    );

  if (isOnlyGreeting) {
    return "greeting";
  }

  const humanWords = [
    "gặp nhân viên",
    "người thật",
    "tư vấn viên",
    "gọi shop",
    "zalo",
    "facebook",
    "hotline",
    "liên hệ shop",
    "nhắn shop",
  ];

  if (humanWords.some((word) => text.includes(word))) {
    return "human_support";
  }

  const orderWords = [
    "đơn",
    "order",
    "mã đơn",
    "ma don",
    "trạng thái",
    "đã thanh toán",
    "giao tới đâu",
    "kiểm tra đơn",
    "hủy đơn",
    "đổi địa chỉ",
    "đổi số điện thoại",
    "thêm sản phẩm vào đơn",
  ];

  if (orderWords.some((word) => text.includes(word))) {
    return "order_lookup";
  }

  const beginnerWords = [
    "người mới",
    "mới chơi",
    "mới bắt đầu",
    "dễ lắp",
    "nên mua mẫu nào",
    "nên mua con nào",
    "nên bắt đầu",
    "cần dụng cụ gì",
    "cần kềm",
    "cần keo",
    "cần sơn",
    "hg với rg",
    "hg và rg",
    "mg với hg",
    "khác nhau gì",
    "entry grade",
    "tập chơi",
    "beginner",
  ];

  if (beginnerWords.some((word) => text.includes(word))) {
    return "beginner_advice";
  }

  const faqWords = [
    "ship",
    "phí ship",
    "giao hàng",
    "vận chuyển",
    "bao lâu",
    "hỏa tốc",
    "kiểm hàng",
    "thanh toán",
    "vnpay",
    "cod",
    "chuyển khoản",
    "đổi trả",
    "bảo hành",
    "thiếu part",
    "lỗi",
    "hoàn tiền",
    "liên hệ",
    "mua hàng",
    "đặt hàng",
    "preorder",
    "đặt trước",
    "cọc",
    "chính hãng",
    "bandai thật",
    "bootleg",
    "tem",
    "seal",
    "móp hộp",
  ];

  if (faqWords.some((word) => text.includes(word))) {
    return "faq";
  }

  const productWords = [
    "sản phẩm",
    "mô hình",
    "gundam",
    "gunpla",
    "rx",
    "zaku",
    "hg",
    "rg",
    "mg",
    "pg",
    "sd",
    "bandai",
    "metal build",
    "30mm",
    "30mf",
    "30ms",
    "pokemon",
    "card",
    "tcg",
    "còn hàng",
    "hàng sẵn",
    "giá",
    "dưới",
    "trên",
    "rẻ",
    "đắt",
    "sale",
    "khuyến mãi",
  ];

  if (productWords.some((word) => text.includes(word))) {
    return "product_search";
  }

  return "unknown";
}

export function extractPhone(message: string) {
  const match = message.match(/(0|\+84)[0-9\s.\-]{8,13}/);

  return (
    match?.[0]
      ?.replace(/\D/g, "")
      .replace(/^84/, "0") || null
  );
}

export function extractOrderId(message: string) {
  const uuid = message.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
  );

  if (uuid) return uuid[0];

  const afterKeyword = message.match(
    /(?:đơn|order|mã đơn|ma don)\s*#?:?\s*([a-z0-9\-]{6,})/i
  );

  return afterKeyword?.[1] || null;
}

export function extractBudget(message: string) {
  const text = message.toLowerCase();

  const directedMatch = text.match(
    /(dưới|duoi|trên|tren|tầm|tam|khoảng|khoang)\s*(\d+(?:[.,]\d+)?)\s*(k|nghìn|ngan|triệu|trieu|m|đ|vnd)?/iu
  );

  const unitMatch = text.match(
    /(\d+(?:[.,]\d+)?)\s*(k|nghìn|ngan|triệu|trieu|m|đ|vnd)(?![\p{L}\p{N}])/iu
  );

  const match = directedMatch || unitMatch;
  if (!match) return null;

  const direction = directedMatch?.[1] || "";
  const numberText = directedMatch ? directedMatch[2] : unitMatch?.[1];
  const unit = directedMatch ? directedMatch[3] || "" : unitMatch?.[2] || "";

  if (!numberText) return null;

  let value = Number(numberText.replace(",", "."));

  if (["k", "nghìn", "ngan"].includes(unit)) value *= 1000;
  if (["triệu", "trieu", "m"].includes(unit)) value *= 1000000;
  if (!unit && value < 10000) value *= 1000;

  return {
    value: Math.round(value),
    type:
      direction.includes("trên") || direction.includes("tren")
        ? "min"
        : "max",
  } as const;
}

export function extractProductKeyword(message: string) {
  const text = message
    .toLowerCase()
    .normalize("NFC")
    .replace(
      /(dưới|duoi|trên|tren|tầm|tam|khoảng|khoang)\s*\d+(?:[.,]\d+)?\s*(?:k|nghìn|ngan|triệu|trieu|m|đ|vnd)?(?![\p{L}\p{N}])/giu,
      " "
    )
    .replace(
      /\d+(?:[.,]\d+)?\s*(?:k|nghìn|ngan|triệu|trieu|m|đ|vnd)(?![\p{L}\p{N}])/giu,
      " "
    )
    .replace(
      /shop ơi|shop|ơi|cho tôi|giúp tôi|giúp mình|tìm cho tôi|tìm giúp|xem giúp|có|không|ko|kh|nào|gì|là gì|loại nào|mẫu nào|sản phẩm|mô hình|hàng|hàng nào|còn hàng|hàng sẵn|có sẵn|giá bao nhiêu|bao nhiêu|giá|rẻ nhất|đắt nhất|cao nhất|thấp nhất|mới nhất|đang sale|khuyến mãi/giu,
      " "
    )
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

  return text;
}