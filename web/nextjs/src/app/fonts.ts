import { Instrument_Sans } from "next/font/google";

// Instrument Sans is the font counsel-main uses (shipped as InstrumentSans.ttf
// in the monorepo). Google Fonts publishes it under SIL OFL, so we can load it
// via next/font/google without vendoring the .ttf.
export const fontBody = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});
