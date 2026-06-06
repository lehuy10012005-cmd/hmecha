import { NextResponse } from "next/server";
import { createAuthServerClient } from "../../../../lib/supabase-auth/server";
import { supabaseAdmin } from "../../../../lib/supabase-admin";

export const dynamic = "force-dynamic";

async function getAdminUser() {
  const supabase = await createAuthServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (!user || !adminEmail || user.email?.trim().toLowerCase() !== adminEmail) {
    return null;
  }

  return user;
}

export async function GET() {
  const admin = await getAdminUser();

  if (!admin) {
    return NextResponse.json({ error: "Unauthorized", reviews: [] }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("product_reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { error: error.message, reviews: [] },
      { status: 500 }
    );
  }

  return NextResponse.json({ reviews: data || [] });
}