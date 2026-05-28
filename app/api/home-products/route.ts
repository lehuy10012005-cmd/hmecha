import { NextResponse } from "next/server";
import { supabase } from "../../../lib/supabase";

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
      return NextResponse.json(
        { message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      products: data || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Không tải được sản phẩm trang chủ." },
      { status: 500 }
    );
  }
}