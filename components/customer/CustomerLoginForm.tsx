"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CustomerLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/tai-khoan";
  const [email, setEmail] = useState(""); const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  const confirmed = params.get("message") === "confirm-email";
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setLoading(true); setError("");
    const response = await fetch("/api/auth/customer-login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password, next }) });
    const result = await response.json();
    if (!response.ok) { setError(result.message || "Không đăng nhập được."); setLoading(false); return; }
    router.replace(result.redirectTo || next); router.refresh();
  }
  return <>
    {next === "/checkout" && <div className="notice">Bạn cần đăng nhập trước khi thanh toán. Giỏ hàng của bạn vẫn được giữ nguyên.</div>}
    {confirmed && <div className="success">Đăng ký thành công. Vui lòng xác nhận email rồi đăng nhập.</div>}
    {error && <div className="error">{error}</div>}
    <form onSubmit={submit} className="authForm">
      <label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com" required /></label>
      <label>Mật khẩu<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Nhập mật khẩu" required /></label>
      <button disabled={loading}>{loading ? "Đang đăng nhập..." : "Đăng nhập"}</button>
    </form>
    <p className="switch">Chưa có tài khoản? <Link href={`/dang-ky?next=${encodeURIComponent(next)}`}>Đăng ký ngay</Link></p>
  </>;
}
