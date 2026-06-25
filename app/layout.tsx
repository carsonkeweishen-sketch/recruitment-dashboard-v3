import type { Metadata } from "next";
import "./globals.css";
import { AppShell } from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "Recruitment Dashboard v2",
  description: "智能招聘 AI 看板 — 招聘效率管理系统",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="h-full">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
