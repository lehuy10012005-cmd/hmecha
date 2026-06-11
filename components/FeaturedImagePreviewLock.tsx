"use client";

import { useEffect } from "react";

function markFeaturedLinesSection() {
  const candidates = Array.from(document.querySelectorAll("section, div"));

  for (const el of candidates) {
    const text = (el.textContent || "").trim();

    if (text.includes("Các Dòng Nổi Bật")) {
      el.setAttribute("data-featured-lines-lock", "true");
      el.classList.add("featured-lines-locked");
      return;
    }
  }
}

export default function FeaturedImagePreviewLock() {
  useEffect(() => {
    markFeaturedLinesSection();

    const observer = new MutationObserver(() => {
      markFeaturedLinesSection();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    function blockFeaturedClick(event: Event) {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const section = target.closest('[data-featured-lines-lock="true"]');

      if (section) {
        event.preventDefault();
        event.stopPropagation();

        if ("stopImmediatePropagation" in event) {
          event.stopImmediatePropagation();
        }
      }
    }

    document.addEventListener("click", blockFeaturedClick, true);
    document.addEventListener("dblclick", blockFeaturedClick, true);
    document.addEventListener("mousedown", blockFeaturedClick, true);
    document.addEventListener("mouseup", blockFeaturedClick, true);
    document.addEventListener("pointerdown", blockFeaturedClick, true);
    document.addEventListener("contextmenu", blockFeaturedClick, true);
    document.addEventListener("dragstart", blockFeaturedClick, true);

    return () => {
      observer.disconnect();
      document.removeEventListener("click", blockFeaturedClick, true);
      document.removeEventListener("dblclick", blockFeaturedClick, true);
      document.removeEventListener("mousedown", blockFeaturedClick, true);
      document.removeEventListener("mouseup", blockFeaturedClick, true);
      document.removeEventListener("pointerdown", blockFeaturedClick, true);
      document.removeEventListener("contextmenu", blockFeaturedClick, true);
      document.removeEventListener("dragstart", blockFeaturedClick, true);
    };
  }, []);

  return null;
}