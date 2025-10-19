import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Money Tracker",
  description: "A simple personal finance tracker built with Next.js and Prisma"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-gray-50 dark:bg-slate-950`}>
        <ThemeProvider>
          <main className="flex min-h-screen items-center justify-center p-6 sm:p-10">
            <div className="w-full max-w-6xl">{children}</div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
