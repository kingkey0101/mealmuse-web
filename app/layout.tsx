import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppSessionProvider } from "@/components/session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MealMuse",
  description: "Your AI-powered recipe assistant - Discover, create, and share delicious recipes",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "MealMuse",
    description: "Your AI-powered recipe assistant - Discover, create, and share delicious recipes",
    url: "https://mymealmuse.com",
    siteName: "MealMuse",
    images: [
      {
        url: "https://mymealmuse.com/api/og",
        width: 1200,
        height: 630,
        alt: "MealMuse - AI-Powered Recipe Assistant",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MealMuse",
    description: "Your AI-powered recipe assistant",
    images: ["https://mymealmuse.com/api/og"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AppSessionProvider>{children}</AppSessionProvider>
      </body>
    </html>
  );
}
