"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            background: "#050816",
            color: "#ffffff",
            fontWeight: 800,
          }}
        >
          Đang tải trang đổi mật khẩu...
        </main>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const router = useRouter();
  const params = useSearchParams();

  const token = params.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    if (!token) {
      setError("Link đổi mật khẩu không hợp lệ. Vui lòng gửi lại yêu cầu quên mật khẩu.");
      setLoading(false);
      return;
    }

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
        token,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Không đổi được mật khẩu.");
      setLoading(false);
      return;
    }

    setMessage(data.message || "Đổi mật khẩu thành công.");
    setPassword("");
    setConfirmPassword("");
    setLoading(false);

    setTimeout(() => {
      router.replace("/dang-nhap");
    }, 1700);
  }

  return (
    <main className="hmResetPage">
      <section className="hmResetCard">
        <Link href="/" className="hmResetBrand">
          <b>HMECHA</b>
          <span>MEMBER CENTER</span>
        </Link>

        <p className="hmResetEyebrow">RESET PASSWORD</p>
        <h1>Đổi mật khẩu mới</h1>

        <p className="hmResetDesc">
          Nhập mật khẩu mới cho tài khoản HMECHA của bạn.
        </p>

        {!token ? (
          <div className="hmResetNotice">
            Link đổi mật khẩu không hợp lệ. Hãy vào trang quên mật khẩu và gửi lại email mới.
          </div>
        ) : (
          <div className="hmResetSuccess">
            Link hợp lệ. Bạn có thể nhập mật khẩu mới bên dưới.
          </div>
        )}

        {message ? <div className="hmResetSuccess">{message}</div> : null}
        {error ? <div className="hmResetError">{error}</div> : null}

        <form onSubmit={submit} className="hmResetForm">
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

          <button type="submit" disabled={loading}>
            {loading ? "Đang đổi..." : "Đổi mật khẩu"}
          </button>
        </form>

        <div className="hmResetLinks">
          <Link href="/quen-mat-khau">Gửi lại link quên mật khẩu</Link>
          <Link href="/dang-nhap">Quay lại đăng nhập</Link>
        </div>
      </section>

      <style>{`
        .hmResetPage {
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

        .hmResetCard {
          width: min(520px, 100%);
          box-sizing: border-box;
          padding: 38px;
          border-radius: 28px;
          background: rgba(11, 16, 38, .96);
          border: 1px solid rgba(0,229,255,.24);
          box-shadow: 0 28px 90px rgba(0,0,0,.45);
        }

        .hmResetBrand {
          display: inline-flex;
          flex-direction: column;
          margin-bottom: 28px;
          text-decoration: none;
        }

        .hmResetBrand b {
          color: #00e5ff;
          font-size: 27px;
          letter-spacing: 4px;
          font-weight: 950;
        }

        .hmResetBrand span {
          margin-top: 6px;
          color: #9eadd3;
          font-size: 12px;
          font-weight: 850;
          letter-spacing: 1px;
        }

        .hmResetEyebrow {
          margin: 0 0 12px;
          color: #00e5ff;
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 2px;
        }

        .hmResetCard h1 {
          margin: 0 0 12px;
          color: #ffffff;
          font-size: 38px;
          line-height: 1.1;
        }

        .hmResetDesc {
          margin: 0 0 24px;
          color: #cbd5e1;
          font-size: 16px;
          line-height: 1.6;
        }

        .hmResetNotice,
        .hmResetSuccess,
        .hmResetError {
          margin: 0 0 18px;
          padding: 14px 15px;
          border-radius: 14px;
          font-size: 14px;
          line-height: 1.55;
        }

        .hmResetNotice {
          color: #9eeeff;
          background: rgba(0,229,255,.1);
          border: 1px solid rgba(0,229,255,.28);
        }

        .hmResetSuccess {
          color: #63f1ad;
          background: rgba(45,205,124,.12);
          border: 1px solid rgba(45,205,124,.28);
        }

        .hmResetError {
          color: #ffb4c0;
          background: rgba(255,70,96,.13);
          border: 1px solid rgba(255,70,96,.3);
        }

        .hmResetForm {
          display: grid;
          gap: 18px;
        }

        .hmResetForm label {
          color: #e5edff;
          font-size: 14px;
          font-weight: 850;
        }

        .hmResetForm input {
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

        .hmResetForm input:focus {
          border-color: #00e5ff;
          box-shadow: 0 0 0 3px rgba(0,229,255,.13);
        }

        .hmResetForm button {
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

        .hmResetForm button:disabled {
          opacity: .65;
          cursor: not-allowed;
        }

        .hmResetLinks {
          margin-top: 24px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .hmResetLinks a {
          color: #00e5ff;
          font-size: 14px;
          font-weight: 850;
          text-decoration: none;
        }

        .hmResetLinks a:hover {
          text-decoration: underline;
        }
      `}</style>
    </main>
  );
}