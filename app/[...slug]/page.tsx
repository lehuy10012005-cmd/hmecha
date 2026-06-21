import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getProductBySlug,
  formatPrice,
} from "../../data/products";
import AddToCartButton from "../../components/AddToCartButton";
import { supabase } from "../../lib/supabase";
import ProductGallery from "../../components/ProductGallery";
import RelatedProducts from "../../components/RelatedProducts";
import ProductReviews from "../../components/ProductReviews";
import ProductEventTracker from "../../components/ProductEventTracker";
import ProductSideActions from "../../components/ProductSideActions";

function normalizeProductText(value: unknown) {
  return String(value || "").toLowerCase();
}

function detectProductLine(product: any) {
  const name = normalizeProductText(product?.name);
  const category = normalizeProductText(product?.category);
  const combined = name + " " + category;

  if (combined.includes("re/100") || combined.includes(" re ")) return "RE/100";
  if (combined.includes("mg ") || combined.includes("master grade")) return "MG - Master Grade";
  if (combined.includes("rg ") || combined.includes("real grade")) return "RG - Real Grade";
  if (combined.includes("hg ") || combined.includes("high grade") || combined.includes("hggq") || combined.includes("hguc")) return "HG - High Grade";
  if (combined.includes("sd ")) return "SD - Super Deformed";
  if (combined.includes("30mm")) return "30MM - 30 Minutes Missions";
  if (combined.includes("30ms")) return "30MS - 30 Minutes Sisters";
  if (combined.includes("30mf")) return "30MF - 30 Minutes Fantasy";
  if (combined.includes("metal build")) return "Metal Build";
  if (combined.includes("figure-rise")) return "Figure-rise Standard";

  return product?.category || "Mô hình lắp ráp / sưu tầm";
}

function detectScale(product: any) {
  const text = String(product?.name || "") + " " + String(product?.category || "");
  const scaleMatch = text.match(/1\/\d+/);

  if (scaleMatch) return scaleMatch[0];
  if (/mg|master grade/i.test(text)) return "1/100";
  if (/rg|hg|high grade|real grade|hggq|hguc/i.test(text)) return "1/144";
  if (/pg|perfect grade/i.test(text)) return "1/60";
  if (/sd/i.test(text)) return "SD scale";

  return "Theo từng dòng sản phẩm";
}

function getProductDescription(product: any) {
  const raw = String(product?.fullDescription || product?.shortDescription || "").trim();

  const badDescription =
    !raw ||
    /supabase|database|nhập từ danh sách trang chủ|dong bo database|đồng bộ database/i.test(raw);

  if (!badDescription) return raw;

  const name = product?.name || "Sản phẩm";
  const brand = product?.brand || "Bandai";
  const line = detectProductLine(product);
  const scale = detectScale(product);
  const status = product?.status || "Còn hàng";

  return `${name} là mẫu ${line} tỉ lệ ${scale}, phù hợp cho người chơi mô hình, người sưu tầm Gundam và các bạn yêu thích mecha. Sản phẩm thuộc thương hiệu ${brand}, tình trạng hiện tại: ${status}. Bộ kit phù hợp để lắp ráp, tạo dáng và trưng bày trên bàn làm việc, kệ sưu tầm hoặc góc decor cá nhân. HMECHA đóng gói sản phẩm cẩn thận trước khi giao và hỗ trợ kiểm tra đơn trước khi xử lý vận chuyển.`;
}

function getProductSpecs(product: any) {
  const dbSpecs = Array.isArray(product?.specs)
    ? product.specs.map((item: unknown) => String(item || "").trim()).filter(Boolean)
    : [];

  if (dbSpecs.length > 0) return dbSpecs;

  return [
    `Mã sản phẩm: ${product?.sku || "Đang cập nhật"}`,
    `Thương hiệu: ${product?.brand || "Bandai"}`,
    `Dòng sản phẩm: ${detectProductLine(product)}`,
    `Tỉ lệ/Kích thước: ${detectScale(product)}`,
    `Phân loại: ${product?.category || "Mô hình lắp ráp"}`,
    `Tình trạng: ${product?.status || "Còn hàng"}`,
    "Lắp ráp: dạng model kit, không cần keo dán cơ bản",
    "Phù hợp: sưu tầm, trưng bày, chụp ảnh mô hình và decor góc làm việc",
    "Dịch vụ HMECHA: đóng gói chống sốc và kiểm tra đơn trước khi giao",
  ];
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug?.[0];

  const { data: dbProduct } = await supabase
    .from("products")
    .select(`
      *,
      product_images (
        image_url,
        sort_order
      )
    `)
    .eq("slug", slug)
    .single();

  const localProduct = getProductBySlug(slug);

  const product = dbProduct
    ? {
        id: dbProduct.id,
        name: dbProduct.name,
        slug: dbProduct.slug,
        sku: dbProduct.sku,
        price: dbProduct.price,
        brand: dbProduct.brand,
        category: dbProduct.category,
        status: dbProduct.status,
        badge: dbProduct.badge,
        images:
          dbProduct.product_images
            ?.sort((a: any, b: any) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
            .map((image: any) => image.image_url) || [],
        shortDescription: dbProduct.short_description,
        fullDescription: dbProduct.full_description,
        specs: dbProduct.specs || [],
      }
    : localProduct;

  if (!product) {
    notFound();
  }

  const description = getProductDescription(product);
  const specs = getProductSpecs(product);
  const productImages = ((product.images || []) as string[]).map((image: string, index: number) => ({
    image_url: image,
    sort_order: index,
  }));

  return (
    <main className="productPage">
      <ProductEventTracker
        productId={product.id}
        productSlug={product.slug}
        productName={product.name}
        price={Number(product.price || 0)}
      />

      <div className="productContainer">
        <nav className="breadcrumb">
          <Link href="/">Trang chủ</Link>
          <span>›</span>
          <Link href="/products">Sản phẩm</Link>
          <span>›</span>
          <strong>{product.name}</strong>
        </nav>

        <section className="productHero">
          <div className="galleryCard">
            <ProductGallery productName={product.name} images={productImages} />
          </div>

          <div className="infoCard">
            <div className="topLine">
              {product.badge ? <span className="badge">{product.badge}</span> : null}
              <span className={product.status === "Hết hàng" ? "stock out" : "stock"}>
                {product.status || "Còn hàng"}
              </span>
            </div>

            <h1>{product.name}</h1>

            <div className="skuLine">
              <span>Mã: <b>{product.sku || "Đang cập nhật"}</b></span>
              <span>Thương hiệu: <b>{product.brand || "Bandai"}</b></span>
            </div>

            <div className="price">{formatPrice(Number(product.price || 0))}</div>

            <div className="quickInfo">
              <div>
                <b>Dòng sản phẩm</b>
                <span>{detectProductLine(product)}</span>
              </div>
              <div>
                <b>Tỉ lệ</b>
                <span>{detectScale(product)}</span>
              </div>
              <div>
                <b>Phân loại</b>
                <span>{product.category || "Mô hình"}</span>
              </div>
            </div>

            <div className="shortDesc">
              <p>{description}</p>
            </div>

            <AddToCartButton product={product} />
          </div>

          <aside className="sideCard">
            <div className="serviceBox">
              <h3>Ưu đãi khi mua hàng</h3>
              <ul>
                <li>Giảm 10.000đ cho đơn hàng bất kỳ.</li>
                <li>Freeship cho đơn hàng từ 1.000.000đ.</li>
                <li>Hỗ trợ khách quay lại bằng mã ưu đãi riêng.</li>
              </ul>
            </div>

            <div className="serviceBox">
              <h3>Cam kết HMECHA</h3>
              <ul>
                <li>Hàng chính hãng, mô tả rõ tình trạng.</li>
                <li>Đóng gói chống sốc trước khi giao.</li>
                <li>Hỗ trợ đổi nếu có lỗi từ nhà sản xuất.</li>
                <li>Tư vấn sản phẩm phù hợp cho người mới chơi.</li>
              </ul>
            </div>

            <ProductSideActions
              product={{
                id: product.id,
                name: product.name,
                slug: product.slug,
                sku: product.sku,
                price: product.price,
                image: product.images?.[0],
                images: product.images,
                status: product.status,
                brand: product.brand,
                category: product.category,
                badge: product.badge,
              }}
            />
          </aside>
        </section>

        <section className="descriptionCard">
          <div className="sectionHead">
            <span />
            <h2>Mô tả sản phẩm</h2>
          </div>

          <div className="descGrid">
            <article>
              <p>{description}</p>

              <h3>Hướng dẫn mua hàng</h3>
              <p>
                Chọn sản phẩm cần mua, bấm <b>Thêm vào giỏ</b> hoặc <b>Mua ngay</b>.
                Sau đó điền thông tin nhận hàng, số điện thoại và địa chỉ. HMECHA sẽ
                liên hệ xác nhận đơn trước khi giao.
              </p>
            </article>

            <aside>
              <h3>Thông tin sản phẩm</h3>
              <ul>
                {specs.map((spec: string) => (
                  <li key={spec}>{spec}</li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <ProductReviews
          productId={product.id}
          productSlug={product.slug}
          productName={product.name}
        />

        <RelatedProducts
          currentId={product.id}
          currentSlug={product.slug}
          category={product.category}
        />
      </div>

      <style>{`
        .productPage {
          min-height: 100vh;
          padding: 22px 18px 64px;
          background: #f3f6fb;
          color: #111827;
          font-family: Arial, "Helvetica Neue", sans-serif;
        }

        .productContainer {
          max-width: 1280px;
          margin: 0 auto;
        }

        .breadcrumb {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          font-size: 13px;
          color: #6b7280;
        }

        .breadcrumb a {
          color: #6b7280;
          text-decoration: none;
        }

        .breadcrumb a:hover,
        .breadcrumb strong {
          color: #d32f2f;
        }

        .productHero {
          display: grid;
          grid-template-columns: 0.98fr 1.18fr 0.82fr;
          gap: 18px;
          align-items: start;
        }

        .galleryCard,
        .infoCard,
        .sideCard,
        .descriptionCard {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
        }

        .galleryCard,
        .infoCard,
        .sideCard {
          padding: 18px;
        }

        .topLine {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .badge,
        .stock {
          display: inline-flex;
          align-items: center;
          min-height: 28px;
          padding: 0 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
        }

        .badge {
          background: #d32f2f;
          color: #ffffff;
        }

        .stock {
          background: #ecfdf3;
          color: #15803d;
        }

        .stock.out {
          background: #fff1f2;
          color: #be123c;
        }

        .infoCard h1 {
          margin: 0 0 12px;
          color: #111827;
          font-size: 30px;
          line-height: 1.18;
          font-weight: 900;
          letter-spacing: -0.4px;
        }

        .skuLine {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 18px;
          padding-bottom: 16px;
          border-bottom: 1px solid #eef0f3;
          color: #6b7280;
          font-size: 14px;
        }

        .skuLine b {
          color: #111827;
        }

        .price {
          margin: 18px 0;
          color: #ff5722;
          font-size: 34px;
          line-height: 1;
          font-weight: 950;
        }

        .quickInfo {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 16px;
        }

        .quickInfo div {
          padding: 12px;
          border: 1px solid #edf0f3;
          border-radius: 10px;
          background: #fafafa;
        }

        .quickInfo b {
          display: block;
          margin-bottom: 5px;
          color: #6b7280;
          font-size: 12px;
        }

        .quickInfo span {
          color: #111827;
          font-size: 13px;
          font-weight: 800;
          line-height: 1.35;
        }

        .shortDesc {
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid #ffe0b2;
          background: #fff8ed;
          color: #4b5563;
          line-height: 1.7;
          font-size: 14px;
        }

        .shortDesc p {
          margin: 0;
        }

        .sideCard {
          display: grid;
          gap: 14px;
        }

        .serviceBox {
          border: 1px solid #edf0f3;
          border-radius: 12px;
          overflow: hidden;
          background: #ffffff;
        }

        .serviceBox h3 {
          margin: 0;
          padding: 13px 15px;
          color: #ffffff;
          background: #d32f2f;
          font-size: 14px;
          font-weight: 900;
        }

        .serviceBox ul {
          margin: 0;
          padding: 14px 16px 14px 30px;
          color: #4b5563;
          font-size: 14px;
          line-height: 1.65;
        }

        .descriptionCard {
          margin-top: 20px;
          padding: 20px;
        }

        .sectionHead {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
        }

        .sectionHead span {
          width: 4px;
          height: 26px;
          border-radius: 99px;
          background: #d32f2f;
        }

        .sectionHead h2 {
          margin: 0;
          color: #111827;
          font-size: 22px;
          font-weight: 900;
        }

        .descGrid {
          display: grid;
          grid-template-columns: minmax(0, 1.25fr) minmax(300px, 0.75fr);
          gap: 22px;
        }

        .descGrid article,
        .descGrid aside {
          color: #374151;
          line-height: 1.8;
          font-size: 14px;
        }

        .descGrid h3 {
          margin: 18px 0 10px;
          color: #d32f2f;
          font-size: 17px;
          font-weight: 900;
        }

        .descGrid p {
          margin: 0 0 12px;
        }

        .descGrid aside {
          padding: 16px;
          border-radius: 12px;
          background: #fafafa;
          border: 1px solid #edf0f3;
        }

        .descGrid aside h3 {
          margin-top: 0;
        }

        .descGrid ul {
          margin: 0;
          padding-left: 18px;
        }

        .descGrid li {
          margin-bottom: 8px;
        }

        @media (max-width: 1120px) {
          .productHero {
            grid-template-columns: 1fr 1fr;
          }

          .sideCard {
            grid-column: 1 / -1;
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }

        @media (max-width: 820px) {
          .productHero,
          .descGrid,
          .sideCard {
            grid-template-columns: 1fr;
          }

          .infoCard h1 {
            font-size: 25px;
          }

          .price {
            font-size: 30px;
          }

          .quickInfo {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 520px) {
          .productPage {
            padding: 14px 10px 46px;
          }

          .galleryCard,
          .infoCard,
          .sideCard,
          .descriptionCard {
            border-radius: 12px;
          }

          .galleryCard,
          .infoCard,
          .sideCard,
          .descriptionCard {
            padding: 14px;
          }
        }
      `}</style>
    </main>
  );
}
