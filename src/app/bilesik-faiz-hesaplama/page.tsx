import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import UnifiedInterestCalculator from "@/components/calculators/UnifiedInterestCalculator";

// 1. Dynamic Metadata & SEO
export const metadata: Metadata = {
  title: "Faiz Karşılaştırma Motoru | Korfu Finance",
  description: "Basit faiz, bileşik faiz ve vadeli mevduat getirilerini eşzamanlı olarak karşılaştırın.",
  keywords: "bileşik faiz, bileşik faiz hesaplama, mevduat getirisi, yatırım hesaplama, faiz hesaplama aracı, korfu finance",
  alternates: {
    canonical: "https://www.korfufinance.com/bilesik-faiz-hesaplama",
  },
  openGraph: {
    title: "Faiz Karşılaştırma Motoru | Korfu Finance",
    description: "Basit faiz, bileşik faiz ve vadeli mevduat getirilerini eşzamanlı olarak karşılaştırın.",
    url: "https://www.korfufinance.com/bilesik-faiz-hesaplama",
    siteName: "Korfu Finance",
    images: [
      {
        url: "https://www.korfufinance.com/korfu_app_icon.svg",
        width: 800,
        height: 600,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Faiz Karşılaştırma Motoru | Korfu Finance",
    description: "Basit faiz, bileşik faiz ve vadeli mevduat getirilerini eşzamanlı olarak karşılaştırın.",
  },
};

export default function BilesikFaizPage() {
  
  // 2. Schema Markup (WebPage + FAQ)
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "name": "Faiz Karşılaştırma Motoru",
        "description": "Basit, bileşik ve vadeli mevduat getirilerini karşılaştırma aracı.",
        "url": "https://www.korfufinance.com/bilesik-faiz-hesaplama",
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Bileşik faiz nedir?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Bileşik faiz, anaparanın yanı sıra daha önce kazanılmış faizlerin üzerinden de faiz hesaplanması durumudur. Kısaca faizin faizidir ve uzun vadede yatırımları katlayarak büyütür."
            }
          },
          {
            "@type": "Question",
            "name": "Bileşik faiz nasıl hesaplanır?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Bileşik faiz formülü: A = P(1 + r/n)^(nt). Burada A toplam tutar, P anapara, r yıllık faiz oranı, n bir yıldaki faizlenme sayısı ve t yıl cinsinden zamandır."
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-slate-200">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }} />

      <main className="container mx-auto px-4 md:px-8 py-10 max-w-6xl">
        
        {/* 3. Breadcrumb Sistemi */}
        <nav aria-label="breadcrumb" className="text-xs font-semibold text-slate-500 mb-8 uppercase tracking-widest flex items-center gap-2">
          <Link href="/" className="hover:text-amber-600 transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <span className="text-amber-600">Faiz Karşılaştırma Motoru</span>
        </nav>

        {/* 4. Header & Intro */}
        <header className="mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-6">
            Faiz <span className="text-amber-600">Karşılaştırma Motoru</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
            Yatırımlarınızın zaman içindeki büyümesini Korfu Finance'in profesyonel algoritmasıyla hesaplayın. Basit faiz, bileşik faiz ve net vadeli mevduat getirilerini aynı anda kıyaslayarak en avantajlı stratejiyi belirleyin.
          </p>
        </header>

        {/* 5. Tool Section (Lazy loaded / Client Component) */}
        <div className="mb-16">
           <UnifiedInterestCalculator />
        </div>

        {/* 6. İçerik Blokları & Bilgi Kartları */}
        <section className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <article className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-3xl mb-4">📈</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Kartopu Etkisi</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Kazanılan faizin ana paraya eklenmesiyle sonraki dönemlerde daha yüksek getiri elde edilir. Vade uzadıkça büyüme eğrisi parabolik bir şekil alır.
            </p>
          </article>
          <article className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-3xl mb-4">⏱️</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Zamanın Gücü</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Erken yaşta küçük miktarlarla bileşik getiri yatırımına başlamak, geç yaşta büyük miktarlarla yapılan yatırımdan daha fazla kâr getirebilir.
            </p>
          </article>
          <article className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="text-3xl mb-4">🛡️</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Enflasyon Korunması</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Doğru oranda çalışan bileşik faiz sistemi, anaparanızın enflasyon karşısında erimesini engellemekle kalmaz, net reel getiri sağlar.
            </p>
          </article>
        </section>

        {/* 7. Açıklayıcı İçerik ve Rehber (SEO Content) */}
        <section className="prose prose-lg dark:prose-invert max-w-none mb-16">
          <h2 className="text-3xl font-serif font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3 mb-6">
            Bileşik Faiz Nedir ve Neden Önemlidir?
          </h2>
          <p>
            Bileşik faiz, basit faizden farklı olarak sadece anapara üzerinden değil, daha önceki dönemlerde kazanılmış olan faizlerin de anaparaya eklenmesiyle elde edilen faizdir. Bu özellik, yatırımlarınızın zaman içinde eksponansiyel (katlanarak) büyümesini sağlar. Finansal okuryazarlığın temel taşlarından biridir.
          </p>
          
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">
            Bileşik Faiz Hesaplama Formülü
          </h3>
          <p>
            Hesaplama aracı arka planda şu matematiksel formülü kullanır: <code>A = P(1 + r/n)^(nt)</code>
          </p>
          <ul>
            <li><strong>A:</strong> Gelecekteki toplam değer (Anapara + Faiz)</li>
            <li><strong>P:</strong> Anapara (Başlangıç yatırımı)</li>
            <li><strong>r:</strong> Yıllık faiz veya getiri oranı (Ondalık cinsinden)</li>
            <li><strong>n:</strong> Faizin yılda kaç kez bileşikleneceği (Örn: Aylık için 12)</li>
            <li><strong>t:</strong> Yıl cinsinden süre</li>
          </ul>

          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-8 mb-4">
            Yatırım Stratejisi Olarak Bileşik Getiri
          </h3>
          <p>
            Sadece banka mevduatlarında değil; temettü veren hisse senetlerinde (Geri alım yaparak), yatırım fonlarında ve Eurobond'larda elde ettiğiniz kupon gelirlerini tekrar aynı araca yatırarak kendi bileşik getiri sisteminizi kurabilirsiniz. Profesyonel yatırımcıların en büyük silahı piyasa zamanlaması değil, piyasada kalınan süredir (Time in the market beats timing the market).
          </p>
        </section>

        {/* 8. Sık Sorulan Sorular (FAQ) */}
        <section className="bg-slate-100 dark:bg-slate-900/50 rounded-3xl p-8 md:p-12 border border-slate-200 dark:border-slate-800">
          <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-8 text-center">
            Sık Sorulan Sorular
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Basit faiz ile bileşik faiz arasındaki fark nedir?</h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Basit faiz her dönem sadece ilk baştaki anapara üzerinden hesaplanırken, bileşik faiz birikmiş (faiz eklenmiş) toplam tutar üzerinden hesaplanır.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Bileşik faizde vade kısaldıkça getiri artar mı?</h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Evet, faizlenme sıklığı (aylık, günlük vs.) arttıkça, aynı yıllık faiz oranında bile elde edeceğiniz efektif getiri daha yüksek olur.
              </p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Düzenli ekleme yapmak sonucu nasıl etkiler?</h4>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Her ay düzenli olarak anaparaya ekleme yapmak, bileşik faizin etkisini inanılmaz derecede hızlandırır. 10 yıllık bir projeksiyonda düzenli alımlar, sonuca çarpan etkisi yapar.
              </p>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
