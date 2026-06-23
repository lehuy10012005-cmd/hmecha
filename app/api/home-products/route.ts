import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function noStoreJson(body: any, init?: ResponseInit) {
  const response = NextResponse.json(body, init);

  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        slug,
        sku,
        price,
        brand,
        category,
        status,
        stock_quantity,
        badge,
        is_active,
        created_at,
        product_images (
          image_url,
          sort_order
        )
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      return noStoreJson(
        { message: error.message },
        { status: 500 }
      );
    }

    return noStoreJson({
      products: data || [],
    });
  } catch (error: any) {
    return noStoreJson(
      { message: error?.message || "Không tải được sản phẩm trang chủ." },
      { status: 500 }
    );
  }
}