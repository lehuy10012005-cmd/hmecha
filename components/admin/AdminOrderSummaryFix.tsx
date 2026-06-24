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

function isLightSummaryBox(element: HTMLElement) {
  const text = normalizeText(element.textContent || "");
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);

  const hasSummaryText =
    text.includes("tam tinh") &&
    text.includes("phi van chuyen") &&
    text.includes("tong cong");

  const isNotWholeOrderCard =
    !text.includes("san pham trong don") ||
    rect.height < 270;

  const sizeLooksRight =
    rect.width > 300 &&
    rect.height > 90 &&
    rect.height < 320;

  const bg = style.backgroundColor;
  const looksLight =
    bg.includes("255, 247") ||
    bg.includes("255, 251") ||
    bg.includes("254, 243") ||
    bg.includes("255, 255") ||
    bg.includes("250, 250");

  return hasSummaryText && isNotWholeOrderCard && sizeLooksRight && looksLight;
}

function applyDarkStyle(target: HTMLElement) {
  target.style.setProperty("background", "#071126", "important");
  target.style.setProperty("background-color", "#071126", "important");
  target.style.setProperty("border", "1px solid #00c8ff", "important");
  target.style.setProperty("color", "#f8fafc", "important");
  target.style.setProperty("box-shadow", "none", "important");

  target.querySelectorAll<HTMLElement>("*").forEach((child) => {
    child.style.setProperty("color", "#f8fafc", "important");
    child.style.setProperty("text-shadow", "none", "important");

    const text = normalizeText(child.textContent || "");

    if (
      text.includes("tong cong") ||
      /\d[\d.]*d/.test(text)
    ) {
      child.style.setProperty("font-weight", "950", "important");
    }
  });
}

function fixOrderSummaryBoxes() {
  const elements = Array.from(
    document.querySelectorAll<HTMLElement>("div, section, article")
  );

  elements.filter(isLightSummaryBox).forEach(applyDarkStyle);
}

export default function AdminOrderSummaryFix() {
  useEffect(() => {
    const path = window.location.pathname;

    const isAdminOrderPage =
      path.includes("/admin") &&
      (
        path.includes("don-hang") ||
        path.includes("orders") ||
        path.includes("order")
      );

    if (!isAdminOrderPage) return;

    fixOrderSummaryBoxes();

    let count = 0;

    const interval = window.setInterval(() => {
      count += 1;
      fixOrderSummaryBoxes();

      if (count >= 40) {
        window.clearInterval(interval);
      }
    }, 500);

    const observer = new MutationObserver(() => {
      fixOrderSummaryBoxes();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    window.setTimeout(() => {
      observer.disconnect();
    }, 20000);

    return () => {
      window.clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  return null;
}