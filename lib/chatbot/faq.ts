export type FaqItem = {
  category: string;
  questions: string[];
  keywords: string[];
  answer: string;
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s#]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const faqItems: FaqItem[] = [
  {
    category: "greeting",
    questions: [
      "xin chào",
      "hello",
      "hi shop",
      "chào shop",
      "chào hmecha",
    ],
    keywords: ["xin chao", "hello", "hi", "chao"],
    answer:
      "Chào bạn, HMECHA có thể hỗ trợ bạn tìm sản phẩm, kiểm tra giá, tình trạng hàng, hướng dẫn đặt hàng, thanh toán, vận chuyển, voucher và hỗ trợ tài khoản.",
  },
  {
    category: "shop_intro",
    questions: [
      "shop bán gì",
      "hmecha là gì",
      "web này bán gì",
      "cửa hàng có sản phẩm gì",
      "shop chuyên về gì",
    ],
    keywords: ["shop ban gi", "hmecha", "ban gi", "san pham gi", "chuyen ve gi"],
    answer:
      "HMECHA chuyên bán mô hình Gundam, Gunpla, Model Kit, phụ kiện lắp ráp, móc khóa và các sản phẩm sưu tầm liên quan đến Gundam.",
  },
  {
    category: "contact",
    questions: [
      "shop ở đâu",
      "địa chỉ shop",
      "hotline shop là gì",
      "số điện thoại shop",
      "liên hệ shop ở đâu",
    ],
    keywords: ["dia chi", "hotline", "so dien thoai", "lien he", "o dau"],
    answer:
      "Bạn có thể liên hệ HMECHA qua hotline 0945632321. Địa chỉ shop: 99 Hồ Đắc Di. Các kênh mạng xã hội được đặt ở phần cuối trang web.",
  },
  {
    category: "social",
    questions: [
      "shop có facebook không",
      "shop có tiktok không",
      "shop có instagram không",
      "shop có shopee không",
      "xem mạng xã hội của shop ở đâu",
    ],
    keywords: ["facebook", "tiktok", "instagram", "shopee", "mang xa hoi"],
    answer:
      "HMECHA có các liên kết mạng xã hội ở cuối trang web. Bạn có thể kéo xuống footer để mở Facebook, Instagram, TikTok hoặc Shopee của shop.",
  },
  {
    category: "beginner",
    questions: [
      "tôi mới chơi nên mua gì",
      "người mới nên mua mẫu nào",
      "mẫu nào dễ lắp",
      "mới bắt đầu chơi gunpla nên chọn gì",
      "gợi ý sản phẩm cho người mới",
    ],
    keywords: ["nguoi moi", "moi choi", "de lap", "moi bat dau", "goi y"],
    answer:
      "Nếu mới chơi, bạn nên bắt đầu với các mẫu HG hoặc sản phẩm giá vừa phải. Những mẫu này dễ lắp, dễ trưng bày và không quá phức tạp. Bạn có thể hỏi thêm: “gợi ý sản phẩm dưới 500k” để mình lọc nhanh hơn.",
  },
  {
    category: "budget",
    questions: [
      "có sản phẩm dưới 500k không",
      "gợi ý sản phẩm dưới 1 triệu",
      "sản phẩm giá rẻ",
      "mẫu nào tầm 300k đến 800k",
      "tôi có ngân sách 500k",
    ],
    keywords: ["duoi", "tren", "gia re", "ngan sach", "tam gia", "500k", "1 trieu"],
    answer:
      "Bạn có thể hỏi theo ngân sách, ví dụ: “cho tôi 3 sản phẩm dưới 500k”, “sản phẩm từ 300k đến 800k” hoặc “mẫu còn hàng dưới 1 triệu”. Chatbot sẽ cố gợi ý sản phẩm phù hợp theo giá.",
  },
  {
    category: "stock",
    questions: [
      "sản phẩm còn hàng không",
      "hàng này còn không",
      "có sẵn không",
      "tồn kho còn bao nhiêu",
      "sản phẩm hết hàng thì sao",
    ],
    keywords: ["con hang", "het hang", "ton kho", "co san", "con khong"],
    answer:
      "Tình trạng sản phẩm được hiển thị trên thẻ sản phẩm và trang chi tiết. Nếu ghi Còn hàng thì bạn có thể đặt. Nếu ghi Hết hàng thì hiện tại chưa thể mua trực tiếp hoặc cần shop cập nhật lại.",
  },
  {
    category: "preorder",
    questions: [
      "đặt trước là gì",
      "pre order là gì",
      "hàng đặt trước bao lâu có",
      "sản phẩm preorder mua sao",
      "có cần cọc khi đặt trước không",
    ],
    keywords: ["dat truoc", "preorder", "pre order", "coc", "hang ve"],
    answer:
      "Sản phẩm Đặt trước nghĩa là hàng chưa có sẵn ngay hoặc cần chờ nhập. Thời gian về hàng có thể thay đổi. Nếu cần chắc chắn, bạn nên liên hệ shop trước khi đặt.",
  },
  {
    category: "cart",
    questions: [
      "thêm vào giỏ hàng sao",
      "giỏ hàng ở đâu",
      "xóa sản phẩm trong giỏ",
      "tăng số lượng sản phẩm",
      "giảm số lượng sản phẩm",
    ],
    keywords: ["gio hang", "them vao gio", "xoa san pham", "tang so luong", "giam so luong"],
    answer:
      "Bạn có thể bấm Thêm vào giỏ ở thẻ sản phẩm hoặc trang chi tiết. Vào Giỏ hàng để tăng/giảm số lượng, xóa sản phẩm hoặc tiến hành thanh toán.",
  },
  {
    category: "checkout",
    questions: [
      "làm sao để đặt hàng",
      "tôi muốn mua hàng",
      "tiến hành thanh toán ở đâu",
      "đặt hàng như thế nào",
      "mua ngay là gì",
    ],
    keywords: ["dat hang", "mua hang", "thanh toan", "mua ngay", "checkout"],
    answer:
      "Bạn chọn sản phẩm, thêm vào giỏ hàng, vào Giỏ hàng, kiểm tra sản phẩm rồi bấm Tiến hành thanh toán. Sau đó nhập thông tin nhận hàng và chọn phương thức thanh toán.",
  },
  {
    category: "payment",
    questions: [
      "shop có cod không",
      "cod là gì",
      "shop có vnpay không",
      "thanh toán qr được không",
      "nên chọn cod hay vnpay",
    ],
    keywords: ["cod", "vnpay", "qr", "thanh toan", "chuyen khoan"],
    answer:
      "HMECHA hỗ trợ COD và VNPAY/QR. COD là thanh toán khi nhận hàng. VNPAY/QR phù hợp nếu bạn muốn thanh toán online nhanh hơn.",
  },
  {
    category: "shipping",
    questions: [
      "phí ship bao nhiêu",
      "bao lâu nhận được hàng",
      "shop có giao toàn quốc không",
      "đơn bao nhiêu thì freeship",
      "miễn phí vận chuyển không",
    ],
    keywords: ["phi ship", "ship", "van chuyen", "giao hang", "freeship", "mien phi"],
    answer:
      "Phí vận chuyển sẽ hiển thị ở giỏ hàng hoặc trang thanh toán. Một số đơn đủ điều kiện có thể được miễn phí vận chuyển, ví dụ đơn từ 1.000.000đ tùy chương trình.",
  },
  {
    category: "coupon",
    questions: [
      "shop có mã giảm giá không",
      "nhập voucher ở đâu",
      "mã giảm giá không dùng được",
      "có freeship không",
      "mỗi đơn dùng được mấy mã",
    ],
    keywords: ["ma giam gia", "voucher", "coupon", "uu dai", "khuyen mai", "freeship"],
    answer:
      "Bạn có thể chọn voucher hoặc nhập mã giảm giá ở trang thanh toán. Thông thường mỗi đơn chỉ dùng một mã phù hợp. Nếu mã không dùng được, có thể mã đã hết hạn hoặc đơn chưa đủ điều kiện.",
  },
  {
    category: "account",
    questions: [
      "có cần tạo tài khoản không",
      "đăng ký tài khoản ở đâu",
      "đăng nhập ở đâu",
      "xem tài khoản của tôi",
      "tài khoản dùng để làm gì",
    ],
    keywords: ["tai khoan", "dang ky", "dang nhap", "account", "member"],
    answer:
      "Tạo tài khoản giúp bạn xem lại lịch sử đơn hàng, theo dõi trạng thái đơn, lưu yêu thích và quản lý thông tin cá nhân tiện hơn.",
  },
  {
    category: "password_reset",
    questions: [
      "tôi quên mật khẩu",
      "đổi mật khẩu như thế nào",
      "không nhận được mã xác nhận",
      "mã xác nhận hết hạn",
      "mã 6 số dùng để làm gì",
    ],
    keywords: ["quen mat khau", "doi mat khau", "ma xac nhan", "6 so", "otp"],
    answer:
      "Bạn vào trang Quên mật khẩu, nhập email đã đăng ký. HMECHA sẽ gửi mã xác nhận 6 chữ số vào email. Sau đó nhập mã, mật khẩu mới và xác nhận để đổi mật khẩu.",
  },
  {
    category: "order_status",
    questions: [
      "xem đơn hàng ở đâu",
      "kiểm tra trạng thái đơn hàng",
      "đơn hàng của tôi đâu",
      "tôi đặt hàng rồi thì làm gì",
      "admin đổi trạng thái đơn ở đâu",
    ],
    keywords: ["don hang", "trang thai don", "kiem tra don", "don cua toi", "dat roi"],
    answer:
      "Nếu đã đăng nhập khi đặt hàng, bạn có thể vào trang Tài khoản để xem lịch sử và trạng thái đơn. Nếu cần hỗ trợ nhanh, hãy gửi thông tin đơn hàng cho HMECHA.",
  },
  {
    category: "reviews",
    questions: [
      "đánh giá sản phẩm ở đâu",
      "tôi muốn viết đánh giá",
      "có xem được đánh giá không",
      "shop có phản hồi đánh giá không",
      "gửi bình luận sản phẩm thế nào",
    ],
    keywords: ["danh gia", "binh luan", "review", "phan hoi", "so sao"],
    answer:
      "Bạn có thể vào trang chi tiết sản phẩm, kéo xuống phần đánh giá, chọn số sao và gửi bình luận. Đánh giá giúp khách sau chọn sản phẩm dễ hơn.",
  },
  {
    category: "return_policy",
    questions: [
      "đổi trả như thế nào",
      "sản phẩm bị lỗi thì sao",
      "nhận sai sản phẩm thì sao",
      "hàng bị móp hộp thì sao",
      "có bảo hành không",
    ],
    keywords: ["doi tra", "bao hanh", "bi loi", "giao sai", "mop hop", "hoan tien"],
    answer:
      "Nếu sản phẩm bị lỗi, giao sai hoặc có vấn đề khi nhận hàng, bạn nên chụp ảnh/video và liên hệ HMECHA sớm. Shop sẽ kiểm tra và hỗ trợ theo chính sách đổi trả.",
  },
  {
    category: "authenticity",
    questions: [
      "hàng có chính hãng không",
      "có phải bandai thật không",
      "shop có bán fake không",
      "sản phẩm có nguyên seal không",
      "hàng có tem không",
    ],
    keywords: ["chinh hang", "bandai", "fake", "bootleg", "nguyen seal", "tem"],
    answer:
      "HMECHA ưu tiên sản phẩm chính hãng và ghi rõ thông tin trên trang chi tiết. Bạn có thể xem thương hiệu, ảnh hộp, mô tả và tình trạng sản phẩm trước khi mua.",
  },
  {
    category: "human_support",
    questions: [
      "gặp admin",
      "tôi muốn gặp người tư vấn",
      "cho tôi gặp nhân viên",
      "cần người hỗ trợ",
      "chatbot không hiểu",
    ],
    keywords: ["admin", "nhan vien", "nguoi tu van", "ho tro", "khong hieu"],
    answer:
      "Bạn có thể để lại câu hỏi cụ thể, tên sản phẩm, ngân sách hoặc mã đơn hàng. Nếu cần hỗ trợ nhanh, liên hệ hotline HMECHA: 0945632321.",
  },
];

function getFaqScore(item: FaqItem, normalizedMessage: string) {
  const exactQuestionScore = item.questions.reduce((score, question) => {
    const normalizedQuestion = normalizeText(question);
    return normalizedMessage.includes(normalizedQuestion) ? score + 8 : score;
  }, 0);

  const keywordScore = item.keywords.reduce((score, keyword) => {
    const normalizedKeyword = normalizeText(keyword);
    return normalizedMessage.includes(normalizedKeyword) ? score + 2 : score;
  }, 0);

  return exactQuestionScore + keywordScore;
}

export function findFaqAnswer(message: string) {
  const normalizedMessage = normalizeText(message);

  if (!normalizedMessage) return null;

  let bestMatch: FaqItem | null = null;
  let bestScore = 0;

  for (const item of faqItems) {
    const score = getFaqScore(item, normalizedMessage);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  if (!bestMatch || bestScore < 2) return null;

  return bestMatch.answer;
}