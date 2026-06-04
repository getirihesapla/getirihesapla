import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import TabbedInterestCalculator from "@/components/calculators/TabbedInterestCalculator";

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
          <span className="text-amber-600">Faiz Hesaplama Araçları</span>
        </nav>

        {/* 4. Header & Intro (Moved to TabbedInterestCalculator) */}
        <div className="mb-8">
           <TabbedInterestCalculator />
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
        <section className="prose prose-lg dark:prose-invert max-w-none mb-16 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800">
          
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Basit Faiz Hesaplama Formülü</h2>
          <p>Basit faiz hesaplama formülü şu şekildedir:</p>
          <p className="font-mono bg-slate-100 dark:bg-slate-800 p-4 rounded-xl text-center font-bold">Basit Faiz = Anapara x Faiz Oranı x Zaman</p>
          
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Basit Faiz Nasıl Hesaplanır?</h3>
          <p className="font-mono bg-slate-100 dark:bg-slate-800 p-4 rounded-xl text-center font-bold mb-4">BasitFaiz = Anapara × FaizOranı × Zaman</p>
          <ul className="space-y-2">
            <li><strong>Anapara (P):</strong> Başlangıçta yatırılan veya borç alınan para miktarı.</li>
            <li><strong>Faiz Oranı (r):</strong> Yıllık faiz oranı. Genellikle yüzde (%) cinsinden ifade edilir ve hesaplamalarda ondalık olarak kullanılır (örneğin, %5 faiz oranı = 0.05).</li>
            <li><strong>Zaman (t):</strong> Faizin hesaplandığı süre.</li>
          </ul>
          
          <hr className="my-10 border-slate-200 dark:border-slate-800" />
          
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Bileşik Faiz Formülü</h2>
          <p className="font-mono bg-slate-100 dark:bg-slate-800 p-4 rounded-xl text-center font-bold mb-4">A = P × (1 + r/n)^(n×t)</p>
          <p><strong>Burada:</strong></p>
          <ul className="space-y-2">
            <li><strong>A:</strong> Faiz dahil toplam tutar</li>
            <li><strong>P:</strong> Anapara (başlangıçta yatırılan para)</li>
            <li><strong>r:</strong> Yıllık faiz oranı (ondalık biçimde ifade edilir)</li>
            <li><strong>n:</strong> Faizin kaç kez bileşik hale getirildiği (örneğin, yıllık = 1, altı aylık = 2, üç aylık = 4, aylık = 12, günlük = 365)</li>
            <li><strong>t:</strong> Süre (yıl olarak)</li>
          </ul>
          
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4">Bileşik Faiz Nasıl Hesaplanır?</h3>
          <p>
            Bileşik faiz hesaplama yöntemi, anaparanın her dönem sonunda biriken faizin de dahil edilerek büyütülmesi ilkesine dayanır. Bu sayede faiz, sadece anapara üzerinden değil, anapara + önceki dönem faizleri üzerinden hesaplanır. Bileşik faiz hesaplamasında, faiz birden fazla kez uygulanır ve zamanla daha yüksek getiriler sağlar.
          </p>

          <hr className="my-10 border-slate-200 dark:border-slate-800" />

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Vadeli Mevduat Faizi Hesaplama</h2>
          <p>
            Vadeli mevduat faiz hesaplaması, basit faiz yöntemi ile yapılır. Yani, yatırılan anapara üzerinden belirli bir faiz oranı uygulanarak hesaplanır.
          </p>
          <p className="font-mono bg-slate-100 dark:bg-slate-800 p-4 rounded-xl text-center font-bold">Basit Faiz Formülü: Faiz = Anapara × Faiz Oranı × VadeSuresi (Gün Cinsinden)</p>

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
