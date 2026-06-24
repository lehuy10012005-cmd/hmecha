import ChatWidget from "@/components/ChatWidget";

export default function Home() {
  return (
    <>
      <iframe loading="lazy"
        src="/hmecha.html?v=status-stock-sync-2"
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