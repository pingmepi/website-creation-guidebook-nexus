import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Providers } from "./providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

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
            <head>
                {GTM_ID && (
                    <Script
                        id="gtm-script"
                        strategy="afterInteractive"
                        dangerouslySetInnerHTML={{
                            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
                        }}
                    />
                )}
            </head>
            <body suppressHydrationWarning className="font-sans bg-atelier-bg text-atelier-text antialiased">
                {GTM_ID && (
                    <noscript>
                        <iframe
                            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
                            height="0"
                            width="0"
                            style={{ display: "none", visibility: "hidden" }}
                        />
                    </noscript>
                )}
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
