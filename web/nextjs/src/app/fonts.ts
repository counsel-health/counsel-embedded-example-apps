import { Instrument_Sans, Inter } from "next/font/google";

export const interBody = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});
export const interTitle = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-title",
});
export const interMono = Inter({ subsets: ["latin"], variable: "--font-mono" });
