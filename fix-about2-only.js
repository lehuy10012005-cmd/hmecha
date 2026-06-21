const fs = require("fs");

const file = "public/hmecha.html";
let html = fs.readFileSync(file, "utf8");

/* Xóa bản fix cũ nếu chạy lại */
html = html.replace(/<style id="hmecha-about2-only-fix">[\s\S]*?<\/style>\s*/g, "");

const about2Fix = `
<style id="hmecha-about2-only-fix">
/* ===== FIX ONLY: HMECHA CHẤT LƯỢNG UY TÍN ===== */

.section_about_2 {
    background: #ffffff !important;
    padding: 46px 0 !important;
    color: #111827 !important;
}

/* ảnh bên trái giữ nguyên, chỉ làm gọn shadow */
.section_about_2 .list-img-about img {
    border-radius: 8px !important;
    box-shadow: 0 8px 22px rgba(15, 23, 42, 0.10) !important;
}

/* dòng HMecha Chất Lượng Uy Tín */
.section_about_2 .flip-animation {
    margin-bottom: 12px !important;
    color: #111827 !important;
    font-family: Georgia, "Times New Roman", serif !important;
    font-size: 30px !important;
    line-height: 1.15 !important;
    font-weight: 950 !important;
    letter-spacing: -0.035em !important;
    text-shadow: none !important;
    white-space: normal !important;
    overflow: visible !important;
    height: auto !important;
}

/* không cho chữ nhảy thành xanh/cyan */
.section_about_2 .flip-animation,
.section_about_2 .flip-animation span {
    color: #111827 !important;
    text-shadow: none !important;
    font-family: Georgia, "Times New Roman", serif !important;
    font-weight: 950 !important;
}

/* bỏ xuống dòng từng chữ cho đỡ kỳ */
.section_about_2 .flip-animation br {
    display: none !important;
}

/* HMecha màu đỏ, phần còn lại đen */
.section_about_2 .flip-animation span:first-child {
    color: #d32f2f !important;
    margin-right: 6px !important;
}

.section_about_2 .flip-animation span {
    font-size: 100% !important;
    display: inline !important;
}

/* card nội dung bên phải */
.section_about_2 .content_about_2 {
    background: #ffffff !important;
    color: #111827 !important;
    border: 1px solid #e5e7eb !important;
    border-radius: 18px !important;
    padding: 28px 30px !important;
    box-shadow: 0 14px 34px rgba(15, 23, 42, 0.10) !important;
    position: relative !important;
    overflow: hidden !important;
}

/* thanh nhấn đỏ-vàng phía trên card */
.section_about_2 .content_about_2::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: linear-gradient(90deg, #d32f2f 0%, #ffc107 58%, #d32f2f 100%);
}

/* xóa toàn bộ shadow chữ cũ */
.section_about_2 .content_about_2 *,
.section_about_2 .section-title *,
.section_about_2 .faq * {
    text-shadow: none !important;
}

/* tiêu đề lớn trong card */
.section_about_2 .content_about_2 .section-title {
    margin-bottom: 18px !important;
}

.section_about_2 .content_about_2 .section-title h2 {
    background: transparent !important;
    color: #111827 !important;
    font-family: Georgia, "Times New Roman", serif !important;
    font-size: 34px !important;
    line-height: 1.2 !important;
    font-weight: 950 !important;
    letter-spacing: -0.04em !important;
    padding: 0 !important;
    margin: 0 !important;
    box-shadow: none !important;
}

/* phần nhấn Giá Trị Lớn */
.section_about_2 .content_about_2 .section-title h2 span {
    color: #d32f2f !important;
    background: transparent !important;
}

/* đoạn mô tả */
.section_about_2 .content_about_2 .content {
    display: block !important;
    color: #374151 !important;
    font-size: 16px !important;
    line-height: 1.85 !important;
    font-weight: 500 !important;
    margin-bottom: 22px !important;
}

.section_about_2 .content_about_2 .content b {
    color: #d32f2f !important;
    font-weight: 950 !important;
}

/* danh sách lợi ích */
.section_about_2 .content_about_2 .faq {
    margin: 20px 0 0 !important;
    padding: 0 !important;
    list-style: none !important;
}

.section_about_2 .content_about_2 .faq li {
    margin-bottom: 12px !important;
}

.section_about_2 .content_about_2 .faq h3 {
    display: flex !important;
    align-items: center !important;
    gap: 10px !important;
    margin: 0 !important;
    color: #111827 !important;
    font-size: 16px !important;
    line-height: 1.45 !important;
    font-weight: 950 !important;
}

/* icon check đổi đỏ-vàng */
.section_about_2 .content_about_2 .faq .icon_mask {
    width: 18px !important;
    height: 18px !important;
    flex: 0 0 18px !important;
    border: 2px solid #ffc107 !important;
    border-radius: 5px !important;
    background: #d32f2f !important;
    box-shadow: none !important;
    position: relative !important;
}

.section_about_2 .content_about_2 .faq .icon_mask::after {
    content: "✓";
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -58%);
    color: #ffffff;
    font-size: 13px;
    font-weight: 950;
}

/* responsive */
@media (max-width: 991px) {
    .section_about_2 {
        padding: 32px 0 !important;
    }

    .section_about_2 .flip-animation {
        font-size: 26px !important;
        margin-top: 18px !important;
    }

    .section_about_2 .content_about_2 {
        padding: 24px 20px !important;
    }

    .section_about_2 .content_about_2 .section-title h2 {
        font-size: 28px !important;
    }
}

@media (max-width: 575px) {
    .section_about_2 .flip-animation {
        font-size: 23px !important;
    }

    .section_about_2 .content_about_2 .section-title h2 {
        font-size: 25px !important;
    }

    .section_about_2 .content_about_2 .content {
        font-size: 15px !important;
    }
}
</style>
`;

/* đặt cuối body để thắng CSS cũ, nhưng chỉ scope section_about_2 */
html = html.replace("</body>", about2Fix + "\n</body>");

fs.writeFileSync(file, html, "utf8");
console.log("Done: fixed only section_about_2.");