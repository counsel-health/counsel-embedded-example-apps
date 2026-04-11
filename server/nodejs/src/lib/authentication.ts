import crypto from "crypto";

export const safeCompare = (a: string, b: string) => {
  if (a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
};

export const stringCompare = (a: string, b: string): boolean => {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
};
