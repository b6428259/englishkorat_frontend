import type { Metadata } from "next";
import "./globals.css";
import ClientProvider from "../components/common/ClientProvider";

export const metadata: Metadata = {
  title: "English Korat",
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
      </body>
    </html>
  );
}
