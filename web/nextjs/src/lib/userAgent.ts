import { UAParser } from "ua-parser-js";

export function isSSR() {
  return typeof window === "undefined";
}

async function getNextHeadersSSR() {
  if (!isSSR()) {
    throw new Error("getNextHeadersSSR can only be called in SSR");
  }
  const { headers } = await import("next/headers");
  return headers();
}

export async function getUserAgent(): Promise<string | undefined> {
  if (isSSR()) {
    const headersList = await getNextHeadersSSR();
    return headersList.get("User-Agent") ?? undefined;
  }
  return navigator.userAgent;
}

export function isMobileOrTabletFromUserAgent(userAgent: string): boolean {
  const { device } = new UAParser(userAgent).getResult();
  return device.is("mobile") || device.is("tablet");
}
