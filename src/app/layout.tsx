import type { Metadata } from "next";
import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
