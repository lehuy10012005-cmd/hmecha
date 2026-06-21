export function fixVietnameseText(value: unknown) {
  const text = String(value || "");

  const map: Record<string, string> = {
    "Chá» thanh toÃ¡n": "Chờ thanh toán",
    "Chá» thanh toÃ¡n": "Chờ thanh toán",
    "Chá thanh toÃ¡n": "Chờ thanh toán",
    "Chờ thanh toán": "Chờ thanh toán",

    "Chá» xÃ¡c nháº­n": "Chờ xác nhận",
    "Chá» xÃ¡c nháº­n": "Chờ xác nhận",
    "Chá xÃ¡c nháº­n": "Chờ xác nhận",
    "Chờ xác nhận": "Chờ xác nhận",

    "ÄÃ£ thanh toÃ¡n": "Đã thanh toán",
    "Äã thanh toÃ¡n": "Đã thanh toán",
    "Đã thanh toán": "Đã thanh toán",

    "HoÃ n thÃ nh": "Hoàn thành",
    "Hoàn thành": "Hoàn thành",

    "Äang giao hÃ ng": "Đang giao hàng",
    "ÄÃ£ giao hÃ ng": "Đã giao hàng",

    "Há»§y": "Hủy",
    "Hủy": "Hủy",
  };

  if (map[text]) return map[text];

  if (text.includes("thanh toÃ¡n") || text.includes("thanh to")) {
    if (text.includes("Ä") || text.includes("Ã£") || text.toLowerCase().includes("paid")) {
      return "Đã thanh toán";
    }

    return "Chờ thanh toán";
  }

  if (text.includes("xÃ¡c") || text.includes("xac")) {
    return "Chờ xác nhận";
  }

  if (text.includes("HoÃ") || text.toLowerCase().includes("complete")) {
    return "Hoàn thành";
  }

  if (text.toLowerCase().includes("pending")) {
    return "Chờ xác nhận";
  }

  if (text.toLowerCase().includes("cancel")) {
    return "Hủy";
  }

  return text
    .replaceAll("Chá»", "Chờ")
    .replaceAll("toÃ¡n", "toán")
    .replaceAll("xÃ¡c nháº­n", "xác nhận")
    .replaceAll("ÄÃ£", "Đã")
    .replaceAll("Äã", "Đã")
    .replaceAll("HoÃ n thÃ nh", "Hoàn thành")
    .replaceAll("Há»§y", "Hủy");
}
