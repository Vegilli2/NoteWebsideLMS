import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NoteWebside LMS",
  description: "Moderne LMS-plattform for salg og levering av norskkurs.",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="nb">
      <body>{children}</body>
    </html>
  );
}
