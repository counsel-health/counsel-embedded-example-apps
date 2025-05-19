import { useEffect, useState } from "react";
import { isMobileOrTabletFromUserAgent } from "@/lib/userAgent";

/**
 * Returns true if the device is a mobile device.
 * @param userAgent - The user agent string to make an initial educated guess. Useful for SSR.
 */
export function useMobile(userAgent?: string) {
  const [isMobile, setIsMobile] = useState(
    userAgent ? isMobileOrTabletFromUserAgent(userAgent) : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}
