import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["700", "800", "900"],
});

export const metadata: Metadata = {
  title: "WMX Services - Digital Agency",
  description: "Professional digital agency offering web development, mobile apps, and desktop applications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${poppins.variable} font-sans antialiased min-h-screen`}
        style={{
          backgroundColor: "#3D52F1",
          color: "#111111",
          fontFamily: "Inter, ui-sans-serif, system-ui"
        }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
