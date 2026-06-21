const fs = require("fs");

const file = "public/hmecha.html";
let html = fs.readFileSync(file, "utf8");

/* Xóa bản ẩn cũ nếu chạy lại */
html = html.replace(/<style id="hmecha-remove-news-section">[\s\S]*?<\/style>\s*/g, "");

/* Ẩn toàn bộ cụm Tin Tức Mới Nhất trên trang chủ */
const css = `
<style id="hmecha-remove-news-section">
/* Xóa khỏi giao diện cụm Tin Tức Mới Nhất */
.section_blog {
    display: none !important;
}
</style>
`;

html = html.replace("</body>", css + "\n</body>");

fs.writeFileSync(file, html, "utf8");

console.log("Done: removed homepage latest news section from UI.");