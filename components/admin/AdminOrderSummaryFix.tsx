"use client";

import { useEffect } from "react";

function normalizeText(value: string) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ")
    .trim();
}

function isSummaryBox(element: HTMLElement) {
  const text = normalizeText(element.textContent || "");
  const rect = element.getBoundingClientRect();

  const hasSummaryText =
    text.includes("tam tinh") &&
    text.includes("phi van chuyen") &&
    text.includes("tong cong");

  const isNotWholeOrderCard =
    !text.includes("san pham trong don") &&
    !text.includes("so dien thoai") &&
    !text.includes("dia chi") &&
    !text.includes("thanh toan");

  const sizeLooksLikeSummary =
    rect.width > 250 &&
    rect.height > 70 &&
    rect.height < 260;

  return hasSummaryText && isNotWholeOrderCard && sizeLooksLikeSummary;
}

function applyDarkStyle(target: HTMLElement) {
  target.style.setProperty("background", "#071126", "important");
  target.style.setProperty("border", "1px solid #00c8ff", "important");
  target.style.setProperty("color", "#f8fafc", "important");
  target.style.setProperty("box-shadow", "none", "important");

  target.querySelectorAll<HTMLElement>("*").forEach((child) => {
    child.style.setProperty("color", "#f8fafc", "important");
    child.style.setProperty("text-shadow", "none", "important");

    const text = normalizeText(child.textContent || "");

    if (
      text.includes("tong cong") ||
      text.includes("tam tinh") ||
      text.includes("phi van chuyen") ||
      /\d[\d.]*d/.test(text)
    ) {
      child.style.setProperty("font-weight", "900", "important");
    }
  });
}

function forceDarkSummaryBoxes() {
  const elements = Array.from(
    document.querySelectorAll<HTMLElement>("div, section, article")
  );

  elements.filter(isSummaryBox).forEach(applyDarkStyle);
}

export default function AdminOrderSummaryFix() {
  useEffect(() => {
    const path = window.location.pathname;

    const isOrderAdminPage =
      path.includes("/admin/don-hang") ||
      path.includes("/admin/orders") ||
      path.includes("/admin/order");

    if (!isOrderAdminPage) return;

    let count = 0;

    forceDarkSummaryBoxes();

    const interval = window.setInterval(() => {
      count += 1;
      forceDarkSummaryBoxes();

      if (count >= 12) {
        window.clearInterval(interval);
      }
    }, 500);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  return null;
}