import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "書類作成ツール",
  description: "請求書・領収書作成ツール",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}