"use client";

import { useEffect, useMemo, useState } from "react";

type Faq = {
  id: string;
  question: string;
  keywords: string;
  answer: string;
  category: string;
  link_label: string | null;
  link_url: string | null;
  priority: number;
  is_active: boolean;
};

type Conversation = {
  id: string;
  session_id: string;
  customer_email: string | null;
  customer_name: string | null;
  status: string;
  last_message: string | null;
  last_sender: string | null;
  page_url: string | null;
  updated_at: string;
};

type Message = {
  id: string;
  sender: "customer" | "bot" | "admin";
  message: string;
  created_at: string;
};

const emptyFaq = {
  id: "",
  question: "",
  keywords: "",
  answer: "",
  category: "general",
  link_label: "",
  link_url: "",
  priority: 10,
  is_active: true,
};

const boxStyle: React.CSSProperties = {
  border: "1px solid rgba(0,229,255,.2)",
  background: "rgba(7,12,32,.86)",
  borderRadius: 22,
  padding: 22,
  boxShadow: "0 18px 42px rgba(0,0,0,.22)",
};

const inputStyle: React.CSSProperties = {
  minHeight: 46,
  borderRadius: 12,
  border: "1px solid rgba(0,229,255,.22)",
  background: "rgba(5,8,22,.9)",
  color: "#fff",
  padding: "0 12px",
  outline: "none",
};

const buttonStyle: React.CSSProperties = {
  minHeight: 44,
  border: 0,
  borderRadius: 12,
  padding: "0 16px",
  fontWeight: 950,
  cursor: "pointer",
  color: "#061020",
  background: "linear-gradient(135deg,#7c4dff,#00e5ff)",
};

export default function AdminChatbotPanel() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [faqForm, setFaqForm] = useState<any>(emptyFaq);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [tab, setTab] = useState<"inbox" | "faq">("inbox");

  const selected = useMemo(
    () => conversations.find((item) => item.id === selectedConversation),
    [conversations, selectedConversation]
  );

  async function loadFaqs() {
    const response = await fetch("/api/admin/chatbot/faqs", { cache: "no-store" });
    const data = await response.json();

    if (response.ok) {
      setFaqs(data.faqs || []);
    }
  }

  async function loadConversations() {
    const response = await fetch("/api/admin/chatbot/conversations", { cache: "no-store" });
    const data = await response.json();

    if (response.ok) {
      setConversations(data.conversations || []);

      if (!selectedConversation && data.conversations?.[0]?.id) {
        setSelectedConversation(data.conversations[0].id);
      }
    }
  }

  async function loadMessages(conversationId = selectedConversation) {
    if (!conversationId) return;

    const response = await fetch(
      "/api/admin/chatbot/messages?conversationId=" + encodeURIComponent(conversationId),
      { cache: "no-store" }
    );

    const data = await response.json();

    if (response.ok) {
      setMessages(data.messages || []);
    }
  }

  useEffect(() => {
    loadFaqs();
    loadConversations();
  }, []);

  useEffect(() => {
    loadMessages();
  }, [selectedConversation]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      loadConversations();
      loadMessages();
    }, 5000);

    return () => window.clearInterval(timer);
  }, [selectedConversation]);

  function updateFaq(field: string, value: any) {
    setFaqForm((current: any) => ({ ...current, [field]: value }));
  }

  function editFaq(faq: Faq) {
    setTab("faq");
    setFaqForm({
      id: faq.id,
      question: faq.question,
      keywords: faq.keywords,
      answer: faq.answer,
      category: faq.category,
      link_label: faq.link_label || "",
      link_url: faq.link_url || "",
      priority: faq.priority,
      is_active: faq.is_active,
    });
  }

  async function saveFaq(event: React.FormEvent) {
    event.preventDefault();

    const response = await fetch("/api/admin/chatbot/faqs", {
      method: faqForm.id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(faqForm),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Không lưu được câu trả lời.");
      return;
    }

    alert(data.message || "Đã lưu câu trả lời.");
    setFaqForm(emptyFaq);
    loadFaqs();
  }

  async function disableFaq(id: string) {
    const response = await fetch("/api/admin/chatbot/faqs", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Không tắt được câu trả lời.");
      return;
    }

    loadFaqs();
  }

  async function sendReply(event: React.FormEvent) {
    event.preventDefault();

    if (!selectedConversation || !reply.trim()) return;

    const response = await fetch("/api/admin/chatbot/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: selectedConversation, message: reply }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Không gửi được tin nhắn.");
      return;
    }

    setReply("");
    loadMessages();
    loadConversations();
  }

  async function updateConversationStatus(status: string) {
    if (!selectedConversation) return;

    await fetch("/api/admin/chatbot/conversations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedConversation, status }),
    });

    loadConversations();
  }

  return (
    <div style={{ color: "#fff", display: "grid", gap: 18 }}>
      <section style={boxStyle}>
        <p style={{ color: "#00e5ff", fontWeight: 950, letterSpacing: 4, margin: 0 }}>
          HMECHA ADMIN
        </p>
        <h1 style={{ fontSize: 56, lineHeight: 1.05, margin: "10px 0" }}>
          Điều khiển chatbot
        </h1>
        <p style={{ color: "#c5d2f2", margin: 0 }}>
          Quản lý câu trả lời tự động và tư vấn khách hàng trực tiếp qua inbox.
        </p>
      </section>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <button style={buttonStyle} onClick={() => setTab("inbox")}>
          Tin nhắn khách hàng
        </button>
        <button style={buttonStyle} onClick={() => setTab("faq")}>
          Câu trả lời tự động
        </button>
      </div>

      {tab === "inbox" ? (
        <section style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 16 }}>
          <div style={boxStyle}>
            <h2 style={{ marginTop: 0 }}>Cuộc trò chuyện</h2>

            <div style={{ display: "grid", gap: 10 }}>
              {conversations.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedConversation(item.id)}
                  style={{
                    textAlign: "left",
                    border: item.id === selectedConversation ? "1px solid #00e5ff" : "1px solid rgba(255,255,255,.12)",
                    borderRadius: 14,
                    padding: 12,
                    background: "rgba(255,255,255,.06)",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  <strong>{item.customer_email || "Khách vãng lai"}</strong>
                  <p style={{ margin: "6px 0", color: "#c5d2f2" }}>
                    {item.last_sender ? item.last_sender + ": " : ""}
                    {item.last_message || "Chưa có tin nhắn"}
                  </p>
                  <small style={{ color: "#00e5ff" }}>{item.status}</small>
                </button>
              ))}
            </div>
          </div>

          <div style={boxStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "center" }}>
              <div>
                <h2 style={{ margin: 0 }}>{selected?.customer_email || "Chọn cuộc trò chuyện"}</h2>
                {selected?.page_url ? (
                  <p style={{ color: "#9fb0d8" }}>Trang khách đang xem: {selected.page_url}</p>
                ) : null}
              </div>

              <button style={buttonStyle} onClick={() => updateConversationStatus("done")}>
                Đánh dấu đã xử lý
              </button>
            </div>

            <div style={{ display: "grid", gap: 10, marginTop: 20, maxHeight: 460, overflow: "auto" }}>
              {messages.map((item) => (
                <div
                  key={item.id}
                  style={{
                    justifySelf: item.sender === "admin" ? "end" : "start",
                    maxWidth: "76%",
                    borderRadius: 16,
                    padding: 12,
                    background:
                      item.sender === "admin"
                        ? "linear-gradient(135deg,#7c4dff,#00e5ff)"
                        : item.sender === "bot"
                        ? "rgba(0,229,255,.12)"
                        : "rgba(255,255,255,.08)",
                    color: item.sender === "admin" ? "#061020" : "#fff",
                    fontWeight: item.sender === "admin" ? 850 : 600,
                  }}
                >
                  <small>{item.sender}</small>
                  <div style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>{item.message}</div>
                </div>
              ))}
            </div>

            <form onSubmit={sendReply} style={{ display: "flex", gap: 10, marginTop: 18 }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                placeholder="Nhập phản hồi cho khách..."
              />
              <button style={buttonStyle}>Gửi</button>
            </form>
          </div>
        </section>
      ) : (
        <section style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={boxStyle}>
            <h2 style={{ marginTop: 0 }}>{faqForm.id ? "Sửa câu trả lời" : "Thêm câu trả lời"}</h2>

            <form onSubmit={saveFaq} style={{ display: "grid", gap: 12 }}>
              <input style={inputStyle} value={faqForm.question} onChange={(e) => updateFaq("question", e.target.value)} placeholder="Câu hỏi mẫu" />
              <input style={inputStyle} value={faqForm.keywords} onChange={(e) => updateFaq("keywords", e.target.value)} placeholder="Từ khóa, cách nhau bằng dấu phẩy" />
              <textarea style={{ ...inputStyle, minHeight: 130, paddingTop: 12 }} value={faqForm.answer} onChange={(e) => updateFaq("answer", e.target.value)} placeholder="Câu trả lời của bot" />
              <input style={inputStyle} value={faqForm.category} onChange={(e) => updateFaq("category", e.target.value)} placeholder="Nhóm: shipping, payment, coupon..." />
              <input style={inputStyle} value={faqForm.link_label} onChange={(e) => updateFaq("link_label", e.target.value)} placeholder="Tên link gợi ý" />
              <input style={inputStyle} value={faqForm.link_url} onChange={(e) => updateFaq("link_url", e.target.value)} placeholder="/chinh-sach-van-chuyen" />
              <input style={inputStyle} type="number" value={faqForm.priority} onChange={(e) => updateFaq("priority", Number(e.target.value))} placeholder="Ưu tiên" />

              <select style={inputStyle} value={faqForm.is_active ? "true" : "false"} onChange={(e) => updateFaq("is_active", e.target.value === "true")}>
                <option value="true">Đang bật</option>
                <option value="false">Tạm tắt</option>
              </select>

              <button style={buttonStyle}>{faqForm.id ? "Lưu thay đổi" : "Tạo câu trả lời"}</button>
            </form>
          </div>

          <div style={boxStyle}>
            <h2 style={{ marginTop: 0 }}>Danh sách câu trả lời</h2>

            <div style={{ display: "grid", gap: 10 }}>
              {faqs.map((faq) => (
                <article key={faq.id} style={{ border: "1px solid rgba(0,229,255,.16)", borderRadius: 14, padding: 14, background: "rgba(255,255,255,.05)" }}>
                  <strong style={{ color: "#00e5ff" }}>{faq.question}</strong>
                  <p style={{ color: "#c5d2f2", whiteSpace: "pre-wrap" }}>{faq.answer}</p>
                  <small>{faq.is_active ? "Đang bật" : "Đã tắt"} · {faq.category}</small>
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button style={buttonStyle} onClick={() => editFaq(faq)}>Sửa</button>
                    <button style={{ ...buttonStyle, background: "linear-gradient(135deg,#ff4fd8,#7c4dff)", color: "#fff" }} onClick={() => disableFaq(faq.id)}>Tắt</button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
