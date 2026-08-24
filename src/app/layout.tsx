import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Hall of Fame: The Cold War Exhibition Game",
  description: "หอเกียรติยศและเกมการเรียนรู้จัดแสดงนิทรรศการประวัติศาสตร์สงครามเย็นและองค์กรพหุภาคีสากล สำหรับ 8 กลุ่ม",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f] antialiased selection:bg-[#0066cc]/20 selection:text-[#0066cc]">
        {children}
      </body>
    </html>
  );
}
