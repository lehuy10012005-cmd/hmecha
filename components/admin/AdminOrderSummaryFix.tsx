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

function forceDarkSummaryBox() {
  const elements = Array.from(
    document.querySelectorAll<HTMLElement>("div, section, article")
  );

  const candidates = elements
    .filter((element) => {
      const text = normalizeText(element.textContent || "");

      return (
        text.includes("tam tinh") &&
        text.includes("phi van chuyen") &&
        text.includes("tong cong")
      );
    })
    .map((element) => {
      const rect = element.getBoundingClientRect();

      return {
        element,
        area: rect.width * rect.height,
      };
    })
    .filter((item) => item.area > 30000)
    .sort((a, b) => a.area - b.area);

  const target = candidates[0]?.element;

  if (!target) return;

  target.style.setProperty("background", "#071126", "important");
  target.style.setProperty("border", "1px solid #00c8ff", "important");
  target.style.setProperty("color", "#f8fafc", "important");
  target.style.setProperty("box-shadow", "none", "important");

  target.querySelectorAll<HTMLElement>("*").forEach((child) => {
    child.style.setProperty("color", "#f8fafc", "important");
    child.style.setProperty("text-shadow", "none", "important");

    const text = normalizeText(child.textContent || "");

    if (text.includes("tong cong") || text.includes("2.690.000")) {
      child.style.setProperty("font-weight", "900", "important");
    }
  });
}

export default function AdminOrderSummaryFix() {
  useEffect(() => {
    forceDarkSummaryBox();

    const interval = window.setInterval(forceDarkSummaryBox, 600);

    const observer = new MutationObserver(() => {
      forceDarkSummaryBox();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      window.clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  return null;
}