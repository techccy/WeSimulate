import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WeSimulate - 朋友圈模拟生成器",
  description: "实时生成高度还原的微信朋友圈截图",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
