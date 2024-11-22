import * as OTPAuth from "otpauth";

export default function ValidateToken(secret, token) {
  if (!secret || !token) {
    return {
      error: "Invalid token",
    };
  }
  let totp = new OTPAuth.TOTP({
    issuer: "ACME",
    label: "QR Menu",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: secret,
  });

  let valid = totp.generate();

  if (token == valid) {
    return {
      data: {
        token: valid,
      },
    };
  } else {
    return {
      error: "Invalid token",
    };
  }
}
