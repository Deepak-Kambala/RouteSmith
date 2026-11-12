import type { Metadata } from "next";
import "./tailwind.css";

export const metadata: Metadata = {
  title: "RouteSmith — AI-Powered Experimentation Engineer",
  description: "Turn any product improvement goal into a live, measurable experiment with automated Flagsmith feature flags and Bayesian telemetry.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;650;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-[#111827]">
        {children}
      </body>
    </html>
  );
}
