import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Startklaar — Klantenportaal",
  description: "Volg de voortgang van je project bij Startklaar.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
