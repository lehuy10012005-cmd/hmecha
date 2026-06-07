import { NextResponse } from "next/server";
import { createAuthServerClient } from "../../../lib/supabase-auth/server";
import { supabaseAdmin } from "../../../lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await createAuthServerClient();

  const {
    data: { user },
  } = await auth.auth.getUser();

  let query = supabaseAdmin
    .from("coupons")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (user) {
    query = query.or(`assigned_user_id.is.null,assigned_user_id.eq.${user.id}`);
  } else {
    query = query.is("assigned_user_id", null);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ message: error.message, coupons: [] }, { status: 500 });
  }

  return NextResponse.json({ coupons: data || [] });
}
