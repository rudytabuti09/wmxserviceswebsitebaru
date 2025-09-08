import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import PWAInstaller from "@/components/pwa/PWAInstaller";

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
  title: {
    default: "WMX Services - Premium Digital Solutions",
    template: "%s | WMX Services"
  },
  description: "Transform your business with cutting-edge digital solutions. WMX Services delivers premium web applications, mobile apps, custom software development, and comprehensive digital transformation services. Trusted by businesses worldwide for innovative technology solutions.",
  keywords: [
    "web development",
    "mobile app development",
    "custom software",
    "digital agency",
    "UI/UX design",
    "e-commerce solutions",
    "digital transformation",
    "technology consulting",
    "software development",
    "responsive design"
  ],
  authors: [{ name: "WMX Services Team" }],
  creator: "WMX Services",
  publisher: "WMX Services",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "WMX Services - Premium Digital Solutions",
    description: "Transform your business with cutting-edge digital solutions. Expert web development, mobile apps, and custom software development services.",
    siteName: "WMX Services",
    images: [
      {
        url: "/images/wmx-services-og.png",
        width: 1200,
        height: 630,
        alt: "WMX Services - Premium Digital Solutions",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "WMX Services - Premium Digital Solutions",
    description: "Transform your business with cutting-edge digital solutions. Expert web development, mobile apps, and custom software development services.",
    images: ["/images/wmx-services-twitter.png"],
    creator: "@wmxservices",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-site-verification-code",
  },
  category: "technology",
  icons: {
    icon: [
      { url: '/icons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/icons/favicon.ico',
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/icons/safari-pinned-tab.svg',
        color: '#3D52F1',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Favicon and Icons - Simplified for better browser compatibility */}
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/icon" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/apple-icon" sizes="180x180" />
        
        {/* Theme Colors */}
        <meta name="theme-color" content="#3D52F1" />
        <meta name="msapplication-TileColor" content="#3D52F1" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${inter.variable} ${poppins.variable} font-sans antialiased min-h-screen`}
        style={{
          backgroundColor: "#3D52F1",
          color: "#111111",
          fontFamily: "Inter, ui-sans-serif, system-ui"
        }}
      >
        <Providers>{children}</Providers>
        <PWAInstaller />
      </body>
    </html>
  );
}
