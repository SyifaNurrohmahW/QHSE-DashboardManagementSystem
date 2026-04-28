import { Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata = {
  title: "QHSE Dashboard",
  description: "QHSE Management System",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={roboto.className}>
      <body className={`${roboto.className} ${roboto.variable} ${robotoMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
