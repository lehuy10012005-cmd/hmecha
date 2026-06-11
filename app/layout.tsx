import type { Metadata } from "next";
import "./globals.css";
import ChatWidget from "@/components/ChatWidget";
import CompareTray from "@/components/CompareTray";
import FeaturedImagePreviewLock from "@/components/FeaturedImagePreviewLock";

export const metadata: Metadata = {
  title: "HMecha | Mô hình Gundam chính hãng",
  description:
    "HMecha - cửa hàng mô hình Gundam, model kit và phụ kiện dành cho người yêu mecha.",
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