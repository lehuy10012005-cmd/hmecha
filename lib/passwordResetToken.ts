import crypto from "crypto";

type ResetPayload = {
  email: string;
  exp: number;
  purpose: "password-reset";
};

function getSecret() {
  const secret =
    process.env.PASSWORD_RESET_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "";

  if (!secret) {
    throw new Error("Missing PASSWORD_RESET_SECRET or SUPABASE_SERVICE_ROLE_KEY");
  }

  return secret;
}

function base64Url(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

export function createPasswordResetToken(email: string) {
  const payload: ResetPayload = {
    email: email.trim().toLowerCase(),
    exp: Date.now() + 1000 * 60 * 30,
    purpose: "password-reset",
  };

  const encodedPayload = base64Url(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

export function verifyPasswordResetToken(token: string) {
  const [encodedPayload, signature] = String(token || "").split(".");

  if (!encodedPayload || !signature) {
    throw new Error("Token không hợp lệ.");
  }

  const expectedSignature = crypto
    .createHmac("sha256", getSecret())
    .update(encodedPayload)
    .digest("base64url");

  const valid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );

  if (!valid) {
    throw new Error("Token không hợp lệ.");
  }

  const payload = JSON.parse(
    Buffer.from(encodedPayload, "base64url").toString("utf8")
  ) as ResetPayload;

  if (payload.purpose !== "password-reset") {
    throw new Error("Token không đúng mục đích.");
  }

  if (!payload.email || Date.now() > payload.exp) {
    throw new Error("Link đặt lại mật khẩu đã hết hạn.");
  }

  return payload;
}