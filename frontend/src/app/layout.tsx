import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Ticket System",
  description: "A modern ticket management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
