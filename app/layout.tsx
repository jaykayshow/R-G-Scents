import type { Metadata } from "next";
import { Playfair_Display, Manrope } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/toaster";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "R&G Scents | The Billionaire Collection",
  description:
    "Luxury is not worn. It is remembered. Discover The Billionaire Collection by R&G Scents — timeless fragrances crafted for men who leave a legacy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${playfair.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-fg">
        <ThemeProvider>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
