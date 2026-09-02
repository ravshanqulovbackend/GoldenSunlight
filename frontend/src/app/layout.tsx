import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "GoldenSunlight — cleanliness and care by your side every day",
    template: "%s | GoldenSunlight",
  },
  description:
    "A company that manufactures and supplies wet wipes, feminine hygiene products, baby products, and household cleaning products under the Sunlight, Peri, Rio, and Natural Fresh brands.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} h-full`}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="flex min-h-full flex-col bg-background text-on-background antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
