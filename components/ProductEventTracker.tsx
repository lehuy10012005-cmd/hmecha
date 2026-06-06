"use client";

import { useEffect, useRef } from "react";

type ProductEventTrackerProps = {
  productId: string;
  productSlug: string;
  productName: string;
  price: number;
};

type EventType =
  | "product_view"
  | "add_to_cart"
  | "buy_now"
  | "quick_view"
  | "product_click";

function getSessionId() {
  const key = "hmecha_session_id";

  if (typeof window === "undefined") return "";

  const existing = window.localStorage.getItem(key);

  if (existing) return existing;

  const next = `hm_${Date.now()}_${Math.random().toString(16).slice(2)}`;

  window.localStorage.setItem(key, next);

  return next;
}

export default function ProductEventTracker({
  productId,
  productSlug,
  productName,
  price,
}: ProductEventTrackerProps) {
  const viewedRef = useRef(false);

  async function track(eventType: EventType, metadata: Record<string, unknown> = {}) {
    try {
      await fetch("/api/product-events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        keepalive: true,
        body: JSON.stringify({
          productId,
          productSlug,
          productName,
          price,
          eventType,
          sessionId: getSessionId(),
          source: "product_detail",
          metadata,
        }),
      });
    } catch {
      // tracking không được làm hỏng trải nghiệm mua hàng
    }
  }

  useEffect(() => {
    if (viewedRef.current) return;

    viewedRef.current = true;
    track("product_view", {
      path: window.location.pathname,
      title: document.title,
    });
  }, []);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;

      if (!target) return;

      const element = target.closest("[data-hmecha-event]") as HTMLElement | null;

      if (!element) return;

      const eventType = element.dataset.hmechaEvent as EventType | undefined;

      if (!eventType) return;

      track(eventType, {
        label: element.textContent?.trim() || "",
        path: window.location.pathname,
      });
    }

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return null;
}