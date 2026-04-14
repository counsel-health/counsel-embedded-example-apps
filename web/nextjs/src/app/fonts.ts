import { Instrument_Sans, Inter } from "next/font/google";

export const fontBody = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});
export const fontTitle = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-title",
});
export const fontMono = Inter({ subsets: ["latin"], variable: "--font-mono" });
