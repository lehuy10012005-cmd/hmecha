const fs = require("fs");

const file = "public/hmecha.html";
let html = fs.readFileSync(file, "utf8");

/* Sửa title HMECHA thành có span để tô đỏ */
html = html.replace(
  "<h2>Lọc sản phẩm HMECHA</h2>",
  "<h2>Lọc sản phẩm <span>HMECHA</span></h2>"
);

/* Thay đúng block CSS của filter, không đụng phần khác */
const newFilterCss = `<style>
    /* ===== HMECHA HOME PRODUCT FILTER - LIGHT RED/YELLOW THEME ===== */
    .hmecha-home-filter {
        padding: 42px 0 18px;
        background: #ffffff !important;
    }

    .hmecha-filter-panel {
        padding: 30px 34px;
        border-radius: 18px;
        background: #ffffff !important;
        border: 1px solid #e5e7eb !important;
        box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08) !important;
        position: relative;
        overflow: hidden;
    }

    .hmecha-filter-panel::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 5px;
        background: linear-gradient(90deg, #d32f2f 0%, #ffc107 55%, #d32f2f 100%);
    }

    .hmecha-filter-heading {
        margin-bottom: 24px;
        position: relative;
        z-index: 1;
    }

    .hmecha-filter-heading p {
        margin: 0 0 8px;
        color: #d32f2f !important;
        font-size: 13px;
        font-weight: 950;
        letter-spacing: 2px;
        text-transform: uppercase;
        text-shadow: none !important;
    }

    .hmecha-filter-heading h2 {
        margin: 0;
        color: #111827 !important;
        font-family: Georgia, "Times New Roman", serif;
        font-size: 36px;
        line-height: 1.15;
        font-weight: 950;
        letter-spacing: -0.04em;
        text-shadow: none !important;
    }

    .hmecha-filter-heading h2 span {
        color: #d32f2f !important;
    }

    .hmecha-filter-controls {
        display: flex;
        align-items: flex-end;
        flex-wrap: wrap;
        gap: 18px;
        position: relative;
        z-index: 1;
    }

    .hmecha-filter-field {
        display: flex;
        flex-direction: column;
        gap: 9px;
        min-width: 285px;
    }

    .hmecha-filter-field span {
        color: #111827 !important;
        font-size: 15px;
        font-weight: 850;
        text-shadow: none !important;
    }

    .hmecha-filter-field select {
        display: block !important;
        width: 100% !important;
        height: 56px !important;
        padding: 0 46px 0 16px !important;
        border-radius: 12px !important;
        border: 1px solid #d1d5db !important;
        background-color: #ffffff !important;
        background-image: none !important;
        color: #111827 !important;
        -webkit-text-fill-color: #111827 !important;
        font-size: 15px !important;
        font-weight: 700 !important;
        opacity: 1 !important;
        cursor: pointer !important;
        outline: none !important;
        appearance: auto !important;
        -webkit-appearance: auto !important;
        color-scheme: light !important;
        box-shadow: 0 6px 16px rgba(15, 23, 42, 0.06) !important;
    }

    .hmecha-filter-field select option {
        background: #ffffff !important;
        color: #111827 !important;
        -webkit-text-fill-color: #111827 !important;
    }

    .hmecha-filter-field select:focus {
        border-color: #d32f2f !important;
        box-shadow: 0 0 0 4px rgba(211, 47, 47, 0.12) !important;
    }

    .hmecha-reset-filter {
        height: 56px;
        padding: 0 24px;
        border: none;
        border-radius: 12px;
        background: #d32f2f !important;
        color: #ffffff !important;
        font-size: 15px;
        font-weight: 900;
        cursor: pointer;
        box-shadow: 0 10px 20px rgba(211, 47, 47, 0.22);
        transition: 0.2s ease;
    }

    .hmecha-reset-filter:hover {
        transform: translateY(-2px);
        background: #be1f2e !important;
        box-shadow: 0 14px 26px rgba(211, 47, 47, 0.28);
    }

    .hmecha-filter-tip {
        margin: 18px 0 0;
        color: #4b5563 !important;
        font-size: 15px;
        font-weight: 500;
        text-shadow: none !important;
        position: relative;
        z-index: 1;
    }

    .hmecha-filter-result {
        margin-top: 28px;
        position: relative;
        z-index: 1;
    }

    .hmecha-filter-count {
        margin: 0 0 18px;
        color: #4b5563 !important;
        font-size: 15px;
        font-weight: 650;
        text-shadow: none !important;
    }

    .hmecha-filter-count strong {
        color: #d32f2f !important;
        font-size: 20px;
        font-weight: 950;
    }

    .hmecha-filter-grid {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 20px;
    }

    .hmecha-filter-grid .swiper-slide {
        width: 100% !important;
        height: auto !important;
        margin: 0 !important;
    }

    .hmecha-filter-grid .item_product_main,
    .hmecha-filter-grid .product-action {
        height: 100%;
    }

    .hmecha-filter-grid .product-action-bottom {
        margin-top: 14px;
    }

    .hmecha-filter-grid .product-action-bottom .btn-cart {
        width: 100%;
    }

    .hmecha-no-result {
        grid-column: 1 / -1;
        padding: 38px 20px;
        border-radius: 14px;
        text-align: center;
        color: #4b5563 !important;
        background: #f9fafb !important;
        border: 1px dashed #d32f2f !important;
        font-weight: 700;
    }

    .hmecha-added {
        background: #ffc107 !important;
        color: #111111 !important;
        box-shadow: 0 8px 18px rgba(255, 193, 7, 0.28) !important;
    }

    .hmecha-filter-hidden {
        display: none !important;
    }

    @media (max-width: 1199px) {
        .hmecha-filter-grid {
            grid-template-columns: repeat(4, minmax(0, 1fr));
        }
    }

    @media (max-width: 991px) {
        .hmecha-filter-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
        }
    }

    @media (max-width: 767px) {
        .hmecha-home-filter {
            padding: 26px 0 12px;
        }

        .hmecha-filter-panel {
            padding: 24px 18px;
            border-radius: 16px;
        }

        .hmecha-filter-heading h2 {
            font-size: 28px;
        }

        .hmecha-filter-field {
            width: 100%;
            min-width: 0;
        }

        .hmecha-reset-filter {
            width: 100%;
        }

        .hmecha-filter-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
        }
    }
</style>`;

/* Regex chỉ thay style block ngay trước section filter */
html = html.replace(
  /<style>\s*\/\* ===== HMECHA HOME PRODUCT FILTER ===== \*\/[\s\S]*?<\/style>\s*\n\s*<section class="section-index hmecha-home-filter"/,
  newFilterCss + `\n\n<section class="section-index hmecha-home-filter"`
);

fs.writeFileSync(file, html, "utf8");
console.log("Done: fixed only HMECHA home filter section.");