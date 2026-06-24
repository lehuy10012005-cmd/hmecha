"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/dashboard-2", label: "Dashboard 2" },
  { href: "/admin/products", label: "Sản phẩm" },
  { href: "/admin/ton-kho", label: "Tồn kho" },
  { href: "/admin/products/new", label: "Thêm sản phẩm" },
  { href: "/admin/orders", label: "Đơn hàng" },
  { href: "/admin/bao-cao", label: "Báo cáo" },
  { href: "/admin/ma-giam-gia", label: "Mã giảm giá" },
  { href: "/admin/chatbot", label: "Chatbot" },
  { href: "/admin/khach-hang", label: "Khách hàng" },
  { href: "/admin/danh-gia", label: "Đánh giá" },
  { href: "/admin/phan-tich-san-pham", label: "Phân tích sản phẩm" },
  { href: "/", label: "Về website" },
];

function matchScore(pathname: string, href: string) {
  if (href === "/") return pathname === "/" ? 1 : 0;
  if (href === "/admin") return pathname === "/admin" ? 1000 : 0;

  if (pathname === href) return href.length + 1000;
  if (pathname.startsWith(href + "/")) return href.length;

  return 0;
}

export default function AdminSidebarNav() {
  const pathname = usePathname() || "";

  const activeHref =
    navItems
      .map((item) => ({
        href: item.href,
        score: matchScore(pathname, item.href),
      }))
      .sort((a, b) => b.score - a.score)[0]?.score > 0
      ? navItems
          .map((item) => ({
            href: item.href,
            score: matchScore(pathname, item.href),
          }))
          .sort((a, b) => b.score - a.score)[0].href
      : "";

  return (
    <nav className="adminNav">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={item.href === activeHref ? "active" : ""}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}