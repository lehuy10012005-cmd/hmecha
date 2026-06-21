const fs = require("fs");

const file = "public/hmecha.html";
let html = fs.readFileSync(file, "utf8");

/* Xóa bản fix cũ nếu chạy lại */
html = html.replace(/<style id="hmecha-news-backtop-only-fix">[\s\S]*?<\/style>\s*/g, "");

const fix = `
<style id="hmecha-news-backtop-only-fix">
/* ===== FIX ONLY: TIN TỨC MỚI NHẤT + NÚT LÊN ĐẦU TRANG ===== */

/* Khu Tin Tức Mới Nhất */
.section_blog {
    background: #ffffff !important;
    color: #111827 !important;
    padding-top: 44px !important;
    padding-bottom: 44px !important;
}

.section_blog .container {
    background: #ffffff !important;
    border: none !important;
    box-shadow: none !important;
}

/* Tiêu đề: Tin Tức đen, Mới Nhất đỏ */
.section_blog .section-title {
    margin-bottom: 28px !important;
}

.section_blog .section-title h2,
.section_blog .section-title h2 a {
    color: #111827 !important;
    font-family: Georgia, "Times New Roman", serif !important;
    font-size: 36px !important;
    line-height: 1.15 !important;
    font-weight: 950 !important;
    letter-spacing: -0.04em !important;
    text-shadow: none !important;
    opacity: 1 !important;
}

.section_blog .section-title h2 span,
.section_blog .section-title h2 a span {
    color: #d32f2f !important;
    text-shadow: none !important;
    opacity: 1 !important;
}

/* Dòng mô tả dưới tiêu đề */
.section_blog .section-title .sub_title,
.section_blog .section-title p,
.section_blog .sub_title {
    color: #4b5563 !important;
    font-size: 16px !important;
    font-weight: 600 !important;
    text-shadow: none !important;
    opacity: 1 !important;
}

/* Card tin tức giữ trắng nhưng làm nét hơn */
.section_blog .item_blog_index {
    background: #ffffff !important;
    border: 1px solid #e5e7eb !important;
    border-radius: 10px !important;
    overflow: hidden !important;
    box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08) !important;
    transition: 0.22s ease !important;
}

.section_blog .item_blog_index:hover {
    transform: translateY(-3px) !important;
    border-color: rgba(211, 47, 47, 0.35) !important;
    box-shadow: 0 16px 34px rgba(211, 47, 47, 0.14) !important;
}

/* Chữ trong card */
.section_blog .item_blog_index *,
.section_blog .blog_content *,
.section_blog .conten_info_blog * {
    text-shadow: none !important;
    opacity: 1 !important;
}

.section_blog .blog_content,
.section_blog .conten_info_blog {
    background: #ffffff !important;
    color: #111827 !important;
}

.section_blog .blog_content h3,
.section_blog .blog_content h3 a,
.section_blog .item_blog_index h3,
.section_blog .item_blog_index h3 a {
    color: #111827 !important;
    font-weight: 950 !important;
    line-height: 1.35 !important;
    letter-spacing: -0.02em !important;
}

.section_blog .blog_content h3 a:hover,
.section_blog .item_blog_index h3 a:hover {
    color: #d32f2f !important;
}

.section_blog .update_date,
.section_blog .update_date *,
.section_blog .user_name,
.section_blog .user_name *,
.section_blog .blog_description,
.section_blog .conten_info_blog p {
    color: #4b5563 !important;
}

/* Link đọc tiếp */
.section_blog .read_more,
.section_blog .read-more,
.section_blog .readmore,
.section_blog a[title="Đọc tiếp"] {
    color: #d32f2f !important;
    font-weight: 950 !important;
}

.section_blog .read_more:hover,
.section_blog .read-more:hover,
.section_blog .readmore:hover,
.section_blog a[title="Đọc tiếp"]:hover {
    color: #ff5722 !important;
}

/* Badge ngày: vàng giống tone mẫu */
.section_blog .user_date,
.section_blog .user_date *,
.section_blog .time-post,
.section_blog .time-post *,
.section_blog .date,
.section_blog .date * {
    background: #ffc107 !important;
    color: #111111 !important;
    border: none !important;
    text-shadow: none !important;
    font-weight: 950 !important;
}

.section_blog .user_date {
    border-radius: 8px !important;
    box-shadow: 0 6px 16px rgba(211, 47, 47, 0.16) !important;
}

.section_blog .user_date svg,
.section_blog .user_date svg path {
    fill: #111111 !important;
    color: #111111 !important;
}

/* Nút mũi tên carousel trong tin tức */
.section_blog .swiper-button-next,
.section_blog .swiper-button-prev,
.section_blog .section_blog_next,
.section_blog .section_blog_prev,
.section_blog [class*="swiper-button"] {
    background: #ffffff !important;
    color: #d32f2f !important;
    border: 1px solid #e5e7eb !important;
    box-shadow: 0 8px 18px rgba(15, 23, 42, 0.12) !important;
}

.section_blog .swiper-button-next:hover,
.section_blog .swiper-button-prev:hover,
.section_blog .section_blog_next:hover,
.section_blog .section_blog_prev:hover {
    background: #d32f2f !important;
    color: #ffffff !important;
    border-color: #d32f2f !important;
}

/* Nút lên đầu trang: bỏ xanh, đổi đỏ/vàng */
.backtop,
a.backtop,
.back-to-top,
.scrollToTop,
.scroll-top,
[class*="backtop"],
[class*="back-top"],
[class*="scroll-top"] {
    background: #d32f2f !important;
    background-image: none !important;
    color: #ffffff !important;
    border: 3px solid #ffc107 !important;
    box-shadow: 0 10px 26px rgba(211, 47, 47, 0.28) !important;
}

.backtop:hover,
a.backtop:hover,
.back-to-top:hover,
.scrollToTop:hover,
.scroll-top:hover,
[class*="backtop"]:hover,
[class*="back-top"]:hover,
[class*="scroll-top"]:hover {
    background: #be1f2e !important;
    color: #ffffff !important;
    border-color: #ffc107 !important;
}

.backtop i,
.backtop svg,
.backtop svg path,
a.backtop i,
a.backtop svg,
a.backtop svg path,
.back-to-top i,
.back-to-top svg,
.scrollToTop i,
.scrollToTop svg {
    color: #ffffff !important;
    stroke: #ffffff !important;
    fill: #ffffff !important;
}

/* Mobile */
@media (max-width: 767px) {
    .section_blog {
        padding-top: 30px !important;
        padding-bottom: 30px !important;
    }

    .section_blog .section-title h2,
    .section_blog .section-title h2 a {
        font-size: 29px !important;
    }

    .section_blog .section-title .sub_title,
    .section_blog .section-title p,
    .section_blog .sub_title {
        font-size: 14px !important;
    }
}
</style>
`;

/* Đặt cuối body để thắng CSS cũ */
html = html.replace("</body>", fix + "\n</body>");

fs.writeFileSync(file, html, "utf8");
console.log("Done: fixed only News section and Backtop button.");