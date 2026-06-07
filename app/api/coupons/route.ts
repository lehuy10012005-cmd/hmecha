import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("coupons")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: error.message, coupons: [] },
      { status: 500 }
    );
  }

  return NextResponse.json({ coupons: data || [] });
}