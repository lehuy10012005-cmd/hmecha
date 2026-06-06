import { NextRequest, NextResponse } from "next/server";
import { createAuthServerClient } from "../../../lib/supabase-auth/server";
import { supabaseAdmin } from "../../../lib/supabase-admin";

export const dynamic = "force-dynamic";

const allowedEvents = new Set([
  "product_view",
  "add_to_cart",
  "buy_now",
  "quick_view",
  "product_click",
]);

export async function POST(request: NextRequest) {
  const supabase = await createAuthServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const body = await request.json();

  const productSlug = String(body.productSlug || "").trim();
  const productId = String(body.productId || "").trim();
  const productName = String(body.productName || "").trim();
  const eventType = String(body.eventType || "").trim();
  const sessionId = String(body.sessionId || "").trim();
  const source = String(body.source || "website").trim();
  const price = Number(body.price || 0);
  const quantity = Number(body.quantity || 1);
  const metadata = body.metadata || {};

  if (!productSlug) {
    return NextResponse.json(
      { error: "Missing productSlug" },
      { status: 400 }
    );
  }

  if (!allowedEvents.has(eventType)) {
    return NextResponse.json(
      { error: "Invalid eventType" },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("product_events")
    .insert({
      product_id: productId,
      product_slug: productSlug,
      product_name: productName,
      event_type: eventType,
      user_id: user?.id || null,
      session_id: sessionId || null,
      price,
      quantity,
      source,
      metadata,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ event: data });
}