const fs = require("fs");

const homePath = "public/hmecha.html";
const articlePath = "app/tin-tuc/[slug]/page.tsx";
const newsListPath = "app/tin-tuc/page.tsx";

let home = fs.readFileSync(homePath, "utf8");
let article = fs.readFileSync(articlePath, "utf8");
let newsList = fs.readFileSync(newsListPath, "utf8");

/* Xóa bản vá cũ nếu chạy lại */
home = home.replace(/<style id="hmecha-final-red-yellow-home-fix">[\s\S]*?<\/style>\s*/g, "");
article = article.replace(/\s*<style id="hmecha-final-red-yellow-article-fix">\{`[\s\S]*?`\}<\/style>\s*/g, "");
newsList = newsList.replace(/<main className="min-h-screen bg-\[#050816\] px-4 py-10 text-white">/g, '<main className="newsListPage min-h-screen px-4 py-10">');
newsList = newsList.replace(/className="mb-6 text-sm text-slate-300"/g, 'className="mb-6 text-sm text-slate-600"');
newsList = newsList.replace(/className="text-cyan-300"/g, 'className="text-red-600"');
newsList = newsList.replace(/Tin tức <span className="text-red-600">HMECHA<\/span>/g, 'Tin tức <span className="text-red-600">HMECHA</span>');
newsList = newsList.replace(/Tin tức <span className="text-cyan-300">HMECHA<\/span>/g, 'Tin tức <span className="text-red-600">HMECHA</span>');
newsList = newsList.replace(/className="overflow-hidden rounded-2xl border border-cyan-300\/20 bg-white\/10 transition hover:-translate-y-1 hover:border-cyan-300\/60"/g, 'className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-red-300 hover:shadow-lg"');
newsList = newsList.replace(/className="mb-3 flex justify-between gap-3 text-xs text-slate-300"/g, 'className="mb-3 flex justify-between gap-3 text-xs text-slate-500"');
newsList = newsList.replace(/className="font-bold text-cyan-300"/g, 'className="font-bold text-red-600"');
newsList = newsList.replace(/className="mb-3 line-clamp-3 text-lg font-black"/g, 'className="mb-3 line-clamp-3 text-lg font-black text-slate-950"');
newsList = newsList.replace(/className="line-clamp-3 text-sm leading-6 text-slate-300"/g, 'className="line-clamp-3 text-sm leading-6 text-slate-600"');

/* HOME: sửa đúng Tin tức / Cẩm nang / Kênh mô hình + service/footer */
const homeFix = `
<style id="hmecha-final-red-yellow-home-fix">
/* =========================================================
   HMECHA FINAL RED/YELLOW THEME FIX
   Sửa đúng: Tin tức, Cẩm nang, Kênh mô hình, footer
========================================================= */

:root {
  --hmecha-red: #d32f2f;
  --hmecha-red-dark: #be1f2e;
  --hmecha-yellow: #ffc107;
  --hmecha-orange: #ff5722;
  --hmecha-black: #050505;
  --hmecha-text: #111827;
  --hmecha-muted: #4b5563;
  --hmecha-soft: #f3f6fb;
  --hmecha-border: #e5e7eb;
}

/* Toàn bộ vùng tin tức/cẩm nang/video: bỏ nền tối, bỏ cyan */
.section_blog,
.section_blog_video {
  background: #ffffff !important;
  color: var(--hmecha-text) !important;
}

.section_blog .container,
.section_blog_video .container,
.section_blog > .container,
.section_blog_video > .container {
  background: #ffffff !important;
  border: none !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  padding-top: 28px !important;
  padding-bottom: 28px !important;
}

/* Tiêu đề section giống tinh thần mẫu: chữ đen đậm, nhấn đỏ */
.section_blog .section-title h2,
.section_blog .section-title h2 a,
.section_blog_video .section-title h2,
.section_blog_video .section-title h2 a {
  color: var(--hmecha-text) !important;
  font-weight: 950 !important;
  letter-spacing: -0.04em !important;
  text-shadow: none !important;
}

.section_blog .section-title h2 span,
.section_blog .section-title h2 a span,
.section_blog_video .section-title h2 span,
.section_blog_video .section-title h2 a span {
  color: var(--hmecha-red) !important;
  text-shadow: none !important;
}

.section_blog .section-title .sub_title,
.section_blog .section-title p,
.section_blog_video .section-title .sub_title,
.section_blog_video .section-title p {
  color: var(--hmecha-muted) !important;
  font-weight: 500 !important;
  text-shadow: none !important;
}

/* Card Tin tức mới nhất: trắng, viền nhẹ, chữ rõ */
.section_blog .item_blog_index {
  background: #ffffff !important;
  color: var(--hmecha-text) !important;
  border: 1px solid var(--hmecha-border) !important;
  border-radius: 10px !important;
  overflow: hidden !important;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.07) !important;
  transition: 0.22s ease !important;
}

.section_blog .item_blog_index:hover {
  transform: translateY(-3px) !important;
  border-color: rgba(211, 47, 47, 0.32) !important;
  box-shadow: 0 16px 34px rgba(211, 47, 47, 0.14) !important;
}

.section_blog .item_blog_index *,
.section_blog .blog_content *,
.section_blog .conten_info_blog * {
  text-shadow: none !important;
  opacity: 1 !important;
}

.section_blog .blog_content {
  background: #ffffff !important;
  color: var(--hmecha-text) !important;
}

.section_blog .blog_content h3,
.section_blog .blog_content h3 a {
  color: var(--hmecha-text) !important;
  font-weight: 950 !important;
  line-height: 1.35 !important;
  letter-spacing: -0.02em !important;
}

.section_blog .blog_content h3 a:hover {
  color: var(--hmecha-red) !important;
}

.section_blog .update_date,
.section_blog .update_date *,
.section_blog .user_name,
.section_blog .user_name b,
.section_blog .blog_description,
.section_blog .conten_info_blog p {
  color: var(--hmecha-muted) !important;
}

.section_blog .read_more,
.section_blog a[title="Đọc tiếp"],
.section_blog .readmore,
.section_blog .read-more {
  color: var(--hmecha-red) !important;
  font-weight: 900 !important;
}

.section_blog .read_more:hover,
.section_blog a[title="Đọc tiếp"]:hover {
  color: var(--hmecha-orange) !important;
}

/* Badge ngày trên ảnh: vàng/đỏ giống mẫu C3, không dùng cyan */
.section_blog .user_date,
.section_blog .user_date *,
.section_blog .time-post,
.section_blog .time-post *,
.section_blog .date,
.section_blog .date * {
  background: var(--hmecha-yellow) !important;
  color: #111111 !important;
  border: none !important;
  text-shadow: none !important;
  font-weight: 950 !important;
}

.section_blog .user_date {
  border-radius: 8px !important;
  box-shadow: 0 6px 16px rgba(211, 47, 47, 0.18) !important;
}

.section_blog .user_date svg,
.section_blog .user_date svg path {
  fill: #111111 !important;
}

/* Cẩm nang kiến thức: đổi style theo section sáng, tiêu đề đen/đỏ */
.section_blog_video .flex-item-white,
.section_blog_video .item_small_blog,
.section_blog_video .contentright,
.section_blog_video .item_video {
  background: #ffffff !important;
  color: var(--hmecha-text) !important;
  text-shadow: none !important;
}

.section_blog_video .item_small_blog {
  border-radius: 12px !important;
  padding: 10px !important;
  transition: 0.22s ease !important;
}

.section_blog_video .item_small_blog:hover {
  background: var(--hmecha-soft) !important;
}

.section_blog_video .item_small_blog *,
.section_blog_video .contentright *,
.section_blog_video .list_item_video * {
  color: var(--hmecha-text) !important;
  opacity: 1 !important;
  text-shadow: none !important;
}

.section_blog_video .item_small_blog h3,
.section_blog_video .item_small_blog h3 a,
.section_blog_video .contentright h3,
.section_blog_video .contentright h3 a {
  color: var(--hmecha-text) !important;
  font-weight: 950 !important;
  line-height: 1.28 !important;
  letter-spacing: -0.02em !important;
}

.section_blog_video .item_small_blog h3 a:hover,
.section_blog_video .contentright h3 a:hover {
  color: var(--hmecha-red) !important;
}

.section_blog_video .time-post,
.section_blog_video .time-post *,
.section_blog_video .date,
.section_blog_video .date *,
.section_blog_video .user_date,
.section_blog_video .user_date * {
  background: var(--hmecha-red) !important;
  color: #ffffff !important;
  font-weight: 950 !important;
  border: none !important;
}

.section_blog_video .time-post {
  border-radius: 8px !important;
}

/* Kênh mô hình: bỏ cyan, giữ ảnh/video nổi, title đen/đỏ */
.section_blog_video .item_video,
.section_blog_video .box_img,
.section_blog_video .content_video {
  background: #ffffff !important;
}

.section_blog_video .item_video img,
.section_blog_video .box_img img {
  border-radius: 10px !important;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.10) !important;
}

.section_blog_video .icon_video span {
  background: rgba(211, 47, 47, 0.92) !important;
  border: 2px solid rgba(255, 255, 255, 0.92) !important;
  box-shadow: 0 10px 26px rgba(211, 47, 47, 0.28) !important;
}

.section_blog_video .icon_video span i {
  border-left-color: #ffffff !important;
}

/* Chặn các rule xanh/cyan cũ trong vùng blog/video */
.section_blog [style*="cyan"],
.section_blog_video [style*="cyan"] {
  color: var(--hmecha-red) !important;
}

/* =========================================================
   SERVICE STRIP + FOOTER theo ảnh mẫu footer C3
========================================================= */

/* 4 ô tiện ích phía trên footer: xanh cũ -> đỏ/vàng/đen */
.section_services {
  background: #ffffff !important;
  position: relative !important;
  z-index: 2 !important;
  padding: 28px 0 0 !important;
  margin: 0 !important;
  transform: none !important;
}

.section_services .container {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.section_services .promo-item {
  background: linear-gradient(135deg, #111827 0%, #070707 100%) !important;
  border: 1px solid rgba(255, 193, 7, 0.35) !important;
  border-radius: 16px !important;
  min-height: 86px !important;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.18) !important;
  overflow: hidden !important;
}

.section_services .promo-item::before {
  background: var(--hmecha-red) !important;
}

.section_services .promo-item .icon {
  background: var(--hmecha-red) !important;
  color: #ffffff !important;
  border-right: 5px solid var(--hmecha-yellow) !important;
}

.section_services .promo-item .icon svg,
.section_services .promo-item .icon svg path {
  fill: #ffffff !important;
  color: #ffffff !important;
}

.section_services .promo-item .info h3 {
  color: #ffffff !important;
  font-weight: 950 !important;
  text-shadow: none !important;
}

.section_services .promo-item .info span {
  color: #d1d5db !important;
}

/* Footer đen họa tiết, vàng/đỏ, bỏ neon cyan */
.hmecha-custom-footer {
  background:
    radial-gradient(circle at 12% 18%, rgba(211, 47, 47, 0.16), transparent 26%),
    radial-gradient(circle at 88% 16%, rgba(255, 193, 7, 0.12), transparent 28%),
    repeating-linear-gradient(135deg, rgba(255,255,255,0.035) 0 1px, transparent 1px 14px),
    linear-gradient(180deg, #060606 0%, #000000 100%) !important;
  border-top: 4px solid var(--hmecha-red) !important;
  color: #ffffff !important;
  box-shadow: none !important;
}

.hmecha-footer-container {
  max-width: 1600px !important;
  padding: 52px 42px 18px !important;
}

.hmecha-brand-name,
.hmecha-footer-title,
.hmecha-contact-item strong,
.hmecha-footer-bottom strong {
  color: #ffffff !important;
  text-shadow: none !important;
}

.hmecha-brand-subtitle,
.hmecha-footer-bottom strong {
  color: var(--hmecha-yellow) !important;
}

.hmecha-footer-title {
  font-weight: 950 !important;
  letter-spacing: 0.02em !important;
}

.hmecha-footer-title::after {
  background: var(--hmecha-red) !important;
  box-shadow: none !important;
}

.hmecha-brand-description,
.hmecha-newsletter-text,
.hmecha-contact-item span,
.hmecha-footer-bottom {
  color: #d1d5db !important;
}

.hmecha-brand-description strong {
  color: var(--hmecha-yellow) !important;
}

.hmecha-footer-links a,
.hmecha-contact-item a,
.hmecha-custom-footer p,
.hmecha-custom-footer span {
  color: #e5e7eb !important;
  text-shadow: none !important;
}

.hmecha-footer-links a::before {
  color: var(--hmecha-yellow) !important;
}

.hmecha-footer-links a:hover,
.hmecha-contact-item a:hover {
  color: var(--hmecha-yellow) !important;
}

.hmecha-socials a {
  background: #111111 !important;
  border: 1px solid rgba(255, 193, 7, 0.34) !important;
  color: #ffffff !important;
  box-shadow: none !important;
}

.hmecha-socials a:hover {
  background: var(--hmecha-red) !important;
  color: #ffffff !important;
  border-color: var(--hmecha-yellow) !important;
}

.hmecha-newsletter-form input {
  background: #ffffff !important;
  color: #111111 !important;
  border: 1px solid #333333 !important;
}

.hmecha-newsletter-form input::placeholder {
  color: #6b7280 !important;
}

.hmecha-newsletter-form button {
  background: var(--hmecha-yellow) !important;
  color: #111111 !important;
  box-shadow: none !important;
  font-weight: 950 !important;
}

.hmecha-newsletter-form button:hover {
  background: var(--hmecha-red) !important;
  color: #ffffff !important;
}

.hmecha-contact-bar {
  border-top: 1px solid rgba(255, 255, 255, 0.13) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.13) !important;
}

.hmecha-contact-icon {
  color: var(--hmecha-yellow) !important;
  filter: none !important;
}

.backtop,
a.backtop {
  background: var(--hmecha-red) !important;
  color: #ffffff !important;
  border: 3px solid var(--hmecha-yellow) !important;
  box-shadow: 0 10px 28px rgba(211, 47, 47, 0.26) !important;
}

/* Floating chat/backtop bớt lệch xanh neon */
.chat-toggle,
.chat-bubble,
button[class*="chat"],
[class*="chatBubble"],
[class*="chat-toggle"] {
  background: var(--hmecha-red) !important;
  color: #ffffff !important;
  border-color: var(--hmecha-yellow) !important;
}
</style>
`;

home = home.replace("</head>", homeFix + "\n</head>");

/* ARTICLE DETAIL: phải sửa trực tiếp vì CSS nằm inline trong page.tsx */
const articleFix = `
      <style id="hmecha-final-red-yellow-article-fix">{\`
        .articlePage {
          background: #f3f6fb !important;
          color: #111827 !important;
        }

        .breadcrumb {
          color: #6b7280 !important;
        }

        .breadcrumb a {
          color: #d32f2f !important;
        }

        .breadcrumb strong {
          color: #111827 !important;
        }

        .articleCard {
          background: #ffffff !important;
          border: 1px solid #e5e7eb !important;
          box-shadow: 0 18px 45px rgba(15, 23, 42, 0.10) !important;
        }

        .heroImage {
          background: #ffffff !important;
        }

        .heroImage::after {
          background: linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.22) 100%) !important;
        }

        .articleContent {
          background: #ffffff !important;
        }

        .meta span {
          background: #fff7d6 !important;
          border: 1px solid #ffc107 !important;
          color: #111827 !important;
        }

        h1 {
          color: #111827 !important;
          text-shadow: none !important;
        }

        .excerpt {
          color: #374151 !important;
          border-left-color: #d32f2f !important;
          background: #fff7f7 !important;
          padding: 14px 18px !important;
          border-radius: 0 14px 14px 0 !important;
        }

        .tagList span {
          background: #f9fafb !important;
          border: 1px solid #e5e7eb !important;
          color: #4b5563 !important;
        }

        .contentDivider {
          background: linear-gradient(90deg, rgba(211,47,47,0), rgba(211,47,47,0.55), rgba(255,193,7,0)) !important;
        }

        .articleSection h2 {
          color: #111827 !important;
          text-shadow: none !important;
        }

        .articleSection h2 span {
          color: #111827 !important;
          border: 1px solid #ffc107 !important;
          background: #ffc107 !important;
        }

        .articleSection p {
          color: #1f2937 !important;
        }

        .articleSection ul {
          background: #fff7e0 !important;
          border: 1px solid #ffc107 !important;
        }

        .articleSection li {
          color: #1f2937 !important;
        }

        .articleSection li::before {
          background: #d32f2f !important;
          box-shadow: none !important;
        }

        .primaryBtn {
          color: #ffffff !important;
          background: #d32f2f !important;
          box-shadow: 0 12px 26px rgba(211, 47, 47, 0.22) !important;
        }

        .primaryBtn:hover {
          background: #be1f2e !important;
        }

        .secondaryBtn {
          color: #d32f2f !important;
          background: #ffffff !important;
          border: 1px solid #d32f2f !important;
        }

        .secondaryBtn:hover {
          color: #111827 !important;
          background: #ffc107 !important;
          border-color: #ffc107 !important;
        }

        .relatedBox {
          background: #ffffff !important;
          border: 1px solid #e5e7eb !important;
          border-radius: 22px !important;
          padding: 22px !important;
          box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08) !important;
        }

        .relatedBox h2 {
          color: #111827 !important;
        }

        .relatedBox h2 span {
          color: #d32f2f !important;
        }

        .relatedCard {
          background: #ffffff !important;
          color: #111827 !important;
          border: 1px solid #e5e7eb !important;
          box-shadow: 0 8px 20px rgba(15, 23, 42, 0.06) !important;
        }

        .relatedCard:hover {
          border-color: rgba(211, 47, 47, 0.36) !important;
          box-shadow: 0 14px 28px rgba(211, 47, 47, 0.12) !important;
        }

        .relatedCard img {
          background: #ffffff !important;
        }

        .relatedCard small {
          color: #d32f2f !important;
        }

        .relatedCard h3 {
          color: #111827 !important;
        }
      \`}</style>
`;

article = article.replace(/\n\s*<\/main>\s*;/, "\n" + articleFix + "\n    </main>\n  ;");
article = article.replace(/  ;\n}/, "  );\n}");

fs.writeFileSync(homePath, home, "utf8");
fs.writeFileSync(articlePath, article, "utf8");
fs.writeFileSync(newsListPath, newsList, "utf8");

console.log("Fixed sections, footer, article detail, and news list to red/yellow/black theme.");