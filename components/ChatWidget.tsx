"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

declare global {
  interface Window {
    __hmechaChatWidgetMounted?: boolean;
  }
}

type ChatMessage = {
  id?: string;
  role: "bot" | "user" | "admin";
  content: string;
};

const suggestions = [
  "Sản phẩm dưới 500k",
  "Phí ship bao nhiêu?",
  "Mã giảm giá dùng sao?",
  "Điểm tích lũy là gì?",
  "Tôi muốn gặp admin",
];

function makeSessionId() {
  return "hm_chat_" + Date.now() + "_" + Math.random().toString(16).slice(2);
}

function linkifyLine(line: string, onNavigate: (url: string) => void) {
  const parts = line.split(/(\/[a-z0-9][a-z0-9\-_/]*)/gi);

  return parts.map((part, index) => {
    if (/^\/[a-z0-9][a-z0-9\-_/]*$/i.test(part)) {
      return (
        <button
          key={index}
          type="button"
          onClick={() => onNavigate(part)}
          style={{
            border: 0,
            padding: 0,
            background: "transparent",
            color: "#00e5ff",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          {part}
        </button>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

export default function ChatWidget() {
  const router = useRouter();
  const pathname = usePathname();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);

  const [canRender, setCanRender] = useState(false);
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      content:
        "Chào bạn, mình là HMECHA Assistant. Mình có thể tư vấn sản phẩm, phí ship, mã giảm giá, điểm tích lũy hoặc chuyển câu hỏi cho admin.",
    },
  ]);

  useEffect(() => {
    if (pathname?.startsWith("/admin") || pathname === "/admin-login") {
      setCanRender(false);
      return;
    }

    if (window.__hmechaChatWidgetMounted) {
      setCanRender(false);
      return;
    }

    window.__hmechaChatWidgetMounted = true;
    setCanRender(true);

    return () => {
      window.__hmechaChatWidgetMounted = false;
    };
  }, [pathname]);

  useEffect(() => {
    if (!canRender) return;

    const key = "hmecha_chat_session_id";
    const existing = window.localStorage.getItem(key);
    const next = existing || makeSessionId();

    window.localStorage.setItem(key, next);
    setSessionId(next);
  }, [canRender]);

  useEffect(() => {
    if (!bodyRef.current) return;

    bodyRef.current.scrollTo({
      top: bodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  function handleInternalNavigate(url: string) {
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

  async function sendMessage(customMessage?: string) {
    const text = (customMessage || input).trim();

    if (!text || loading || !sessionId) return;

    setInput("");
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: text }]);

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
            role: "bot",
            content: data.reply || "Bot đang gặp lỗi. Bạn thử gửi lại sau nhé.",
          },
        ]);
        return;
      }

      await refreshMessages(sessionId);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content: "Mình đang bị lỗi kết nối. Bạn thử gửi lại sau nhé.",
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
    const next = makeSessionId();
    window.localStorage.setItem("hmecha_chat_session_id", next);
    setSessionId(next);
    setMessages([
      {
        role: "bot",
        content:
          "Mình đã mở cuộc trò chuyện mới. Bạn cần tư vấn sản phẩm hay kiểm tra thông tin mua hàng?",
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
            bottom: 96,
            zIndex: 60,
            width: "min(380px, calc(100vw - 28px))",
            height: "min(620px, calc(100vh - 130px))",
            display: "grid",
            gridTemplateRows: "auto 1fr auto",
            overflow: "hidden",
            borderRadius: 24,
            border: "1px solid rgba(0,229,255,.38)",
            background:
              "linear-gradient(180deg, rgba(7,12,32,.96), rgba(5,8,22,.98))",
            boxShadow: "0 24px 70px rgba(0,0,0,.5)",
            color: "#fff",
          }}
        >
          <header
            style={{
              padding: 16,
              background:
                "linear-gradient(135deg, rgba(124,77,255,.95), rgba(0,229,255,.9))",
              color: "#061020",
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
            }}
          >
            <div>
              <strong style={{ display: "block", fontSize: 17 }}>
                HMECHA Assistant
              </strong>
              <small>Bot hỗ trợ + admin tư vấn</small>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                onClick={clearChat}
                style={{
                  border: 0,
                  borderRadius: 999,
                  width: 32,
                  height: 32,
                  cursor: "pointer",
                  fontWeight: 950,
                }}
                title="Xóa chat"
              >
                ↻
              </button>

              <button
                type="button"
                onClick={() => setOpen(false)}
                style={{
                  border: 0,
                  borderRadius: 999,
                  width: 32,
                  height: 32,
                  cursor: "pointer",
                  fontWeight: 950,
                }}
                title="Đóng"
              >
                ×
              </button>
            </div>
          </header>

          <div
            ref={bodyRef}
            style={{
              padding: 14,
              overflow: "auto",
              display: "grid",
              gap: 10,
              alignContent: "start",
            }}
          >
            {messages.map((message, index) => (
              <div
                key={message.id || index}
                style={{
                  justifySelf: message.role === "user" ? "end" : "start",
                  maxWidth: "86%",
                  borderRadius:
                    message.role === "user"
                      ? "18px 18px 4px 18px"
                      : "18px 18px 18px 4px",
                  padding: "10px 12px",
                  background:
                    message.role === "user"
                      ? "linear-gradient(135deg,#7c4dff,#00e5ff)"
                      : message.role === "admin"
                      ? "rgba(255,79,216,.18)"
                      : "rgba(255,255,255,.08)",
                  color: message.role === "user" ? "#061020" : "#ffffff",
                  fontWeight: message.role === "user" ? 850 : 650,
                  lineHeight: 1.55,
                  whiteSpace: "pre-wrap",
                }}
              >
                {message.role === "admin" ? (
                  <small style={{ color: "#ff8de7", fontWeight: 950 }}>
                    HMECHA Admin
                  </small>
                ) : null}

                <div>
                  {message.content.split("\n").map((line, lineIndex) => (
                    <p
                      key={lineIndex}
                      style={{ margin: lineIndex ? "7px 0 0" : 0 }}
                    >
                      {linkifyLine(line, handleInternalNavigate)}
                    </p>
                  ))}
                </div>
              </div>
            ))}

            {loading ? (
              <div
                style={{
                  justifySelf: "start",
                  borderRadius: 16,
                  padding: "10px 12px",
                  background: "rgba(255,255,255,.08)",
                  color: "#c5d2f2",
                }}
              >
                Đang trả lời...
              </div>
            ) : null}
          </div>

          <footer
            style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,.1)" }}
          >
            <div
              style={{
                display: "flex",
                gap: 8,
                overflowX: "auto",
                paddingBottom: 10,
              }}
            >
              {suggestions.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => sendMessage(item)}
                  disabled={loading}
                  style={{
                    border: "1px solid rgba(0,229,255,.28)",
                    borderRadius: 999,
                    padding: "8px 10px",
                    background: "rgba(0,229,255,.08)",
                    color: "#dce6ff",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    fontWeight: 800,
                  }}
                >
                  {item}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Nhập câu hỏi cho shop..."
                style={{
                  flex: 1,
                  minHeight: 44,
                  border: "1px solid rgba(0,229,255,.24)",
                  borderRadius: 14,
                  background: "rgba(5,8,22,.92)",
                  color: "#fff",
                  padding: "0 12px",
                  outline: "none",
                }}
              />

              <button
                type="submit"
                disabled={loading || !input.trim()}
                style={{
                  minWidth: 68,
                  border: 0,
                  borderRadius: 14,
                  background: "linear-gradient(135deg,#7c4dff,#00e5ff)",
                  color: "#061020",
                  fontWeight: 950,
                  cursor: "pointer",
                }}
              >
                Gửi
              </button>
            </form>
          </footer>
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        style={{
          position: "fixed",
          right: 22,
          bottom: 24,
          zIndex: 61,
          width: 62,
          height: 62,
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,.24)",
          background: "linear-gradient(135deg,#14b8ff,#00e5ff)",
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
          color: "#061020",
          fontWeight: 950,
          fontSize: 30,
          boxShadow: "none",
        }}
        aria-label="Mở chatbot"
      >
        {open ? (
          "×"
        ) : (
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
            <path
              d="M4.5 11.6C4.5 7.9 7.8 5 12 5s7.5 2.9 7.5 6.6-3.3 6.6-7.5 6.6c-.9 0-1.8-.1-2.6-.4L5.5 19l1.2-3.1c-1.4-1.1-2.2-2.6-2.2-4.3Z"
              fill="white"
              stroke="#061020"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>
    </>
  );
}