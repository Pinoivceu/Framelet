import type { Metadata, Viewport } from "next";
import {
  IBM_Plex_Mono,
  IBM_Plex_Sans,
  Inter,
  JetBrains_Mono,
  Nunito,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";

const uiSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ui",
});
const uiMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ui-mono",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });

export const metadata: Metadata = {
  title: {
    default: "Framelet — useful little widgets for any page",
    template: "%s · Framelet",
  },
  description:
    "Create tidy clock, countdown, quote, progress, and focus widgets for Notion or any website.",
};

export const viewport: Viewport = {
  themeColor: "#f7f8f3",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${uiSans.variable} ${uiMono.variable} ${inter.variable} ${playfair.variable} ${jetbrains.variable} ${nunito.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
