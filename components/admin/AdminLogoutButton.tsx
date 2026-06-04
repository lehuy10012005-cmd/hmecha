"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminLogoutButton() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  async function handleLogout() {
    setSubmitting(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/admin-login");
    router.refresh();
  }

  return (
    <button className="logoutButton" type="button" onClick={handleLogout} disabled={submitting}>
      {submitting ? "Đang đăng xuất..." : "Đăng xuất"}
    </button>
  );
}
