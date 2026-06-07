import Link from "next/link";
import { redirect } from "next/navigation";
import { createAuthServerClient } from "../../../lib/supabase-auth/server";
import { supabaseAdmin } from "../../../lib/supabase-admin";

export const dynamic = "force-dynamic";

type WishlistItem = {
  id: string;
  product_slug: string;
  product_name: string;
  product_price: number;
  product_image: string | null;
  product_status: string | null;
  product_brand: string | null;
  product_category: string | null;
  created_at: string;
};

function money(value: number) {
  return Number(value || 0).toLocaleString("vi-VN") + "₫";
}

export default async function WishlistPage() {
  const supabase = await createAuthServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/tai-khoan");
  }

  const { data } = await supabaseAdmin
    .from("product_wishlists")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const items = (data || []) as WishlistItem[];

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "42px 20px 90px",
        color: "#fff",
        background:
          "radial-gradient(circle at 12% 0%, rgba(124,77,255,.2), transparent 30%), radial-gradient(circle at 90% 0%, rgba(0,229,255,.16), transparent 30%), linear-gradient(180deg, #050816 0%, #081226 100%)",
      }}
    >
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <Link href="/tai-khoan" style={{ color: "#00e5ff", fontWeight: 900, textDecoration: "none" }}>
          ← Quay lại tài khoản
        </Link>

        <section
          style={{
            marginTop: 24,
            border: "1px solid rgba(0,229,255,.2)",
            borderRadius: 24,
            padding: 26,
            background: "rgba(7,12,32,.86)",
          }}
        >
          <p style={{ color: "#00e5ff", letterSpacing: 4, fontWeight: 950, margin: 0 }}>
            HMECHA WISHLIST
          </p>
          <h1 style={{ fontSize: "clamp(38px, 5vw, 64px)", margin: "10px 0" }}>
            Sản phẩm yêu thích
          </h1>
          <p style={{ color: "#c5d2f2", margin: 0 }}>
            Lưu lại các mẫu Gundam bạn đang quan tâm để xem và mua sau.
          </p>
        </section>

        {items.length === 0 ? (
          <section
            style={{
              marginTop: 22,
              border: "1px solid rgba(0,229,255,.2)",
              borderRadius: 22,
              padding: 26,
              background: "rgba(7,12,32,.84)",
            }}
          >
            <h2>Bạn chưa có sản phẩm yêu thích</h2>
            <p style={{ color: "#c5d2f2" }}>
              Vào trang chi tiết sản phẩm và bấm “Thêm vào yêu thích”.
            </p>
            <Link
              href="/"
              style={{
                display: "inline-grid",
                placeItems: "center",
                minHeight: 46,
                borderRadius: 12,
                padding: "0 18px",
                color: "#061020",
                fontWeight: 950,
                textDecoration: "none",
                background: "linear-gradient(135deg,#7c4dff,#00e5ff)",
              }}
            >
              Tiếp tục mua sắm
            </Link>
          </section>
        ) : (
          <section
            style={{
              marginTop: 22,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: 18,
            }}
          >
            {items.map((item) => (
              <article
                key={item.id}
                style={{
                  border: "1px solid rgba(0,229,255,.22)",
                  borderRadius: 20,
                  overflow: "hidden",
                  background: "rgba(7,12,32,.86)",
                }}
              >
                <Link href={"/" + item.product_slug}>
                  <img
                    src={item.product_image || "/placeholder.png"}
                    alt={item.product_name}
                    style={{
                      width: "100%",
                      height: 230,
                      objectFit: "cover",
                      background: "#000",
                    }}
                  />
                </Link>

                <div style={{ padding: 16 }}>
                  <p style={{ color: "#9fb0d8", margin: "0 0 8px" }}>
                    {item.product_category || "Gundam"}
                  </p>

                  <h2 style={{ fontSize: 20, margin: "0 0 10px", lineHeight: 1.3 }}>
                    {item.product_name}
                  </h2>

                  <strong style={{ color: "#00e5ff", fontSize: 26 }}>
                    {money(item.product_price)}
                  </strong>

                  <p style={{ color: "#c5d2f2" }}>
                    Tình trạng: <b>{item.product_status || "Đang cập nhật"}</b>
                  </p>

                  <Link
                    href={"/" + item.product_slug}
                    style={{
                      display: "grid",
                      placeItems: "center",
                      minHeight: 44,
                      borderRadius: 12,
                      textDecoration: "none",
                      color: "#061020",
                      fontWeight: 950,
                      background: "linear-gradient(135deg,#7c4dff,#00e5ff)",
                    }}
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
