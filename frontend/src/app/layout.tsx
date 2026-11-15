import type { Metadata } from "next";
import "./tailwind.css";

export const metadata: Metadata = {
  title: "SearchForge // Flagsmith Bayesian Bench",
  description: "Zero-API-cost, real-time Hybrid Search & RRF Bayesian Experimentation Workbench powered by Flagsmith.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-screen w-screen overflow-hidden bg-[#07080C] text-slate-100 dot-matrix-bg select-none">
        {children}
      </body>
    </html>
  );
}
