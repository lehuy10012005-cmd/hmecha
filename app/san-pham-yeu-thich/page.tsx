import WishlistPageClient from "../../components/WishlistPageClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sản phẩm yêu thích | HMECHA",
  description: "Danh sách sản phẩm yêu thích của khách hàng HMECHA.",
};

export default function WishlistPage() {
  return <WishlistPageClient />;
}