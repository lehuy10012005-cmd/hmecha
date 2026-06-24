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

function renderMessageContent(text: string, onNavigate: (url: string) => void) {
  const lines = String(text || "").split("\n");

  return lines.map((line, index) => {
    const cleanLine = line.trim();
    const viewMatch = cleanLine.match(/^Xem:\s*(\/[a-z0-9][a-z0-9\-_/]*)/i);
    const directUrlMatch = cleanLine.match(/^(\/[a-z0-9][a-z0-9\-_/]*)$/i);

    if (viewMatch || directUrlMatch) {
      const url = cleanUrl(viewMatch?.[1] || directUrlMatch?.[1] || "");

      return (
        <button
          key={index}
          type="button"
          className="hm-chat-link-button"
          onClick={() => onNavigate(url)}
        >
          Xem chi tiết →
        </button>
      );
    }

    return (
      <p key={index} className="hm-chat-line">
        {line}
      </p>
    );
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

    try {
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

      setMessages((prev) => {
        const hasAdmin = mapped.some((item: ChatMessage) => item.role === "admin");

        if (!hasAdmin && mapped.length < prev.length) {
          return prev;
        }

        return mapped.length ? mapped : prev;
      });
    } catch {
      return;
    }
  }

  useEffect(() => {
    if (!open || !sessionId) return;

    refreshMessages(sessionId);

    const timer = window.setInterval(() => {
      refreshMessages(sessionId);
    }, 6000);

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

      setMessages((prev) => [
        ...prev,
        {
          id: makeMsgId(),
          role: "bot",
          content:
            data.reply ||
            "Mình đã nhận được câu hỏi. Bạn hỏi rõ hơn để mình hỗ trợ chính xác nhé.",
        },
      ]);
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
        content: "Mình đã mở cuộc trò chuyện mới. Bạn muốn tư vấn sản phẩm nào?",
      },
    ]);
  }

  if (!canRender) return null;

  return (
    <>
      {open ? (
        <section className="hm-chat-panel" data-hmecha-chat-widget="true">
          <header className="hm-chat-header">
            <div className="hm-chat-avatar">H</div>

            <div className="hm-chat-title">
              <strong>HMECHA Assistant</strong>
              <span>Tư vấn sản phẩm và đơn hàng</span>
            </div>

            <button
              type="button"
              className="hm-chat-close"
              onClick={() => setOpen(false)}
              aria-label="Đóng chatbot"
            >
              ×
            </button>
          </header>

          <div ref={bodyRef} className="hm-chat-body">
            {messages.map((message, index) => (
              <div
                key={message.id || index}
                className={
                  message.role === "user"
                    ? "hm-chat-row hm-chat-row-user"
                    : "hm-chat-row hm-chat-row-bot"
                }
              >
                <div
                  className={
                    message.role === "user"
                      ? "hm-chat-bubble hm-chat-bubble-user"
                      : message.role === "admin"
                      ? "hm-chat-bubble hm-chat-bubble-admin"
                      : "hm-chat-bubble hm-chat-bubble-bot"
                  }
                >
                  {renderMessageContent(message.content, navigate)}
                </div>
              </div>
            ))}

            {loading ? (
              <div className="hm-chat-row hm-chat-row-bot">
                <div className="hm-chat-bubble hm-chat-bubble-bot hm-chat-loading">
                  Đang trả lời...
                </div>
              </div>
            ) : null}
          </div>

          <div className="hm-chat-suggestions">
            {suggestions.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => sendMessage(item)}
                disabled={loading}
              >
                {item}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="hm-chat-form">
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Nhập tin nhắn..."
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Gửi tin nhắn"
            >
              ➤
            </button>

            <button
              type="button"
              onClick={clearChat}
              title="Làm mới chat"
              aria-label="Làm mới chat"
            >
              ↻
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        className="hm-chat-floating"
        onClick={() => setOpen((value) => !value)}
        aria-label="Mở chatbot"
      >
        {open ? "×" : "💬"}
      </button>

      <style>{`
        .hm-chat-panel {
          position: fixed;
          right: 22px;
          bottom: 92px;
          z-index: 70;
          width: min(390px, calc(100vw - 24px));
          height: min(560px, calc(100vh - 115px));
          display: grid;
          grid-template-rows: auto 1fr auto auto;
          overflow: hidden;
          border-radius: 18px;
          background: #0b1020;
          border: 1px solid rgba(255,255,255,.14);
          box-shadow: 0 22px 60px rgba(0,0,0,.48);
          color: #f8fafc;
          font-family: Arial, Helvetica, sans-serif;
        }

        .hm-chat-header {
          min-height: 70px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid rgba(255,255,255,.1);
          background: #0f172a;
        }

        .hm-chat-avatar {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: #ef4444;
          color: #fff;
          font-weight: 950;
          font-size: 22px;
          flex-shrink: 0;
        }

        .hm-chat-title {
          min-width: 0;
          flex: 1;
        }

        .hm-chat-title strong {
          display: block;
          font-size: 16px;
          line-height: 1.25;
          color: #ffffff;
        }

        .hm-chat-title span {
          display: block;
          margin-top: 3px;
          color: #cbd5e1;
          font-size: 13px;
          line-height: 1.3;
        }

        .hm-chat-close {
          width: 34px;
          height: 34px;
          border: 0;
          border-radius: 10px;
          background: rgba(255,255,255,.08);
          color: #fff;
          cursor: pointer;
          font-size: 24px;
          line-height: 30px;
        }

        .hm-chat-body {
          padding: 14px;
          overflow-y: auto;
          overflow-x: hidden;
          display: grid;
          gap: 10px;
          align-content: start;
          background: #0b1020;
        }

        .hm-chat-body::-webkit-scrollbar {
          width: 8px;
        }

        .hm-chat-body::-webkit-scrollbar-thumb {
          background: rgba(148,163,184,.45);
          border-radius: 999px;
        }

        .hm-chat-row {
          display: flex;
        }

        .hm-chat-row-user {
          justify-content: flex-end;
        }

        .hm-chat-row-bot {
          justify-content: flex-start;
        }

        .hm-chat-bubble {
          max-width: 88%;
          padding: 11px 13px;
          border-radius: 15px;
          font-size: 14px;
          line-height: 1.55;
          word-break: break-word;
          overflow-wrap: anywhere;
          white-space: normal;
        }

        .hm-chat-bubble-bot {
          background: #ffffff;
          color: #111827;
          border-bottom-left-radius: 5px;
          box-shadow: 0 6px 18px rgba(0,0,0,.16);
        }

        .hm-chat-bubble-user {
          background: #ef4444;
          color: #ffffff;
          border-bottom-right-radius: 5px;
          font-weight: 750;
        }

        .hm-chat-bubble-admin {
          background: #fff7ed;
          color: #7c2d12;
          border: 1px solid #fed7aa;
        }

        .hm-chat-line {
          margin: 0;
        }

        .hm-chat-line + .hm-chat-line {
          margin-top: 7px;
        }

        .hm-chat-link-button {
          margin-top: 7px;
          min-height: 34px;
          padding: 0 13px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #ef4444;
          border-radius: 999px;
          background: #fff;
          color: #dc2626;
          cursor: pointer;
          font-size: 13px;
          font-weight: 850;
          text-decoration: none;
        }

        .hm-chat-link-button:hover {
          background: #fee2e2;
        }

        .hm-chat-loading {
          color: #475569;
          font-style: italic;
        }

        .hm-chat-suggestions {
          padding: 10px 12px;
          border-top: 1px solid rgba(255,255,255,.1);
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          background: #0f172a;
        }

        .hm-chat-suggestions button {
          min-height: 32px;
          border: 1px solid rgba(255,255,255,.16);
          border-radius: 999px;
          padding: 0 11px;
          background: rgba(255,255,255,.06);
          color: #e5e7eb;
          font-weight: 750;
          cursor: pointer;
          font-size: 12.5px;
        }

        .hm-chat-suggestions button:hover {
          background: rgba(239,68,68,.16);
          border-color: rgba(239,68,68,.45);
        }

        .hm-chat-form {
          padding: 12px;
          display: grid;
          grid-template-columns: 1fr 42px 42px;
          gap: 8px;
          border-top: 1px solid rgba(255,255,255,.1);
          background: #0f172a;
        }

        .hm-chat-form input {
          min-height: 42px;
          border: 1px solid rgba(255,255,255,.18);
          border-radius: 999px;
          background: #ffffff;
          color: #111827;
          padding: 0 14px;
          outline: none;
          font-size: 14px;
        }

        .hm-chat-form input:focus {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239,68,68,.16);
        }

        .hm-chat-form button {
          width: 42px;
          height: 42px;
          border: 0;
          border-radius: 999px;
          background: #ef4444;
          color: #ffffff;
          font-weight: 950;
          cursor: pointer;
        }

        .hm-chat-form button:last-child {
          background: rgba(255,255,255,.1);
          color: #fff;
          border: 1px solid rgba(255,255,255,.16);
        }

        .hm-chat-form button:disabled {
          opacity: .55;
          cursor: not-allowed;
        }

        .hm-chat-floating {
          position: fixed;
          right: 22px;
          bottom: 24px;
          z-index: 71;
          width: 58px;
          height: 58px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.18);
          background: #ef4444;
          color: #ffffff;
          display: grid;
          place-items: center;
          cursor: pointer;
          font-size: 24px;
          font-weight: 950;
          box-shadow: 0 16px 34px rgba(239,68,68,.28);
        }

        @media (max-width: 520px) {
          .hm-chat-panel {
            right: 10px;
            bottom: 84px;
            width: calc(100vw - 20px);
            height: min(560px, calc(100vh - 105px));
          }

          .hm-chat-floating {
            right: 16px;
            bottom: 18px;
          }
        }
      `}</style>
    </>
  );
}