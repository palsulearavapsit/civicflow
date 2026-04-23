import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { VoterProvider } from "@/context/VoterContext";
import { I18nProvider } from "@/context/I18nContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "CivicFlow | Your Election Copilot",
  description: "Navigate your voting journey with confidence. Real-time deadlines, polling places, and AI guidance.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        <I18nProvider>
          <AuthProvider>
            <VoterProvider>
              {children}
            </VoterProvider>
          </AuthProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
