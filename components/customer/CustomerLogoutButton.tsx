"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function CustomerLogoutButton() {
  const router = useRouter(); const [loading, setLoading] = useState(false);
  async function logout() { setLoading(true); await fetch("/api/auth/customer-logout", { method: "POST" }); router.replace("/"); router.refresh(); }
  return <button className="customerLogout" type="button" onClick={logout} disabled={loading}>{loading ? "Đang đăng xuất..." : "Đăng xuất"}</button>;
}
