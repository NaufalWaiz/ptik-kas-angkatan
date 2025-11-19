import type { Metadata } from "next";
import { Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kas Angkatan Dashboard",
  description:
    "Frontend Next.js untuk memantau saldo kas angkatan dan mengelola transaksi melalui Backend Golang.",
  icons: {
    icon: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="kasangkatan">
      <body
        className={`${poppins.variable} ${geistMono.variable} antialiased bg-base-100 text-base-content`}
      >
        {children}
      </body>
    </html>
  );
}
