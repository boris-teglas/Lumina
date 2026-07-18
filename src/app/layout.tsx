import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GlowLink | Pametan booking i CRM za salone lepote",
  description: "Digitalni loyalty programi, automatski Instagram Story termini, mini CRM karton klijenta i zaštitna lista čekanja za salone lepote.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr">
      <body>{children}</body>
    </html>
  );
}
