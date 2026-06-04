import Link from "next/link";
import crypto from "crypto";
import qs from "qs";
import { supabaseAdmin as supabase } from "../../../lib/supabase-admin";
import { sendOrderEmail } from "../../../lib/sendOrderEmail";
function sortObject(obj: Record<string, string>) {
  const sorted: Record<string, string> = {};
  const keys = Object.keys(obj).sort();

  for (const key of keys) {
    sorted[key] = encodeURIComponent(String(obj[key])).replace(/%20/g, "+");
  }

  return sorted;
}

function formatPrice(price: number) {
  return Number(price || 0).toLocaleString("vi-VN") + "₫";
}

type PageProps = {
  searchParams: Promise<Record<string, string>>;
};

export default async function VNPayReturnPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const secureHash = params.vnp_SecureHash;
  const responseCode = params.vnp_ResponseCode;
  const txnRef = params.vnp_TxnRef;
  const transactionNo = params.vnp_TransactionNo;
  const bankCode = params.vnp_BankCode;
  const amount = Number(params.vnp_Amount || 0) / 100;

  const verifyParams = { ...params };
  delete verifyParams.vnp_SecureHash;
  delete verifyParams.vnp_SecureHashType;

  const sortedParams = sortObject(verifyParams);
  const signData = qs.stringify(sortedParams, { encode: false });

  const secretKey = process.env.VNPAY_HASH_SECRET || "";

  const signed = crypto
    .createHmac("sha512", secretKey)
    .update(Buffer.from(signData, "utf-8"))
    .digest("hex");

  const isValidSignature = signed === secureHash;
  const isPaid = isValidSignature && responseCode === "00";

  let updateMessage = "";

if (txnRef && isValidSignature) {
  const { data: orderData, error: orderReadError } = await supabase
    .from("orders")
    .select("id, stock_deducted")
    .eq("vnpay_txn_ref", txnRef)
    .single();

  if (orderReadError) {
    updateMessage = "Không tìm thấy đơn hàng để cập nhật.";
  } else {
    const { error } = await supabase
      .from("orders")
      .update({
        payment_status: isPaid ? "paid" : "failed",
        status: isPaid ? "Đã thanh toán" : "Thanh toán thất bại",
        vnpay_transaction_no: transactionNo || null,
        vnpay_response_code: responseCode || null,
        vnpay_bank_code: bankCode || null,
        paid_at: isPaid ? new Date().toISOString() : null,
      })
      .eq("vnpay_txn_ref", txnRef);

   if (error) {
  updateMessage = "Có lỗi khi cập nhật đơn hàng trong Supabase.";
} else {
  updateMessage = "Đã cập nhật trạng thái đơn hàng.";

  if (isPaid && orderData && !orderData.stock_deducted) {
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("product_id, quantity")
      .eq("order_id", orderData.id);

    if (!itemsError && orderItems) {
      for (const item of orderItems) {
        if (item.product_id) {
          await supabase.rpc("decrement_product_stock", {
            product_id_input: item.product_id,
            quantity_input: item.quantity,
          });
        }
      }

      await supabase
        .from("orders")
        .update({
          stock_deducted: true,
          stock_deducted_at: new Date().toISOString(),
        })
        .eq("id", orderData.id);

      updateMessage = "Thanh toán thành công và đã tự động trừ tồn kho.";
    }
  }

  if (isPaid && orderData?.id) {
    try {
      const emailResult = await sendOrderEmail(orderData.id);

      if (emailResult.skipped) {
        updateMessage += " Email đơn hàng đã được gửi trước đó.";
      } else {
        updateMessage += " Email thông báo đơn hàng đã được gửi về Gmail.";
      }
    } catch (emailError) {
      console.error("Send order email error:", emailError);
      updateMessage += " Nhưng gửi email thông báo bị lỗi.";
    }
  }
}
  }
}

  return (
    <main className="vnpayReturnPage">
      <section className="card">
        <p className="eyebrow">HMECHA PAYMENT</p>

        {isPaid ? (
          <>
            <h1>Thanh toán thành công</h1>
            <p className="desc">
              VNPAY đã xác nhận giao dịch thành công. Đơn hàng của bạn đã được
              cập nhật trong hệ thống.
            </p>
          </>
        ) : (
          <>
            <h1>Thanh toán chưa thành công</h1>
            <p className="desc">
              Giao dịch chưa hoàn tất hoặc chữ ký xác minh không hợp lệ.
            </p>
          </>
        )}

        <div className="infoGrid">
          <div>
            <span>Mã giao dịch web</span>
            <b>{txnRef || "Không có"}</b>
          </div>

          <div>
            <span>Mã giao dịch VNPAY</span>
            <b>{transactionNo || "Không có"}</b>
          </div>

          <div>
            <span>Ngân hàng</span>
            <b>{bankCode || "Không có"}</b>
          </div>

          <div>
            <span>Số tiền</span>
            <b>{formatPrice(amount)}</b>
          </div>

          <div>
            <span>Mã phản hồi</span>
            <b>{responseCode || "Không có"}</b>
          </div>

          <div>
            <span>Xác minh chữ ký</span>
            <b>{isValidSignature ? "Hợp lệ" : "Không hợp lệ"}</b>
          </div>
        </div>

        {updateMessage && <p className="updateMessage">{updateMessage}</p>}

        <div className="actions">
          <Link href="/" className="homeBtn">
            Về trang chủ
          </Link>

          <Link href="/tai-khoan/don-hang" className="adminBtn">
            Xem đơn hàng của tôi
          </Link>
        </div>
      </section>

      <style>{`
        .vnpayReturnPage {
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
          width: min(900px, 100%);
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

        .infoGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
          margin: 24px 0;
        }

        .infoGrid div {
          padding: 16px;
          border-radius: 16px;
          background: rgba(0,0,0,.22);
          border: 1px solid rgba(255,255,255,.1);
        }

        .infoGrid span {
          display: block;
          color: #b8c4e6;
          margin-bottom: 8px;
          font-size: 13px;
        }

        .infoGrid b {
          color: #00e5ff;
          word-break: break-word;
        }

        .updateMessage {
          color: #ff78d2;
          font-weight: 900;
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

        @media (max-width: 700px) {
          h1 {
            font-size: 34px;
          }

          .infoGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}