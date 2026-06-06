import PolicyLayout from "../../components/policy/PolicyLayout";

export const metadata = {
  title: "Chính sách vận chuyển | HMECHA",
  description:
    "Thông tin giao hàng, phí vận chuyển, thời gian xử lý và trách nhiệm kiểm tra kiện hàng khi mua tại HMECHA.",
};

export default function ShippingPolicyPage() {
  return (
    <PolicyLayout
      eyebrow="HMECHA DELIVERY"
      title="Chính sách vận chuyển"
      description="HMECHA đóng gói cẩn thận các sản phẩm mô hình, Gunpla và phụ kiện trước khi bàn giao cho đơn vị vận chuyển."
      updatedAt="06/2026"
    >
      <section>
        <h2>1. Phạm vi giao hàng</h2>
        <p>
          HMECHA hỗ trợ giao hàng toàn quốc thông qua các đơn vị vận chuyển phù
          hợp với từng khu vực. Một số địa chỉ vùng sâu, vùng xa, hải đảo hoặc
          khu vực hạn chế giao nhận có thể phát sinh thêm thời gian xử lý.
        </p>
      </section>

      <section>
        <h2>2. Thời gian xử lý đơn hàng</h2>
        <table className="policyTable">
          <thead>
            <tr><th>Loại đơn</th><th>Thời gian xử lý dự kiến</th></tr>
          </thead>
          <tbody>
            <tr><td>Đơn COD</td><td>Thường được xác nhận và chuẩn bị trong 24–48 giờ làm việc.</td></tr>
            <tr><td>Đơn đã thanh toán online</td><td>Được xử lý sau khi hệ thống ghi nhận thanh toán thành công.</td></tr>
            <tr><td>Đơn preorder/đặt trước</td><td>Được xử lý theo thời gian hàng về dự kiến được ghi tại sản phẩm hoặc thông báo riêng.</td></tr>
          </tbody>
        </table>
        <p>
          Thời gian xử lý có thể kéo dài hơn trong dịp sale, lễ, Tết, thời tiết
          xấu hoặc khi đơn cần xác minh thêm thông tin.
        </p>
      </section>

      <section>
        <h2>3. Thời gian giao hàng dự kiến</h2>
        <table className="policyTable">
          <thead>
            <tr><th>Khu vực</th><th>Thời gian giao dự kiến</th></tr>
          </thead>
          <tbody>
            <tr><td>Nội tỉnh/thành phố gần kho</td><td>1–3 ngày làm việc sau khi bàn giao vận chuyển.</td></tr>
            <tr><td>Các tỉnh/thành phố khác</td><td>3–7 ngày làm việc tùy tuyến giao hàng.</td></tr>
            <tr><td>Vùng xa, hải đảo hoặc khu vực hạn chế giao nhận</td><td>Có thể lâu hơn tùy tình trạng vận hành của đơn vị vận chuyển.</td></tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>4. Phí vận chuyển</h2>
        <p>
          Phí vận chuyển được hiển thị hoặc thông báo trong quá trình đặt hàng.
          Mức phí có thể thay đổi theo địa chỉ nhận hàng, khối lượng, kích thước
          kiện hàng và chính sách của đơn vị vận chuyển.
        </p>
      </section>

      <section>
        <h2>5. Quy định đóng gói</h2>
        <p>
          HMECHA ưu tiên đóng gói an toàn, đặc biệt với Gunpla, model kit, hộp
          bài, phụ kiện nhựa và sản phẩm sưu tầm. Tùy sản phẩm, kiện hàng có
          thể được bọc chống sốc, chèn giấy hoặc gia cố thùng bên ngoài.
        </p>
        <ul>
          <li>Sản phẩm được kiểm tra cơ bản trước khi đóng gói.</li>
          <li>Hộp sản phẩm được bảo vệ trong khả năng hợp lý của shop.</li>
          <li>Thông tin người nhận được ghi rõ để hạn chế thất lạc.</li>
        </ul>
      </section>

      <section>
        <h2>6. Trách nhiệm kiểm tra khi nhận hàng</h2>
        <p>
          Khi nhận hàng, khách hàng nên kiểm tra tình trạng bên ngoài của kiện
          hàng trước khi ký nhận hoặc thanh toán COD. Nếu kiện hàng bị rách, móp
          nặng, ướt, bị mở hoặc sai thông tin, khách hàng nên chụp ảnh và liên hệ HMECHA ngay.
        </p>
        <div className="policyWarning">
          HMECHA khuyến khích khách hàng quay video mở kiện hàng liên tục từ lúc
          còn nguyên niêm phong đến khi kiểm tra sản phẩm.
        </div>
      </section>

      <section>
        <h2>7. Giao hàng không thành công</h2>
        <p>
          Nếu giao hàng không thành công do khách hàng không nghe máy, địa chỉ
          không chính xác, không nhận hàng hoặc hẹn giao nhiều lần nhưng không
          nhận, đơn hàng có thể được hoàn về HMECHA.
        </p>
      </section>

      <section>
        <h2>8. Theo dõi đơn hàng</h2>
        <p>
          Khách hàng có thể theo dõi tình trạng đơn hàng trong khu vực tài khoản
          hoặc liên hệ HMECHA để nhận mã vận đơn khi đơn đã được bàn giao cho đơn vị vận chuyển.
        </p>
      </section>
    </PolicyLayout>
  );
}
