import { supabase } from "@/lib/supabase";
import { extractBudget, extractProductKeyword } from "./intent";

type Product = {
  id: string;
  sku: string | null;
  name: string;
  slug: string;
  price: number;
  brand: string | null;
  category: string | null;
  status: string | null;
  stock_quantity: number | null;
  badge?: string | null;
};

function formatPrice(price: number) {
  return Number(price || 0).toLocaleString("vi-VN") + "₫";
}

function normalizeText(value: string) {
  return value.toLowerCase().trim();
}

function analyzeProductQuestion(message: string) {
  const text = normalizeText(message);

  const isCheapest =
    text.includes("rẻ nhất") ||
    text.includes("re nhat") ||
    text.includes("giá thấp nhất") ||
    text.includes("gia thap nhat") ||
    text.includes("giá mềm nhất");

  const isMostExpensive =
    text.includes("đắt nhất") ||
    text.includes("dat nhat") ||
    text.includes("cao nhất") ||
    text.includes("gia cao nhat");

  const onlyInStock =
    text.includes("còn hàng") ||
    text.includes("co hang") ||
    text.includes("hàng sẵn") ||
    text.includes("hang san") ||
    text.includes("có sẵn") ||
    text.includes("co san");

  const isSale =
    text.includes("sale") ||
    text.includes("giảm giá") ||
    text.includes("giam gia") ||
    text.includes("khuyến mãi") ||
    text.includes("khuyen mai");

  const isNewest =
    text.includes("mới nhất") ||
    text.includes("moi nhat") ||
    text.includes("hàng mới") ||
    text.includes("hang moi");

  let keyword = extractProductKeyword(message);

  const importantWords = [
    "hg",
    "rg",
    "mg",
    "pg",
    "sd",
    "bandai",
    "metal build",
    "gundam",
    "gunpla",
    "rx",
    "zaku",
    "30mm",
    "30mf",
    "30ms",
    "30mp",
    "pokemon",
    "card",
    "tcg",
  ];

  for (const word of importantWords) {
    if (text.includes(word) && !keyword.includes(word)) {
      keyword = `${keyword} ${word}`.trim();
    }
  }

  return {
    keyword,
    budget: extractBudget(message),
    isCheapest,
    isMostExpensive,
    onlyInStock,
    isSale,
    isNewest,
  };
}

function buildKeywordOr(keyword: string) {
  const tokens = keyword
    .split(/\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 2)
    .slice(0, 5);

  const fields = ["name", "brand", "category", "sku", "slug"];

  return tokens
    .flatMap((token) => fields.map((field) => `${field}.ilike.%${token}%`))
    .join(",");
}

async function runProductQuery(
  options: ReturnType<typeof analyzeProductQuestion>,
  useKeyword: boolean
) {
  let query = supabase
    .from("products")
    .select(
      `
      id,
      sku,
      name,
      slug,
      price,
      brand,
      category,
      status,
      stock_quantity,
      badge
    `
    )
    .eq("is_active", true)
    .limit(8);

  if (options.onlyInStock) {
    query = query.gt("stock_quantity", 0);
  }

  if (options.budget?.type === "max") {
    query = query.lte("price", options.budget.value);
  }

  if (options.budget?.type === "min") {
    query = query.gte("price", options.budget.value);
  }

  if (options.isSale) {
    query = query.or(
      "badge.ilike.%sale%,status.ilike.%sale%,category.ilike.%sale%,name.ilike.%sale%"
    );
  }

  if (useKeyword && options.keyword) {
    const keywordOr = buildKeywordOr(options.keyword);
    if (keywordOr) query = query.or(keywordOr);
  }

  if (options.isCheapest) {
    query = query.order("price", { ascending: true });
  } else if (options.isMostExpensive) {
    query = query.order("price", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  return query;
}

function getIntroText(options: ReturnType<typeof analyzeProductQuestion>) {
  if (options.isCheapest) {
    return "Mình tìm thấy vài sản phẩm giá mềm nhất hiện tại:";
  }

  if (options.isMostExpensive) {
    return "Mình tìm thấy vài sản phẩm giá cao nhất hiện tại:";
  }

  if (options.isSale) {
    return "Mình tìm thấy vài sản phẩm đang có liên quan đến sale/khuyến mãi:";
  }

  if (options.onlyInStock && options.keyword) {
    return `Mình tìm thấy vài sản phẩm liên quan “${options.keyword}” đang còn hàng:`;
  }

  if (options.onlyInStock) {
    return "Mình tìm thấy vài sản phẩm đang còn hàng:";
  }

  if (options.budget) {
    return `Mình tìm thấy vài sản phẩm ${
      options.budget.type === "max" ? "dưới" : "trên"
    } ${formatPrice(options.budget.value)}:`;
  }

  if (options.keyword) {
    return `Mình tìm thấy vài sản phẩm phù hợp với “${options.keyword}”:`;
  }

  return "Mình tìm thấy vài sản phẩm gợi ý cho bạn:";
}

function formatProductList(products: Product[]) {
  return products
    .slice(0, 5)
    .map((product, index) => {
      const stock = Number(product.stock_quantity || 0);
      const stockText =
        stock > 0 ? `còn ${stock} sản phẩm` : product.status || "đang cập nhật";

      return `${index + 1}. ${product.name} - ${formatPrice(
        product.price
      )} (${stockText})\n   Xem: /${product.slug}`;
    })
    .join("\n");
}

export async function searchProductsForChat(message: string) {
  const options = analyzeProductQuestion(message);

  const { data, error } = await runProductQuery(options, true);

  if (error) {
    console.error("Chatbot product search error:", error);
    return "Mình đang bị lỗi kết nối dữ liệu sản phẩm. Bạn thử hỏi lại sau nhé.";
  }

  let products = (data || []) as Product[];

  if (products.length === 0 && options.keyword) {
    const fallback = await runProductQuery(
      {
        ...options,
        keyword: "",
      },
      false
    );

    if (!fallback.error) {
      products = (fallback.data || []) as Product[];
    }
  }

  if (products.length === 0) {
    return "Mình chưa tìm thấy sản phẩm phù hợp. Bạn thử hỏi theo tên model như RX-78, Char Zaku, dòng HG/RG/MG hoặc khoảng giá như dưới 500k nhé.";
  }

  const intro = getIntroText(options);
  const list = formatProductList(products);

  const footer = options.keyword
    ? "\n\nBạn muốn mình lọc thêm theo giá, dòng HG/RG/MG hoặc tình trạng còn hàng không?"
    : "\n\nBạn muốn mình lọc theo dòng HG/RG/MG, Bandai, Metal Build hoặc khoảng giá nào không?";

  return `${intro}\n${list}${footer}`;
}