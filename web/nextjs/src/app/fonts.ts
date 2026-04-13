import { Instrument_Sans, Inter } from "next/font/google";

// Instrument Sans is the font counsel-main uses (shipped as InstrumentSans.ttf
// in the monorepo). Google Fonts publishes it under SIL OFL, so we can load it
// via next/font/google without vendoring the .ttf.
export const interBody = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});
export const interTitle = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-title",
});
// Keep Inter for mono slot (counsel-main uses GeistMono; Inter is a safe fallback here).
export const interMono = Inter({ subsets: ["latin"], variable: "--font-mono" });
