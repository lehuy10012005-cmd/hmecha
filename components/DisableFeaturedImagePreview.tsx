"use client";

import { useEffect } from "react";

function isImageUrl(url: string) {
  return /\.(png|jpg|jpeg|webp|gif|avif|svg)(\?|#|$)/i.test(url || "");
}

function markFeaturedSections() {
  const blocks = Array.from(document.querySelectorAll("section, div"));

  for (const block of blocks) {
    const text = (block.textContent || "").trim();

    if (text.includes("Các Dòng Nổi Bật")) {
      block.setAttribute("data-lock-featured-image-preview", "true");
      block.classList.add("featured-lines-no-preview");
      break;
    }
  }
}

export default function DisableFeaturedImagePreview() {
  useEffect(() => {
    markFeaturedSections();

    const observer = new MutationObserver(() => {
      markFeaturedSections();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const section = target.closest('[data-lock-featured-image-preview="true"]');
      if (!section) return;

      const img = target.closest("img");
      const link = target.closest("a") as HTMLAnchorElement | null;

      if (!img && !link) return;

      const href = link?.href || "";
      const opensImage =
        isImageUrl(href) ||
        link?.hasAttribute("data-fancybox") ||
        link?.hasAttribute("data-lightbox") ||
        link?.className?.toString().toLowerCase().includes("zoom") ||
        link?.className?.toString().toLowerCase().includes("preview");

      if (img && !link) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (opensImage) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    function handleContextMenu(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const section = target.closest('[data-lock-featured-image-preview="true"]');
      const img = target.closest("img");

      if (section && img) {
        event.preventDefault();
      }
    }

    function handleDragStart(event: DragEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const section = target.closest('[data-lock-featured-image-preview="true"]');
      const img = target.closest("img");

      if (section && img) {
        event.preventDefault();
      }
    }

    document.addEventListener("click", handleClick, true);
    document.addEventListener("dblclick", handleClick, true);
    document.addEventListener("contextmenu", handleContextMenu, true);
    document.addEventListener("dragstart", handleDragStart, true);

    return () => {
      observer.disconnect();
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("dblclick", handleClick, true);
      document.removeEventListener("contextmenu", handleContextMenu, true);
      document.removeEventListener("dragstart", handleDragStart, true);
    };
  }, []);

  return null;
}