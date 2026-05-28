import { extractBudget } from "./intent";

function formatPrice(price: number) {
  return Number(price || 0).toLocaleString("vi-VN") + "₫";
}

export function answerBeginnerAdvice(message: string) {
  const text = message.toLowerCase();
  const budget = extractBudget(message);

  if (
    text.includes("hg với rg") ||
    text.includes("hg và rg") ||
    text.includes("hg rg")
  ) {
    return `HG và RG khác nhau chủ yếu ở độ chi tiết và trải nghiệm lắp.

HG thường dễ lắp hơn, ít chi tiết hơn, giá mềm hơn, rất hợp cho người mới bắt đầu.

RG cùng tỉ lệ 1/144 nhưng chi tiết hơn, nhiều mảnh nhỏ hơn, khớp và decal thường phức tạp hơn. Nếu bạn mới chơi hoàn toàn, mình khuyên bắt đầu bằng HG trước, sau đó lên RG sẽ dễ hơn.

Nếu bạn muốn, bạn có thể hỏi: “Gợi ý HG dưới 500k cho người mới”.`;
  }

  if (
    text.includes("mg với hg") ||
    text.includes("mg và hg") ||
    text.includes("hg mg")
  ) {
    return `HG và MG khác nhau khá rõ.

HG thường nhỏ hơn, dễ lắp hơn, thời gian lắp nhanh hơn và giá dễ tiếp cận hơn.

MG thường tỉ lệ 1/100, kích thước lớn hơn, nhiều chi tiết hơn, có khung xương hoặc cơ cấu đẹp hơn. Nhưng MG cũng cần nhiều thời gian và kiên nhẫn hơn.

Người mới nên bắt đầu với HG hoặc Entry Grade. Nếu đã lắp vài mẫu rồi, bạn có thể thử MG.`;
  }

  if (
    text.includes("cần dụng cụ") ||
    text.includes("cần kềm") ||
    text.includes("dụng cụ gì") ||
    text.includes("tool")
  ) {
    return `Người mới lắp Gunpla nên có vài dụng cụ cơ bản:

1. Kềm cắt mô hình để cắt part khỏi runner.
2. Dao hobby hoặc dũa để xử lý phần nhựa thừa.
3. Nhíp nếu có dán sticker hoặc decal nhỏ.
4. Bút panel line nếu muốn mô hình nổi chi tiết hơn.
5. Một tấm cutting mat nếu muốn thao tác gọn và an toàn hơn.

Mới chơi thì chưa cần mua quá nhiều. Kềm tốt + dao/dũa cơ bản là đủ bắt đầu.`;
  }

  if (
    text.includes("cần keo") ||
    text.includes("có cần keo") ||
    text.includes("cần sơn") ||
    text.includes("có cần sơn")
  ) {
    return `Đa số Gunpla chính hãng Bandai không cần keo và không bắt buộc phải sơn.

Bạn chỉ cần cắt part, ráp theo hướng dẫn là mô hình đã hoàn thiện cơ bản. Sơn, panel line, decal hoặc topcoat là các bước nâng cấp thêm nếu bạn muốn mô hình đẹp hơn.

Với người mới, cứ lắp mộc trước để quen tay. Sau vài mẫu rồi hãy thử panel line hoặc sơn nhẹ.`;
  }

  if (
    text.includes("entry grade") ||
    text.includes("eg") ||
    text.includes("dễ lắp")
  ) {
    return `Entry Grade là dòng rất hợp cho người mới.

Ưu điểm:
1. Dễ lắp.
2. Ít part hơn HG/RG/MG.
3. Không cần quá nhiều dụng cụ.
4. Giá thường dễ tiếp cận.
5. Rất hợp để làm quen cách cắt, ráp và đọc hướng dẫn.

Nếu bạn mới chơi hoàn toàn, Entry Grade hoặc HG đơn giản là lựa chọn an toàn nhất.`;
  }

  if (
    text.includes("người mới") ||
    text.includes("mới chơi") ||
    text.includes("mới bắt đầu") ||
    text.includes("nên mua")
  ) {
    const budgetText = budget
      ? ` Với ngân sách khoảng ${budget.type === "max" ? "dưới" : "trên"} ${formatPrice(
          budget.value
        )}, bạn nên ưu tiên HG hoặc Entry Grade trước.`
      : "";

    return `Nếu bạn mới chơi Gunpla, mình khuyên bắt đầu bằng HG hoặc Entry Grade.${budgetText}

Lý do là hai dòng này dễ lắp, ít áp lực, giá dễ chịu và không cần kỹ thuật quá phức tạp.

Gợi ý chọn mẫu:
1. Thích dễ lắp nhất: chọn Entry Grade.
2. Thích nhiều mẫu đẹp, giá vừa phải: chọn HG.
3. Thích chi tiết hơn nhưng vẫn nhỏ gọn: sau khi quen tay hãy thử RG.
4. Thích mô hình lớn, lắp lâu hơn: sau vài mẫu hãy thử MG.

Bạn có thể hỏi tiếp kiểu: “Gợi ý HG dưới 500k cho người mới” để mình lọc sản phẩm cụ thể trong shop.`;
  }

  return `Với người mới chơi Gunpla, mình khuyên bắt đầu từ mẫu dễ lắp, giá vừa phải và không quá nhiều chi tiết nhỏ.

Nên ưu tiên:
1. Entry Grade nếu muốn dễ nhất.
2. HG nếu muốn nhiều lựa chọn và giá ổn.
3. RG nếu đã quen tay một chút.
4. MG nếu muốn mô hình lớn và trải nghiệm lắp lâu hơn.

Bạn có thể hỏi mình theo ngân sách, ví dụ: “Người mới nên mua mẫu dưới 500k” hoặc “Gợi ý HG dễ lắp”.`;
}