import type { Metadata } from "next";
import { Inter, Crimson_Pro } from "next/font/google";
import "./globals.css";
import { MarketProvider } from "@/context/MarketContext";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const crimsonPro = Crimson_Pro({ subsets: ["latin"], variable: "--font-crimson-pro" });

export const metadata: Metadata = {
  title: "Korfu Finance | Profesyonel Analiz",
  description: "Korfu Finance; canlı BIST, kripto ve döviz verileriyle desteklenen, bileşik faiz, Gordon büyüme modeli ve portföy simülasyonu sunan profesyonel, reklamsız ve minimalist finansal hesaplama terminalidir.",
  keywords: ["getiri hesapla", "bileşik faiz hesaplama", "portföy simülasyonu", "gordon büyüme modeli", "hisse değerleme", "borsa portföy takip", "canlı bist verileri", "temettü hesaplama", "korfu finance", "kişisel finans yönetimi", "finansal terminal", "faiz hesaplama", "kredi hesaplama", "gelir gider takip"],
  icons: {
    icon: '/korfu_favicon.svg',
    apple: '/korfu_app_icon.svg',
  },
  openGraph: {
    title: "Korfu Finance | Profesyonel Analiz",
    description: "Korfu Finance; canlı BIST, kripto ve döviz verileriyle desteklenen, bileşik faiz, Gordon büyüme modeli ve portföy simülasyonu sunan profesyonel, reklamsız ve minimalist finansal hesaplama terminalidir.",
    url: "https://www.korfufinance.com",
    siteName: "Korfu Finance",
    images: [
      {
        url: "/korfu_app_icon.svg",
        width: 1024,
        height: 1024,
        alt: "Korfu Finance",
      },
    ],
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Korfu Finance | Profesyonel Analiz",
    description: "Korfu Finance; canlı BIST, kripto ve döviz verileriyle desteklenen, bileşik faiz, Gordon büyüme modeli ve portföy simülasyonu sunan profesyonel, reklamsız ve minimalist finansal hesaplama terminalidir.",
    images: ["/korfu_app_icon.svg"],
  },
};

export const viewport = {
  themeColor: "#0f172a",
};

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import LoadingScreen from "@/components/layout/LoadingScreen";
import TVTicker from "@/components/tradingview/TVTicker";
import { MobileMenuProvider } from "@/context/MobileMenuContext";


import MobileBottomNav from "@/components/layout/MobileBottomNav";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="data:application/manifest+json;charset=utf-8,%7B%22name%22%3A%22Korfu%20Finance%22%2C%22short_name%22%3A%22Korfu%20Finance%22%2C%22display%22%3A%22standalone%22%2C%22start_url%22%3A%22.%22%2C%22background_color%22%3A%22%230f172a%22%2C%22theme_color%22%3A%22%230f172a%22%2C%22icons%22%3A%5B%7B%22src%22%3A%22%2Fkorfu_app_icon.svg%22%2C%22sizes%22%3A%22192x192%20512x512%22%2C%22type%22%3A%22image%2Fsvg%2Bxml%22%2C%22purpose%22%3A%22any%20maskable%22%7D%5D%7D" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme') || 'system';
                if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
              
              // Kökten Çözüm: Eski PWA ve Cache kalıntılarını tüm cihazlarda zorla temizle
              if ('caches' in window) {
                caches.keys().then(function(names) {
                  for (let name of names) {
                    caches.delete(name);
                  }
                });
              }
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.getRegistrations().then(function(registrations) {
                  let hasUpdates = false;
                  for (let registration of registrations) {
                    registration.unregister();
                    hasUpdates = true;
                  }
                  if (hasUpdates) {
                    window.location.reload(true);
                  }
                });
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${crimsonPro.variable} font-sans antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 transition-colors duration-300`}>
        <LoadingScreen />
        <MarketProvider>
          <MobileMenuProvider>
            {/* Ticker at the absolute top */}
            <div className="z-50 relative">
              <TVTicker />
            </div>
            
            <div className="flex h-screen overflow-hidden pt-[54px] pb-16 md:pb-0"> {/* pb-16 for Mobile Nav padding on mobile, 0 on desktop */}
              <Sidebar />
              
              <div className="flex-1 flex flex-col w-full md:ml-64 overflow-hidden relative">
                <Header />
                <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">
                  {children}
                </main>

              </div>
            </div>
            
            {/* Mobile Bottom Navigation (Native App Feel) */}
            <MobileBottomNav />
            
          </MobileMenuProvider>
        </MarketProvider>
      </body>
    </html>
  );
}
