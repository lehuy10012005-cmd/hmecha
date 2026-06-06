import PolicyLayout from "../../components/policy/PolicyLayout";

export const metadata = {
  title: "Chính sách đổi trả | HMECHA",
  description:
    "Điều kiện đổi trả sản phẩm mô hình, Gunpla và phụ kiện khi mua hàng tại HMECHA.",
};

export default function ReturnPolicyPage() {
  return (
    <PolicyLayout
      eyebrow="HMECHA RETURN"
      title="Chính sách đổi trả"
      description="HMECHA hỗ trợ đổi trả trong các trường hợp sản phẩm bị lỗi, giao sai, thiếu phụ kiện hoặc phát sinh vấn đề được xác minh hợp lệ."
      updatedAt="06/2026"
    >
      <section>
        <h2>1. Nguyên tắc chung</h2>
        <p>
          Chính sách đổi trả được xây dựng để bảo vệ quyền lợi khách hàng đồng
          thời đảm bảo tính công bằng đối với sản phẩm mô hình sưu tầm, model
          kit, hộp bài, phụ kiện và các sản phẩm dễ bị ảnh hưởng bởi tình trạng
          mở seal, lắp ráp hoặc sử dụng.
        </p>
      </section>

      <section>
        <h2>2. Thời gian tiếp nhận yêu cầu</h2>
        <table className="policyTable">
          <thead>
            <tr><th>Trường hợp</th><th>Thời gian báo HMECHA</th></tr>
          </thead>
          <tbody>
            <tr><td>Sai sản phẩm, thiếu sản phẩm, thiếu phụ kiện</td><td>Trong vòng 48 giờ kể từ khi nhận hàng.</td></tr>
            <tr><td>Sản phẩm hư hại do vận chuyển</td><td>Trong vòng 24–48 giờ, kèm ảnh/video kiện hàng.</td></tr>
            <tr><td>Lỗi sản xuất rõ ràng chưa qua sử dụng</td><td>Trong vòng 7 ngày kể từ khi nhận hàng.</td></tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>3. Trường hợp được hỗ trợ đổi trả</h2>
        <ul>
          <li>HMECHA giao sai sản phẩm so với đơn hàng đã xác nhận.</li>
          <li>Sản phẩm bị thiếu chi tiết, thiếu phụ kiện hoặc thiếu quà tặng đã ghi trong đơn.</li>
          <li>Sản phẩm bị hư hại nghiêm trọng trong quá trình vận chuyển và có bằng chứng phù hợp.</li>
          <li>Sản phẩm có lỗi sản xuất rõ ràng trước khi khách hàng lắp ráp hoặc sử dụng.</li>
          <li>Đơn hàng đã thanh toán nhưng không thể giao do lỗi xử lý từ phía HMECHA.</li>
        </ul>
      </section>

      <section>
        <h2>4. Điều kiện sản phẩm đổi trả</h2>
        <ul>
          <li>Còn đầy đủ hộp, phụ kiện, runner, manual, decal, card hoặc quà tặng kèm nếu có.</li>
          <li>Chưa bị lắp ráp, cắt runner, sơn, dán decal, mod hoặc custom.</li>
          <li>Có mã đơn hàng hoặc bằng chứng mua hàng tại HMECHA.</li>
          <li>Có ảnh hoặc video thể hiện rõ vấn đề cần hỗ trợ.</li>
        </ul>
      </section>

      <section>
        <h2>5. Trường hợp không hỗ trợ đổi trả</h2>
        <ul>
          <li>Khách hàng đổi ý, không còn nhu cầu hoặc đặt nhầm sau khi sản phẩm đã giao đúng.</li>
          <li>Sản phẩm đã được lắp ráp, cắt khỏi runner, sơn, custom hoặc sử dụng.</li>
          <li>Hộp bị móp nhẹ nhưng sản phẩm bên trong không ảnh hưởng, trừ khi shop có cam kết riêng.</li>
          <li>Sản phẩm sale mạnh, thanh lý, hàng trưng bày hoặc hàng đã mô tả rõ tình trạng trước khi bán.</li>
          <li>Khách hàng không cung cấp được bằng chứng mở kiện hàng hoặc bằng chứng không đủ rõ.</li>
        </ul>
      </section>

      <section>
        <h2>6. Bằng chứng cần cung cấp</h2>
        <ul>
          <li>Mã đơn hàng hoặc email/số điện thoại đặt hàng.</li>
          <li>Ảnh mặt ngoài kiện hàng, tem vận chuyển và tình trạng hộp khi nhận.</li>
          <li>Video mở hộp liên tục nếu khiếu nại thiếu hàng, sai hàng hoặc hư hại.</li>
          <li>Ảnh chụp rõ lỗi sản phẩm, phụ kiện thiếu hoặc phần bị hư hại.</li>
        </ul>
        <div className="policyNotice">
          Video mở kiện hàng là bằng chứng quan trọng nhất trong các trường hợp
          khiếu nại thiếu hàng, sai hàng hoặc hư hại trong vận chuyển.
        </div>
      </section>

      <section>
        <h2>7. Quy trình xử lý đổi trả</h2>
        <ol>
          <li>Khách hàng liên hệ HMECHA và gửi thông tin đơn hàng kèm bằng chứng.</li>
          <li>HMECHA kiểm tra yêu cầu và phản hồi hướng xử lý dự kiến.</li>
          <li>Nếu hợp lệ, hai bên thống nhất đổi hàng, gửi bổ sung phụ kiện, hoàn tiền hoặc phương án hỗ trợ khác.</li>
          <li>Khách hàng gửi lại sản phẩm nếu HMECHA yêu cầu kiểm tra thực tế.</li>
          <li>HMECHA hoàn tất xử lý sau khi nhận đủ thông tin và sản phẩm hoàn trả nếu có.</li>
        </ol>
      </section>

      <section>
        <h2>8. Chi phí vận chuyển và hoàn tiền</h2>
        <p>
          Nếu lỗi phát sinh từ HMECHA hoặc đơn vị vận chuyển được xác minh hợp lệ,
          HMECHA sẽ hỗ trợ chi phí đổi trả theo thỏa thuận. Trường hợp hoàn tiền
          được chấp thuận, HMECHA sẽ hoàn theo phương thức phù hợp như chuyển khoản
          ngân hàng hoặc hoàn qua cổng thanh toán nếu giao dịch hỗ trợ.
        </p>
      </section>
    </PolicyLayout>
  );
}
