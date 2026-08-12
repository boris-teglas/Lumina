import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GlowLink | Pametan booking i CRM za salone lepote",
  description: "Automatski Instagram Story termini, mini CRM karton klijenta, pametna lista čekanja i zaštitna crna lista za salone lepote.",
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
