import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pratiksha Shirsat | Product Builder, Developer & Consultant",
  description:
    "Pratiksha Shirsat builds user-centered products across AI, enterprise platforms, data, and cloud systems.",
  keywords: [
    "Pratiksha Shirsat",
    "product manager",
    "product builder",
    "developer",
    "Salesforce consultant",
    "AI product",
  ],
  authors: [{ name: "Pratiksha Shirsat" }],
  openGraph: {
    title: "Pratiksha Shirsat | Product Builder",
    description:
      "Developer, consultant, and product builder turning conversations into working products.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
