import { createPrivateKey, createPublicKey, KeyObject } from "crypto";
import { exportJWK, SignJWT } from "jose";
import { env } from "@/envConfig";

const JWT_ALG = "RS256";
const JWT_EXPIRY = "1h";
// Must match the kid registered in the Counsel API's orgByIssuer JWKS (keys.json in counsel-main)
const JWT_KID = "rsa-256-key-1";

let _publicJwk: Record<string, unknown> | null = null;
let _privateKey: KeyObject | null = null;

export async function getPublicJwk() {
  if (_publicJwk) return _publicJwk;
  const pem = env.COUNSEL_PRIVATE_KEY_PEM;
  if (!pem) throw new Error("COUNSEL_PRIVATE_KEY_PEM is required for JWT auth");
  const nodePrivateKey = createPrivateKey(pem);
  const nodePublicKey = createPublicKey(nodePrivateKey);
  const jwk = await exportJWK(nodePublicKey);
  _publicJwk = { ...jwk, kid: JWT_KID, use: "sig", alg: JWT_ALG };
  return _publicJwk;
}

function getPrivateKey(): KeyObject {
  if (_privateKey) return _privateKey;
  const pem = env.COUNSEL_PRIVATE_KEY_PEM;
  if (!pem)
    throw new Error(
      "COUNSEL_PRIVATE_KEY_PEM is required for issuer-based auth"
    );
  // Use Node.js crypto directly — jose's importPKCS8 uses Uint8Array.fromBase64
  // internally on Bun and fails on multi-line PEM (no whitespace tolerance).
  // createPrivateKey handles standard multi-line PEM natively.
  _privateKey = createPrivateKey(pem);
  return _privateKey;
}

export async function signCounselJwt(
  subject: string,
  issuer: string
): Promise<string> {
  const privateKey = getPrivateKey();
  return new SignJWT({ sub: subject })
    .setProtectedHeader({ alg: JWT_ALG, kid: JWT_KID })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .setIssuer(issuer)
    .sign(privateKey);
}
