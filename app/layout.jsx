import { Inter, Plus_Jakarta_Sans } from "next/font/google";

import "@/styles/index.css";
import AppProviders from "@/components/providers/app-providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata = {
  title: "tourtoise",
  description:
    "Plan trips, discover destinations, and keep your travel journals together.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: { url: "/logo.png", type: "image/png" },
    apple: "/apple-touch-icon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#009966",
};

const RootLayout = ({ children }) => (
  <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
    <body>
      <AppProviders>{children}</AppProviders>
    </body>
  </html>
);

export default RootLayout;
