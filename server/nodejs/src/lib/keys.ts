import { createPrivateKey, createPublicKey } from "crypto";
import { exportJWK, importPKCS8, SignJWT } from "jose";
import { env } from "@/envConfig";
let _publicJwk: Record<string, unknown> | null = null;
export async function getPublicJwk() {
  if (_publicJwk) return _publicJwk;
  const nodePrivateKey = createPrivateKey(env.COUNSEL_PRIVATE_KEY_PEM);
  const nodePublicKey = createPublicKey(nodePrivateKey);
  const jwk = await exportJWK(nodePublicKey);
  _publicJwk = { ...jwk, kid: "rsa-256-key-1", use: "sig", alg: "RS256" };
  return _publicJwk;
}

export async function signCounselJwt(subject: string, issuer: string): Promise<string> {
  const privateKey = await importPKCS8(env.COUNSEL_PRIVATE_KEY_PEM, "RS256");
  return new SignJWT({ sub: subject })
    .setProtectedHeader({ alg: "RS256", kid: "rsa-256-key-1" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .setIssuer(issuer)
    .sign(privateKey);
}
