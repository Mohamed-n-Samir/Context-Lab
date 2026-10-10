import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Context Lab — Reusable React contexts",
  description: "A growing library of portable React contexts with live demos and clear setup guides.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
