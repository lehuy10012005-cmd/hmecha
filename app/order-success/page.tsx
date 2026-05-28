"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

function formatPrice(price: number) {
  return Number(price || 0).toLocaleString("vi-VN") + "₫";
}

const BANK_INFO = {
  bankName: "TPBank",
  accountNumber: "0000 3837 593",
  accountName: "LE VAN QUANG HUY",
  qrImage: "/qr/tpbank-huy.png",
};

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();

  const method = searchParams.get("method") || "cod";
  const total = Number(searchParams.get("total") || 0);
  const order = searchParams.get("order") || "";
  const content = searchParams.get("content") || "HMECHA SODIENTHOAI";

  const isBank = method === "bank";

  const qrUrl = BANK_INFO.qrImage;

  return (
    <main className="successPage">
      <section className="card">
        <p className="eyebrow">HMECHA ORDER</p>
        <h1>Đặt hàng thành công</h1>

        <p className="desc">
          Cảm ơn bạn đã đặt hàng tại HMECHA. Đơn hàng của bạn đã được lưu vào hệ
          thống.
        </p>

        <div className="orderInfo">
          <div>
            <span>Mã đơn hàng</span>
            <b>{order.slice(0, 8).toUpperCase() || "HMECHA"}</b>
          </div>

          <div>
            <span>Tổng thanh toán</span>
            <b>{formatPrice(total)}</b>
          </div>

          <div>
            <span>Phương thức</span>
            <b>{isBank ? "Chuyển khoản ngân hàng" : "COD"}</b>
          </div>

          <div>
            <span>Trạng thái</span>
            <b>{isBank ? "Chờ thanh toán" : "Chờ xác nhận"}</b>
          </div>
        </div>

        {isBank && (
          <div className="bankBox">
            <div>
              <h2>Thông tin chuyển khoản</h2>

              <div className="bankRows">
                <div>
                  <span>Ngân hàng</span>
                  <b>{BANK_INFO.bankName}</b>
                </div>

                <div>
                  <span>Số tài khoản</span>
                  <b>{BANK_INFO.accountNumber}</b>
                </div>

                <div>
                  <span>Chủ tài khoản</span>
                  <b>{BANK_INFO.accountName}</b>
                </div>

                <div>
                  <span>Số tiền</span>
                  <b>{formatPrice(total)}</b>
                </div>

                <div>
                  <span>Nội dung CK</span>
                  <b>{content}</b>
                </div>
              </div>

              <p>
                Sau khi chuyển khoản, admin sẽ kiểm tra và cập nhật trạng thái
                đơn hàng.
              </p>
            </div>

            <div className="qrBox">
              <img src={qrUrl} alt="QR chuyển khoản HMECHA" />
              <small>Quét QR để chuyển khoản demo</small>
            </div>
          </div>
        )}

        <div className="actions">
          <Link href="/" className="homeBtn">
            Về trang chủ
          </Link>

          <Link href="/admin/orders" className="adminBtn">
            Xem đơn trong admin
          </Link>
        </div>
      </section>

      <style>{`
        .successPage {
          min-height: 100vh;
          padding: 40px 20px;
          display: grid;
          place-items: center;
          background:
            radial-gradient(circle at top left, rgba(124,77,255,.22), transparent 32%),
            radial-gradient(circle at top right, rgba(0,229,255,.15), transparent 30%),
            linear-gradient(180deg, #050816 0%, #0b1026 48%, #050816 100%);
          color: white;
        }

        .card {
          width: min(980px, 100%);
          border-radius: 26px;
          padding: 30px;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(0,229,255,.22);
          box-shadow: 0 0 40px rgba(124,77,255,.16);
        }

        .eyebrow {
          margin: 0;
          color: #00e5ff;
          font-weight: 950;
          letter-spacing: 2px;
        }

        h1 {
          margin: 10px 0;
          font-size: 46px;
          line-height: 1.05;
        }

        .desc {
          color: #dce6ff;
          font-size: 17px;
          line-height: 1.6;
        }

        .orderInfo {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin: 24px 0;
        }

        .orderInfo div {
          padding: 16px;
          border-radius: 16px;
          background: rgba(0,0,0,.22);
          border: 1px solid rgba(255,255,255,.1);
        }

        .orderInfo span {
          display: block;
          color: #b8c4e6;
          margin-bottom: 8px;
          font-size: 13px;
        }

        .orderInfo b {
          color: #00e5ff;
          font-size: 18px;
        }

        .bankBox {
          margin-top: 20px;
          padding: 20px;
          border-radius: 20px;
          border: 1px solid rgba(0,229,255,.28);
          background: rgba(0,0,0,.24);
          display: grid;
          grid-template-columns: 1fr 240px;
          gap: 20px;
        }

        .bankBox h2 {
          margin-top: 0;
          color: #00e5ff;
        }

        .bankRows {
          display: grid;
          gap: 10px;
        }

        .bankRows div {
          display: grid;
          grid-template-columns: 140px 1fr;
          gap: 12px;
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(255,255,255,.08);
        }

        .bankRows span {
          color: #b8c4e6;
        }

        .bankRows b {
          color: white;
          word-break: break-word;
        }

        .bankBox p {
          color: #dce6ff;
          line-height: 1.6;
        }

        .qrBox {
          background: white;
          color: #111827;
          border-radius: 18px;
          padding: 12px;
          text-align: center;
          height: fit-content;
        }

        .qrBox img {
          width: 100%;
          aspect-ratio: 1 / 1;
          object-fit: contain;
          display: block;
        }

        .qrBox small {
          display: block;
          font-weight: 900;
          color: #334155;
        }

        .actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
          flex-wrap: wrap;
        }

        .homeBtn,
        .adminBtn {
          text-decoration: none;
          border-radius: 14px;
          padding: 14px 20px;
          font-weight: 950;
        }

        .homeBtn {
          color: #050816;
          background: linear-gradient(135deg,#7c4dff,#00e5ff);
        }

        .adminBtn {
          color: #dce6ff;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.16);
        }

        @media (max-width: 800px) {
          h1 {
            font-size: 36px;
          }

          .orderInfo {
            grid-template-columns: 1fr 1fr;
          }

          .bankBox {
            grid-template-columns: 1fr;
          }

          .qrBox {
            max-width: 260px;
          }
        }

        @media (max-width: 520px) {
          .orderInfo {
            grid-template-columns: 1fr;
          }

          .bankRows div {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}