function getRandomQuickReplies() {
  const fixed = [
    "Tư vấn sản phẩm",
    "Dưới 500k",
    "Phí ship",
  ];

  const pool = [
    "Dưới 1 triệu",
    "1 - 2 triệu",
    "Trên 2 triệu",
    "Mô hình thôi",
    "HG cho người mới",
    "RG chi tiết",
    "MG cao cấp",
    "SD nhỏ gọn",
    "Bandai",
    "P-Bandai",
    "Hàng mới",
    "Còn hàng",
    "Mua làm quà",
    "Mẫu ngầu",
    "Nhỏ gọn để bàn",
    "Cao cấp trưng bày",
    "Dụng cụ lắp ráp",
    "Có cần keo không",
    "Mã giảm giá",
    "Thanh toán COD",
    "VNPAY / QR",
    "Quên mật khẩu",
    "Đổi trả",
    "Kiểm tra đơn",
    "Gặp admin",
    "Khác đi",
    "Còn nữa không",
  ];

  const shuffled = [...pool].sort(() => Math.random() - 0.5);

  return [...fixed, ...shuffled.slice(0, 9)];
}
"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type ChatMessage = {
  id?: string;
  role: "bot" | "user" | "admin";
  content: string;
};

const suggestions = [
  "Tư vấn sản phẩm",
  "Dưới 500k",
  "Phí ship",
  "Mã giảm giá",
  "Điểm tích lũy",
  "Gặp admin",
];

function makeSessionId() {
  return "hm_chat_" + Date.now() + "_" + Math.random().toString(16).slice(2);
}

function makeMsgId() {
  return "msg_" + Date.now() + "_" + Math.random().toString(16).slice(2);
}

function cleanUrl(value: string) {
  return value.trim().replace(/[)\].,;]+$/g, "");
}

function renderTextWithLinks(text: string, onNavigate: (url: string) => void) {
  const parts = text.split(/(\/[a-z0-9][a-z0-9\-_/]*)/gi);

  return parts.map((part, index) => {
    const url = cleanUrl(part);

    if (/^\/[a-z0-9][a-z0-9\-_/]*$/i.test(url)) {
      return (
        <button
          key={index}
          type="button"
          onClick={() => onNavigate(url)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            maxWidth: "100%",
            border: 0,
            borderRadius: 999,
            padding: "4px 9px",
            margin: "2px 0",
            background: "linear-gradient(135deg,#7c4dff,#00e5ff)",
            color: "#061020",
            fontWeight: 900,
            cursor: "pointer",
            fontSize: 12,
          }}
        >
          Xem sản phẩm
        </button>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

export default function ChatWidget() {
  const router = useRouter();
  const pathname = usePathname();
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [canRender, setCanRender] = useState(false);
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: makeMsgId(),
      role: "bot",
      content:
        "Chào bạn, mình là HMECHA Assistant. Bạn cần tư vấn sản phẩm, phí ship, mã giảm giá hay gặp admin?",
    },
  ]);

  useEffect(() => {
    if (pathname?.startsWith("/admin") || pathname === "/admin-login") {
      setCanRender(false);
      return;
    }

    setCanRender(true);
  }, [pathname]);

  useEffect(() => {
    if (!canRender) return;

    const timer = window.setTimeout(() => {
      const widgets = Array.from(
        document.querySelectorAll('[data-hmecha-chat-widget="true"]')
      );

      widgets.slice(0, -1).forEach((node) => {
        node.remove();
      });
    }, 0);

    return () => window.clearTimeout(timer);
  }, [canRender, pathname]);

  useEffect(() => {
    if (!canRender) return;

    const key = "hmecha_chat_session_id";
    const oldSession = window.localStorage.getItem(key);
    const nextSession = oldSession || makeSessionId();

    window.localStorage.setItem(key, nextSession);
    setSessionId(nextSession);
  }, [canRender]);

  useEffect(() => {
    if (!bodyRef.current) return;

    bodyRef.current.scrollTo({
      top: bodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading, open]);

  function navigate(url: string) {
    setOpen(false);
    router.push(url);
  }

  async function refreshMessages(activeSession = sessionId) {
    if (!activeSession) return;

    const response = await fetch(
      "/api/chatbot/messages?sessionId=" + encodeURIComponent(activeSession),
      { cache: "no-store" }
    );

    const data = await response.json();

    if (!response.ok || !data.messages?.length) return;

    const mapped = data.messages.map((item: any) => ({
      id: item.id,
      role:
        item.sender === "customer"
          ? "user"
          : item.sender === "admin"
          ? "admin"
          : "bot",
      content: item.message,
    }));

    setMessages(mapped);
  }

  useEffect(() => {
    if (!open || !sessionId) return;

    refreshMessages(sessionId);

    const timer = window.setInterval(() => {
      refreshMessages(sessionId);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [open, sessionId]);

  async function sendMessage(customText?: string) {
    const text = (customText || input).trim();

    if (!text || loading || !sessionId) return;

    setInput("");
    setLoading(true);

    setMessages((prev) => [
      ...prev,
      {
        id: makeMsgId(),
        role: "user",
        content: text,
      },
    ]);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          sessionId,
          pageUrl: pathname,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: makeMsgId(),
            role: "bot",
            content: data.reply || "Bot đang lỗi. Bạn thử gửi lại sau nhé.",
          },
        ]);
        return;
      }

      await refreshMessages(sessionId);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: makeMsgId(),
          role: "bot",
          content: "Mình đang bị lỗi kết nối. Bạn thử lại sau nhé.",
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    sendMessage();
  }

  function clearChat() {
    const nextSession = makeSessionId();

    window.localStorage.setItem("hmecha_chat_session_id", nextSession);
    setSessionId(nextSession);

    setMessages([
      {
        id: makeMsgId(),
        role: "bot",
        content:
          "Mình đã mở cuộc trò chuyện mới. Bạn muốn tư vấn sản phẩm nào?",
      },
    ]);
  }

  if (!canRender) return null;

  return (
    <>
      {open ? (
        <section
          style={{
            position: "fixed",
            right: 22,
            bottom: 92,
            zIndex: 70,
            width: "min(360px, calc(100vw - 24px))",
            height: "min(520px, calc(100vh - 115px))",
            borderRadius: 22,
            overflow: "hidden",
            display: "grid",
            gridTemplateRows: "auto 1fr auto auto",
            background:
              "linear-gradient(180deg, rgba(7,12,32,.98), rgba(5,8,22,.98))",
            border: "1px solid rgba(0,229,255,.28)",
            boxShadow: "0 22px 60px rgba(0,0,0,.45)",
            color: "#fff",
          }}
        >
          <header
            style={{
              minHeight: 68,
              padding: "14px 16px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              borderBottom: "1px solid rgba(255,255,255,.08)",
              background:
                "linear-gradient(135deg, rgba(124,77,255,.16), rgba(0,229,255,.08))",
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 999,
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg,#7c4dff,#00e5ff)",
                color: "#061020",
                fontWeight: 950,
                fontSize: 22,
                flexShrink: 0,
              }}
            >
              H
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <strong style={{ display: "block", fontSize: 16 }}>
                HMECHA Assistant
              </strong>
              <small style={{ color: "#9fb0d8" }}>Tư vấn nhanh cho khách hàng</small>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                width: 34,
                height: 34,
                border: 0,
                borderRadius: 999,
                background: "rgba(255,255,255,.08)",
                color: "#fff",
                cursor: "pointer",
                fontSize: 24,
                lineHeight: "30px",
              }}
            >
              ×
            </button>
          </header>

          <div
            ref={bodyRef}
            style={{
              padding: 14,
              overflowY: "auto",
              overflowX: "hidden",
              display: "grid",
              gap: 10,
              alignContent: "start",
            }}
          >
            {messages.map((message, index) => (
              <div
                key={message.id || index}
                style={{
                  display: "flex",
                  justifyContent: message.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "86%",
                    padding: "10px 12px",
                    borderRadius:
                      message.role === "user"
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                    background:
                      message.role === "user"
                        ? "linear-gradient(135deg,#7c4dff,#00e5ff)"
                        : message.role === "admin"
                        ? "rgba(255,79,216,.18)"
                        : "rgba(255,255,255,.08)",
                    color: message.role === "user" ? "#061020" : "#fff",
                    fontWeight: message.role === "user" ? 850 : 600,
                    fontSize: 14,
                    lineHeight: 1.5,
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {message.content.split("\n").map((line, lineIndex) => (
                    <p key={lineIndex} style={{ margin: lineIndex ? "6px 0 0" : 0 }}>
                      {renderTextWithLinks(line, navigate)}
                    </p>
                  ))}
                </div>
              </div>
            ))}

            {loading ? (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>
                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: "16px 16px 16px 4px",
                    background: "rgba(255,255,255,.08)",
                    color: "#c5d2f2",
                    fontSize: 14,
                  }}
                >
                  Đang trả lời...
                </div>
              </div>
            ) : null}
          </div>

          <div
            style={{
              padding: "8px 12px",
              borderTop: "1px solid rgba(255,255,255,.08)",
              display: "flex",
              gap: 8,
              overflowX: "auto",
              overflowY: "hidden",
            }}
          >
            {suggestions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => sendMessage(item)}
                disabled={loading}
                style={{
                  flex: "0 0 auto",
                  minHeight: 34,
                  border: "1px solid rgba(0,229,255,.25)",
                  borderRadius: 999,
                  padding: "0 11px",
                  background: "rgba(0,229,255,.08)",
                  color: "#dce6ff",
                  fontWeight: 800,
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                {item}
              </button>
            ))}
          </div>

          <form
            onSubmit={handleSubmit}
            style={{
              padding: 12,
              display: "grid",
              gridTemplateColumns: "1fr 42px 42px",
              gap: 8,
              borderTop: "1px solid rgba(255,255,255,.08)",
            }}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Nhập tin nhắn..."
              style={{
                minHeight: 42,
                border: "1px solid rgba(0,229,255,.22)",
                borderRadius: 999,
                background: "rgba(255,255,255,.06)",
                color: "#fff",
                padding: "0 13px",
                outline: "none",
                fontSize: 14,
              }}
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                width: 42,
                height: 42,
                border: 0,
                borderRadius: 999,
                background: "linear-gradient(135deg,#7c4dff,#00e5ff)",
                color: "#061020",
                fontWeight: 950,
                cursor: "pointer",
              }}
            >
              ➤
            </button>

            <button
              type="button"
              onClick={clearChat}
              title="Làm mới chat"
              style={{
                width: 42,
                height: 42,
                border: "1px solid rgba(255,255,255,.12)",
                borderRadius: 999,
                background: "rgba(255,255,255,.06)",
                color: "#fff",
                fontWeight: 950,
                cursor: "pointer",
              }}
            >
              ↻
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        style={{
          position: "fixed",
          right: 22,
          bottom: 24,
          zIndex: 71,
          width: 58,
          height: 58,
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,.22)",
          background: "linear-gradient(135deg,#7c4dff,#00e5ff)",
          color: "#061020",
          display: "grid",
          placeItems: "center",
          cursor: "pointer",
          fontSize: 25,
          fontWeight: 950,
          boxShadow: "0 16px 34px rgba(0,229,255,.25)",
        }}
      >
        {open ? "×" : "💬"}
      </button>
    </>
  );
}