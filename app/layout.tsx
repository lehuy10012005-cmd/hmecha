import type { Metadata } from "next";
import "./globals.css";
import ChatWidget from "@/components/ChatWidget";



import FeaturedImagePreviewLock from "@/components/FeaturedImagePreviewLock";

export const metadata: Metadata = {
  title: "HMecha | Mo hinh Gundam chinh hang",
  description: "HMecha - cua hang mo hinh Gundam, model kit va phu kien mecha.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <FeaturedImagePreviewLock />
        
        
        {children}
        
        <ChatWidget />
      </body>
    </html>
  );
}