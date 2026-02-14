import type { Metadata } from "next";
import { Inter, Syne } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const syne = Syne({ subsets: ["latin"], variable: "--font-display", weight: ["400", "500", "600", "700", "800"] });

export const metadata: Metadata = {
    title: "Merekapade - AI-Powered Custom T-Shirt Design",
    description: "Create personalized t-shirts with Merekapade. Our AI-assisted design flow helps you create unique apparel with ease.",
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon.ico",
        apple: "/favicon.ico",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body suppressHydrationWarning className={`${inter.variable} ${syne.variable} font-sans bg-atelier-bg text-atelier-text antialiased`}>
                <Providers>
                    <div className="min-h-screen flex flex-col">
                        <Header />
                        <main className="flex-1">
                            {children}
                        </main>
                        <Footer />
                    </div>
                </Providers>
            </body>
        </html>
    );
}
