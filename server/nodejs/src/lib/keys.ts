import { createPrivateKey, createPublicKey } from "crypto";
import { exportJWK, importPKCS8, SignJWT } from "jose";
import { env } from "@/envConfig";

const JWT_ALG = "RS256";
const JWT_EXPIRY = "1h";
// Must match the kid registered in the Counsel API's orgByIssuer JWKS (keys.json in counsel-main)
const JWT_KID = "rsa-256-key-1";

let _publicJwk: Record<string, unknown> | null = null;
let _privateKey: Awaited<ReturnType<typeof importPKCS8>> | null = null;

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

async function getPrivateKey() {
  if (_privateKey) return _privateKey;
  const pem = env.COUNSEL_PRIVATE_KEY_PEM;
  if (!pem) throw new Error("COUNSEL_PRIVATE_KEY_PEM is required for issuer-based auth");
  _privateKey = await importPKCS8(pem, JWT_ALG);
  return _privateKey;
}

export async function signCounselJwt(subject: string, issuer: string): Promise<string> {
  const privateKey = await getPrivateKey();
  return new SignJWT({ sub: subject })
    .setProtectedHeader({ alg: JWT_ALG, kid: JWT_KID })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRY)
    .setIssuer(issuer)
    .sign(privateKey);
}
