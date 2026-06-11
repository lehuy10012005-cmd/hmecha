const fs = require("fs");

const path = "components/ChatWidget.tsx";
let text = fs.readFileSync(path, "utf8");

if (!text.includes("declare global")) {
  text = text.replace(
    'type ChatMessage = {',
    `declare global {
  interface Window {
    __hmechaChatWidgetMounted?: boolean;
  }
}

type ChatMessage = {`
  );
}

if (!text.includes("const [canRender, setCanRender]")) {
  text = text.replace(
    'const [open, setOpen] = useState(false);',
    'const [canRender, setCanRender] = useState(false);\n  const [open, setOpen] = useState(false);'
  );
}

if (!text.includes("window.__hmechaChatWidgetMounted")) {
  text = text.replace(
    `useEffect(() => {
    const key = "hmecha_chat_session_id";`,
    `useEffect(() => {
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

    const key = "hmecha_chat_session_id";`
  );

  text = text.replace('}, []);', '}, [canRender]);');
}

if (!text.includes("if (!canRender) return null;")) {
  text = text.replace(
    'return (',
    'if (!canRender) return null;\n\n  return ('
  );
}

/*
  Đổi nút floating thành 1 nút duy nhất:
  - bỏ boxShadow lớn dễ nhìn như bong bóng thứ 2
  - bỏ fontSize emoji lớn
  - dùng icon SVG đơn giản
*/
text = text.replace(
  /<button\s+type="button"\s+onClick=\{\(\) => setOpen\(\(value\) => !value\)\}[\s\S]*?aria-label="Mở chatbot"\s+>\s*\{open \? "×" : "💬"\}\s*<\/button>/,
  `<button
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
          border: "1px solid rgba(255,255,255,.22)",
          background: open
            ? "linear-gradient(135deg,#7c4dff,#00e5ff)"
            : "linear-gradient(135deg,#18a8ff,#00e5ff)",
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
          color: "#061020",
          fontWeight: 950,
          fontSize: 30,
        }}
        aria-label="Mở chatbot"
      >
        {open ? (
          "×"
        ) : (
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4.5 11.6C4.5 7.9 7.8 5 12 5s7.5 2.9 7.5 6.6-3.3 6.6-7.5 6.6c-.9 0-1.8-.1-2.6-.4L5.5 19l1.2-3.1c-1.4-1.1-2.2-2.6-2.2-4.3Z"
              fill="white"
              stroke="#061020"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>`
);

fs.writeFileSync(path, text, "utf8");
console.log("Fixed ChatWidget singleton and single bubble style.");