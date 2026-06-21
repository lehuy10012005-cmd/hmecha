const fs = require("fs");

const cssPath = "app/globals.css";
const htmlPath = "public/hmecha.html";

let css = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, "utf8") : "";
let html = fs.existsSync(htmlPath) ? fs.readFileSync(htmlPath, "utf8") : "";

css = css.replace(/\/\* hmecha-section-unify-fix \*\/[\s\S]*?\/\* end-hmecha-section-unify-fix \*\//g, "");
html = html.replace(/<style id="hmecha-section-unify-fix">[\s\S]*?<\/style>/g, "");

const fixCss = `

/* hmecha-section-unify-fix */

/* =========================
   1) KHỐI LỌC SẢN PHẨM
========================= */
.homeFilterSection,
.filterSection,
.productFilterSection,
.product-filter-section,
.filter-home-box,
.filter-home-card,
[class*="filter-section"],
[class*="home-filter"],
[class*="product-filter"] {
  background: #ffffff !important;
  border: 1px solid #cfe8f7 !important;
  border-radius: 24px !important;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08) !important;
}

.homeFilterSection *,
.filterSection *,
.productFilterSection *,
.product-filter-section *,
.filter-home-box *,
.filter-home-card *,
[class*="filter-section"] *,
[class*="home-filter"] *,
[class*="product-filter"] * {
  text-shadow: none !important;
}

.homeFilterSection h1,
.homeFilterSection h2,
.homeFilterSection h3,
.filterSection h1,
.filterSection h2,
.filterSection h3,
.productFilterSection h1,
.productFilterSection h2,
.productFilterSection h3,
.product-filter-section h1,
.product-filter-section h2,
.product-filter-section h3,
.filter-home-box h1,
.filter-home-box h2,
.filter-home-box h3,
.filter-home-card h1,
.filter-home-card h2,
.filter-home-card h3,
[class*="filter-section"] h1,
[class*="filter-section"] h2,
[class*="filter-section"] h3,
[class*="home-filter"] h1,
[class*="home-filter"] h2,
[class*="home-filter"] h3,
[class*="product-filter"] h1,
[class*="product-filter"] h2,
[class*="product-filter"] h3 {
  color: #0f172a !important;
  text-shadow: none !important;
}

.homeFilterSection p,
.filterSection p,
.productFilterSection p,
.product-filter-section p,
.filter-home-box p,
.filter-home-card p,
[class*="filter-section"] p,
[class*="home-filter"] p,
[class*="product-filter"] p,
.homeFilterSection label,
.filterSection label,
.productFilterSection label,
.product-filter-section label,
[class*="filter-section"] label,
[class*="home-filter"] label,
[class*="product-filter"] label {
  color: #334155 !important;
}

.homeFilterSection select,
.filterSection select,
.productFilterSection select,
.product-filter-section select,
.filter-home-box select,
.filter-home-card select,
[class*="filter-section"] select,
[class*="home-filter"] select,
[class*="product-filter"] select {
  background: #ffffff !important;
  color: #0f172a !important;
  border: 1px solid #9ed8f5 !important;
  border-radius: 16px !important;
  box-shadow: none !important;
}

.homeFilterSection select:focus,
.filterSection select:focus,
.productFilterSection select:focus,
.product-filter-section select:focus,
.filter-home-box select:focus,
.filter-home-card select:focus,
[class*="filter-section"] select:focus,
[class*="home-filter"] select:focus,
[class*="product-filter"] select:focus {
  outline: none !important;
  border-color: #1ec8f2 !important;
  box-shadow: 0 0 0 4px rgba(30, 200, 242, 0.14) !important;
}


/* =========================
   2) KHỐI GIỚI THIỆU / CHẤT LƯỢNG UY TÍN
========================= */
.aboutSection,
.aboutGunplaSection,
.whyChooseSection,
.qualitySection,
.introSection,
.intro-gunpla,
.about-gunpla,
[class*="quality-section"],
[class*="about-section"],
[class*="about-gunpla"],
[class*="why-choose"],
[class*="intro-section"] {
  background: #ffffff !important;
}

.aboutSection .content,
.aboutGunplaSection .content,
.whyChooseSection .content,
.qualitySection .content,
.introSection .content,
.intro-gunpla .content,
.about-gunpla .content,
[class*="quality-section"] .content,
[class*="about-section"] .content,
[class*="about-gunpla"] .content,
[class*="why-choose"] .content,
[class*="intro-section"] .content,
.aboutSection .text-box,
.aboutGunplaSection .text-box,
.whyChooseSection .text-box,
.qualitySection .text-box,
.introSection .text-box,
[class*="quality-section"] .text-box,
[class*="about-section"] .text-box,
[class*="about-gunpla"] .text-box,
[class*="why-choose"] .text-box,
[class*="intro-section"] .text-box {
  background: #ffffff !important;
  color: #334155 !important;
  border: 1px solid #cfe8f7 !important;
  border-radius: 24px !important;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08) !important;
}

.aboutSection h1,
.aboutSection h2,
.aboutSection h3,
.aboutGunplaSection h1,
.aboutGunplaSection h2,
.aboutGunplaSection h3,
.whyChooseSection h1,
.whyChooseSection h2,
.whyChooseSection h3,
.qualitySection h1,
.qualitySection h2,
.qualitySection h3,
.introSection h1,
.introSection h2,
.introSection h3,
.intro-gunpla h1,
.intro-gunpla h2,
.intro-gunpla h3,
.about-gunpla h1,
.about-gunpla h2,
.about-gunpla h3,
[class*="quality-section"] h1,
[class*="quality-section"] h2,
[class*="quality-section"] h3,
[class*="about-section"] h1,
[class*="about-section"] h2,
[class*="about-section"] h3,
[class*="about-gunpla"] h1,
[class*="about-gunpla"] h2,
[class*="about-gunpla"] h3,
[class*="why-choose"] h1,
[class*="why-choose"] h2,
[class*="why-choose"] h3,
[class*="intro-section"] h1,
[class*="intro-section"] h2,
[class*="intro-section"] h3 {
  color: #0f172a !important;
  text-shadow: none !important;
}

.aboutSection p,
.aboutGunplaSection p,
.whyChooseSection p,
.qualitySection p,
.introSection p,
.intro-gunpla p,
.about-gunpla p,
[class*="quality-section"] p,
[class*="about-section"] p,
[class*="about-gunpla"] p,
[class*="why-choose"] p,
[class*="intro-section"] p,
.aboutSection li,
.aboutGunplaSection li,
.whyChooseSection li,
.qualitySection li,
.introSection li,
.intro-gunpla li,
.about-gunpla li,
[class*="quality-section"] li,
[class*="about-section"] li,
[class*="about-gunpla"] li,
[class*="why-choose"] li,
[class*="intro-section"] li {
  color: #334155 !important;
}

.aboutSection strong,
.aboutGunplaSection strong,
.whyChooseSection strong,
.qualitySection strong,
.introSection strong,
.intro-gunpla strong,
.about-gunpla strong,
[class*="quality-section"] strong,
[class*="about-section"] strong,
[class*="about-gunpla"] strong,
[class*="why-choose"] strong,
[class*="intro-section"] strong {
  color: #0f172a !important;
}


/* =========================
   3) TRANG BÀI VIẾT / CẨM NANG / TIN TỨC CHI TIẾT
========================= */
.articlePage,
.newsPage,
.newsDetailPage,
.postPage,
.postDetailPage,
.guidePage,
.knowledgePage,
[class*="article-page"],
[class*="article-detail"],
[class*="news-detail"],
[class*="post-detail"],
[class*="guide-page"],
[class*="knowledge-page"] {
  background: #f8fafc !important;
  color: #0f172a !important;
}

.articlePage article,
.newsPage article,
.newsDetailPage article,
.postPage article,
.postDetailPage article,
.guidePage article,
.knowledgePage article,
[class*="article-page"] article,
[class*="article-detail"] article,
[class*="news-detail"] article,
[class*="post-detail"] article,
[class*="guide-page"] article,
[class*="knowledge-page"] article,
.articlePage .content,
.newsPage .content,
.newsDetailPage .content,
.postPage .content,
.postDetailPage .content,
.guidePage .content,
.knowledgePage .content,
[class*="article-page"] .content,
[class*="article-detail"] .content,
[class*="news-detail"] .content,
[class*="post-detail"] .content,
[class*="guide-page"] .content,
[class*="knowledge-page"] .content,
.articlePage .article-body,
.newsPage .article-body,
.newsDetailPage .article-body,
.postPage .article-body,
.postDetailPage .article-body,
.guidePage .article-body,
.knowledgePage .article-body,
[class*="article-page"] .article-body,
[class*="article-detail"] .article-body,
[class*="news-detail"] .article-body,
[class*="post-detail"] .article-body,
[class*="guide-page"] .article-body,
[class*="knowledge-page"] .article-body {
  background: #ffffff !important;
  color: #334155 !important;
  border: 1px solid #dbeafe !important;
  border-radius: 24px !important;
  box-shadow: 0 12px 28px rgba(15, 23, 42, 0.08) !important;
}

.articlePage h1,
.articlePage h2,
.articlePage h3,
.articlePage h4,
.newsPage h1,
.newsPage h2,
.newsPage h3,
.newsPage h4,
.newsDetailPage h1,
.newsDetailPage h2,
.newsDetailPage h3,
.newsDetailPage h4,
.postPage h1,
.postPage h2,
.postPage h3,
.postPage h4,
.postDetailPage h1,
.postDetailPage h2,
.postDetailPage h3,
.postDetailPage h4,
.guidePage h1,
.guidePage h2,
.guidePage h3,
.guidePage h4,
.knowledgePage h1,
.knowledgePage h2,
.knowledgePage h3,
.knowledgePage h4,
[class*="article-page"] h1,
[class*="article-page"] h2,
[class*="article-page"] h3,
[class*="article-page"] h4,
[class*="article-detail"] h1,
[class*="article-detail"] h2,
[class*="article-detail"] h3,
[class*="article-detail"] h4,
[class*="news-detail"] h1,
[class*="news-detail"] h2,
[class*="news-detail"] h3,
[class*="news-detail"] h4,
[class*="post-detail"] h1,
[class*="post-detail"] h2,
[class*="post-detail"] h3,
[class*="post-detail"] h4,
[class*="guide-page"] h1,
[class*="guide-page"] h2,
[class*="guide-page"] h3,
[class*="guide-page"] h4,
[class*="knowledge-page"] h1,
[class*="knowledge-page"] h2,
[class*="knowledge-page"] h3,
[class*="knowledge-page"] h4 {
  color: #0f172a !important;
  text-shadow: none !important;
}

.articlePage p,
.articlePage li,
.articlePage span,
.newsPage p,
.newsPage li,
.newsPage span,
.newsDetailPage p,
.newsDetailPage li,
.newsDetailPage span,
.postPage p,
.postPage li,
.postPage span,
.postDetailPage p,
.postDetailPage li,
.postDetailPage span,
.guidePage p,
.guidePage li,
.guidePage span,
.knowledgePage p,
.knowledgePage li,
.knowledgePage span,
[class*="article-page"] p,
[class*="article-page"] li,
[class*="article-page"] span,
[class*="article-detail"] p,
[class*="article-detail"] li,
[class*="article-detail"] span,
[class*="news-detail"] p,
[class*="news-detail"] li,
[class*="news-detail"] span,
[class*="post-detail"] p,
[class*="post-detail"] li,
[class*="post-detail"] span,
[class*="guide-page"] p,
[class*="guide-page"] li,
[class*="guide-page"] span,
[class*="knowledge-page"] p,
[class*="knowledge-page"] li,
[class*="knowledge-page"] span {
  color: #334155 !important;
}

.articlePage .tag,
.articlePage .badge,
.newsPage .tag,
.newsPage .badge,
.newsDetailPage .tag,
.newsDetailPage .badge,
.postPage .tag,
.postPage .badge,
.postDetailPage .tag,
.postDetailPage .badge,
.guidePage .tag,
.guidePage .badge,
.knowledgePage .tag,
.knowledgePage .badge,
[class*="article-page"] .tag,
[class*="article-page"] .badge,
[class*="article-detail"] .tag,
[class*="article-detail"] .badge,
[class*="news-detail"] .tag,
[class*="news-detail"] .badge,
[class*="post-detail"] .tag,
[class*="post-detail"] .badge,
[class*="guide-page"] .tag,
[class*="guide-page"] .badge,
[class*="knowledge-page"] .tag,
[class*="knowledge-page"] .badge {
  background: #f1f5f9 !important;
  color: #0f172a !important;
  border: 1px solid #dbeafe !important;
}

.articlePage .toc,
.articlePage .quoteBox,
.articlePage blockquote,
.newsPage .toc,
.newsPage .quoteBox,
.newsPage blockquote,
.newsDetailPage .toc,
.newsDetailPage .quoteBox,
.newsDetailPage blockquote,
.postPage .toc,
.postPage .quoteBox,
.postPage blockquote,
.postDetailPage .toc,
.postDetailPage .quoteBox,
.postDetailPage blockquote,
.guidePage .toc,
.guidePage .quoteBox,
.guidePage blockquote,
.knowledgePage .toc,
.knowledgePage .quoteBox,
.knowledgePage blockquote,
[class*="article-page"] .toc,
[class*="article-page"] .quoteBox,
[class*="article-page"] blockquote,
[class*="article-detail"] .toc,
[class*="article-detail"] .quoteBox,
[class*="article-detail"] blockquote,
[class*="news-detail"] .toc,
[class*="news-detail"] .quoteBox,
[class*="news-detail"] blockquote,
[class*="post-detail"] .toc,
[class*="post-detail"] .quoteBox,
[class*="post-detail"] blockquote,
[class*="guide-page"] .toc,
[class*="guide-page"] .quoteBox,
[class*="guide-page"] blockquote,
[class*="knowledge-page"] .toc,
[class*="knowledge-page"] .quoteBox,
[class*="knowledge-page"] blockquote {
  background: #f8fbff !important;
  border: 1px solid #cfe8f7 !important;
  color: #334155 !important;
  border-radius: 18px !important;
}

.articlePage a,
.newsPage a,
.newsDetailPage a,
.postPage a,
.postDetailPage a,
.guidePage a,
.knowledgePage a,
[class*="article-page"] a,
[class*="article-detail"] a,
[class*="news-detail"] a,
[class*="post-detail"] a,
[class*="guide-page"] a,
[class*="knowledge-page"] a {
  color: #0284c7 !important;
}

.articlePage a:hover,
.newsPage a:hover,
.newsDetailPage a:hover,
.postPage a:hover,
.postDetailPage a:hover,
.guidePage a:hover,
.knowledgePage a:hover,
[class*="article-page"] a:hover,
[class*="article-detail"] a:hover,
[class*="news-detail"] a:hover,
[class*="post-detail"] a:hover,
[class*="guide-page"] a:hover,
[class*="knowledge-page"] a:hover {
  color: #d32f2f !important;
}


/* =========================
   4) CARD BÀI VIẾT LIÊN QUAN
========================= */
.relatedArticles,
.relatedPosts,
.relatedNews,
[class*="related-articles"],
[class*="related-posts"],
[class*="related-news"] {
  background: transparent !important;
}

.relatedArticles .card,
.relatedPosts .card,
.relatedNews .card,
[class*="related-articles"] .card,
[class*="related-posts"] .card,
[class*="related-news"] .card,
.relatedArticles article,
.relatedPosts article,
.relatedNews article,
[class*="related-articles"] article,
[class*="related-posts"] article,
[class*="related-news"] article {
  background: #ffffff !important;
  border: 1px solid #dbeafe !important;
  border-radius: 16px !important;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06) !important;
}

.relatedArticles h3,
.relatedPosts h3,
.relatedNews h3,
[class*="related-articles"] h3,
[class*="related-posts"] h3,
[class*="related-news"] h3,
.relatedArticles a,
.relatedPosts a,
.relatedNews a,
[class*="related-articles"] a,
[class*="related-posts"] a,
[class*="related-news"] a {
  color: #0f172a !important;
}

.relatedArticles p,
.relatedPosts p,
.relatedNews p,
[class*="related-articles"] p,
[class*="related-posts"] p,
[class*="related-news"] p {
  color: #475569 !important;
}


/* =========================
   5) MỘT SỐ NÚT CHUNG ĐỒNG BỘ LẠI
========================= */
.articlePage button,
.newsPage button,
.newsDetailPage button,
.postPage button,
.postDetailPage button,
.guidePage button,
.knowledgePage button,
[class*="article-page"] button,
[class*="article-detail"] button,
[class*="news-detail"] button,
[class*="post-detail"] button,
[class*="guide-page"] button,
[class*="knowledge-page"] button {
  border-radius: 999px !important;
}

.articlePage .primary,
.newsPage .primary,
.newsDetailPage .primary,
.postPage .primary,
.postDetailPage .primary,
.guidePage .primary,
.knowledgePage .primary,
[class*="article-page"] .primary,
[class*="article-detail"] .primary,
[class*="news-detail"] .primary,
[class*="post-detail"] .primary,
[class*="guide-page"] .primary,
[class*="knowledge-page"] .primary {
  background: linear-gradient(90deg, #7c3aed 0%, #22d3ee 100%) !important;
  color: #ffffff !important;
  border: none !important;
}

.articlePage .secondary,
.newsPage .secondary,
.newsDetailPage .secondary,
.postPage .secondary,
.postDetailPage .secondary,
.guidePage .secondary,
.knowledgePage .secondary,
[class*="article-page"] .secondary,
[class*="article-detail"] .secondary,
[class*="news-detail"] .secondary,
[class*="post-detail"] .secondary,
[class*="guide-page"] .secondary,
[class*="knowledge-page"] .secondary {
  background: #ffffff !important;
  color: #d32f2f !important;
  border: 1px solid #d32f2f !important;
}

/* end-hmecha-section-unify-fix */
`;

const htmlFix = `
<style id="hmecha-section-unify-fix">
/* ép 1 số phần tĩnh trong hmecha.html sáng hơn */
.section_filter,
.section_about,
.section_news_detail,
.section_camnang_detail,
.section_blog_detail,
.section_blog_content {
  background: #f8fafc !important;
}
.section_filter .container,
.section_about .container,
.section_news_detail .container,
.section_camnang_detail .container,
.section_blog_detail .container,
.section_blog_content .container {
  background: transparent !important;
}
</style>
`;

css += fixCss;
html = html.replace("</head>", htmlFix + "\n</head>");

fs.writeFileSync(cssPath, css, "utf8");
fs.writeFileSync(htmlPath, html, "utf8");

console.log("Applied section tone unifying fix.");
console.log("Updated: app/globals.css + public/hmecha.html");