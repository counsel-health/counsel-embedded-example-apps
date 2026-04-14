import { Instrument_Sans, Inter } from "next/font/google";

// Instrument Sans is the font counsel-main uses (shipped as InstrumentSans.ttf
// in the monorepo). Google Fonts publishes it under SIL OFL, so we can load it
// via next/font/google without vendoring the .ttf.
//
// Exports are named after their semantic CSS variable slot (fontBody, fontTitle,
// fontMono) rather than the underlying typeface so the names stay stable if the
// typeface is ever swapped.
export const fontBody = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});
export const fontTitle = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-title",
});
// Keep Inter for the mono slot (counsel-main uses GeistMono; Inter is a safe fallback).
export const fontMono = Inter({ subsets: ["latin"], variable: "--font-mono" });
