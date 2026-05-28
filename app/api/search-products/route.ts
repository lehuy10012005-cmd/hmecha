import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  price: number | null;
  brand: string | null;
  category: string | null;
  status: string | null;
  stock_quantity: number | null;
};

type ProductImageRow = {
  product_id: string;
  image_url: string;
  sort_order: number | null;
};

function formatPrice(price: number) {
  return Number(price || 0).toLocaleString("vi-VN") + "₫";
}

function cleanKeyword(value: string) {
  return String(value || "")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const q = cleanKeyword(searchParams.get("q") || "");
    const limit = Math.min(Number(searchParams.get("limit") || 8), 12);

    let productQuery = supabase
      .from("products")
      .select(
        `
        id,
        name,
        slug,
        sku,
        price,
        brand,
        category,
        status,
        stock_quantity
      `
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (q) {
      productQuery = productQuery.or(
        [
          `name.ilike.%${q}%`,
          `slug.ilike.%${q}%`,
          `sku.ilike.%${q}%`,
          `brand.ilike.%${q}%`,
          `category.ilike.%${q}%`,
        ].join(",")
      );
    }

    const { data: productsData, error: productsError } = await productQuery;

    if (productsError) {
      console.error("Search products error:", productsError);

      return NextResponse.json(
        {
          products: [],
          message: productsError.message,
        },
        { status: 500 }
      );
    }

    const products = (productsData || []) as ProductRow[];
    const productIds = products.map((item) => item.id);

    let imagesByProductId: Record<string, string> = {};

    if (productIds.length > 0) {
      const { data: imagesData, error: imagesError } = await supabase
        .from("product_images")
        .select("product_id, image_url, sort_order")
        .in("product_id", productIds)
        .order("sort_order", { ascending: true });

      if (!imagesError && imagesData) {
        for (const image of imagesData as ProductImageRow[]) {
          if (!imagesByProductId[image.product_id]) {
            imagesByProductId[image.product_id] = image.image_url;
          }
        }
      }
    }

    const result = products.map((product) => {
      const stock = Number(product.stock_quantity || 0);

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        url: `/${product.slug}`,
        sku: product.sku,
        price: Number(product.price || 0),
        price_text: formatPrice(Number(product.price || 0)),
        brand: product.brand,
        category: product.category,
        status: product.status || (stock > 0 ? "Còn hàng" : "Đang cập nhật"),
        stock_quantity: stock,
        image: imagesByProductId[product.id] || "/favicon.ico",
      };
    });

    return NextResponse.json({
      query: q,
      products: result,
    });
  } catch (error: any) {
    console.error("Search API fatal error:", error);

    return NextResponse.json(
      {
        products: [],
        message: error?.message || "Không tìm kiếm được sản phẩm.",
      },
      { status: 500 }
    );
  }
}