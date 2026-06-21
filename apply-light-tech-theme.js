const fs = require("fs");

const htmlPath = "public/hmecha.html";
const cssPath = "app/globals.css";

let html = fs.readFileSync(htmlPath, "utf8");
let css = fs.existsSync(cssPath) ? fs.readFileSync(cssPath, "utf8") : "";

/* Xóa theme cũ nếu chạy lại */
html = html.replace(/<style id="hmecha-light-tech-theme">[\s\S]*?<\/style>\s*/gi, "");
css = css.replace(/\/\* hmecha-light-tech-theme \*\/[\s\S]*?\/\* end-hmecha-light-tech-theme \*\//gi, "");

/* Theme cho trang chủ public/hmecha.html */
const homeTheme = `
<style id="hmecha-light-tech-theme">
:root {
  --mainColor: #2563eb !important;
  --subColor: #00b8d9 !important;
  --hover: #0ea5e9 !important;
  --textColor: #0f172a !important;
  --price: #00a6c8 !important;
  --bgHeader: #ffffff !important;
  --txtHeader: #0f172a !important;
  --bgBody: #f5f8fc !important;
  --bgBodySub: #eaf3ff !important;
  --bgFooter: #eef6ff !important;
  --txtTitleFooter: #0f172a !important;
  --txtFooter: #475569 !important;
  --textorder: #f97316 !important;
  --bgmoduleflash: #ffffff !important;
}

html,
body {
  background:
    radial-gradient(circle at top left, rgba(0, 184, 217, 0.15), transparent 32%),
    radial-gradient(circle at top right, rgba(37, 99, 235, 0.12), transparent 30%),
    linear-gradient(180deg, #f7fbff 0%, #f5f8fc 45%, #eef6ff 100%) !important;
  color: #0f172a !important;
}

/* Header sáng, sạch */
.header,
.top-main-header,
.main-header,
.header-menu {
  background: rgba(255, 255, 255, 0.96) !important;
  color: #0f172a !important;
  border-bottom: 1px solid #d8e3f0 !important;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.07) !important;
}

.main-header {
  background-image: none !important;
}

.logo-wrapper img {
  filter: none !important;
}

.header a,
.header-menu a,
.nav-link,
.sudes-main-cate a,
#nav a {
  color: #0f172a !important;
}

.header a:hover,
.header-menu a:hover,
.nav-link:hover,
#nav a:hover {
  color: #00a6c8 !important;
}

/* Thanh top và điểm nhấn */
.banner-top {
  background: linear-gradient(90deg, #2563eb, #00b8d9) !important;
  color: #ffffff !important;
}

/* Section sáng */
.section-index,
.section-index .container,
[class*="section_"],
[class*="section-"] {
  background: transparent !important;
}

.section-title h2,
.section-title h2 a,
.title_module_main h2,
.title_module_main h2 a,
.title-module,
.title-head,
h1, h2, h3, h4 {
  color: #0f172a !important;
}

.section-title h2 span,
.title_module_main h2 span {
  color: #00a6c8 !important;
}

/* Card sản phẩm: nền trắng để ảnh nổi hơn */
.item_product_main,
.product-action,
.product-item,
.product-card,
.item-product,
.product-box,
.cate-item {
  background: #ffffff !important;
  color: #0f172a !important;
  border: 1px solid #d8e3f0 !important;
  border-radius: 18px !important;
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.08) !important;
}

.item_product_main:hover,
.product-action:hover,
.product-item:hover,
.product-card:hover,
.item-product:hover {
  transform: translateY(-3px);
  box-shadow: 0 20px 46px rgba(37, 99, 235, 0.14) !important;
  border-color: rgba(0, 184, 217, 0.45) !important;
}

.item_product_main img,
.product-action img,
.product-item img,
.product-card img {
  background: #f8fafc !important;
}

/* Tên, mô tả, tồn kho */
.product-name a,
.line-clamp-2-new a,
.product-name,
.item_product_main a,
.product-action a {
  color: #0f172a !important;
}

.inventory_quantity,
.inventory_quantity span,
.stock-brand-title,
.a-stock,
.product-info,
.product-info span,
.product-vendor,
.product-type,
.product-summary,
.product-description,
.text-muted {
  color: #475569 !important;
}

/* Giá nổi bật */
.price,
.special-price,
.product-price,
.product-price-cart .price,
.price-box {
  color: #00a6c8 !important;
  font-weight: 950 !important;
}

.old-price,
.compare-price {
  color: #94a3b8 !important;
}

/* Nút chính */
.btn,
.btn-cart,
.add_to_cart,
button[type="submit"],
.product-button .add_to_cart {
  background: linear-gradient(135deg, #2563eb, #00b8d9) !important;
  color: #ffffff !important;
  border: none !important;
  box-shadow: 0 12px 26px rgba(37, 99, 235, 0.22) !important;
}

.btn:hover,
.btn-cart:hover,
.add_to_cart:hover,
button[type="submit"]:hover {
  background: linear-gradient(135deg, #0ea5e9, #2563eb) !important;
  color: #ffffff !important;
}

/* Flash sale sáng hơn, không chìm */
.section_flash_sale,
.section_flash_sale .container {
  background:
    linear-gradient(135deg, rgba(255, 247, 237, 0.96), rgba(255, 255, 255, 0.96)) !important;
  border-radius: 26px !important;
  border: 1px solid #fed7aa !important;
  box-shadow: 0 18px 42px rgba(249, 115, 22, 0.12) !important;
}

.section_flash_sale .section-title h2,
.section_flash_sale h2,
.section_flash_sale .title_module_main h2 {
  color: #0f172a !important;
}

.sale,
.badge,
.flash-sale-badge,
.product-badge {
  background: #f97316 !important;
  color: #ffffff !important;
}

/* Search, dropdown, menu */
.search-suggest,
.dropdown-menu,
.mega-content,
.sudes-main-cate,
.sudes-list-cate,
.header_tim_kiem,
.search-mobile {
  background: #ffffff !important;
  color: #0f172a !important;
  border: 1px solid #d8e3f0 !important;
  box-shadow: 0 18px 45px rgba(15, 23, 42, 0.10) !important;
}

.search-suggest a,
.search-suggest span,
.dropdown-menu a,
.mega-content a {
  color: #0f172a !important;
}

/* Footer sáng, lịch sự */
.hmecha-custom-footer {
  background:
    linear-gradient(180deg, #eef6ff 0%, #ffffff 100%) !important;
  color: #475569 !important;
  border-top: 1px solid #d8e3f0 !important;
}

.hmecha-footer-title,
.hmecha-footer-bottom strong,
.hmecha-brand-header h2 {
  color: #0f172a !important;
}

.hmecha-footer-links a,
.hmecha-footer-bottom,
.hmecha-custom-footer p {
  color: #475569 !important;
}

.hmecha-footer-links a:hover {
  color: #00a6c8 !important;
}

/* Mobile bottom nav */
.fixed-bottom-mobile,
.bottom-nav,
.mobile-bottom-nav {
  background: #ffffff !important;
  border-top: 1px solid #d8e3f0 !important;
  box-shadow: 0 -10px 30px rgba(15, 23, 42, 0.08) !important;
}

.fixed-bottom-mobile a,
.bottom-nav a,
.mobile-bottom-nav a {
  color: #0f172a !important;
}
</style>
`;

/* Theme cho các trang React: sản phẩm, chi tiết, giỏ hàng, checkout, tài khoản, yêu thích */
const appTheme = `

/* hmecha-light-tech-theme */

:root {
  --hmecha-light-bg: #f5f8fc;
  --hmecha-light-panel: #ffffff;
  --hmecha-light-soft: #eaf3ff;
  --hmecha-light-text: #0f172a;
  --hmecha-light-muted: #475569;
  --hmecha-light-border: #d8e3f0;
  --hmecha-primary: #2563eb;
  --hmecha-cyan: #00b8d9;
  --hmecha-price: #00a6c8;
  --hmecha-sale: #f97316;
}

html,
body {
  background: #f5f8fc;
}

/* Chỉ đổi các trang khách hàng, không ép admin */
.page,
.cartPage,
.checkoutPage,
.authPage,
.successPage,
.shell,
.wishlistPage,
.policyPage,
.articlePage,
.vnpayReturnPage,
.comparePage,
.orderDetailPage {
  background:
    radial-gradient(circle at top left, rgba(0, 184, 217, 0.14), transparent 32%),
    radial-gradient(circle at top right, rgba(37, 99, 235, 0.12), transparent 30%),
    linear-gradient(180deg, #f7fbff 0%, #f5f8fc 48%, #eef6ff 100%) !important;
  color: #0f172a !important;
}

/* Khối nội dung và card */
.page section,
.cartPage section,
.checkoutPage section,
.authPage .card,
.successPage section,
.shell aside,
.shell .content,
.wishlistPage section,
.policyPage section,
.articlePage section,
.vnpayReturnPage section,
.comparePage section,
.orderDetailPage section,
.productCard,
.product-card,
.card,
.panel,
.summaryBox,
.checkoutBox,
.cartBox,
.infoBox,
.wishCard,
.emptyBox {
  background: rgba(255, 255, 255, 0.96) !important;
  color: #0f172a !important;
  border-color: #d8e3f0 !important;
  box-shadow: 0 16px 38px rgba(15, 23, 42, 0.08) !important;
}

/* Text */
.page h1,
.page h2,
.page h3,
.cartPage h1,
.cartPage h2,
.checkoutPage h1,
.checkoutPage h2,
.authPage h1,
.shell h1,
.shell h2,
.wishlistPage h1,
.wishlistPage h2,
.policyPage h1,
.policyPage h2,
.articlePage h1,
.articlePage h2,
.orderDetailPage h1,
.orderDetailPage h2 {
  color: #0f172a !important;
}

.page p,
.page span,
.cartPage p,
.cartPage span,
.checkoutPage p,
.checkoutPage span,
.authPage p,
.authPage span,
.shell p,
.shell span,
.wishlistPage p,
.wishlistPage span,
.policyPage p,
.policyPage span,
.articlePage p,
.articlePage span,
.orderDetailPage p,
.orderDetailPage span {
  color: #475569 !important;
}

/* Link và điểm nhấn */
.page a,
.cartPage a,
.checkoutPage a,
.authPage a,
.shell a,
.wishlistPage a,
.policyPage a,
.articlePage a,
.orderDetailPage a {
  color: #2563eb;
}

.price,
.productPrice,
.salePrice,
.totalPrice,
strong.price {
  color: #00a6c8 !important;
}

/* Button */
.page button,
.cartPage button,
.checkoutPage button,
.authPage button,
.successPage button,
.shell button,
.wishlistPage button,
.policyPage button,
.articlePage button,
.orderDetailPage button,
.page .btn,
.cartPage .btn,
.checkoutPage .btn,
.authPage .btn {
  border-color: transparent !important;
}

.page button:not(.ghost),
.cartPage button:not(.ghost),
.checkoutPage button:not(.ghost),
.authPage button:not(.ghost),
.successPage button:not(.ghost),
.shell button:not(.customerLogout),
.wishlistPage button:not(.ghost),
.page .primary,
.checkoutPage .primary,
.cartPage .primary {
  background: linear-gradient(135deg, #2563eb, #00b8d9) !important;
  color: #ffffff !important;
  box-shadow: 0 12px 26px rgba(37, 99, 235, 0.2) !important;
}

/* Form */
input,
select,
textarea {
  background: #ffffff !important;
  color: #0f172a !important;
  border-color: #d8e3f0 !important;
}

input::placeholder,
textarea::placeholder {
  color: #94a3b8 !important;
}

/* Ảnh sản phẩm */
.page img,
.cartPage img,
.checkoutPage img,
.wishlistPage img,
.orderDetailPage img {
  background: #f8fafc;
}

/* Tài khoản customer sidebar */
.shell aside {
  background: #ffffff !important;
  border-right: 1px solid #d8e3f0 !important;
}

.shell .brand {
  color: #2563eb !important;
}

.shell nav a {
  background: #f1f7ff !important;
  color: #0f172a !important;
  border: 1px solid #d8e3f0 !important;
}

.shell nav a:hover {
  background: linear-gradient(135deg, #2563eb, #00b8d9) !important;
  color: #ffffff !important;
}

/* Giữ admin tối để dễ đọc dashboard, không override admin */
.adminShell,
.dashboardPage,
.dashboard2,
.adminProductsPage,
.ordersPage,
.adminCustomers,
.analyticsPage,
.adminReviewsPage {
  color-scheme: dark;
}

/* end-hmecha-light-tech-theme */
`;

html = html.replace("</head>", homeTheme + "\n</head>");
css += appTheme;

fs.writeFileSync(htmlPath, html, "utf8");
fs.writeFileSync(cssPath, css, "utf8");

console.log("Applied HMECHA Light Tech Theme.");
console.log("Changed files: public/hmecha.html, app/globals.css");