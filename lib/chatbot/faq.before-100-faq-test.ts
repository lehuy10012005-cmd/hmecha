export type FaqItem = {
  category: string;
  keywords: string[];
  answer: string;
};

export const faqItems: FaqItem[] = [
  {
    category: "shipping",
    keywords: [
      "ship",
      "phí ship",
      "giao hàng",
      "vận chuyển",
      "bao lâu",
      "freeship",
      "miễn phí ship",
      "giao tỉnh",
      "giao toàn quốc",
    ],
    answer:
      "HMECHA hỗ trợ giao hàng toàn quốc. Phí vận chuyển mặc định là 30.000đ. Một số đơn đủ điều kiện có thể được miễn phí ship, ví dụ đơn từ 1.000.000đ hoặc có mã FREESHIP.\n\nThời gian giao tùy khu vực: nội thành thường nhanh hơn, tỉnh xa sẽ lâu hơn. Sau khi đặt hàng, admin sẽ xác nhận đơn trước khi xử lý giao.",
  },
  {
    category: "payment",
    keywords: [
      "thanh toán",
      "vnpay",
      "qr",
      "cod",
      "chuyển khoản",
      "trả tiền",
      "thanh toán lỗi",
      "bị trừ tiền",
    ],
    answer:
      "HMECHA hiện hỗ trợ 2 phương thức chính: COD và VNPAY / QR.\n\nCOD: bạn thanh toán khi nhận hàng.\nVNPAY / QR: bạn thanh toán qua cổng VNPAY hoặc quét QR theo hướng dẫn ở trang checkout.\n\nNếu đã bị trừ tiền nhưng đơn chưa cập nhật, bạn hãy gửi mã đơn hoặc ảnh giao dịch để admin kiểm tra.",
  },
  {
    category: "coupon",
    keywords: [
      "mã giảm giá",
      "voucher",
      "coupon",
      "ưu đãi",
      "khuyến mãi",
      "giảm giá",
      "freeship",
      "c3welcome",
      "c3gundam",
      "c3ship",
    ],
    answer:
      "Mỗi đơn hàng chỉ áp dụng 1 mã giảm giá. Bạn có thể chọn mã có sẵn ở trang checkout hoặc nhập mã thủ công.\n\nMột số mã phổ biến:\nC3WELCOME: ưu đãi cho khách mới.\nC3GUNDAM: giảm theo phần trăm.\nFREESHIP: miễn phí vận chuyển nếu đủ điều kiện.\nC3SHIP: giảm phí vận chuyển.\n\nVoucher cá nhân sẽ nằm trong mục Tài khoản nếu bạn đã đăng nhập.",
  },
  {
    category: "reward",
    keywords: [
      "điểm",
      "tích điểm",
      "điểm tích lũy",
      "đổi điểm",
      "đổi voucher",
      "thẻ tích điểm",
      "reward",
    ],
    answer:
      "Điểm tích lũy dùng để đổi voucher cá nhân cho các đơn sau. Khi đơn hàng được admin chuyển sang trạng thái Hoàn thành, hệ thống sẽ cộng điểm cho tài khoản.\n\nBạn có thể vào Tài khoản để xem điểm hiện có và đổi điểm lấy voucher như giảm 20K, 50K, freeship hoặc ưu đãi cao hơn nếu đủ điểm.",
  },
  {
    category: "order",
    keywords: [
      "đơn hàng",
      "kiểm tra đơn",
      "mã đơn",
      "trạng thái đơn",
      "đơn của tôi",
      "đặt rồi",
      "đơn đâu",
      "xem đơn",
    ],
    answer:
      "Nếu bạn đặt hàng khi đã đăng nhập, đơn sẽ hiển thị trong Tài khoản → Đơn hàng của tôi.\n\nCác trạng thái thường gặp:\nChờ xác nhận: shop mới nhận đơn, chưa tính vào doanh thu.\nĐã xác nhận: shop đã kiểm tra đơn.\nĐang giao: đơn đang được xử lý vận chuyển.\nHoàn thành: đơn đã xong và có thể được cộng điểm tích lũy.\nĐã hủy / thanh toán thất bại: đơn không được tính.",
  },
  {
    category: "wishlist",
    keywords: [
      "yêu thích",
      "thêm yêu thích",
      "wishlist",
      "lưu sản phẩm",
      "xem sau",
      "trái tim",
    ],
    answer:
      "Bạn có thể bấm nút trái tim hoặc nút Thêm vào yêu thích ở trang sản phẩm để lưu mẫu đang quan tâm.\n\nDanh sách yêu thích nằm trong Tài khoản → Yêu thích. Nếu chưa đăng nhập, bạn cần đăng nhập để lưu sản phẩm vào tài khoản.",
  },
  {
    category: "compare",
    keywords: [
      "so sánh",
      "compare",
      "so sánh sản phẩm",
      "khác nhau",
      "nên chọn mẫu nào",
      "phân vân",
    ],
    answer:
      "Bạn có thể bấm So sánh sản phẩm ở trang chi tiết để thêm mẫu vào bảng so sánh. Hệ thống hỗ trợ so sánh tối đa 4 sản phẩm.\n\nTrang so sánh sẽ giúp bạn nhìn nhanh giá, SKU, thương hiệu, tình trạng, danh mục và link xem chi tiết từng mẫu.",
  },
  {
    category: "beginner",
    keywords: [
      "người mới",
      "mới chơi",
      "mới bắt đầu",
      "dễ lắp",
      "nên mua",
      "hg",
      "rg",
      "mg",
      "entry grade",
      "dụng cụ",
    ],
    answer:
      "Nếu bạn mới chơi Gunpla, nên bắt đầu bằng Entry Grade hoặc HG. Hai dòng này dễ lắp, giá dễ tiếp cận và không cần kỹ thuật quá phức tạp.\n\nDụng cụ cơ bản nên có: kềm cắt mô hình, dao hobby hoặc dũa, nhíp nếu dán sticker nhỏ. Sơn và keo chưa cần thiết khi mới bắt đầu.",
  },
  {
    category: "preorder",
    keywords: [
      "preorder",
      "đặt trước",
      "hàng đặt trước",
      "cọc",
      "bao lâu có hàng",
      "hàng về",
    ],
    answer:
      "Với sản phẩm Đặt trước, shop sẽ xác nhận giá, thời gian dự kiến và điều kiện cọc nếu có trước khi chốt đơn.\n\nThời gian về hàng có thể thay đổi theo lịch phát hành, vận chuyển và tình trạng nhập hàng.",
  },
  {
    category: "return",
    keywords: [
      "đổi trả",
      "hoàn tiền",
      "bảo hành",
      "thiếu part",
      "lỗi",
      "giao sai",
      "móp hộp",
      "hộp móp",
      "đổi hàng",
    ],
    answer:
      "Nếu sản phẩm bị giao sai, thiếu part hoặc lỗi rõ ràng, bạn hãy giữ lại hộp, runner, phụ kiện và chụp ảnh/video tình trạng sản phẩm để shop kiểm tra.\n\nVới hộp móp nhẹ do vận chuyển nhưng sản phẩm bên trong không ảnh hưởng, shop sẽ xem xét hỗ trợ tùy mức độ.",
  },
  {
    category: "authenticity",
    keywords: [
      "chính hãng",
      "bandai thật",
      "bootleg",
      "fake",
      "tem",
      "seal",
      "nguyên seal",
      "hàng thật",
    ],
    answer:
      "HMECHA ưu tiên sản phẩm chính hãng và ghi rõ thông tin từng mẫu. Với sản phẩm Bandai, bạn có thể xem thương hiệu, ảnh hộp và thông tin sản phẩm trên trang chi tiết.\n\nNếu bạn muốn kiểm tra một mẫu cụ thể, hãy gửi tên sản phẩm hoặc link để shop kiểm tra kỹ hơn.",
  },
  {
    category: "stock",
    keywords: [
      "còn hàng",
      "hết hàng",
      "tồn kho",
      "còn không",
      "có sẵn",
      "hàng sẵn",
      "sắp hết",
    ],
    answer:
      "Tình trạng sản phẩm được hiển thị ngay trên card và trang chi tiết. Nếu ghi Còn hàng thì bạn có thể đặt. Nếu ghi Hết hàng thì nút mua có thể bị khóa hoặc shop cần kiểm tra lại.\n\nNếu bạn muốn chắc chắn trước khi mua, hãy gửi tên mẫu để admin xác nhận tồn kho.",
  },
  {
    category: "support",
    keywords: [
      "admin",
      "nhân viên",
      "người thật",
      "tư vấn viên",
      "gặp admin",
      "liên hệ",
      "zalo",
      "facebook",
      "hotline",
    ],
    answer:
      "Mình đã ghi nhận yêu cầu cần nhân viên tư vấn. Bạn có thể để lại câu hỏi cụ thể, tên sản phẩm, ngân sách hoặc mã đơn để admin phản hồi dễ hơn.\n\nVí dụ: “Mình có 500K, muốn mẫu dễ lắp”, hoặc “Kiểm tra giúp đơn #ABC123”.",
  },
];

export function findFaqAnswer(message: string) {
  const normalized = message.toLowerCase();

  let bestMatch: FaqItem | null = null;
  let bestScore = 0;

  for (const item of faqItems) {
    const score = item.keywords.reduce((total, keyword) => {
      return normalized.includes(keyword.toLowerCase()) ? total + 1 : total;
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = item;
    }
  }

  return bestMatch?.answer || null;
}