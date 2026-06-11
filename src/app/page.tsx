import RealMarketOverview from "@/components/tradingview/RealMarketOverview";
import CalculatorGrid from "@/components/calculators/CalculatorGrid";
import HistoryPanel from "@/components/calculators/HistoryPanel";
import FooterWithModals from "@/components/layout/FooterWithModals";

export default function Home() {
  return (
    <>
      <div className="container mx-auto px-4 md:px-8 py-8">

        {/* Canlı Piyasalar (Gerçek Zamanlı) */}
        <section className="mb-12">
          <h2 className="text-xl font-serif font-bold text-amber-600 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
            Öne Çıkan Piyasalar
          </h2>
          <RealMarketOverview />
        </section>


        {/* Hesaplama Araçları */}
        <section id="pdf-export-area" className="pb-10">
          <h2 className="text-xl font-serif font-bold text-amber-600 mb-4 border-b border-slate-200 dark:border-slate-800 pb-2">
            Hesaplama Araçları
          </h2>
          <div className="flex flex-col gap-10">
            <div className="w-full">
              <CalculatorGrid />
            </div>
            <div className="w-full">
              <HistoryPanel />
            </div>
          </div>
        </section>

        {/* Metodoloji & Vizyon */}
        <section className="mt-8 bg-slate-50 dark:bg-[#0f172a] border-t-2 border-amber-600/50 rounded-2xl p-8 lg:p-10 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Hakkımızda / Vizyon */}
            <div className="flex flex-col justify-center">
              <h3 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-4">Korfu Vizyonu</h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400 font-medium">
                <strong className="text-amber-600 dark:text-amber-500">KorfuFinance.com;</strong> finansal kararlarda sezgileri değil, rasyonel matematiği rehber edinen yatırımcılar için tasarlanmış bağımsız bir analiz platformudur. Amacımız, paranın zaman değerini ve piyasa risklerini herkes için şeffaf ve ölçülebilir kılmaktır.
              </p>
            </div>

            {/* Manifesto / İddialı Vizyon Bloğu */}
            <div className="border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-6 md:pt-0 md:pl-10 flex flex-col gap-6">
              <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                <strong className="text-amber-600 dark:text-amber-500 block mb-1">Kurumsal Güç, Bireysel Özgürlük</strong>
                Piyasa gürültüsünü ve spekülasyonları bir kenara bırakıyoruz. Amacımız; dev fonların ve kurumsal aktörlerin kullandığı rasyonel finans matematiğini, pürüzsüz ve minimalist bir deneyimle doğrudan yatırımcının parmaklarının ucuna getirmektir.
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                <strong className="text-amber-600 dark:text-amber-500 block mb-1">Verinin ve Matematiğin Mutlak Hakimiyeti</strong>
                Finansal kararlarda sezgilere yer yoktur. Korfu; paranın zaman değerini, risk parametrelerini ve içsel değerleme modellerini şeffaf algoritmalara dökerek yatırımlarınıza matematiksel bir kesinlik kazandırır.
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                <strong className="text-amber-600 dark:text-amber-500 block mb-1">Geleceğin Finansal Terminali</strong>
                Estetikten ödün vermeyen, dikkat dağıtmayan ve tamamen amaca odaklanan bir ekosistem inşa ediyoruz. Karmaşık finans dünyasını rafine bir vizyonla yeniden tanımlıyor, modern sermaye yönetimine rehberlik ediyoruz.
              </div>
            </div>
          </div>
        </section>
      </div>

      <FooterWithModals />
    </>
  );
}
