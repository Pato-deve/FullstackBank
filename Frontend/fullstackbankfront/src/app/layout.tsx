// app/layout.tsx
import "../app/globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "ITBANK homebanking",
  description:
    "Banco Argentarius ofrece cuentas flexibles, préstamos accesibles y herramientas de inversión innovadoras. Disfruta de banca en línea segura y atención personalizada para lograr tus objetivos financieros.",
  robots: {
    index: true,
    follow: true,
  },
};


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
