import PolicyLayout from "../../components/policy/PolicyLayout";

export const metadata = {
  title: "Chính sách thanh toán | HMECHA",
  description:
    "Các hình thức thanh toán COD, VNPAY, xác nhận giao dịch và xử lý lỗi thanh toán tại HMECHA.",
};

export default function PaymentPolicyPage() {
  return (
    <PolicyLayout
      eyebrow="HMECHA PAYMENT"
      title="Chính sách thanh toán"
      description="HMECHA hỗ trợ thanh toán linh hoạt, minh bạch và an toàn để khách hàng đặt mua mô hình, Gunpla và phụ kiện thuận tiện hơn."
      updatedAt="06/2026"
    >
      <section>
        <h2>1. Phương thức thanh toán được hỗ trợ</h2>
        <ul>
          <li><strong>Thanh toán khi nhận hàng COD:</strong> khách hàng thanh toán cho nhân viên giao hàng khi nhận sản phẩm.</li>
          <li><strong>Thanh toán online qua VNPAY:</strong> khách hàng thanh toán qua cổng thanh toán được tích hợp trên website.</li>
          <li><strong>Chuyển khoản ngân hàng:</strong> có thể áp dụng trong một số trường hợp cần xác nhận riêng với HMECHA.</li>
        </ul>
      </section>

      <section>
        <h2>2. Thanh toán COD</h2>
        <p>
          Với đơn COD, khách hàng đặt hàng trên website và thanh toán khi nhận
          hàng. HMECHA có thể liên hệ để xác nhận thông tin đơn trước khi đóng gói.
        </p>
        <ul>
          <li>Đơn có thể bị tạm giữ nếu thông tin người nhận không rõ ràng.</li>
          <li>Đơn có thể bị hủy nếu không liên hệ được hoặc địa chỉ không đầy đủ.</li>
          <li>Khách có lịch sử nhiều lần không nhận hàng có thể cần thanh toán trước.</li>
        </ul>
      </section>

      <section>
        <h2>3. Thanh toán online qua VNPAY</h2>
        <p>
          Khi chọn VNPAY, khách hàng sẽ được chuyển sang cổng thanh toán để hoàn
          tất giao dịch. Sau khi thanh toán thành công, hệ thống cập nhật trạng
          thái đơn hàng và gửi email xác nhận nếu email hợp lệ.
        </p>
        <div className="policyNotice">
          HMECHA không yêu cầu khách hàng cung cấp mật khẩu ngân hàng, mã OTP
          hoặc thông tin bảo mật thẻ qua chat, email hoặc cuộc gọi riêng.
        </div>
      </section>

      <section>
        <h2>4. Thanh toán chuyển khoản</h2>
        <p>
          Với thanh toán chuyển khoản, khách hàng cần chuyển đúng số tiền và đúng
          nội dung được HMECHA hướng dẫn để đối soát nhanh hơn.
        </p>
        <ul>
          <li>Mã đơn hàng.</li>
          <li>Số điện thoại đặt hàng.</li>
          <li>Tên người đặt nếu cần thiết.</li>
        </ul>
      </section>

      <section>
        <h2>5. Xác nhận thanh toán</h2>
        <p>
          Đơn hàng được xem là đã thanh toán khi hệ thống hoặc HMECHA ghi nhận
          giao dịch thành công. Với giao dịch cần kiểm tra thêm, trạng thái đơn
          có thể tạm thời là “Chờ xác nhận”.
        </p>
      </section>

      <section>
        <h2>6. Lỗi thanh toán hoặc giao dịch bị gián đoạn</h2>
        <ol>
          <li>Kiểm tra trạng thái đơn hàng trong tài khoản.</li>
          <li>Kiểm tra tài khoản ngân hàng hoặc ví thanh toán.</li>
          <li>Không thanh toán lại nhiều lần nếu chưa chắc giao dịch trước thất bại.</li>
          <li>Liên hệ HMECHA để kiểm tra nếu tiền đã bị trừ nhưng đơn chưa cập nhật.</li>
        </ol>
      </section>

      <section>
        <h2>7. Hoàn tiền</h2>
        <table className="policyTable">
          <thead>
            <tr><th>Trường hợp</th><th>Hướng xử lý</th></tr>
          </thead>
          <tbody>
            <tr><td>Thanh toán online thành công nhưng đơn không thể xử lý</td><td>HMECHA kiểm tra và hoàn tiền hoặc đề xuất đổi sang sản phẩm khác.</td></tr>
            <tr><td>Khách chuyển khoản thừa</td><td>HMECHA hoàn phần chênh lệch sau khi đối soát.</td></tr>
            <tr><td>Đơn đổi trả hợp lệ</td><td>Hoàn tiền theo chính sách đổi trả sau khi hoàn tất xác minh.</td></tr>
          </tbody>
        </table>
      </section>

      <section>
        <h2>8. Bảo mật thanh toán</h2>
        <p>
          HMECHA không lưu trữ thông tin thẻ ngân hàng, mã OTP hoặc mật khẩu
          thanh toán của khách hàng. Các giao dịch online được xử lý thông qua
          cổng thanh toán hoặc đơn vị cung cấp dịch vụ thanh toán.
        </p>
      </section>
    </PolicyLayout>
  );
}
