import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createAuthServerClient } from "../../lib/supabase-auth/server";
export const dynamic = "force-dynamic";
export default async function CheckoutLayout({ children }: { children: ReactNode }) {
  const supabase = await createAuthServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/dang-nhap?next=/checkout");
  return children;
}
