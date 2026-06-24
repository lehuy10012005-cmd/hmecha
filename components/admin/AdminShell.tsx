"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties, ReactNode } from "react";

const navItems = [
  { href: "/admin", label: "Tổng quan", icon: "⌂" },
  { href: "/admin/don-hang", label: "Đơn hàng", icon: "□" },
  { href: "/admin/san-pham", label: "Sản phẩm", icon: "◇" },
  { href: "/admin/khach-hang", label: "Khách hàng", icon: "○" },
  { href: "/admin/danh-gia", label: "Đánh giá", icon: "☆" },
  { href: "/admin/coupons", label: "Mã giảm giá", icon: "%" },
  { href: "/admin/marketing", label: "Marketing", icon: "✉" },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname.includes("/admin/login") || pathname.includes("/admin/dang-nhap")) {
    return <>{children}</>;
  }

  function handleLogout() {
    try {
      const keys = Object.keys(localStorage);

      keys.forEach((key) => {
        const lower = key.toLowerCase();
        if (
          lower.includes("admin") ||
          lower.includes("auth") ||
          lower.includes("token") ||
          lower.includes("session")
        ) {
          localStorage.removeItem(key);
        }
      });

      document.cookie.split(";").forEach((cookie) => {
        const name = cookie.split("=")[0]?.trim();
        if (!name) return;

        const lower = name.toLowerCase();

        if (
          lower.includes("admin") ||
          lower.includes("auth") ||
          lower.includes("token") ||
          lower.includes("session") ||
          lower.startsWith("sb-")
        ) {
          document.cookie = `${name}=; Max-Age=0; path=/`;
        }
      });
    } catch {
      // ignore
    }

    window.location.href = "/admin";
  }

  return (
    <div style={styles.shell}>
      <aside style={styles.sidebar}>
        <div style={styles.brandBox}>
          <div style={styles.logoMark}>H</div>
          <div>
            <div style={styles.brandName}>HMECHA</div>
            <div style={styles.brandSub}>Admin Panel</div>
          </div>
        </div>

        <nav style={styles.nav}>
          {navItems.map((item) => {
            const active =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  ...styles.navItem,
                  ...(active ? styles.navItemActive : null),
                }}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={styles.sidebarFooter}>
          <button type="button" onClick={handleLogout} style={styles.logoutButton}>
            Đăng xuất
          </button>
        </div>
      </aside>

      <main style={styles.content}>{children}</main>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  shell: {
    minHeight: "100vh",
    display: "flex",
    background: "#f3f4f6",
    color: "#111827",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  sidebar: {
    width: "268px",
    minHeight: "100vh",
    background: "#0f172a",
    color: "#ffffff",
    padding: "22px 16px",
    display: "flex",
    flexDirection: "column",
    position: "sticky",
    top: 0,
  },
  brandBox: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "4px 6px 22px",
    borderBottom: "1px solid rgba(255,255,255,.10)",
    marginBottom: "18px",
  },
  logoMark: {
    width: "42px",
    height: "42px",
    borderRadius: "14px",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg,#ef4444,#f97316)",
    color: "#fff",
    fontWeight: 900,
    fontSize: "20px",
    boxShadow: "0 14px 30px rgba(239,68,68,.28)",
  },
  brandName: {
    fontWeight: 900,
    letterSpacing: ".08em",
    fontSize: "15px",
  },
  brandSub: {
    fontSize: "12px",
    color: "#94a3b8",
    marginTop: "2px",
  },
  nav: {
    display: "grid",
    gap: "8px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 12px",
    borderRadius: "14px",
    color: "#cbd5e1",
    textDecoration: "none",
    fontWeight: 700,
    fontSize: "14px",
  },
  navItemActive: {
    background: "#ffffff",
    color: "#dc2626",
    boxShadow: "0 12px 28px rgba(0,0,0,.22)",
  },
  navIcon: {
    width: "24px",
    height: "24px",
    borderRadius: "8px",
    display: "grid",
    placeItems: "center",
    background: "rgba(255,255,255,.08)",
    fontSize: "13px",
  },
  sidebarFooter: {
    marginTop: "auto",
    borderTop: "1px solid rgba(255,255,255,.10)",
    paddingTop: "16px",
  },
  logoutButton: {
    width: "100%",
    border: "1px solid rgba(248,113,113,.45)",
    borderRadius: "14px",
    background: "rgba(220,38,38,.10)",
    color: "#fecaca",
    fontWeight: 800,
    padding: "12px 14px",
    cursor: "pointer",
  },
  content: {
    flex: 1,
    padding: "30px",
    overflow: "auto",
  },
};