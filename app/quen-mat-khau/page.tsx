"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Step = "email" | "code";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const emailParam = params.get("email");

    if (emailParam) {
      setEmail(emailParam);
    }
  }, []);

  async function sendCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    const response = await fetch("/api/auth/forgot-password-custom", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Không gửi được mã xác nhận.");
      setLoading(false);
      return;
    }

    setMessage(data.message);

    if (data.challengeToken) {
      setChallengeToken(data.challengeToken);
      setStep("code");
    }

    setLoading(false);
  }

  async function resetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    if (password.length < 6) {
      setError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu nhập lại không khớp.");
      setLoading(false);
      return;
    }

    const response = await fetch("/api/auth/reset-password-custom", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        challengeToken,
        code,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Không đổi được mật khẩu.");
      setLoading(false);
      return;
    }

    setMessage(data.message);
    setCode("");
    setPassword("");
    setConfirmPassword("");
    setLoading(false);
  }

  return (
    <main className="hmOtpPage">
      <section className="hmOtpCard">
        <Link href="/" className="hmOtpBrand">
          <b>HMECHA</b>
          <span>MEMBER CENTER</span>
        </Link>

        <p className="hmOtpEyebrow">PASSWORD RECOVERY</p>
        <h1>Quên mật khẩu</h1>

        <p className="hmOtpDesc">
          {step === "email"
            ? "Nhập email đã đăng ký. HMECHA sẽ gửi mã xác nhận 6 chữ số để bạn tạo mật khẩu mới."
            : "Nhập mã xác nhận trong email và tạo mật khẩu mới cho tài khoản của bạn."}
        </p>

        {message ? <div className="hmOtpSuccess">{message}</div> : null}
        {error ? <div className="hmOtpError">{error}</div> : null}

        {step === "email" ? (
          <form onSubmit={sendCode} className="hmOtpForm">
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
              {loading ? "Đang gửi..." : "Gửi mã xác nhận"}
            </button>
          </form>
        ) : (
          <form onSubmit={resetPassword} className="hmOtpForm">
            <label>
              Mã xác nhận 6 chữ số
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="Nhập 6 số"
                required
              />
            </label>

            <label>
              Mật khẩu mới
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                required
              />
            </label>

            <label>
              Nhập lại mật khẩu mới
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Nhập lại mật khẩu"
                required
              />
            </label>

            <button disabled={loading}>
              {loading ? "Đang đổi..." : "Xác nhận và đổi mật khẩu"}
            </button>

            <button
              type="button"
              className="hmOtpGhost"
              onClick={() => {
                setStep("email");
                setCode("");
                setPassword("");
                setConfirmPassword("");
                setMessage("");
                setError("");
              }}
            >
              Gửi lại mã khác
            </button>
          </form>
        )}

        <p className="hmOtpSwitch">
          Nhớ mật khẩu rồi? <Link href="/dang-nhap">Đăng nhập</Link>
        </p>
      </section>

      <style>{`
        .hmOtpPage {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 28px;
          background:
            radial-gradient(circle at 16% 12%, rgba(124,77,255,.3), transparent 34%),
            radial-gradient(circle at 82% 16%, rgba(0,229,255,.2), transparent 32%),
            linear-gradient(180deg, #050816 0%, #0b1026 100%);
          color: #ffffff;
        }

        .hmOtpCard {
          width: min(520px, 100%);
          box-sizing: border-box;
          padding: 38px;
          border-radius: 28px;
          background: rgba(11, 16, 38, .96);
          border: 1px solid rgba(0,229,255,.24);
          box-shadow: 0 28px 90px rgba(0,0,0,.45);
        }

        .hmOtpBrand {
          display: inline-flex;
          flex-direction: column;
          margin-bottom: 28px;
          text-decoration: none;
        }

        .hmOtpBrand b {
          color: #00e5ff;
          font-size: 27px;
          letter-spacing: 4px;
          font-weight: 950;
        }

        .hmOtpBrand span {
          margin-top: 6px;
          color: #9eadd3;
          font-size: 12px;
          font-weight: 850;
          letter-spacing: 1px;
        }

        .hmOtpEyebrow {
          margin: 0 0 12px;
          color: #00e5ff;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 2px;
        }

        .hmOtpCard h1 {
          margin: 0 0 12px;
          color: #ffffff;
          font-size: 38px;
          line-height: 1.1;
        }

        .hmOtpDesc {
          margin: 0 0 24px;
          color: #cbd5e1;
          font-size: 16px;
          line-height: 1.6;
        }

        .hmOtpSuccess,
        .hmOtpError {
          margin: 0 0 18px;
          padding: 14px 15px;
          border-radius: 14px;
          font-size: 14px;
          line-height: 1.55;
        }

        .hmOtpSuccess {
          color: #63f1ad;
          background: rgba(45,205,124,.12);
          border: 1px solid rgba(45,205,124,.28);
        }

        .hmOtpError {
          color: #ffb4c0;
          background: rgba(255,70,96,.13);
          border: 1px solid rgba(255,70,96,.3);
        }

        .hmOtpForm {
          display: grid;
          gap: 18px;
        }

        .hmOtpForm label {
          color: #e5edff;
          font-size: 14px;
          font-weight: 850;
        }

        .hmOtpForm input {
          display: block;
          width: 100%;
          box-sizing: border-box;
          margin-top: 8px;
          padding: 15px 16px;
          border: 1px solid rgba(255,255,255,.16);
          border-radius: 14px;
          outline: none;
          background: rgba(255,255,255,.075);
          color: #ffffff;
          font-size: 15px;
        }

        .hmOtpForm input:focus {
          border-color: #00e5ff;
          box-shadow: 0 0 0 3px rgba(0,229,255,.13);
        }

        .hmOtpForm button {
          margin-top: 8px;
          min-height: 54px;
          border: none;
          border-radius: 15px;
          background: linear-gradient(135deg,#7c4dff,#00e5ff);
          color: #050816;
          cursor: pointer;
          font-size: 16px;
          font-weight: 950;
          box-shadow: 0 18px 34px rgba(0,229,255,.18);
        }

        .hmOtpForm button:disabled {
          opacity: .65;
          cursor: not-allowed;
        }

        .hmOtpForm .hmOtpGhost {
          margin-top: 0;
          background: rgba(255,255,255,.08);
          color: #ffffff;
          border: 1px solid rgba(255,255,255,.14);
          box-shadow: none;
        }

        .hmOtpSwitch {
          margin: 24px 0 0;
          text-align: center;
          color: #cbd5e1;
        }

        .hmOtpSwitch a {
          color: #00e5ff;
          font-weight: 950;
          text-decoration: none;
        }
      `}</style>
    </main>
  );
}