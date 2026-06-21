const fs = require("fs");

const file = "public/hmecha.html";
let html = fs.readFileSync(file, "utf8");

/* Xóa các bản fix cũ nếu có */
html = html.replace(/<style id="hmecha-news-backtop-only-fix">[\s\S]*?<\/style>\s*/g, "");
html = html.replace(/<style id="hmecha-news-backtop-direct-fix">[\s\S]*?<\/style>\s*/g, "");

/* Sửa thẳng title Tin Tức Mới Nhất để không bị CSS cũ đè */
html = html.replace(
  `<a href="tin-tuc" title="Tin Tức Mới Nhất">Tin Tức <span>Mới Nhất</span></a>`,
  `<a href="tin-tuc" title="Tin Tức Mới Nhất" class="hm-news-title-link"><span class="hm-news-title-main">Tin Tức</span> <span class="hm-news-title-accent">Mới Nhất</span></a>`
);

/* Sửa subtitle đúng của block Tin tức */
html = html.replace(
  `<p class="sub_title">Cập nhật những thông tin mới nhất </p>`,
  `<p class="sub_title hm-news-subtitle">Cập nhật những thông tin mới nhất</p>`
);

const fix = `
<style id="hmecha-news-backtop-direct-fix">
/* ===== FIX TRỰC TIẾP: TIN TỨC MỚI NHẤT + NÚT LÊN ĐẦU TRANG ===== */

/* Chỉ sửa section Tin tức, không đụng block khác */
.section_blog {
  background: #ffffff !important;
  color: #111827 !important;
  padding-top: 44px !important;
  padding-bottom: 44px !important;
}

.section_blog > .container {
  background: #ffffff !important;
  border: none !important;
  box-shadow: none !important;
}

/* Tiêu đề Tin Tức Mới Nhất */
.section_blog .section-title h2,
.section_blog .section-title h2 a.hm-news-title-link {
  color: #111827 !important;
  font-family: Georgia, "Times New Roman", serif !important;
  font-size: 36px !important;
  line-height: 1.15 !important;
  font-weight: 950 !important;
  letter-spacing: -0.04em !important;
  text-shadow: none !important;
  opacity: 1 !important;
}

.section_blog .section-title h2 a.hm-news-title-link,
.section_blog .section-title h2 a.hm-news-title-link:hover {
  text-decoration: none !important;
}

.section_blog .section-title h2 a.hm-news-title-link .hm-news-title-main {
  color: #111827 !important;
  -webkit-text-fill-color: #111827 !important;
  text-shadow: none !important;
  opacity: 1 !important;
}

.section_blog .section-title h2 a.hm-news-title-link .hm-news-title-accent {
  color: #d32f2f !important;
  -webkit-text-fill-color: #d32f2f !important;
  text-shadow: none !important;
  opacity: 1 !important;
}

/* Subtitle */
.section_blog .section-title .hm-news-subtitle,
.section_blog text-shadow: none !important;
  opacity: 1 !important;
}

/* Subtitle */
.section_blog .section-title .hm-news-subtitle,
.section_blog > .container > .section-title .hm-news-subtitle {
  color: #4b5563 !important;
  -webkit-text-fill-color: #4b5563 !important;
  font-size: 16px !important;
  font-weight: 600 !important;
  text-shadow: none !important;
  opacity: 1 !important;
}

/* Card tin tức */
.section_blog .item_blog_index {
  background: #ffffff !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 10px !important;
  overflow: hidden !important;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08) !important;
}

.section_blog .item_blog_index:hover {
  transform: translateY(-3px) !important;
  border-color: rgba(211, 47, 47, 0.35) !important;
  box-shadow: 0 16px 34px rgba(211, 47, 47, 0.14) !important;
}

/* Chữ trong card */
.section_blog .blog_content,
.section_blog .conten_info_blog {
  background: #ffffff !important;
  color: #111827 !important;
}

.section_blog .blog_content h3 a {
  color: #111827 !important;
  -webkit-text-fill-color: #111827 !important;
  font-weight: 950 !important;
  text-shadow: none !important;
}

.section_blog .blog_content h3 a:hover {
  color: #d32f2f !important;
  -webkit-text-fill-color: #d32f2f !important;
}

.section_blog .update_date,
.section_blog .update_date *,
.section_blog .blog_description {
  color: #4b5563 !important;
  -webkit-text-fill-color: #4b5563 !important;
  text-shadow: none !important;
}

.section_blog .read_more {
  color: #d32f2f !important;
  -webkit-text-fill-color: #d32f2f !important;
  font-weight: 950 !important;
  text-shadow: none !important;
}

.section_blog .read_more:hover {
  color: #ff5722 !important;
  -webkit-text-fill-color: #ff5722 !important;
}

/* Badge ngày */
.section_blog .user_date,
.section_blog .user_date * {
  background: #ffc107 !important;
  color: #111111 !important;
  -webkit-text-fill-color: #111111 !important;
  text-shadow: none !important;
  font-weight: 950 !important;
}

.section_blog .user_date svg,
.section_blog .user_date svg path {
  fill: #111111 !important;
  color: #111111 !important;
}

/* Nút mũi tên trong slider tin tức */
.section_blog .swiper-button-next,
.section_blog .swiper-button-prev,
.section_blog [class*="swiper-button"] {
  background: #ffffff !important;
  color: #d32f2f !important;
  border: 1px solid #e5e7eb !important;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12) !important;
}

.section_blog .swiper-button-next::after,
.section_blog .swiper-button-prev::after {
  color: #d32f2f !important;
}

/* Nút lên đầu trang đúng class thật */
.hmecha-back-to-top {
  background: #d32f2f !important;
  background-image: none !important;
  color: #ffffff !important;
  border: 3px solid #ffc107 !important;
  box-shadow: 0 10px 26px rgba(211, 47, 47, 0.28) !important;
}

.hmecha-back-to-top:hover {
  background: #be1f2e !important;
  transform: translateY(-4px) !important;
}

.hmecha-back-to-top svg,
.hmecha-back-to-top svg path {
  stroke: #ffffff !important;
  color: #ffffff !important;
}

@media (max-width: 767px) {
  .section_blog .section-title h2,
  .section_blog .section-title h2 a.hm-news-title-link {
    font-size: 30px !important;
  }

  .section_blog .section-title .hm-news-subtitle {
    font-size: 14px !important;
  }
}
</style>
`;

html = html.replace("</body>", fix + "\n</body>");

fs.writeFileSync(file, html, "utf8");

console.log("Done: direct fixed news title and real backtop button class.");