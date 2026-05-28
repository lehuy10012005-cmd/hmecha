export type ArticleSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type Article = {
  slug: string;
  title: string;
  date: string;
  author: string;
  category: string;
  image: string;
  excerpt: string;
  tags: string[];
  sections: ArticleSection[];
};

export const articles: Article[] = [
  {
    slug: "bien-nien-su-gundam-ky-1-vu-tru-uc",
    title:
      "[SERIES DÀI KỲ] KHÁM PHÁ ĐA VŨ TRỤ GUNDAM: TỪ KHỞI NGUỒN ĐẾN NHỮNG KỶ NGUYÊN MỚI",
    date: "07/05/2026",
    author: "HMECHA",
    category: "Tin tức",
    image:
      "https://bizweb.dktcdn.net/thumb/large/100/382/833/articles/banner-one-year-war.jpeg?v=1777021276897",
    excerpt:
      "Universal Century không chỉ là một dòng thời gian trong Gundam, mà còn là nền móng tạo nên toàn bộ tinh thần chiến tranh, lý tưởng và bi kịch của thương hiệu mecha huyền thoại này.",
    tags: ["Gundam", "Universal Century", "Gunpla", "Anime", "Mecha"],
    sections: [
      {
        heading: "Mở đầu: Vì sao Universal Century luôn là điểm bắt đầu?",
        paragraphs: [
          "Khi nhắc đến Gundam, rất nhiều người sẽ nghĩ ngay đến những mobile suit khổng lồ, các trận chiến ngoài không gian và những mẫu Gunpla quen thuộc như RX-78-2, Zaku hay Nu Gundam. Nhưng phía sau những cỗ máy ấy là một hệ thống lịch sử rất lớn, nơi con người, chính trị, chiến tranh và công nghệ liên tục va chạm với nhau.",
          "Universal Century, thường được gọi tắt là UC, là một trong những dòng thời gian quan trọng nhất của Gundam. Đây là nơi đặt nền móng cho khái niệm mobile suit, cho cuộc đối đầu giữa Trái Đất và các thuộc địa không gian, cũng như cho những bi kịch kéo dài qua nhiều thế hệ.",
          "Với người mới bước vào thế giới Gundam, UC có thể hơi đồ sộ. Nhưng nếu đi theo từng giai đoạn, bạn sẽ thấy đây là một hành trình rất đáng khám phá, đặc biệt nếu bạn vừa xem anime vừa sưu tầm Gunpla.",
        ],
      },
      {
        heading: "Bình minh của mâu thuẫn: Khi không gian không còn là giấc mơ",
        paragraphs: [
          "Trong bối cảnh UC, nhân loại đã mở rộng ra ngoài Trái Đất và sinh sống tại các colony ngoài không gian. Ban đầu, đây là biểu tượng của tiến bộ khoa học và hy vọng về một tương lai mới. Nhưng khi khoảng cách giữa cư dân Trái Đất và cư dân không gian ngày càng lớn, mâu thuẫn chính trị bắt đầu xuất hiện.",
          "Những người sống tại colony dần cảm thấy bị kiểm soát, bị xem nhẹ và không có tiếng nói tương xứng. Từ đó, các tư tưởng độc lập phát triển, tạo tiền đề cho sự ra đời của những phe phái đối lập với Liên bang Trái Đất.",
          "Chính trong bối cảnh ấy, mobile suit không chỉ còn là vũ khí. Chúng trở thành biểu tượng của quyền lực, tham vọng và cả nỗi sợ.",
        ],
      },
      {
        heading: "Cuộc Chiến Một Năm và cái bóng của RX-78-2",
        paragraphs: [
          "Một trong những giai đoạn nổi tiếng nhất của UC là Cuộc Chiến Một Năm. Đây là thời điểm các mobile suit bước lên trung tâm chiến trường, thay đổi hoàn toàn cách con người tiến hành chiến tranh.",
          "RX-78-2 Gundam không chỉ là một cỗ máy mạnh. Trong mắt người hâm mộ, nó là biểu tượng của thời kỳ Gundam bắt đầu định hình: một thiếu niên bị kéo vào chiến tranh, một vũ khí thử nghiệm trở thành huyền thoại, và một cuộc đối đầu không hề đơn giản giữa đúng và sai.",
          "Ở chiều ngược lại, Zaku của Zeon cũng là biểu tượng cực kỳ quan trọng. Thiết kế quân sự, dáng vẻ thô ráp và cảm giác thực chiến khiến Zaku trở thành một trong những mobile suit đáng nhớ nhất lịch sử Gundam.",
        ],
        bullets: [
          "RX-78-2 đại diện cho hình ảnh Gundam nguyên bản.",
          "Zaku thể hiện rõ phong cách quân sự của Zeon.",
          "Cuộc Chiến Một Năm là nền tảng cho rất nhiều anime, manga, game và Gunpla sau này.",
        ],
      },
      {
        heading: "Vì sao UC hấp dẫn người chơi Gunpla?",
        paragraphs: [
          "Đối với người sưu tầm mô hình, UC có sức hút rất riêng. Các thiết kế trong dòng thời gian này thường mang cảm giác cơ khí rõ ràng, nhiều chi tiết quân sự, dễ tạo diorama và phù hợp với nhiều phong cách custom.",
          "Bạn có thể bắt đầu bằng các mẫu HG đơn giản, sau đó chuyển sang RG để trải nghiệm khung xương chi tiết hơn, hoặc MG nếu muốn một mô hình có kích thước lớn và nhiều gimmick. Với những ai thích sự hoành tráng, các mẫu PG thuộc UC luôn là lựa chọn rất đáng chú ý.",
          "Điểm hay của UC là mỗi mẫu kit đều có câu chuyện phía sau. Khi bạn lắp một chiếc Gundam Ground Type, một chiếc Zaku hay một chiếc Nu Gundam, bạn không chỉ lắp nhựa; bạn đang cầm trên tay một mảnh nhỏ của lịch sử Gundam.",
        ],
      },
      {
        heading: "Kết luận",
        paragraphs: [
          "Universal Century là cánh cửa lớn để bước vào thế giới Gundam. Nó có chiến tranh, có lý tưởng, có bi kịch và có rất nhiều mobile suit đã trở thành biểu tượng.",
          "Nếu bạn mới bắt đầu, đừng cố hiểu toàn bộ UC trong một lần. Hãy đi từ những mốc quan trọng, xem từng tác phẩm tiêu biểu và chọn vài mẫu Gunpla gắn với giai đoạn mình thích. Khi đó, hành trình khám phá Gundam sẽ tự nhiên và thú vị hơn rất nhiều.",
        ],
      },
    ],
  },
  {
    slug: "30-minutes-fantasy-30mf-the-he-mo-hinh-gia-tuong-dot-pha-tu-bandai",
    title:
      "30 Minutes Fantasy (30MF): Thế Hệ Mô Hình Giả Tưởng Đột Phá Từ Bandai",
    date: "16/04/2026",
    author: "HMECHA",
    category: "Tin tức",
    image:
      "https://bizweb.dktcdn.net/thumb/large/100/382/833/articles/image-30-minutes-fantasy-banner.jpg?v=1776322512403",
    excerpt:
      "30 Minutes Fantasy mở rộng thế giới model kit Bandai sang phong cách fantasy, nơi người chơi có thể lắp ráp, nâng cấp và tùy biến nhân vật như một đội hình phiêu lưu thu nhỏ.",
    tags: ["30MF", "Bandai", "Model Kit", "Fantasy", "Custom"],
    sections: [
      {
        heading: "30MF là gì?",
        paragraphs: [
          "30 Minutes Fantasy, hay 30MF, là dòng model kit mang màu sắc giả tưởng của Bandai. Thay vì tập trung vào robot chiến đấu như Gunpla hay 30MM, dòng này khai thác hình ảnh hiệp sĩ, pháp sư, chiến binh và các lớp nhân vật thường thấy trong thế giới fantasy.",
          "Điểm hấp dẫn nhất của 30MF nằm ở khả năng tùy biến. Người chơi không chỉ lắp một nhân vật cố định, mà còn có thể thay đổi giáp, vũ khí, phụ kiện và phối hợp nhiều bộ kit để tạo ra nhân vật mang dấu ấn riêng.",
          "Với những ai thích custom nhưng không muốn bắt đầu bằng các kỹ thuật quá khó, 30MF là một lựa chọn rất dễ tiếp cận.",
        ],
      },
      {
        heading: "Tinh thần của 30MF: Lắp nhanh, chơi sâu",
        paragraphs: [
          "Đúng như tinh thần của các dòng 30 Minutes, 30MF hướng đến trải nghiệm lắp ráp nhanh, gọn và ít áp lực. Người mới có thể hoàn thành một nhân vật trong thời gian ngắn, trong khi người chơi lâu năm vẫn có nhiều đất để sáng tạo.",
          "Các khớp nối và cấu trúc thân thể được thiết kế để hỗ trợ thay đổi trang bị. Điều này giúp một nhân vật có thể biến đổi từ chiến binh cận chiến thành cung thủ, pháp sư hoặc một dạng nhân vật lai tùy theo phụ kiện bạn dùng.",
          "Cảm giác chơi của 30MF giống như xây dựng một nhân vật trong game nhập vai: bắt đầu từ lớp nhân vật cơ bản, sau đó nâng cấp từng phần để tạo thành phiên bản riêng.",
        ],
      },
      {
        heading: "Vì sao 30MF đáng chú ý với người chơi model kit?",
        paragraphs: [
          "Trong vài năm gần đây, cộng đồng model kit ngày càng thích các dòng có khả năng phối đồ và custom. 30MF đáp ứng đúng nhu cầu đó bằng một hệ sinh thái dễ mở rộng.",
          "Bạn có thể mua một kit nhân vật chính, sau đó thêm bộ giáp, vũ khí hoặc phụ kiện để thay đổi phong cách. Điều này khiến mỗi mẫu 30MF không bị giới hạn ở hình dáng ban đầu.",
          "Ngoài ra, chủ đề fantasy cũng tạo cảm giác mới lạ. Sau nhiều mẫu robot, mobile suit và mecha, việc lắp một chiến binh hoặc hiệp sĩ giả tưởng mang lại trải nghiệm khá khác biệt.",
        ],
        bullets: [
          "Phù hợp cho người mới vì cấu trúc lắp ráp dễ tiếp cận.",
          "Phù hợp cho người thích custom vì có nhiều phụ kiện thay thế.",
          "Chủ đề fantasy giúp bộ sưu tập model kit đa dạng hơn.",
        ],
      },
      {
        heading: "Nên bắt đầu 30MF như thế nào?",
        paragraphs: [
          "Nếu bạn mới chơi, hãy bắt đầu với một nhân vật cơ bản có thiết kế mình thích. Sau khi quen cấu trúc khớp và cách thay phụ kiện, bạn có thể mua thêm các set vũ khí hoặc giáp để mở rộng.",
          "Người thích trưng bày có thể tạo một đội hình nhỏ gồm nhiều class khác nhau. Người thích chụp ảnh mô hình có thể kết hợp thêm background fantasy, hiệu ứng phép thuật hoặc base trong suốt để tạo cảnh hành động.",
          "Còn nếu bạn đã quen Gunpla, 30MF sẽ là một nhánh phụ thú vị để đổi gió mà vẫn giữ được cảm giác lắp ráp quen thuộc của Bandai.",
        ],
      },
      {
        heading: "Kết luận",
        paragraphs: [
          "30 Minutes Fantasy không chỉ là một dòng model kit mới, mà còn là lời mời bước vào một kiểu chơi sáng tạo hơn. Lắp nhanh, thay đồ dễ, phối phụ kiện tốt và có chủ đề fantasy rõ ràng, 30MF rất phù hợp cho cả người mới lẫn người chơi lâu năm.",
          "Nếu bạn đang muốn thử một dòng khác ngoài Gunpla, 30MF là lựa chọn đáng để đưa vào danh sách.",
        ],
      },
    ],
  },
  {
    slug: "gundam-la-gi-lich-su-va-cau-chuyen-bien-no-thanh-mot-phan-khong-the-thieu-cua-van-hoa-dai-chung",
    title:
      "Gundam Là Gì? Lịch Sử Và Câu Chuyện Biến Nó Thành Một Phần Không Thể Thiếu Của Văn Hóa Đại Chúng",
    date: "02/04/2026",
    author: "HMECHA",
    category: "Kiến thức",
    image:
      "https://bizweb.dktcdn.net/thumb/large/100/382/833/articles/gunpla-size-comparison.jpeg?v=1775113487277",
    excerpt:
      "Gundam không chỉ là robot khổng lồ. Đó là một biểu tượng văn hóa kết nối anime, mô hình, game, âm nhạc, cộng đồng sưu tầm và tinh thần sáng tạo của nhiều thế hệ.",
    tags: ["Gundam", "Gunpla", "Anime", "Văn hóa", "Người mới"],
    sections: [
      {
        heading: "Gundam không đơn giản là robot",
        paragraphs: [
          "Với người mới, Gundam thường được hiểu đơn giản là những con robot khổng lồ có thiết kế đẹp mắt. Nhưng khi tìm hiểu sâu hơn, bạn sẽ thấy Gundam là một thương hiệu có chiều sâu rất lớn, kết hợp giữa khoa học viễn tưởng, chiến tranh, chính trị và câu chuyện trưởng thành của con người.",
          "Điểm làm Gundam khác nhiều dòng robot khác là cách nó đặt mobile suit vào bối cảnh chiến tranh có hệ quả. Một trận đánh không chỉ để phô diễn sức mạnh, mà còn kéo theo mất mát, lựa chọn đạo đức và những thay đổi trong cuộc đời nhân vật.",
          "Chính vì vậy, Gundam có sức sống lâu dài. Người xem có thể thích vì thiết kế máy, người chơi mô hình có thể thích vì Gunpla, còn người yêu câu chuyện có thể ở lại vì những lớp ý nghĩa phía sau.",
        ],
      },
      {
        heading: "Từ anime đến biểu tượng văn hóa",
        paragraphs: [
          "Gundam bắt đầu từ anime, nhưng theo thời gian đã phát triển thành một hệ sinh thái rộng lớn. Bên cạnh phim và series truyền hình, thương hiệu này còn có manga, game, novel, thẻ bài, sự kiện triển lãm và đặc biệt là Gunpla.",
          "Gunpla giúp người hâm mộ không chỉ xem Gundam mà còn trực tiếp tương tác với nó. Việc cắt runner, lắp ráp, dán decal, panel line, sơn hoặc custom khiến mỗi người có một cách sở hữu Gundam rất riêng.",
          "Có người lắp để thư giãn, có người sưu tầm theo dòng, có người custom để thi đấu hoặc trưng bày. Từ đó, Gundam trở thành một cộng đồng sáng tạo chứ không chỉ là một bộ anime.",
        ],
      },
      {
        heading: "Gundam hấp dẫn người mới ở điểm nào?",
        paragraphs: [
          "Người mới thường bị thu hút bởi thiết kế mobile suit. Các mẫu Gundam có nhiều phong cách: cổ điển, quân sự, hiện đại, fantasy, tối giản hoặc cực kỳ phức tạp.",
          "Sau khi bắt đầu lắp mô hình, người chơi sẽ dần để ý đến grade, tỷ lệ, độ chi tiết và câu chuyện của từng mẫu. Một mẫu HG nhỏ gọn có thể rất dễ chơi, trong khi MG hoặc RG lại đem đến trải nghiệm lắp ráp nhiều lớp hơn.",
          "Điều thú vị là Gundam không bắt buộc bạn phải biết hết mọi thứ ngay từ đầu. Bạn có thể bắt đầu bằng một mẫu mình thấy đẹp, rồi từ từ tìm hiểu anime hoặc timeline liên quan.",
        ],
        bullets: [
          "HG phù hợp để bắt đầu vì giá dễ tiếp cận và lắp nhanh.",
          "RG dành cho người thích chi tiết trong kích thước nhỏ.",
          "MG phù hợp khi muốn trải nghiệm mô hình lớn hơn và nhiều cơ cấu hơn.",
          "SD thích hợp cho người thích phong cách dễ thương, gọn và sưu tầm nhanh.",
        ],
      },
      {
        heading: "Gunpla: Cánh cửa dễ nhất để bước vào Gundam",
        paragraphs: [
          "Không phải ai cũng bắt đầu Gundam bằng anime. Rất nhiều người biết đến thương hiệu này qua Gunpla. Chỉ cần chọn một mẫu hợp mắt, bạn đã có thể bước vào thế giới Gundam theo cách rất trực quan.",
          "Gunpla cũng là sở thích có nhiều cấp độ. Bạn có thể chỉ lắp ráp cơ bản, hoặc nâng cấp dần bằng panel line, waterslide decal, topcoat, sơn airbrush và custom kitbash.",
          "Chính sự linh hoạt này khiến Gunpla phù hợp với nhiều độ tuổi và phong cách chơi khác nhau.",
        ],
      },
      {
        heading: "Kết luận",
        paragraphs: [
          "Gundam là sự kết hợp giữa câu chuyện, thiết kế cơ khí và văn hóa sưu tầm. Nó có thể bắt đầu từ một bộ phim, một mẫu mô hình hoặc một nhân vật bạn yêu thích.",
          "Dù bạn là người xem anime, người chơi model kit hay người mới tò mò về mecha, Gundam luôn có một cánh cửa phù hợp để bắt đầu.",
        ],
      },
    ],
  },
  {
    slug: "tin-tuc-tuy-bien-chien-thuat-cung-ultimate-deck-st-09-destiny-ignition",
    title:
      "[TIN TỨC] TÙY BIẾN CHIẾN THUẬT CÙNG ULTIMATE DECK [ST-09] DESTINY IGNITION",
    date: "15/03/2026",
    author: "HMECHA",
    category: "Tin tức",
    image:
      "https://bizweb.dktcdn.net/thumb/large/100/382/833/articles/36b78eb4-96ea-4bf9-8865-ccf7ce7ea4c0.png?v=1773587116303",
    excerpt:
      "Ultimate Deck ST-09 Destiny Ignition là lựa chọn đáng chú ý cho người chơi Gundam Card Game muốn bắt đầu bằng một bộ bài có định hướng chiến thuật rõ ràng.",
    tags: ["Gundam Card Game", "ST-09", "Destiny Ignition", "Deck", "TCG"],
    sections: [
      {
        heading: "Ultimate Deck ST-09 có gì đáng chú ý?",
        paragraphs: [
          "Với người chơi card game, một bộ bài dựng sẵn tốt không chỉ giúp bắt đầu nhanh hơn mà còn tạo nền tảng để nâng cấp sau này. Ultimate Deck ST-09 Destiny Ignition thuộc nhóm sản phẩm như vậy: dễ tiếp cận, có chủ đề rõ và phù hợp để người chơi làm quen với nhịp trận.",
          "Điểm hấp dẫn của một ultimate deck nằm ở việc nó thường được thiết kế theo một chiến thuật nhất định. Người chơi không phải tự ghép bài từ con số không, mà có thể bắt đầu bằng một khung deck đã có sẵn rồi tinh chỉnh dần.",
          "Với chủ đề Destiny Ignition, bộ bài này tạo cảm giác mạnh mẽ, tốc độ và hướng đến những pha triển khai có tính bùng nổ.",
        ],
      },
      {
        heading: "Phù hợp với ai?",
        paragraphs: [
          "ST-09 phù hợp với người mới muốn có một bộ bài hoàn chỉnh để bắt đầu chơi. Thay vì mua lẻ từng lá và chưa biết nên xây theo hướng nào, người chơi có thể dùng deck dựng sẵn để hiểu nhịp chơi cơ bản.",
          "Bộ này cũng phù hợp với người đã chơi một thời gian và muốn có thêm nền tảng để nâng cấp. Khi đã quen cách vận hành, bạn có thể thay một số lá bài để deck ổn định hơn hoặc tạo phong cách riêng.",
          "Đối với người sưu tầm, các ultimate deck thường có sức hút nhờ chủ đề, artwork và tính hoàn chỉnh của sản phẩm.",
        ],
      },
      {
        heading: "Chiến thuật nên chú ý khi chơi",
        paragraphs: [
          "Khi sử dụng một deck dựng sẵn, điều quan trọng là hiểu vai trò của từng nhóm thẻ. Đừng chỉ nhìn vào lá mạnh nhất; hãy quan sát cách các lá hỗ trợ nhau để tạo nhịp triển khai.",
          "Một deck tốt thường cần cân bằng giữa khả năng tấn công, phòng thủ, tài nguyên và phản ứng trước tình huống. Nếu chỉ tập trung vào các lá tấn công mạnh, người chơi có thể bị hụt nhịp khi đối thủ kiểm soát bàn đấu tốt hơn.",
          "Với ST-09, người chơi nên thử nhiều ván ở dạng nguyên bản trước, sau đó mới quyết định thay lá nào. Cách này giúp bạn hiểu bộ bài thay vì chỉnh quá sớm.",
        ],
        bullets: [
          "Chơi thử deck gốc vài trận trước khi nâng cấp.",
          "Ghi lại tình huống hay bị kẹt bài để biết cần chỉnh phần nào.",
          "Ưu tiên sự ổn định trước khi thêm các combo phức tạp.",
          "Đừng bỏ qua các lá hỗ trợ vì chúng thường quyết định nhịp trận.",
        ],
      },
      {
        heading: "Có nên mua ST-09 không?",
        paragraphs: [
          "Nếu bạn đang muốn bắt đầu Gundam Card Game bằng một sản phẩm dễ chơi và có định hướng rõ, ST-09 là một lựa chọn đáng cân nhắc. Nó giúp bạn có ngay bộ bài để trải nghiệm mà không phải tự xây deck từ đầu.",
          "Nếu bạn đã có kinh nghiệm, giá trị của ST-09 nằm ở việc nó có thể trở thành nền để nâng cấp. Một số lá trong deck có thể dùng làm lõi cho chiến thuật riêng hoặc kết hợp với các sản phẩm khác.",
          "Nhìn chung, đây là kiểu sản phẩm phù hợp cho cả người chơi mới, người chơi sưu tầm và người muốn mở rộng lựa chọn chiến thuật.",
        ],
      },
    ],
  },
  {
    slug: "huong-dan-co-ban-cach-choi-gundam-card-game",
    title: "🤖 HƯỚNG DẪN CƠ BẢN: CÁCH CHƠI GUNDAM CARD GAME",
    date: "20/03/2026",
    author: "HMECHA",
    category: "Cẩm nang",
    image:
      "https://bizweb.dktcdn.net/100/382/833/articles/unnamed-1.jpg?v=1774017458327",
    excerpt:
      "Gundam Card Game là sân chơi dành cho những ai yêu thích chiến thuật, mobile suit và cảm giác điều khiển đội hình Gundam trên bàn đấu.",
    tags: ["Gundam Card Game", "Hướng dẫn", "Người mới", "TCG"],
    sections: [
      {
        heading: "Gundam Card Game là gì?",
        paragraphs: [
          "Gundam Card Game là trò chơi thẻ bài lấy cảm hứng từ thế giới Gundam. Thay vì chỉ xem các mobile suit chiến đấu trên màn ảnh, người chơi sẽ xây dựng bộ bài của riêng mình và điều khiển chiến thuật trên bàn đấu.",
          "Mỗi lá bài đại diện cho một vai trò khác nhau: có lá dùng để triển khai đơn vị, có lá hỗ trợ chiến thuật, có lá tạo lợi thế trong một thời điểm quan trọng. Cách bạn kết hợp các lá bài sẽ quyết định phong cách chơi của cả deck.",
          "Với người mới, điều quan trọng nhất không phải là thắng ngay, mà là hiểu nhịp trận: khi nào nên triển khai, khi nào nên giữ tài nguyên và khi nào nên tấn công.",
        ],
      },
      {
        heading: "Chuẩn bị trước khi chơi",
        paragraphs: [
          "Để bắt đầu, bạn cần một bộ bài hợp lệ, không gian chơi đủ rộng và một người chơi đối diện. Người mới nên bắt đầu bằng starter deck hoặc ultimate deck vì các sản phẩm này đã được dựng sẵn với cấu trúc tương đối cân bằng.",
          "Trước trận, hãy đọc nhanh các nhóm thẻ chính trong deck. Việc biết lá nào là đơn vị chủ lực, lá nào hỗ trợ và lá nào dùng trong tình huống đặc biệt sẽ giúp bạn đưa ra quyết định tốt hơn.",
          "Trong vài trận đầu, bạn có thể chơi chậm, đọc kỹ hiệu ứng và ghi nhớ các bước cơ bản. Đây là giai đoạn làm quen, không cần vội.",
        ],
        bullets: [
          "Chọn một deck dựng sẵn để bắt đầu.",
          "Đọc kỹ hiệu ứng các lá quan trọng.",
          "Sắp xếp khu vực chơi rõ ràng để tránh nhầm lẫn.",
          "Chơi thử nhiều ván để hiểu nhịp deck.",
        ],
      },
      {
        heading: "Nhịp chơi cơ bản",
        paragraphs: [
          "Một ván card game thường xoay quanh việc quản lý tài nguyên và triển khai lá bài đúng thời điểm. Bạn không nên tung hết bài mạnh quá sớm nếu chưa có kế hoạch bảo vệ hoặc tận dụng chúng.",
          "Người chơi cần quan sát bàn đấu của đối thủ. Nếu đối thủ đang chuẩn bị một lượt bùng nổ, việc giữ lại lá phòng thủ hoặc lá phản ứng có thể quan trọng hơn việc tấn công ngay.",
          "Khi mới chơi, hãy tập trung vào ba việc: hiểu bài của mình, đọc tình huống của đối thủ và giữ nhịp tài nguyên ổn định.",
        ],
      },
      {
        heading: "Lỗi thường gặp của người mới",
        paragraphs: [
          "Lỗi phổ biến nhất là chỉ nhìn vào lá có chỉ số cao mà bỏ qua sự phối hợp giữa các lá. Một lá mạnh nhưng không phù hợp với nhịp deck có thể khiến bạn bị kẹt bài.",
          "Lỗi thứ hai là dùng tài nguyên quá nhanh. Card game không chỉ là đánh ra lá mạnh, mà còn là giữ lựa chọn cho các lượt sau.",
          "Lỗi thứ ba là nâng cấp deck quá sớm. Trước khi thay bài, bạn nên chơi đủ nhiều để biết deck đang yếu ở đâu.",
        ],
        bullets: [
          "Không nên chỉ chọn bài vì artwork đẹp hoặc chỉ số cao.",
          "Đừng dùng hết tài nguyên nếu chưa cần thiết.",
          "Nên hiểu deck gốc trước khi nâng cấp.",
          "Sau mỗi trận, ghi lại tình huống khiến bạn thua để cải thiện.",
        ],
      },
      {
        heading: "Kết luận",
        paragraphs: [
          "Gundam Card Game là trò chơi dễ bắt đầu nhưng có chiều sâu. Người mới có thể làm quen bằng deck dựng sẵn, sau đó từng bước tìm hiểu chiến thuật và nâng cấp bộ bài.",
          "Cứ chơi chậm, đọc bài kỹ và thử nhiều ván. Sau một thời gian, bạn sẽ thấy mỗi deck có cá tính riêng, giống như mỗi mobile suit trong thế giới Gundam đều có vai trò riêng trên chiến trường.",
        ],
      },
    ],
  },
  {
    slug: "cac-loai-the-bai-trong-gundam-card-game",
    title: "🃏 CÁC LOẠI THẺ BÀI TRONG GUNDAM CARD GAME",
    date: "14/01/2026",
    author: "HMECHA",
    category: "Cẩm nang",
    image:
      "https://bizweb.dktcdn.net/100/382/833/articles/500372369-1357538558829198-1436231448247876073-n.jpg?v=1768403890963",
    excerpt:
      "Hiểu rõ từng loại thẻ là bước đầu tiên để xây dựng một bộ bài Gundam Card Game ổn định, dễ vận hành và có chiến thuật rõ ràng.",
    tags: ["Gundam Card Game", "Thẻ bài", "TCG", "Cẩm nang"],
    sections: [
      {
        heading: "Vì sao cần hiểu từng loại thẻ?",
        paragraphs: [
          "Trong bất kỳ trò chơi thẻ bài nào, mỗi loại thẻ đều có nhiệm vụ riêng. Nếu chỉ nhìn vào lá bài mạnh mà không hiểu vai trò của nó trong deck, người chơi rất dễ rơi vào tình trạng bài đẹp nhưng vận hành không ổn định.",
          "Gundam Card Game cũng vậy. Một deck tốt cần có sự phối hợp giữa đơn vị chiến đấu, nhân vật hỗ trợ, lá chiến thuật và các công cụ tạo lợi thế theo lượt.",
          "Khi nắm được chức năng từng loại thẻ, bạn sẽ dễ đọc bài hơn, dễ nâng cấp deck hơn và cũng hiểu rõ vì sao mình thắng hoặc thua sau mỗi trận.",
        ],
      },
      {
        heading: "Unit Card: Lực lượng chính trên bàn đấu",
        paragraphs: [
          "Unit Card thường đại diện cho mobile suit hoặc đơn vị chiến đấu. Đây là nhóm thẻ giữ vai trò trung tâm vì chúng trực tiếp tham gia kiểm soát bàn đấu và gây áp lực lên đối thủ.",
          "Khi chọn unit cho deck, người chơi nên quan tâm đến chi phí triển khai, khả năng phối hợp và vai trò trong chiến thuật tổng thể. Một unit mạnh nhưng quá khó đưa ra sân có thể không hiệu quả bằng một unit vừa phải nhưng ổn định.",
          "Với người mới, nên chọn các unit dễ hiểu, có vai trò rõ và không yêu cầu combo quá phức tạp.",
        ],
      },
      {
        heading: "Pilot Card: Linh hồn của mobile suit",
        paragraphs: [
          "Pilot Card thường đại diện cho phi công hoặc nhân vật gắn với mobile suit. Nhóm thẻ này giúp tăng sức mạnh, mở thêm hiệu ứng hoặc tạo lợi thế đặc biệt khi kết hợp đúng đơn vị.",
          "Pilot tốt không nhất thiết phải mạnh trong mọi tình huống. Quan trọng là nó hợp với unit và cách deck vận hành. Một pilot đúng chỗ có thể biến một lượt đánh bình thường thành pha xoay chuyển trận đấu.",
          "Khi xây deck, hãy xem pilot như phần bổ trợ chiến thuật, không nên nhồi quá nhiều nếu chúng không có mục tiêu rõ ràng.",
        ],
      },
      {
        heading: "Command Card: Công cụ thay đổi tình huống",
        paragraphs: [
          "Command Card là nhóm thẻ tạo hiệu ứng chiến thuật. Chúng có thể giúp rút bài, tăng sức mạnh, phá thế trận, bảo vệ đơn vị hoặc tạo bất ngờ trong một lượt quan trọng.",
          "Đây là nhóm thẻ đòi hỏi người chơi phải biết thời điểm sử dụng. Dùng quá sớm có thể lãng phí, dùng quá muộn có thể không còn tác dụng.",
          "Người mới nên ưu tiên các command dễ hiểu, hiệu ứng rõ ràng và hỗ trợ trực tiếp cho kế hoạch chính của deck.",
        ],
        bullets: [
          "Dùng command để giữ nhịp, không chỉ để tạo combo đẹp.",
          "Không nên đưa quá nhiều command nếu deck thiếu unit.",
          "Luôn tự hỏi: lá này giúp mình thắng tình huống nào?",
        ],
      },
      {
        heading: "Base và các thẻ hỗ trợ khác",
        paragraphs: [
          "Ngoài unit, pilot và command, một số deck còn sử dụng các thẻ dạng base hoặc hỗ trợ để tạo nền tảng lâu dài. Những lá này thường không tạo cảm giác bùng nổ ngay, nhưng lại giúp deck ổn định hơn qua nhiều lượt.",
          "Người mới thường bỏ qua nhóm thẻ hỗ trợ vì chúng không trực tiếp tấn công. Tuy nhiên, trong card game, sự ổn định đôi khi quan trọng hơn một pha mạnh ngắn hạn.",
          "Một deck cân bằng nên có đủ công cụ để triển khai, phòng thủ, hồi nhịp và kết thúc trận đấu.",
        ],
      },
      {
        heading: "Kết luận",
        paragraphs: [
          "Hiểu các loại thẻ là nền tảng để chơi Gundam Card Game tốt hơn. Khi biết unit làm gì, pilot hỗ trợ ra sao, command dùng lúc nào và base giúp ổn định thế nào, bạn sẽ xây deck có mục tiêu rõ ràng hơn.",
          "Đừng vội chạy theo các lá hiếm hoặc lá mạnh. Hãy bắt đầu bằng việc hiểu cấu trúc deck, sau đó nâng cấp từng phần theo phong cách chơi của bạn.",
        ],
      },
    ],
  },
];

export function getArticleBySlug(slug: string) {
  return articles.find((article) => article.slug === slug);
}

export function getRelatedArticles(currentSlug: string) {
  return articles.filter((article) => article.slug !== currentSlug).slice(0, 3);
}