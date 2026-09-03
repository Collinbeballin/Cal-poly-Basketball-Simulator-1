import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { AppInit } from "@/components/AppInit";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cal Poly Basketball — Cognitive Simulator",
  description:
    "First-person basketball decision-making training for Cal Poly men's basketball.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="min-h-screen bg-ink-950 font-display text-white antialiased">
        <AppInit />
        {children}
      </body>
    </html>
  );
}
