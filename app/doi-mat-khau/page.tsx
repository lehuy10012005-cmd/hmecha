"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [ready, setReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function handleResetLink() {
      setChecking(true);
      setError("");

      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get("code");

        // Supabase PKCE link: /doi-mat-khau?code=...
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            setReady(false);
            setError("Link đổi mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng gửi lại yêu cầu quên mật khẩu.");
            setChecking(false);
            return;
          }

          if (data.session) {
            setReady(true);
            window.history.replaceState({}, document.title, "/doi-mat-khau");
            setChecking(false);
            return;
          }
        }

        // Supabase implicit link: /doi-mat-khau#access_token=...&refresh_token=...&type=recovery
        const hash = window.location.hash ? window.location.hash.replace(/^#/, "") : "";
        const hashParams = new URLSearchParams(hash);
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");

        if (accessToken && refreshToken && type === "recovery") {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            setReady(false);
            setError("Link đổi mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng gửi lại yêu cầu quên mật khẩu.");
            setChecking(false);
            return;
          }

          if (data.session) {
            setReady(true);
            window.history.replaceState({}, document.title, "/doi-mat-khau");
            setChecking(false);
            return;
          }
        }

        const { data } = await supabase.auth.getSession();
        setReady(Boolean(data.session));
        setChecking(false);
      } catch {
        setReady(false);
        setChecking(false);
      }
    }

    handleResetLink();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setReady(true);
      }

      setChecking(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    const { data } = await supabase.auth.getSession();
    const hasSession = Boolean(data.session) || ready;

    if (!hasSession) {
      setError(
        "Bạn cần mở trang này từ link đặt lại mật khẩu trong email. Link hiện tại chưa có token hợp lệ hoặc đã hết hạn."
      );
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

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(
        "Không đổi được mật khẩu. Link có thể đã hết hạn, vui lòng gửi lại yêu cầu quên mật khẩu."
      );
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();

    setMessage("Đổi mật khẩu thành công. Bạn có thể đăng nhập bằng mật khẩu mới.");
    setPassword("");
    setConfirmPassword("");
    setLoading(false);

    setTimeout(() => {
      router.replace("/dang-nhap");
    }, 1600);
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

        {checking ? (
          <div className="hmResetNotice">
            Đang kiểm tra link đặt lại mật khẩu...
          </div>
        ) : null}

        {!checking && !ready ? (
          <div className="hmResetNotice">
            Nếu bạn mở trang này trực tiếp, hệ thống sẽ không cho đổi mật khẩu.
            Hãy vào trang quên mật khẩu, nhập email rồi bấm link được gửi trong email.
          </div>
        ) : null}

        {!checking && ready ? (
          <div className="hmResetSuccess">
            Link hợp lệ. Bạn có thể nhập mật khẩu mới bên dưới.
          </div>
        ) : null}

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

          <button type="submit" disabled={loading || checking}>
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