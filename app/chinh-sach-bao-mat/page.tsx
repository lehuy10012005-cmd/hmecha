import PolicyLayout from "../../components/policy/PolicyLayout";

export const metadata = {
  title: "Chính sách bảo mật | HMECHA",
  description:
    "Chính sách bảo mật thông tin khách hàng khi mua mô hình Gundam, Gunpla và phụ kiện tại HMECHA.",
};

export default function PrivacyPolicyPage() {
  return (
    <PolicyLayout
      eyebrow="HMECHA POLICY"
      title="Chính sách bảo mật"
      description="HMECHA cam kết bảo vệ thông tin cá nhân của khách hàng trong quá trình đăng ký tài khoản, đặt hàng, thanh toán và sử dụng dịch vụ trên website."
      updatedAt="06/2026"
    >
      <section>
        <h2>1. Mục đích của chính sách</h2>
        <p>
          Chính sách này giải thích cách HMECHA thu thập, sử dụng, lưu trữ và
          bảo vệ thông tin cá nhân của khách hàng khi truy cập website, tạo tài
          khoản, đặt hàng, thanh toán hoặc liên hệ hỗ trợ.
        </p>
        <p>
          Khi sử dụng website HMECHA, khách hàng được hiểu là đã đọc và đồng ý
          với các nội dung trong chính sách này.
        </p>
      </section>

      <section>
        <h2>2. Thông tin HMECHA có thể thu thập</h2>
        <ul>
          <li><strong>Thông tin tài khoản:</strong> họ tên, email, số điện thoại, mật khẩu đã được xử lý qua hệ thống xác thực.</li>
          <li><strong>Thông tin đặt hàng:</strong> địa chỉ nhận hàng, sản phẩm đã mua, số lượng, giá trị đơn hàng, phương thức thanh toán.</li>
          <li><strong>Thông tin giao dịch:</strong> mã đơn hàng, thời gian đặt hàng, trạng thái COD/VNPAY và lịch sử cập nhật đơn.</li>
          <li><strong>Thông tin tương tác:</strong> nội dung liên hệ, chatbox, đánh giá sản phẩm hoặc phản hồi dịch vụ.</li>
          <li><strong>Dữ liệu kỹ thuật:</strong> trình duyệt, thiết bị, thời gian truy cập, trang đã xem và dữ liệu cần thiết để cải thiện trải nghiệm.</li>
        </ul>
      </section>

      <section>
        <h2>3. Mục đích sử dụng thông tin</h2>
        <ul>
          <li>Xác nhận tài khoản, hỗ trợ đăng nhập và quản lý đơn hàng.</li>
          <li>Xử lý đơn hàng, giao hàng, thanh toán và đổi trả khi cần thiết.</li>
          <li>Gửi email xác nhận đơn hàng, cập nhật trạng thái đơn và hỗ trợ sau bán.</li>
          <li>Liên hệ khi đơn hàng cần xác minh thông tin giao hàng hoặc thanh toán.</li>
          <li>Cải thiện giao diện website, danh mục sản phẩm, bộ lọc và trải nghiệm mua sắm.</li>
          <li>Phòng chống gian lận, đơn hàng bất thường hoặc hành vi gây ảnh hưởng đến hệ thống.</li>
        </ul>
        <div className="policyNotice">
          HMECHA không bán, trao đổi hoặc cho thuê thông tin cá nhân của khách
          hàng cho bên thứ ba vì mục đích thương mại độc lập.
        </div>
      </section>

      <section>
        <h2>4. Chia sẻ thông tin với bên thứ ba</h2>
        <p>
          HMECHA chỉ chia sẻ thông tin trong phạm vi cần thiết để hoàn tất dịch
          vụ, bao gồm đơn vị vận chuyển, cổng thanh toán, dịch vụ email hoặc cơ
          quan có thẩm quyền khi có yêu cầu hợp pháp.
        </p>
      </section>

      <section>
        <h2>5. Lưu trữ và bảo vệ dữ liệu</h2>
        <p>
          HMECHA áp dụng các biện pháp kỹ thuật và tổ chức phù hợp để hạn chế
          truy cập trái phép, mất mát hoặc lạm dụng dữ liệu cá nhân. Dữ liệu đơn
          hàng có thể được lưu trữ trong thời gian cần thiết để xử lý giao dịch,
          hỗ trợ đổi trả, đối soát thanh toán và chăm sóc khách hàng.
        </p>
      </section>

      <section>
        <h2>6. Quyền của khách hàng</h2>
        <ul>
          <li>Yêu cầu xem hoặc cập nhật thông tin tài khoản cá nhân.</li>
          <li>Yêu cầu chỉnh sửa thông tin giao hàng khi đơn chưa được xử lý.</li>
          <li>Yêu cầu hỗ trợ xóa hoặc hạn chế xử lý một số thông tin theo điều kiện phù hợp.</li>
          <li>Từ chối nhận thông tin quảng bá nếu HMECHA triển khai email marketing trong tương lai.</li>
        </ul>
      </section>

      <section>
        <h2>7. Cookie và dữ liệu trải nghiệm</h2>
        <p>
          Website có thể sử dụng cookie hoặc localStorage để ghi nhớ giỏ hàng,
          trạng thái đăng nhập và lựa chọn của khách hàng. Một số chức năng có
          thể không hoạt động đầy đủ nếu khách hàng tắt các cơ chế lưu trữ này.
        </p>
      </section>

      <section>
        <h2>8. Cập nhật chính sách và liên hệ</h2>
        <p>
          HMECHA có thể cập nhật chính sách khi website thay đổi chức năng, vận
          chuyển, thanh toán hoặc yêu cầu pháp lý. Nếu có câu hỏi về dữ liệu cá
          nhân, khách hàng có thể liên hệ email hỗ trợ hoặc hotline hiển thị trên website.
        </p>
      </section>
    </PolicyLayout>
  );
}
