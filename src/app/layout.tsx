import type { Metadata } from "next";
import "./globals.css";
import ClientProvider from "../components/common/ClientProvider";
import { Analytics } from '@vercel/analytics/next';


export const metadata: Metadata = {
  title: "EnglishKorat",
  description: "Learn English Online with English Korat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        <ClientProvider>
          {children}
        </ClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
