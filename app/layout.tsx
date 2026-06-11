import type { Metadata } from "next";
import "./globals.css";
import ChatWidget from "@/components/ChatWidget";


import CompareTray from "@/components/CompareTray";
import FeaturedImagePreviewLock from "@/components/FeaturedImagePreviewLock";

export const metadata: Metadata = {
  title: "HMecha | MÃƒÂ´ hÃƒÂ¬nh Gundam chÃƒÂ­nh hÃƒÂ£ng",
  description:
    "HMecha - cÃ¡Â»Â­a hÃƒÂ ng mÃƒÂ´ hÃƒÂ¬nh Gundam, model kit vÃƒÂ  phÃ¡Â»Â¥ kiÃ¡Â»â€¡n dÃƒÂ nh cho ngÃ†Â°Ã¡Â»Âi yÃƒÂªu mecha.",
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