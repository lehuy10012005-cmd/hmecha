import Link from "next/link";
import AdminLoginForm from "../../components/admin/AdminLoginForm";

export default function AdminLoginPage() {
  return (
    <main className="adminLoginPage">
      <section className="loginCard">
        <Link href="/" className="brand">
          <div className="logo">H</div>
          <div>
            <p>HMECHA</p>
            <span>Admin Control Center</span>
          </div>
        </Link>

        <div className="heading">
          <p className="eyebrow">ADMIN ACCESS</p>
          <h1>Đăng nhập quản trị</h1>
          <span>Quản lý doanh thu, sản phẩm và đơn hàng của HMecha.</span>
        </div>

        <AdminLoginForm />

        <Link href="/" className="backLink">← Quay lại website</Link>
      </section>

      <style>{`
        .adminLoginPage { min-height:100vh; display:grid; place-items:center; padding:24px; color:#fff; background:radial-gradient(circle at 20% 10%,rgba(124,77,255,.23),transparent 35%),radial-gradient(circle at 85% 15%,rgba(0,229,255,.16),transparent 31%),#070b19; }
        .loginCard { width:min(460px,100%); padding:34px; border-radius:26px; background:rgba(16,21,43,.94); border:1px solid rgba(0,229,255,.18); box-shadow:0 28px 80px rgba(0,0,0,.38); }
        .brand { display:flex; align-items:center; gap:13px; margin-bottom:34px; text-decoration:none; }
        .logo { width:48px; height:48px; display:grid; place-items:center; border-radius:14px; color:#061120; font-size:27px; font-weight:950; background:linear-gradient(135deg,#7c4dff,#00e5ff); }
        .brand p { margin:0 0 3px; color:#00e5ff; font-size:16px; font-weight:950; letter-spacing:1.5px; }
        .brand span { color:#a9b8dd; font-size:13px; }
        .heading .eyebrow { margin:0 0 11px; color:#00e5ff; font-size:12px; font-weight:950; letter-spacing:1.7px; }
        .heading h1 { margin:0 0 10px; font-size:31px; }
        .heading span { color:#a9b8dd; font-size:14px; line-height:1.6; }
        .error { margin-top:22px; padding:13px 15px; border-radius:12px; color:#ff9eac; font-size:14px; font-weight:700; background:rgba(255,79,104,.12); border:1px solid rgba(255,79,104,.26); }
        .loginForm { display:grid; gap:18px; margin-top:29px; }
        .loginForm label { color:#dfe7fc; font-size:14px; font-weight:750; }
        .loginForm input { width:100%; box-sizing:border-box; margin-top:9px; padding:15px 16px; border-radius:13px; border:1px solid rgba(255,255,255,.14); outline:none; color:#fff; font-size:15px; background:rgba(255,255,255,.055); }
        .loginForm input:focus { border-color:rgba(0,229,255,.6); box-shadow:0 0 0 3px rgba(0,229,255,.1); }
        .loginForm button { margin-top:7px; padding:16px; border:0; border-radius:13px; color:#071020; font-size:15px; font-weight:950; cursor:pointer; background:linear-gradient(135deg,#7c4dff,#00e5ff); }
        .loginForm button:disabled { opacity:.65; cursor:wait; }
        .backLink { display:block; margin-top:26px; color:#98abd6; font-size:14px; text-align:center; text-decoration:none; }
        .backLink:hover { color:#00e5ff; }
      `}</style>
    </main>
  );
}
