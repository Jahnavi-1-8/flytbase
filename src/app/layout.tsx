import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Account Quest | FlytBase Executive Live CRM",
  description:
    "Executive Monday Morning CRM with strict MCP rate-limited upstream sync, live signals polling, and 100% source-ID traceability.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}

