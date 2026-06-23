import crypto from "crypto";

type ResetChallengePayload = {
  email: string;
  codeHash: string;
  nonce: string;
  exp: number;
  purpose: "password-reset-otp";
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

function sign(value: string) {
  return crypto
    .createHmac("sha256", getSecret())
    .update(value)
    .digest("base64url");
}

function hashCode(email: string, code: string, nonce: string) {
  return crypto
    .createHmac("sha256", getSecret())
    .update(`${email.trim().toLowerCase()}:${code}:${nonce}`)
    .digest("hex");
}

function base64Url(value: string) {
  return Buffer.from(value).toString("base64url");
}

export function createPasswordResetChallenge(email: string) {
  const cleanEmail = email.trim().toLowerCase();
  const code = crypto.randomInt(100000, 1000000).toString();
  const nonce = crypto.randomBytes(16).toString("hex");

  const payload: ResetChallengePayload = {
    email: cleanEmail,
    codeHash: hashCode(cleanEmail, code, nonce),
    nonce,
    exp: Date.now() + 1000 * 60 * 10,
    purpose: "password-reset-otp",
  };

  const encodedPayload = base64Url(JSON.stringify(payload));
  const signature = sign(encodedPayload);

  return {
    code,
    challengeToken: `${encodedPayload}.${signature}`,
  };
}

export function verifyPasswordResetChallenge(token: string, code: string) {
  const [encodedPayload, signature] = String(token || "").split(".");

  if (!encodedPayload || !signature) {
    throw new Error("Mã xác nhận không hợp lệ.");
  }

  const expectedSignature = sign(encodedPayload);

  if (signature.length !== expectedSignature.length) {
    throw new Error("Mã xác nhận không hợp lệ.");
  }

  const validSignature = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );

  if (!validSignature) {
    throw new Error("Mã xác nhận không hợp lệ.");
  }

  const payload = JSON.parse(
    Buffer.from(encodedPayload, "base64url").toString("utf8")
  ) as ResetChallengePayload;

  if (payload.purpose !== "password-reset-otp") {
    throw new Error("Mã xác nhận không đúng mục đích.");
  }

  if (!payload.email || Date.now() > payload.exp) {
    throw new Error("Mã xác nhận đã hết hạn. Vui lòng gửi lại mã mới.");
  }

  const cleanCode = String(code || "").trim();

  if (!/^\d{6}$/.test(cleanCode)) {
    throw new Error("Vui lòng nhập đúng mã 6 chữ số.");
  }

  const expectedCodeHash = hashCode(payload.email, cleanCode, payload.nonce);

  if (expectedCodeHash.length !== payload.codeHash.length) {
    throw new Error("Mã xác nhận không đúng.");
  }

  const validCode = crypto.timingSafeEqual(
    Buffer.from(expectedCodeHash),
    Buffer.from(payload.codeHash)
  );

  if (!validCode) {
    throw new Error("Mã xác nhận không đúng.");
  }

  return payload;
}