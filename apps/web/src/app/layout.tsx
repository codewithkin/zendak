import type { Metadata } from "next";
import { Geist } from "next/font/google";

import "../index.css";
import Providers from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "zendak",
  description: "zendak",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased`}>
        <Providers>
          <div className="grid grid-rows-[1fr] h-svh">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
