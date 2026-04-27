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

import ErrorBoundary from "@/components/ErrorBoundary";

import { ThemeProvider } from "@/context/ThemeContext";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import { Suspense } from "react";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>
        <a 
          href="#main-content" 
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[999] bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow-xl"
        >
          Skip to main content
        </a>
        <ThemeProvider>

          <I18nProvider>
            <AuthProvider>
              <VoterProvider>
                <ErrorBoundary>
                  <ServiceWorkerRegistration />
                  <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
                    {children}
                  </Suspense>
                </ErrorBoundary>
              </VoterProvider>
            </AuthProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}



