export default function ChinhSachGioiThieuPage() {
  return (
    <div className="policy-page">
      <div className="policy-page__inner">
        <h1 className="policy-page__title">Chính sách giới thiệu</h1>

        <div className="policy-page__section">
          <h2>1. Giới thiệu chương trình</h2>
          <p>
            Chương trình giới thiệu của FROM THE STRESS cho phép khách hàng chia
            sẻ mã giới thiệu cá nhân để bạn bè nhận được ưu đãi giảm giá khi mua
            sản phẩm. Mỗi tài khoản sẽ được cấp một mã giới thiệu duy nhất sau
            khi đăng ký thành công.
          </p>
        </div>

        <div className="policy-page__section">
          <h2>2. Điều kiện áp dụng</h2>
          <ul>
            <li>
              Người được giới thiệu phải là khách hàng mới (chưa sử dụng mã giới
              thiệu nào trước đó).
            </li>
            <li>Người được giới thiệu phải tạo tài khoản trên website.</li>
            <li>
              Mỗi tài khoản chỉ được sử dụng mã giới thiệu một lần duy nhất.
            </li>
            <li>
              Mã giới thiệu không được kết hợp với các chương trình khuyến mãi
              khác.
            </li>
            <li>Đơn hàng phải đạt giá trị tối thiểu theo quy định (nếu có).</li>
          </ul>
        </div>

        <div className="policy-page__section">
          <h2>3. Quyền lợi</h2>
          <ul>
            <li>
              Người được giới thiệu: Nhận giảm giá theo tỷ lệ hoặc số tiền cố
              định do hệ thống quy định.
            </li>
            <li>
              Người giới thiệu: Có thể nhận thưởng (nếu chương trình có áp dụng
              thưởng cho người giới thiệu).
            </li>
          </ul>
        </div>

        <div className="policy-page__section">
          <h2>4. Quy định chống gian lận</h2>
          <ul>
            <li>Không được tự giới thiệu (dùng mã của chính mình).</li>
            <li>
              Không được tạo nhiều tài khoản giả để sử dụng mã giới thiệu.
            </li>
            <li>
              Hệ thống có quyền từ chối hoặc thu hồi ưu đãi nếu phát hiện hành
              vi gian lận.
            </li>
            <li>Các tài khoản vi phạm có thể bị khóa vĩnh viễn.</li>
          </ul>
        </div>

        <div className="policy-page__section">
          <h2>5. Quy định rút tiền (Đối tác liên kết)</h2>
          <ul>
            <li>Số dư tối thiểu để rút: 100.000đ.</li>
            <li>
              Yêu cầu rút tiền sẽ được admin xét duyệt trong vòng 3-5 ngày làm
              việc.
            </li>
            <li>
              Hoa hồng chỉ được ghi nhận khi đơn hàng hoàn thành và thanh toán
              xác nhận.
            </li>
          </ul>
        </div>

        <div className="policy-page__section">
          <h2>6. Thay đổi chính sách</h2>
          <p>
            FROM THE STRESS có quyền thay đổi hoặc ngừng chương trình giới thiệu
            bất kỳ lúc nào mà không cần thông báo trước. Mọi thay đổi sẽ được
            cập nhật trên trang này.
          </p>
        </div>
      </div>
    </div>
  );
}
