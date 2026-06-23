"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Vui lòng nhập email đã đăng ký.");
      setLoading(false);
      return;
    }

    const redirectTo = `${window.location.origin}/doi-mat-khau`;

    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo,
    });

    if (error) {
      setError("Không gửi được email đặt lại mật khẩu. Vui lòng thử lại.");
      setLoading(false);
      return;
    }

    setMessage(
      "Nếu email này đã đăng ký tài khoản HMECHA, hệ thống sẽ gửi link đặt lại mật khẩu. Vui lòng kiểm tra hộp thư hoặc spam."
    );
    setLoading(false);
  }

  return (
    <main className="authPage">
      <section className="card">
        <Link href="/" className="brand">
          <b>HMECHA</b>
          <span>MEMBER CENTER</span>
        </Link>

        <p className="eyebrow">PASSWORD RECOVERY</p>
        <h1>Quên mật khẩu</h1>

        <p className="description">
          Nhập email đã đăng ký tài khoản. HMECHA sẽ gửi link để bạn tạo mật
          khẩu mới.
        </p>

        {message ? <div className="success">{message}</div> : null}
        {error ? <div className="error">{error}</div> : null}

        <form onSubmit={submit} className="authForm">
          <label>
            Email tài khoản
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="email@example.com"
              required
            />
          </label>

          <button disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi link đặt lại mật khẩu"}
          </button>
        </form>

        <p className="switch">
          Nhớ mật khẩu rồi? <Link href="/dang-nhap">Đăng nhập</Link>
        </p>
      </section>

      <style>{`
        .authPage {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 24px;
          color: #fff;
          background:
            radial-gradient(circle at 16% 12%, rgba(124,77,255,.28), transparent 34%),
            radial-gradient(circle at 82% 16%, rgba(0,229,255,.18), transparent 32%),
            #050816;
        }

        .card {
          width: min(485px, 100%);
          box-sizing: border-box;
          padding: 36px;
          border-radius: 27px;
          background: rgba(15,20,42,.94);
          border: 1px solid rgba(0,229,255,.2);
          box-shadow: 0 28px 80px rgba(0,0,0,.38);
        }

        .brand {
          display: inline-flex;
          flex-direction: column;
          margin-bottom: 30px;
          text-decoration: none;
        }

        .brand b {
          color: #00e5ff;
          font-size: 24px;
          letter-spacing: 3px;
        }

        .brand span {
          color: #9eadd3;
          margin-top: 5px;
          font-size: 12px;
          font-weight: 800;
        }

        .eyebrow {
          margin: 0 0 12px;
          color: #00e5ff;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 1.8px;
        }

        h1 {
          margin: 0 0 11px;
          font-size: 38px;
        }

        .description {
          margin: 0 0 25px;
          color: #aab9dd;
          line-height: 1.65;
        }

        .success,
        .error {
          margin: 0 0 18px;
          padding: 13px 15px;
          border-radius: 12px;
          font-size: 14px;
          line-height: 1.5;
        }

        .success {
          color: #63f1ad;
          background: rgba(45,205,124,.12);
          border: 1px solid rgba(45,205,124,.26);
        }

        .error {
          color: #ff9bab;
          background: rgba(255,70,96,.12);
          border: 1px solid rgba(255,70,96,.27);
        }

        .authForm {
          display: grid;
          gap: 17px;
        }

        .authForm label {
          color: #dce6ff;
          font-size: 14px;
          font-weight: 800;
        }

        .authForm input {
          display: block;
          width: 100%;
          box-sizing: border-box;
          margin-top: 8px;
          padding: 15px 16px;
          border: 1px solid rgba(255,255,255,.15);
          border-radius: 13px;
          outline: none;
          background: rgba(255,255,255,.065);
          color: #fff;
          font-size: 15px;
        }

        .authForm input:focus {
          border-color: #00e5ff;
        }

        .authForm button {
          margin-top: 8px;
          padding: 16px;
          border: none;
          border-radius: 14px;
          background: linear-gradient(135deg,#7c4dff,#00e5ff);
          color: #050816;
          cursor: pointer;
          font-size: 16px;
          font-weight: 950;
        }

        .authForm button:disabled {
          opacity: .65;
        }

        .switch {
          margin: 25px 0 0;
          text-align: center;
          color: #9eadd3;
        }

        .switch a {
          color: #00e5ff;
          font-weight: 850;
          text-decoration: none;
        }
      `}</style>
    </main>
  );
}