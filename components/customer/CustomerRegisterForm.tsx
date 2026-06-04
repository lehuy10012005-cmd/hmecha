"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CustomerRegisterForm() {
  const router = useRouter(); const params = useSearchParams(); const next = params.get("next") || "/tai-khoan";
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  function update(field: keyof typeof form, value: string) { setForm(current => ({ ...current, [field]: value })); }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    if (form.password !== form.confirm) { setError("Mật khẩu nhập lại chưa trùng khớp."); return; }
    setLoading(true);
    const response = await fetch("/api/auth/customer-register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fullName: form.fullName, phone: form.phone, email: form.email, password: form.password, next }) });
    const result = await response.json();
    if (!response.ok) { setError(result.message || "Không đăng ký được."); setLoading(false); return; }
    if (result.requiresConfirmation) { router.replace(`/dang-nhap?message=confirm-email&next=${encodeURIComponent(next)}`); return; }
    router.replace(result.redirectTo || next); router.refresh();
  }
  return <>
    {error && <div className="error">{error}</div>}
    <form onSubmit={submit} className="authForm">
      <label>Họ và tên<input value={form.fullName} onChange={e => update("fullName", e.target.value)} required /></label>
      <label>Số điện thoại<input value={form.phone} onChange={e => update("phone", e.target.value)} required /></label>
      <label>Email<input type="email" value={form.email} onChange={e => update("email", e.target.value)} required /></label>
      <label>Mật khẩu<input type="password" value={form.password} onChange={e => update("password", e.target.value)} minLength={6} required /></label>
      <label>Nhập lại mật khẩu<input type="password" value={form.confirm} onChange={e => update("confirm", e.target.value)} minLength={6} required /></label>
      <button disabled={loading}>{loading ? "Đang tạo tài khoản..." : "Đăng ký tài khoản"}</button>
    </form>
    <p className="switch">Đã có tài khoản? <Link href={`/dang-nhap?next=${encodeURIComponent(next)}`}>Đăng nhập</Link></p>
  </>;
}
