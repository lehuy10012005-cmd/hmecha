import ChatWidget from "@/components/ChatWidget";

export default function Home() {
  return (
    <>
      <iframe loading="lazy"
        src="/hmecha.html?v=status-db-20260624"
        style={{
          width: "100%",
          height: "100vh",
          border: "none",
        }}
      />

      <ChatWidget />
    </>
  );
}