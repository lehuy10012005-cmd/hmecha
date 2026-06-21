const fs = require("fs");

const file = "public/hmecha.html";
let html = fs.readFileSync(file, "utf8");

/* Xóa bản fix font cũ nếu chạy lại */
html = html.replace(/<style id="hmecha-title-font-fix">[\s\S]*?<\/style>\s*/g, "");

/* 1) Trả title Tin Tức về markup gốc để font-title hoạt động đúng */
html = html.replace(
  /<a href="tin-tuc" title="Tin Tức Mới Nhất" class="hm-news-title-link">[\s\S]*?<\/a>/,
  `<a href="tin-tuc" title="Tin Tức Mới Nhất">Tin Tức <span>Mới Nhất</span></a>`
);

/* 2) Đổi HMecha Chất Lượng Uy Tín sang cấu trúc title giống các section khác */
html = html.replace(
  /<div class="flip-animation[\s\S]*?<\/div>\s*<div class="content_about_2">/,
  `<div class="section-title a-left font-title hm-about-quality-title">
                    <h2><span>HMecha</span> Chất Lượng Uy Tín</h2>
                </div>
                <div class="content_about_2">`
);

/* 3) Gỡ các dòng ép font Georgia ở những bản vá trước */
const styleIds = [
  "hmecha-news-backtop-only-fix",
  "hmecha-news-backtop-direct-fix",
  "hmecha-about2-only-fix"
];

for (const id of styleIds) {
  const reg = new RegExp(`(<style id="${id}">)([\\\\s\\\\S]*?)(<\\\\/style>)`, "g");
  html = html.replace(reg, (full, open, css, close) => {
    css = css.replace(/font-family:\\s*Georgia,\\s*"Times New Roman",\\s*serif\\s*!important;\\s*/g, "");
    css = css.replace(/letter-spacing:\\s*-?0\\.[0-9]+em\\s*!important;\\s*/g, "");
    return open + css + close;
  });
}

/* 4) Fix lại màu nhưng KHÔNG ép font nữa */
const fontFix = `
<style id="hmecha-title-font-fix">
/* ===== FIX ONLY FONT/TITLE STYLE - dùng lại font gốc của web ===== */

/* Tin Tức Mới Nhất: giữ font-title gốc, chỉ sửa màu */
.section_blog .section-title.a-left.font-title h2,
.section_blog .section-title.a-left.font-title h2 a {
    color: #111827 !important;
    text-shadow: none !important;
    opacity: 1 !important;
}

.section_blog .section-title.a-left.font-title h2 a span {
    color: #d32f2f !important;
    text-shadow: none !important;
    opacity: 1 !important;
}

.section_blog .section-title .sub_title {
    color: #4b5563 !important;
    text-shadow: none !important;
    opacity: 1 !important;
}

/* HMecha Chất Lượng Uy Tín: dùng cùng cấu trúc font-title như mẫu */
.section_about_2 .hm-about-quality-title {
    margin-bottom: 12px !important;
}

.section_about_2 .hm-about-quality-title h2 {
    color: #111827 !important;
    text-shadow: none !important;
    opacity: 1 !important;
    margin: 0 !important;
}

.section_about_2 .hm-about-quality-title h2 span {
    color: #d32f2f !important;
    text-shadow: none !important;
    opacity: 1 !important;
}

/* Tiêu đề trong card bên phải cũng giữ font-title gốc */
.section_about_2 .content_about_2 .section-title.a-left.font-title h2 {
    color: #111827 !important;
    text-shadow: none !important;
    opacity: 1 !important;
}

.section_about_2 .content_about_2 .section-title.a-left.font-title h2 span {
    color: #d32f2f !important;
    text-shadow: none !important;
    opacity: 1 !important;
}

/* Chặn lỗi chữ bị dính xanh/cyan còn sót ở 2 tiêu đề này */
.section_blog .section-title.a-left.font-title h2 *,
.section_about_2 .hm-about-quality-title h2 *,
.section_about_2 .content_about_2 .section-title.a-left.font-title h2 * {
    text-shadow: none !important;
}
</style>
`;

html = html.replace("</body>", fontFix + "\n</body>");

fs.writeFileSync(file, html, "utf8");
console.log("Done: fixed title font to use original font-title style.");