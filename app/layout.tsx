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
    url: "https://mealmuse.com",
    siteName: "MealMuse",
    images: [
      {
        url: "/favicon.ico",
        width: 192,
        height: 192,
        alt: "MealMuse Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "MealMuse",
    description: "Your AI-powered recipe assistant",
    images: ["/favicon.ico"],
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
