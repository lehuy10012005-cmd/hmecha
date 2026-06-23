import Link from "next/link";

export default function ResetPasswordInfoPage() {
  return (
    <main className="hmInfoPage">
      <section className="hmInfoCard">
        <b>HMECHA</b>
        <h1>Đổi mật khẩu</h1>
        <p>
          Chức năng đổi mật khẩu hiện sử dụng mã xác nhận 6 chữ số gửi qua email.
          Vui lòng vào trang quên mật khẩu để nhận mã xác nhận.
        </p>
        <Link href="/quen-mat-khau">Đến trang quên mật khẩu</Link>
      </section>

      <style>{`
        .hmInfoPage {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 28px;
          background: #050816;
          color: #ffffff;
        }

        .hmInfoCard {
          width: min(520px, 100%);
          padding: 38px;
          border-radius: 24px;
          background: rgba(11, 16, 38, .96);
          border: 1px solid rgba(0,229,255,.24);
          text-align: center;
        }

        .hmInfoCard b {
          color: #00e5ff;
          letter-spacing: 3px;
          font-size: 24px;
        }

        .hmInfoCard h1 {
          margin: 20px 0 12px;
          font-size: 36px;
        }

        .hmInfoCard p {
          color: #cbd5e1;
          line-height: 1.6;
        }

        .hmInfoCard a {
          display: inline-flex;
          margin-top: 18px;
          padding: 14px 18px;
          border-radius: 14px;
          background: linear-gradient(135deg,#7c4dff,#00e5ff);
          color: #050816;
          text-decoration: none;
          font-weight: 950;
        }
      `}</style>
    </main>
  );
}