import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import CustomerLogoutButton from "../../components/customer/CustomerLogoutButton";
import { createAuthServerClient } from "../../lib/supabase-auth/server";
export const dynamic = "force-dynamic";
export default async function CustomerAccountLayout({ children }: { children: ReactNode }) {
  const supabase = await createAuthServerClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/dang-nhap?next=/tai-khoan");
  return <main className="shell"><aside><Link className="brand" href="/">HMECHA</Link><p>Tài khoản của tôi</p><nav><Link href="/tai-khoan">Tổng quan</Link><Link href="/tai-khoan/don-hang">Đơn hàng của tôi</Link><span>Thẻ tích điểm — sắp có</span><span>Voucher — sắp có</span><span>Yêu thích — sắp có</span></nav><CustomerLogoutButton /></aside><section className="content">{children}</section><style>{`
    .shell{min-height:100vh;display:grid;grid-template-columns:270px 1fr;color:#fff;background:#050816}aside{padding:30px 19px;border-right:1px solid rgba(0,229,255,.17);background:#080d21}.brand{display:block;color:#00e5ff;font-size:24px;font-weight:950;letter-spacing:3px;text-decoration:none}aside p{color:#aab9dd;margin:8px 0 29px}nav{display:grid;gap:10px}nav a,nav span{padding:14px;border-radius:13px;color:#dce6ff;background:rgba(255,255,255,.045);text-decoration:none;font-weight:800}nav a:hover{color:#071020;background:linear-gradient(135deg,#7c4dff,#00e5ff)}nav span{color:#7281a7}.customerLogout{width:100%;margin-top:32px;padding:14px;border:1px solid rgba(255,90,110,.26);border-radius:13px;color:#ff9eac;background:rgba(255,90,110,.08);font-weight:850;cursor:pointer}.content{padding:44px min(5vw,58px)}@media(max-width:780px){.shell{grid-template-columns:1fr}aside{border-right:none;border-bottom:1px solid rgba(0,229,255,.17)}}
  `}</style></main>;
}
