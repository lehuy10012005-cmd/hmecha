import { notFound } from "next/navigation";
import Link from "next/link";
import {
  products as localProducts,
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
          ?.sort((a: any, b: any) => a.sort_order - b.sort_order)
          .map((image: any) => image.image_url) || [],
      shortDescription: dbProduct.short_description,
      fullDescription: dbProduct.full_description,
      specs: dbProduct.specs || [],
    }
  : localProduct;

 if (!product) {
  notFound();
}

 return (
  <main className="page">
    <ProductEventTracker
      productId={product.id}
      productSlug={product.slug}
      productName={product.name}
      price={Number(product.price || 0)}
    />

    <div className="container">
        <div className="breadcrumb">
          <Link href="/">Trang chủ</Link>
          <span>›</span>
         <Link href="/">Sản phẩm</Link>
          <span>›</span>
          <strong>{product.name}</strong>
        </div>

        <section className="productBox">
          <ProductGallery
  productName={product.name}
  images={((product.images || []) as string[]).map(
    (image: string, index: number) => ({
      image_url: image,
      sort_order: index,
    })
  )}
/>

          <div className="details">
            {product.badge && <span className="badge">{product.badge}</span>}

            <h1>{product.name}</h1>

            <div className="sku">Mã: <b>{product.sku}</b></div>

            <div className="meta">
              <span>
                Thương hiệu: <b>{product.brand}</b>
              </span>
              <i />
              <span>
                Tình trạng: <b>{product.status}</b>
              </span>
            </div>

            <div className="price">{formatPrice(product.price)}</div>

            <div className="summary">
              <p>✨ <b>Mô hình Gundam</b> là loại mô hình nhựa, được gọi là Model kit. Bao gồm nhiều mảnh nhựa rời được lắp ráp lại.</p>
              <ul>
                <li><b>Chi tiết đẹp:</b> Form dáng sắc nét, phù hợp trưng bày.</li>
                <li><b>Khớp cử động:</b> Dễ tạo dáng và pose mô hình.</li>
                <li><b>Không cần keo:</b> Các chi tiết gắn bằng khớp nối.</li>
              </ul>
            </div>

            <div className="coupons">
              <strong>Các mã giảm giá có thể áp dụng:</strong>
              <div>
                <span>HMECHA</span>
                <span>FREESHIP</span>
                <span>MECHA10</span>
              </div>
            </div>

            <AddToCartButton product={product} />

          </div>

          <aside className="rightBox">
            <div className="promo">
              <h3>🎁 KHUYẾN MÃI - ƯU ĐÃI</h3>
              <ul>
                <li>✅ Giảm 10.000đ cho đơn hàng bất kỳ</li>
                <li>✅ Giảm 5% cho khách quay lại</li>
                <li>🎁 Freeship cho đơn từ 1.000.000đ</li>
              </ul>
            </div>

            <div className="policy">
              <h3>✅ CHÍNH SÁCH HỖ TRỢ</h3>
              <div>🚚 Miễn phí vận chuyển đơn từ 1.000.000đ</div>
              <div>🛡️ Cam kết hàng chính hãng 100%</div>
              <div>📦 Đóng gói chống sốc trước khi giao</div>
              <div>🔁 Hỗ trợ đổi với lỗi từ nhà sản xuất</div>
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

        <section className="tabs">
          <div className="tabHeader">
            <h2>Mô tả sản phẩm</h2>
          </div>

          <div className="tabContent">
            <p>{product.fullDescription}</p>

            <h3>Thông tin sản phẩm</h3>
            <ul>
             {((product.specs || []) as string[]).map((spec: string) => (
  <li key={spec}>{spec}</li>
))}
            </ul>

            <h3>Hướng dẫn mua hàng</h3>
            <p>
              Chọn sản phẩm cần mua, bấm <b>Thêm vào giỏ hàng</b> hoặc <b>Mua ngay</b>.
              Sau đó điền thông tin nhận hàng, số điện thoại và địa chỉ. HMECHA sẽ liên hệ xác nhận đơn trước khi giao.
            </p>
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
        .page {
          min-height: 100vh;
          color: white;
          padding: 26px 20px 70px;
          background:
            radial-gradient(circle at top left, rgba(124,77,255,.26), transparent 34%),
            radial-gradient(circle at top right, rgba(0,229,255,.18), transparent 28%),
            linear-gradient(180deg, #050816 0%, #0b1026 45%, #050816 100%);
        }

        .container {
          max-width: 1320px;
          margin: 0 auto;
        }

        .breadcrumb {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
          color: #aebce4;
          margin-bottom: 24px;
          font-size: 15px;
        }

        .breadcrumb a {
          color: #aebce4;
          text-decoration: none;
        }

        .breadcrumb strong {
          color: #00e5ff;
        }

        .productBox {
          display: grid;
          grid-template-columns: 1.05fr 1.3fr .9fr;
          gap: 24px;
          align-items: start;
        }

        .gallery,
        .details,
        .rightBox > div,
        .tabs {
          background: rgba(255,255,255,.07);
          border: 1px solid rgba(0,229,255,.2);
          border-radius: 22px;
          box-shadow: 0 0 34px rgba(124,77,255,.12);
          backdrop-filter: blur(8px);
        }

        .gallery {
          padding: 16px;
        }

        .mainImage {
          background: #030612;
          border-radius: 18px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.08);
        }

        .mainImage img {
          width: 100%;
          aspect-ratio: 1 / 1;
          object-fit: cover;
          display: block;
        }

        .thumbs {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 10px;
          margin-top: 12px;
        }

        .thumb {
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(0,229,255,.25);
          background: #050816;
        }

        .thumb img {
          width: 100%;
          aspect-ratio: 1 / 1;
          object-fit: cover;
          display: block;
        }

        .details {
          padding: 24px;
        }

        .badge {
          display: inline-flex;
          padding: 8px 12px;
          background: linear-gradient(135deg,#ff3d8b,#7c4dff);
          border-radius: 9px;
          font-weight: 900;
          margin-bottom: 14px;
        }

        .details h1 {
          font-size: 34px;
          line-height: 1.15;
          margin: 0 0 12px;
          letter-spacing: .3px;
        }

        .sku {
          color: #b8c4e6;
          margin-bottom: 10px;
        }

        .sku b {
          color: #ff78d2;
        }

        .meta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          align-items: center;
          color: #b8c4e6;
          padding-bottom: 18px;
          border-bottom: 1px solid rgba(255,255,255,.12);
        }

        .meta b {
          color: #00e5ff;
        }

        .meta i {
          width: 1px;
          height: 16px;
          background: rgba(255,255,255,.22);
        }

        .price {
          margin: 20px 0;
          font-size: 36px;
          font-weight: 950;
          color: #ff4fd8;
          text-shadow: 0 0 18px rgba(255,79,216,.3);
        }

        .summary {
          color: #dce6ff;
          line-height: 1.75;
        }

        .summary ul {
          padding-left: 18px;
        }

        .coupons {
          margin: 18px 0;
        }

        .coupons strong {
          display: block;
          margin-bottom: 10px;
          color: #eaf1ff;
        }

        .coupons div {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .coupons span {
          display: inline-flex;
          padding: 8px 12px;
          border-radius: 999px;
          background: rgba(0,229,255,.12);
          color: #00e5ff;
          border: 1px solid rgba(0,229,255,.28);
          font-weight: 900;
        }

        .store {
          margin-top: 16px;
          display: block;
          text-decoration: none;
          color: #eaf1ff;
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(255,255,255,.06);
          border-radius: 14px;
          padding: 13px 14px;
          font-weight: 800;
        }

        .rightBox {
          display: grid;
          gap: 18px;
        }

        .promo,
        .policy {
          overflow: hidden;
        }

        .promo h3,
        .policy h3 {
          margin: 0;
          padding: 15px 18px;
          background: linear-gradient(135deg,#7c4dff,#00e5ff);
          color: #050816;
          font-size: 17px;
          font-weight: 950;
        }

        .promo ul {
          margin: 0;
          padding: 18px 20px;
          list-style: none;
          display: grid;
          gap: 12px;
          color: #dce6ff;
          line-height: 1.5;
        }

        .policy {
          padding-bottom: 8px;
        }

        .policy div {
          padding: 14px 18px;
          color: #dce6ff;
          border-bottom: 1px solid rgba(255,255,255,.08);
        }

        .tabs {
          margin-top: 30px;
          overflow: hidden;
        }

        .tabHeader {
          padding: 18px 22px;
          border-bottom: 1px solid rgba(255,255,255,.1);
          background: rgba(0,0,0,.18);
        }

        .tabHeader h2 {
          margin: 0;
          font-size: 24px;
        }

        .tabContent {
          padding: 22px;
          color: #dce6ff;
          line-height: 1.8;
        }

        .tabContent h3 {
          color: #00e5ff;
          margin-top: 20px;
        }

        @media (max-width: 1100px) {
          .productBox {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .details h1 {
            font-size: 26px;
          }

          .price {
            font-size: 30px;
          }

          .thumbs {
            grid-template-columns: repeat(4, 1fr);
          }
        }
      `}</style>

    </main>
  );
}