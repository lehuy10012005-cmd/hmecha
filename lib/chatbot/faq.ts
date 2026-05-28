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
      "giao",
      "giao hàng",
      "vận chuyển",
      "bao lâu",
      "toàn quốc",
      "ra tỉnh",
    ],
    answer:
      "Shop có hỗ trợ giao hàng toàn quốc. Phí ship mặc định sẽ được tính khi đặt hàng, và shop có thể miễn phí ship cho đơn đạt điều kiện khuyến mãi. Thời gian giao thường tùy khu vực: nội thành nhanh hơn, tỉnh xa sẽ lâu hơn một chút. Khi đơn được xác nhận, shop sẽ đóng gói và gửi hàng sớm nhất có thể.",
  },
  {
    category: "cod",
    keywords: ["cod", "thanh toán khi nhận", "trả tiền khi nhận", "kiểm hàng"],
    answer:
      "Shop có hỗ trợ COD cho khách muốn thanh toán khi nhận hàng. Khi nhận hàng, bạn nên kiểm tra tình trạng kiện hàng bên ngoài trước khi nhận. Nếu kiện có dấu hiệu móp, rách hoặc bất thường, bạn có thể chụp lại và báo shop để được hỗ trợ.",
  },
  {
    category: "payment",
    keywords: [
      "thanh toán",
      "vnpay",
      "chuyển khoản",
      "qr",
      "ngân hàng",
      "thanh toán lỗi",
      "lỗi vnpay",
    ],
    answer:
      "Shop hỗ trợ thanh toán VNPAY và COD. Nếu thanh toán VNPAY bị lỗi, bạn có thể thử đặt lại đơn hoặc chọn COD để shop xác nhận thủ công. Nếu bạn đã bị trừ tiền nhưng đơn chưa cập nhật, hãy gửi mã đơn hoặc ảnh giao dịch để shop kiểm tra.",
  },
  {
    category: "return",
    keywords: [
      "đổi trả",
      "hoàn tiền",
      "lỗi",
      "thiếu part",
      "giao sai",
      "sai mẫu",
      "bảo hành",
      "móp hộp",
      "hộp bị móp",
    ],
    answer:
      "Nếu sản phẩm bị giao sai, thiếu part hoặc có lỗi rõ ràng, bạn hãy giữ lại hộp, runner, phụ kiện và chụp ảnh/video tình trạng sản phẩm để shop kiểm tra. Shop sẽ hỗ trợ theo từng trường hợp cụ thể. Với hộp móp nhẹ do vận chuyển nhưng sản phẩm bên trong không ảnh hưởng, shop sẽ xem xét hỗ trợ tùy mức độ.",
  },
  {
    category: "preorder",
    keywords: [
      "preorder",
      "đặt trước",
      "cọc",
      "bao lâu có hàng",
      "hàng về",
      "hủy preorder",
      "hàng đặt trước",
    ],
    answer:
      "Với hàng preorder, thời gian về hàng sẽ phụ thuộc lịch phát hành và vận chuyển. Một số mẫu có thể cần cọc để giữ slot. Nếu bạn muốn đặt trước, shop sẽ xác nhận giá, thời gian dự kiến và điều kiện cọc trước khi chốt đơn.",
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
      "Shop ưu tiên bán sản phẩm chính hãng và ghi rõ thông tin sản phẩm trong từng mẫu. Nếu bạn cần kiểm tra một mẫu cụ thể có phải Bandai chính hãng, bootleg hay dòng khác, hãy gửi tên sản phẩm để shop kiểm tra kỹ hơn cho bạn.",
  },
  {
    category: "order_guide",
    keywords: [
      "cách đặt",
      "mua hàng",
      "đặt hàng",
      "thêm giỏ",
      "checkout",
      "giỏ hàng",
      "cần tài khoản",
    ],
    answer:
      "Bạn có thể đặt hàng bằng cách vào sản phẩm muốn mua, bấm thêm vào giỏ hàng, mở giỏ hàng rồi sang trang thanh toán. Sau đó nhập họ tên, số điện thoại, địa chỉ nhận hàng và chọn phương thức thanh toán. Không cần hỏi quá nhiều, cứ đặt trên web là shop sẽ nhận được đơn.",
  },
  {
    category: "support",
    keywords: [
      "liên hệ",
      "zalo",
      "facebook",
      "tư vấn",
      "nhân viên",
      "hotline",
      "gọi shop",
    ],
    answer:
      "Bạn có thể liên hệ trực tiếp shop qua hotline hoặc kênh liên hệ đang hiển thị trên website để được tư vấn nhanh hơn. Nếu đang hỏi về một sản phẩm cụ thể, bạn gửi tên mẫu hoặc link sản phẩm để shop kiểm tra chính xác.",
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