import ChatWidget from "@/components/ChatWidget";

export default function Home() {
  return (
    <>
      <iframe
        src="/hmecha.html"
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