"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type ChatMessage = {
  role: "bot" | "user";
  content: string;
};

const suggestions = [
  "Có Gundam RX-78 không?",
  "Sản phẩm dưới 500k",
  "Phí ship bao nhiêu?",
  "Kiểm tra đơn hàng",
];

function linkifyLine(
  line: string,
  onNavigate: (url: string) => void
) {
  const parts = line.split(/(\/[a-z0-9][a-z0-9\-_/]*)/gi);

  return parts.map((part, index) => {
    if (/^\/[a-z0-9][a-z0-9\-_/]*$/i.test(part)) {
      return (
        <button
          key={`${part}-${index}`}
          type="button"
          className="chatProductLink"
          onClick={() => onNavigate(part)}
        >
          {part}
        </button>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}
export default function ChatWidget() {
    const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "bot",
      content:
        "Chào bạn 👋 Mình là bot HMECHA. Mình có thể hỗ trợ tìm sản phẩm, xem giá/tồn kho, phí ship, thanh toán và kiểm tra đơn hàng.",
    },
  ]);

  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
useEffect(() => {
  setOpen(false);
}, [pathname]);

function handleInternalNavigate(url: string) {
  setOpen(false);
  router.push(url);
}
  useEffect(() => {
    if (!bodyRef.current) return;

    bodyRef.current.scrollTo({
      top: bodyRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function sendMessage(customMessage?: string) {
    const text = (customMessage || input).trim();
    if (!text || loading) return;

    setInput("");
    setLoading(true);
    setMessages((prev) => [...prev, { role: "user", content: text }]);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          content:
            data.reply ||
            "Mình chưa trả lời được câu này. Bạn thử hỏi lại giúp mình nhé.",
        },
      ]);
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
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    sendMessage();
  }

  return (
    <div className="hmechaChat">
      {open && (
        <section className="chatPanel" aria-label="HMECHA chatbot">
          <header>
            <div>
              <strong>HMECHA Bot</strong>
              <span>Hỗ trợ sản phẩm & đơn hàng</span>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Đóng chat"
              className="chatCloseButton"
            >
              ×
            </button>
          </header>

          <div className="chatBody" ref={bodyRef}>
            {messages.map((message, index) => (
              <div
                className={`message ${message.role}`}
                key={`${message.role}-${index}`}
              >
                {message.content.split("\n").map((line, lineIndex) => (
               <p key={`${index}-${lineIndex}`}>
  {linkifyLine(line, handleInternalNavigate)}
</p>
                ))}
              </div>
            ))}

            {loading && <div className="message bot typing">Đang trả lời...</div>}
          </div>

          <div className="suggestions">
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

          <form onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Nhập câu hỏi cho shop..."
            />

            <button type="submit" disabled={loading || !input.trim()}>
              Gửi
            </button>
          </form>
        </section>
      )}

      <button
        className="chatToggle"
        type="button"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? "×" : "💬"}
      </button>

      <style jsx>{`
     .hmechaChat {
  position: fixed;
  right: 6px;
  bottom: 85px;
  z-index: 2147483647;
  font-family: inherit;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  pointer-events: auto !important;
}

        .chatToggle {
          width: 62px;
          height: 62px;
          border-radius: 999px;
          border: 1px solid rgba(0, 229, 255, 0.45) !important;
          background: linear-gradient(135deg, #7c4dff, #00e5ff) !important;
          color: white !important;
          font-size: 28px;
          font-weight: 900;
          cursor: pointer;
          box-shadow: 0 18px 42px rgba(0, 0, 0, 0.35) !important;
        }

        .chatPanel {
          width: min(380px, calc(100vw - 28px));
          height: min(620px, calc(100vh - 115px));
          margin-bottom: 14px;
          border-radius: 24px;
          overflow: hidden;
          background: rgba(5, 8, 22, 0.96);
          border: 1px solid rgba(0, 229, 255, 0.26);
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.48);
          color: #ecf4ff;
          display: flex;
          flex-direction: column;
          backdrop-filter: blur(18px);
        }

        header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 18px;
          background: linear-gradient(
            135deg,
            rgba(124, 77, 255, 0.38),
            rgba(0, 229, 255, 0.16)
          );
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        header strong {
          display: block;
          font-size: 17px;
        }

        header span {
          display: block;
          margin-top: 3px;
          color: #b8c4e6;
          font-size: 12px;
        }

        .chatCloseButton {
          width: 34px;
          height: 34px;
          border: 0 !important;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12) !important;
          color: white !important;
          cursor: pointer;
          font-size: 22px;
          box-shadow: none !important;
        }

        .chatBody {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .message {
          max-width: 86%;
          padding: 11px 13px;
          border-radius: 16px;
          line-height: 1.42;
          font-size: 14px;
          white-space: pre-wrap;
        }

        .message p {
          margin: 0 0 5px;
        }

        .message p:last-child {
          margin-bottom: 0;
        }

        .message.bot {
          align-self: flex-start;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.09);
          color: #eaf2ff;
        }

        .message.user {
          align-self: flex-end;
          background: linear-gradient(135deg, #7c4dff, #00bcd4);
          color: white;
        }

        .message a,
.message .chatProductLink {
  color: #7df4ff !important;
  font-weight: 800;
  text-decoration: underline;
}

.message .chatProductLink {
  display: inline;
  border: 0 !important;
  background: transparent !important;
  padding: 0 !important;
  margin: 0;
  box-shadow: none !important;
  cursor: pointer;
  font: inherit;
}

        .typing {
          opacity: 0.75;
        }

        .suggestions {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 10px 14px 0;
        }

        .suggestions button {
          flex: 0 0 auto;
          border: 1px solid rgba(0, 229, 255, 0.22) !important;
          background: rgba(255, 255, 255, 0.07) !important;
          color: #dce6ff !important;
          border-radius: 999px;
          padding: 8px 10px;
          font-size: 12px;
          cursor: pointer;
          box-shadow: none !important;
        }

        form {
          display: flex;
          gap: 9px;
          padding: 14px;
        }

        input {
          flex: 1;
          min-width: 0;
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          color: white;
          outline: none;
          padding: 12px 14px;
        }

        input::placeholder {
          color: #8fa0c8;
        }

        form button {
          border: 0 !important;
          border-radius: 999px;
          padding: 0 16px;
          background: #00e5ff !important;
          color: #06101f !important;
          font-weight: 900;
          cursor: pointer;
          box-shadow: none !important;
        }

        form button:disabled,
        .suggestions button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        @media (max-width: 520px) {
          .hmechaChat {
            right: 14px;
            bottom: 14px;
          }

          .chatPanel {
            height: min(590px, calc(100vh - 100px));
          }
        }
      `}</style>
    </div>
  );
}
