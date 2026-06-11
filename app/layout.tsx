import type { Metadata } from "next";
import "./globals.css";
import ChatWidget from "@/components/ChatWidget";


import CompareTray from "@/components/CompareTray";
import FeaturedImagePreviewLock from "@/components/FeaturedImagePreviewLock";

export const metadata: Metadata = {
  title: "HMecha | MÃ´ hÃ¬nh Gundam chÃ­nh hÃ£ng",
  description:
    "HMecha - cá»­a hÃ ng mÃ´ hÃ¬nh Gundam, model kit vÃ  phá»¥ kiá»‡n dÃ nh cho ngÆ°á»i yÃªu mecha.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col">
        <FeaturedImagePreviewLock />
        
        
        {children}
        <CompareTray />
        <ChatWidget />
      </body>
    </html>
  );
}