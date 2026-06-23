"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function CustomerLoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/tai-khoan";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const confirmed = params.get("message") === "confirm-email";
  const forgotHref = `/quen-mat-khau${email.trim() ? `?email=${encodeURIComponent(email.trim())}` : ""}`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const response = await fetch("/api/auth/customer-login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        next,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setError(
        result.message ||
          "Email hoặc mật khẩu không đúng. Nếu bạn quên mật khẩu, hãy bấm Quên mật khẩu để đặt lại."
      );
      setLoading(false);
      return;
    }

    router.replace(result.redirectTo || next);
    router.refresh();
  }

  return (
    <>
      {next === "/checkout" ? (
        <div className="notice">
          Bạn cần đăng nhập trước khi thanh toán. Giỏ hàng của bạn vẫn được giữ nguyên.
        </div>
      ) : null}

      {confirmed ? (
        <div className="success">
          Đăng ký thành công. Vui lòng xác nhận email rồi đăng nhập.
        </div>
      ) : null}

      {error ? (
        <div className="error">
          <p style={{ margin: 0 }}>{error}</p>
          <Link
            href={forgotHref}
            style={{
              display: "inline-block",
              marginTop: 10,
              color: "#e11d48",
              fontWeight: 950,
              textDecoration: "underline",
            }}
          >
            Quên mật khẩu? Đặt lại tại đây
          </Link>
        </div>
      ) : null}

      <form onSubmit={submit} className="authForm">
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="email@example.com"
            required
          />
        </label>

        <label>
          Mật khẩu
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Nhập mật khẩu"
            required
          />
        </label>

        <div style={{ marginTop: -8, textAlign: "right" }}>
          <Link
            href={forgotHref}
            style={{
              color: "#00e5ff",
              fontWeight: 950,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            Quên mật khẩu?
          </Link>
        </div>

        <button disabled={loading}>
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>

      <p className="switch">
        Chưa có tài khoản?{" "}
        <Link href={`/dang-ky?next=${encodeURIComponent(next)}`}>
          Đăng ký ngay
        </Link>
      </p>
    </>
  );
}