import type { Metadata } from "next";
import { Fraunces, Geist } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "Clumsy Cheetah Bakes | Mumbai",
    template: "%s | Clumsy Cheetah Bakes",
  },
  description:
    "Handcrafted cakes, brownies, cookies and little moments of happiness — baked fresh in Bandra and delivered to your door.",
  openGraph: {
    title: "Clumsy Cheetah Bakes",
    description: "Life’s too short for boring cake.",
    type: "website",
    locale: "en_IN",
    images: [{ url: "/brand/logo.png", alt: "Clumsy Cheetah Bakes" }],
  },
  icons: {
    icon: "/brand/logo.png",
    apple: "/brand/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${geist.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
