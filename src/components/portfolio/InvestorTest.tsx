"use client";

import React, { useState, useRef } from "react";
import html2canvas from "html2canvas";

const QUESTIONS_POOL = [
  {
    id: 1, text: "Yatırım yaparken nihai vizyonunuz hangisidir?",
    options: [
      { text: "Agresif", profiles: ["P1", "P6"] },
      { text: "Temettü", profiles: ["P2", "P10"] },
      { text: "Dengeli", profiles: ["P3", "P8"] },
      { text: "Defansif", profiles: ["P4", "P11"] }
    ]
  },
  {
    id: 2, text: "Portföyünüz bir haftada %30 erirse ilk psikolojik tepkiniz ne olur?",
    options: [
      { text: "Kaldıraçlı ekleme", profiles: ["P1", "P12"] },
      { text: "Lot artırma", profiles: ["P5", "P2"] },
      { text: "Sepet dengesi izleme", profiles: ["P3", "P8"] },
      { text: "Panikle nakde geçme", profiles: ["P12", "P11"] }
    ]
  },
  {
    id: 3, text: "Bir hisse veya varlığı seçerken en çok hangi veriye güvenirsiniz?",
    options: [
      { text: "Sosyal medya trendi", profiles: ["P12"] },
      { text: "Temettü geçmişi", profiles: ["P2", "P10"] },
      { text: "F/K ve içsel değer (DCF)", profiles: ["P5"] },
      { text: "Banka/Devlet garantisi", profiles: ["P4", "P11"] }
    ]
  },
  {
    id: 4, text: "Paranıza ne kadar süre boyunca hiç dokunmadan piyasada bırakabilirsiniz?",
    options: [
      { text: "Birkaç hafta", profiles: ["P6", "P12"] },
      { text: "10 yıl ve üzeri", profiles: ["P5", "P8", "P2"] },
      { text: "1-5 yıl orta vade", profiles: ["P3", "P10"] },
      { text: "Her an çekebileceğim kadar kısa", profiles: ["P11", "P4"] }
    ]
  },
  {
    id: 5, text: "Ekonomik kriz ve resesyon kelimeleri size ne hissettiriyor?",
    options: [
      { text: "Kumar fırsatı", profiles: ["P1", "P7"] },
      { text: "Ucuz mal toplama şansı", profiles: ["P5", "P3"] },
      { text: "Yeniden dengeleme zamanı", profiles: ["P3", "P8"] },
      { text: "Kaçış sinyali", profiles: ["P4", "P11"] }
    ]
  },
  {
    id: 6, text: "Teknik analiz grafiklerindeki indikatörler (RSI, MACD) sizin için ne ifade eder?",
    options: [
      { text: "Ana stratejimdir", profiles: ["P6"] },
      { text: "Çok bakmam bilançoya bakarım", profiles: ["P5", "P10"] },
      { text: "Destekleyici yan araçtır", profiles: ["P3"] },
      { text: "Güvenmem", profiles: ["P4", "P8"] }
    ]
  },
  {
    id: 7, text: "Yatırım dünyasından kendinize bir idol seçseniz bu kim olurdu?",
    options: [
      { text: "Kripto Balinaları", profiles: ["P1", "P6"] },
      { text: "Temettü Emeklileri", profiles: ["P2", "P10"] },
      { text: "Warren Buffett", profiles: ["P5", "P3"] },
      { text: "Merkez Bankası Başkanları", profiles: ["P4", "P11"] }
    ]
  },
  {
    id: 8, text: "Şu anki birikimlerinizin ağırlıklı gücü nerede duruyor?",
    options: [
      { text: "Kripto/Büyüme hisseleri", profiles: ["P1", "P9"] },
      { text: "Temettü şirketleri", profiles: ["P2", "P10"] },
      { text: "Fon/Eurobond sepeti", profiles: ["P3", "P8"] },
      { text: "Altın/Mevduat", profiles: ["P4", "P11"] }
    ]
  },
  {
    id: 9, text: "Bir şirketin kar ettiğini duyduğunuzda ilk baktığınız şey nedir?",
    options: [
      { text: "Kaç tavan yaptırır?", profiles: ["P1", "P12"] },
      { text: "Ne kadarını temettü dağıtır?", profiles: ["P2", "P10"] },
      { text: "Özsermaye karlılığı ne olmuş?", profiles: ["P5", "P3"] },
      { text: "Batma riski var mı?", profiles: ["P4", "P11"] }
    ]
  },
  {
    id: 10, text: "Halk arzlar hakkında ne düşünüyorsunuz?",
    options: [
      { text: "Tavan serisi bittiğinde spekülatif oynarım", profiles: ["P1", "P6"] },
      { text: "Uzun vadeli lot biriktiririm", profiles: ["P5", "P10"] },
      { text: "Endeks ağırlığına göre taşırım", profiles: ["P3", "P8"] },
      { text: "İlk sinyalde çıkarım", profiles: ["P12", "P11"] }
    ]
  },
  {
    id: 11, text: "Enflasyonun %50 olduğu yerde %60 faiz veren mevduat görseniz ne yaparsınız?",
    options: [
      { text: "Yüzüne bakmam", profiles: ["P1", "P9"] },
      { text: "Bir kısmını nakit akışı için düşünürüm", profiles: ["P3", "P11"] },
      { text: "Defans dengesi için rasyonel bulurum", profiles: ["P4", "P8"] },
      { text: "Tüm paramı yığarım", profiles: ["P4", "P11"] }
    ]
  },
  {
    id: 12, text: "Bir yatırım enstrümanı sosyal medyada çok övülüyorsa tavrınız ne olur?",
    options: [
      { text: "FOMO ile hemen alırım", profiles: ["P12"] },
      { text: "Temettü vermiyorsa ilgilenmem", profiles: ["P2", "P10"] },
      { text: "Spekülasyon kokusu alır şortlarım", profiles: ["P7", "P6"] },
      { text: "Korkar uzak dururum", profiles: ["P4", "P5"] }
    ]
  },
  {
    id: 13, text: "Yıllık getiri hedefiniz kabaca yüzde kaçtır?",
    options: [
      { text: "%100 ve üzeri", profiles: ["P1", "P9"] },
      { text: "Enflasyon üstü + pasif gelir", profiles: ["P2", "P10"] },
      { text: "Sürdürülebilir %35 reel büyüme", profiles: ["P3", "P5"] },
      { text: "Sadece anaparam erimesin", profiles: ["P4", "P11"] }
    ]
  },
  {
    id: 14, text: "Yatırım fonları (TEFAS) hakkında ne düşünüyorsunuz?",
    options: [
      { text: "Çok yavaşlar", profiles: ["P1", "P6"] },
      { text: "Hisse yoğun temettü fonları iyi", profiles: ["P2", "P10"] },
      { text: "Çeşitlendirmeyi profesyonellere bırakmak harika", profiles: ["P3", "P8"] },
      { text: "Sadece altın/para piyasası fonu alırım", profiles: ["P4", "P11"] }
    ]
  },
  {
    id: 15, text: "Sizce para tam olarak nedir?",
    options: [
      { text: "Büyük riskler almak için oyun aracı", profiles: ["P1", "P7"] },
      { text: "Çalışmak zorunda kalmamamı sağlayacak asker", profiles: ["P2", "P5"] },
      { text: "Geleceğimi güvenceye alacak rasyonel güç", profiles: ["P3", "P8"] },
      { text: "Kaybedilmemesi gereken en kutsal varlık", profiles: ["P4", "P11"] }
    ]
  },
  {
    id: 16, text: "Bir arkadaşınız size tüyo (kesin yükselecek tüyo) verdiğinde ne yaparsınız?",
    options: [
      { text: "Hiç düşünmeden hemen alırım", profiles: ["P12"] },
      { text: "Finansallarına bakar, temettü durumunu incelerim", profiles: ["P5", "P2"] },
      { text: "Kulak asmam kendi araştırmamı yaparım", profiles: ["P3", "P5"] },
      { text: "Spekülatif kağıtlardan kaçarım", profiles: ["P4", "P8"] }
    ]
  },
  {
    id: 17, text: "Açığa satış (Short) veya VİOP kaldıraçlı işlemler hakkında fikriniz nedir?",
    options: [
      { text: "Kazancımı maksimize ettiğim ana silahımdır", profiles: ["P1", "P7"] },
      { text: "Çok tehlikeli, kumar gibi görürüm", profiles: ["P12", "P2"] },
      { text: "Sadece profesyonel hedge amaçlı kullanılmalı", profiles: ["P3", "P5"] },
      { text: "Hayatta işim olmaz", profiles: ["P4", "P11", "P8"] }
    ]
  },
  {
    id: 18, text: "Gelişmekte olan yeni start-up'lara veya teknoloji şirketlerine yatırım yapmak?",
    options: [
      { text: "Geleceğin Apple'ını bulmak için harika", profiles: ["P9", "P1"] },
      { text: "Erken aşamada temettü vermedikleri için pas geçerim", profiles: ["P2", "P10"] },
      { text: "Sepetimde %5-10 yer ayırabilirim", profiles: ["P3", "P8"] },
      { text: "Çok riskli, batma şansı çok yüksek", profiles: ["P4", "P11"] }
    ]
  },
  {
    id: 19, text: "Piyasa yatay (testere) bandına girdiğinde ne yaparsınız?",
    options: [
      { text: "Sıkılır kriptoya veya oynaklığı yüksek varlıklara geçerim", profiles: ["P1", "P12"] },
      { text: "Temettülerimi elime alıp keyfime bakarım", profiles: ["P2", "P10"] },
      { text: "Maliyet düşürmek için harika bir toplama dönemi derim", profiles: ["P5", "P3"] },
      { text: "Pozisyonumu bozmadan beklerim", profiles: ["P8", "P4"] }
    ]
  },
  {
    id: 20, text: "Yatırım yaparken kendinizi ne kadar sabırlı görüyorsunuz?",
    options: [
      { text: "Hiç sabrım yok ekranı sürekli izlerim", profiles: ["P12", "P6"] },
      { text: "10 yıl boyunca satmadan bekleyebilirim", profiles: ["P5", "P8"] },
      { text: "Planladığım hedef fiyata gelene kadar rasyonel beklerim", profiles: ["P3", "P5"] },
      { text: "Güvende olduğum sürece zaman önemli değil", profiles: ["P4", "P11"] }
    ]
  },
  {
    id: 21, text: "Yatırım kararlarınızı alırken en çok hangi platformu/aracı kullanırsınız?",
    options: [
      { text: "Telegram/X ve sosyal medya sinyalleri", profiles: ["P12"] },
      { text: "Şirketlerin KAP bildirimleri ve temettü tabloları", profiles: ["P2", "P10"] },
      { text: "Korfu Finance ve bilançolar", profiles: ["P5", "P3"] },
      { text: "Banka danışmanları", profiles: ["P4", "P11"] }
    ]
  },
  {
    id: 22, text: "Birikimlerinizi artırmak için yaşam standardınızdan kısar mısınız?",
    options: [
      { text: "Hayır, parayı piyasada katlayarak harcarım", profiles: ["P1", "P12"] },
      { text: "Evet, sonraki yıllarda daha çok pasif gelir için feda ederim", profiles: ["P2", "P10"] },
      { text: "Belirli bir bütçe planım var rasyonel yaşarım", profiles: ["P3", "P8"] },
      { text: "Zaten birikim yapmak ana odağım her zaman kısarım", profiles: ["P4", "P5"] }
    ]
  },
  {
    id: 23, text: "FED veya TCMB faiz kararlarını ne sıklıkla takip edersiniz?",
    options: [
      { text: "Sadece piyasa oynaklığı yaratıp kaldıraç fırsatı verdiğinde bakarım", profiles: ["P1", "P6"] },
      { text: "Şirketlerimin borçlanma maliyetlerini etkilediği için incelerim", profiles: ["P5", "P3"] },
      { text: "Makro sepet dağılımımı değiştirmek için her toplantıyı izlerim", profiles: ["P3", "P8"] },
      { text: "Faiz arttıkça mevduat oranlarına bakarım", profiles: ["P11", "P4"] }
    ]
  },
  {
    id: 24, text: "Yabancı hisse senetleri (Apple, Tesla vb.) portföyünüzde ne kadar yer tutuyor?",
    options: [
      { text: "Yoğunlukla oradayım, büyük teknoloji rallilerini severim", profiles: ["P9", "P1"] },
      { text: "Sadece yüksek temettü ödeyen yabancı şirketleri taşırım", profiles: ["P10", "P2"] },
      { text: "Eurobond veya yabancı fonlar üzerinden dengeli taşırım", profiles: ["P3", "P8"] },
      { text: "Vergilendirme ve riskler yüzünden uzak dururum", profiles: ["P4", "P11"] }
    ]
  },
  {
    id: 25, text: "Yatırımda en büyük korkunuz nedir?",
    options: [
      { text: "Treni kaçırmak ve başkaları zengin olurken izlemek (FOMO)", profiles: ["P12", "P1"] },
      { text: "Şirketlerin temettüyü kesmesi veya azaltması", profiles: ["P2", "P10"] },
      { text: "Rasyonel analizlerimin piyasa tarafından manipüle edilmesi", profiles: ["P5", "P3"] },
      { text: "Anaparamın tamamen sıfırlanması", profiles: ["P4", "P11"] }
    ]
  }
];

const PROFILES: Record<string, { title: string; desc: string; icon: string; colors: string; textStyle: string }> = {
  "P1": { title: "Agresif Boğa", desc: "Kripto, kaldıraç ve yüksek riskli büyüme hisseleri aşığı.", icon: "🐂", colors: "from-blue-500 to-purple-500", textStyle: "text-white" },
  "P2": { title: "Temettü Avcısı", desc: "Düzenli pasif gelir, nakit akışı ve bileşik getirinin gücüne inanan emeklilik adayı.", icon: "🌳", colors: "from-emerald-500 to-amber-400", textStyle: "text-white" },
  "P3": { title: "Dengeli Filozof", desc: "Fon sepetleri, borsa ve tahvil dengesini makroekonomiye göre kusursuz yöneten rasyonel akıl.", icon: "⚖️", colors: "from-slate-800 to-slate-400", textStyle: "text-white" },
  "P4": { title: "Defansif Kale", desc: "Riskten nefret eden; altın, Eurobond ve mevduat ile anaparasını mühürleyen korumacı.", icon: "🏰", colors: "from-orange-700 to-slate-900", textStyle: "text-white" },
  "P5": { title: "Değer Balinası", desc: "Warren Buffett ekolü. Ucuz kalmış cevherleri bulup yıllarca lot biriktiren sabır küpü.", icon: "🐳", colors: "from-purple-800 to-slate-900", textStyle: "text-white" },
  "P6": { title: "Trend Avcısı", desc: "Teknik analiz ve indikatörlerle dalgaları yakalayıp al-sat yapan piyasa sörfçüsü.", icon: "⚡", colors: "from-green-400 to-neutral-900", textStyle: "text-white" },
  "P7": { title: "Kaos Teorisyeni", desc: "Piyasanın düşüşünden beslenen, krizleri ve ayı sezonunu fırsata çeviren kontrariyen oyuncu.", icon: "🐻", colors: "from-red-600 to-zinc-900", textStyle: "text-white" },
  "P8": { title: "Endeks Robotu", desc: "Endeks fonlarını düzenli alıp piyasa ortalamasını hedefleyen disiplinli yatırımcı.", icon: "🤖", colors: "from-cyan-400 to-slate-100", textStyle: "text-slate-900" },
  "P9": { title: "Melek Yatırımcı", desc: "Erken aşama girişimlere ve teknoloji odaklı geleceğe para yatırmayı seven vizyoner.", icon: "🚀", colors: "from-orange-500 to-gray-700", textStyle: "text-white" },
  "P10": { title: "Temettü Büyümesi", desc: "Her yıl dağıttığı temettüyü istikrarlı artıran dinamik şirketlere odaklanan stratejist.", icon: "📈", colors: "from-lime-400 to-gray-300", textStyle: "text-slate-900" },
  "P11": { title: "Likidite Kralı", desc: "Parasını asla bağlamayan, her an nakde dönebilecek araçlarla yaşayan esnek oyuncu.", icon: "🌊", colors: "from-yellow-400 to-blue-900", textStyle: "text-white" },
  "P12": { title: "Duygusal Yatırımcı", desc: "Sosyal medya trendlerinden etkilenen, tepeden alıp dipten satmaya meyilli profil.", icon: "❗", colors: "from-pink-500 to-slate-800", textStyle: "text-white" },
};

type Question = typeof QUESTIONS_POOL[0];

export default function InvestorTest() {
  const [stage, setStage] = useState<"intro" | "quiz" | "result">("intro");
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [resultProfile, setResultProfile] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [shareFile, setShareFile] = useState<File | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (stage === "result" && cardRef.current && resultProfile) {
      // Delay slightly to ensure fonts and DOM are fully rendered
      setTimeout(() => {
        html2canvas(cardRef.current!, {
          useCORS: true,
          allowTaint: false,
          scale: 2,
          backgroundColor: null
        }).then(canvas => {
          canvas.toBlob((blob) => {
            if (blob) {
              setShareFile(new File([blob], 'korfu-analiz.png', { type: 'image/png' }));
            }
          }, 'image/png');
        }).catch(err => console.error("Arka plan görsel hatası:", err));
      }, 800);
    }
  }, [stage, resultProfile]);

  const handleStart = () => {
    // Fisher-Yates shuffle
    const shuffled = [...QUESTIONS_POOL];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setActiveQuestions(shuffled.slice(0, 5));
    setStage("quiz");
    setCurrentQIndex(0);
    setScores({});
    setResultProfile(null);
  };

  const handleAnswer = (profiles: string[]) => {
    const newScores = { ...scores };
    profiles.forEach(p => {
      newScores[p] = (newScores[p] || 0) + 1;
    });
    setScores(newScores);

    if (currentQIndex < activeQuestions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      calculateResult(newScores);
    }
  };

  const calculateResult = (finalScores: Record<string, number>) => {
    let dominantProfile = "P3";
    let max = -1;
    Object.keys(finalScores).forEach(key => {
      if (finalScores[key] > max) {
        max = finalScores[key];
        dominantProfile = key;
      }
    });

    setResultProfile(dominantProfile);
    setStage("result");
  };

  const downloadImage = async () => {
    if (!cardRef.current || !resultProfile) return;
    setIsExporting(true);
    
    try {
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        allowTaint: false,
        scale: 2,
        backgroundColor: null
      });
      
      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `korfu-analiz.png`;
      link.click();
    } catch (err) {
      console.error("Görsel oluşturulurken hata:", err);
      alert("Görsel oluşturulamadı. Lütfen tekrar deneyin.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    if (!resultProfile) return;
    
    const shareData: any = {
      title: "Yatırımcı Kişiliği Testi",
      text: `Ben bir ${PROFILES[resultProfile].title} karakteriyim! Sen de yatırımcı profilini test et.`,
      url: "https://korfufinance.com/portfoy-simulasyonu",
    };
    
    if (shareFile) {
      shareData.files = [shareFile];
    }
    
    try {
      if (shareFile && typeof navigator.canShare === 'function' && navigator.canShare({ files: [shareFile] })) {
        await navigator.share(shareData);
      } else if (navigator.share) {
        await navigator.share({
          title: shareData.title,
          text: shareData.text,
          url: shareData.url
        });
      } else {
        navigator.clipboard.writeText(shareData.url);
        alert("Link panoya kopyalandı!");
      }
    } catch (err) {
      console.error("Paylaşım hatası:", err);
      navigator.clipboard.writeText("https://korfufinance.com/portfoy-simulasyonu");
      alert("Bağlantı panoya kopyalandı!");
    }
  };

  const resetTest = () => {
    setStage("intro");
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl mt-12 mb-8">
      
      {stage === "intro" && (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
            <span className="text-4xl">🎯</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">
            Portföyünü simüle ettin, peki sen nasıl bir yatırımcısın?
          </h2>
          <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
            Finansal hedeflerini, risk toleransını ve yatırım felsefeni analiz ederek sana en uygun piyasa karakterini belirliyoruz. Dev havuzdan seçilen 5 soru ile Yatırımcı Kişiliğini Şimdi Öğren!
          </p>
          <button 
            onClick={handleStart}
            className="px-10 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white font-bold rounded-xl text-lg transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-105"
          >
            Testi Başlat
          </button>
        </div>
      )}

      {stage === "quiz" && activeQuestions.length > 0 && (
        <div className="max-w-2xl mx-auto py-4">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-amber-500 font-bold uppercase tracking-wider text-sm">Soru {currentQIndex + 1} / 5</h3>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((idx) => (
                <div key={idx} className={`h-2 rounded-full transition-all duration-300 ${idx <= currentQIndex ? 'w-8 bg-amber-500' : 'w-4 bg-slate-800'}`} />
              ))}
            </div>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-8 leading-tight">
            {activeQuestions[currentQIndex].text}
          </h2>
          
          <div className="space-y-4">
            {activeQuestions[currentQIndex].options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(opt.profiles)}
                className="w-full text-left p-5 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-amber-500/50 transition-all text-slate-200 font-medium group flex items-center justify-between"
              >
                <span>{opt.text}</span>
                <span className="w-6 h-6 rounded-full border border-slate-600 group-hover:border-amber-500 flex items-center justify-center opacity-50 group-hover:opacity-100">
                  <div className="w-3 h-3 rounded-full bg-amber-500 opacity-0 group-hover:opacity-100 transition-all" />
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {stage === "result" && resultProfile && (
        <div className="max-w-4xl mx-auto py-4 flex flex-col md:flex-row items-center gap-12">
          
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-amber-500 font-bold uppercase tracking-widest text-sm mb-4">Test Tamamlandı</h3>
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-white mb-6 leading-tight">
              Karakterin:<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                {PROFILES[resultProfile].title}
              </span>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-8">
              {PROFILES[resultProfile].desc}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button 
                onClick={resetTest}
                className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl transition-all border border-slate-700"
              >
                Yeniden Çöz
              </button>
            </div>
          </div>

          <div className="flex-none">
            {/* Spotify Wrapped Style Card (9:16) */}
            <div 
              ref={cardRef}
              className={`w-[300px] h-[533px] bg-gradient-to-br ${PROFILES[resultProfile].colors} rounded-2xl overflow-hidden relative shadow-2xl flex flex-col items-center justify-between p-8`}
            >
              {/* Overlay mask for depth */}
              <div className="absolute inset-0 bg-black/20 pointer-events-none" />

              {/* Top Logo */}
              <div className="relative z-10 flex items-center gap-2 mt-4 opacity-90">
                <img src="/korfu_logo_transparent.svg" alt="Logo" className="w-8 h-8 object-contain drop-shadow-md brightness-0 invert" />
                <span className={`font-serif font-bold text-lg ${PROFILES[resultProfile].textStyle}`}>KorfuFinance</span>
              </div>
              
              {/* Content */}
              <div className="relative z-10 text-center w-full my-auto flex flex-col items-center justify-center">
                <div className={`${PROFILES[resultProfile].textStyle} opacity-70 font-bold tracking-widest text-[10px] uppercase mb-4`}>
                  Yatırımcı Profilim
                </div>
                
                <div className="text-8xl mb-6 drop-shadow-2xl hover:scale-110 transition-transform">
                  {PROFILES[resultProfile].icon}
                </div>
                
                <div className={`${PROFILES[resultProfile].textStyle} font-serif font-extrabold text-3xl leading-tight mb-4 drop-shadow-lg`}>
                  <span className="opacity-90 text-2xl font-normal block mb-1">Ben bir</span>
                  {PROFILES[resultProfile].title}
                </div>
                
                <div className={`${PROFILES[resultProfile].textStyle} opacity-90 text-xs font-medium px-2 leading-relaxed drop-shadow-md`}>
                  "{PROFILES[resultProfile].desc}"
                </div>
              </div>
              
              {/* Footer */}
              <div className="relative z-10 w-full text-center mt-auto pb-2">
                <div className={`w-12 h-1 bg-current opacity-30 mx-auto mb-4 rounded-full ${PROFILES[resultProfile].textStyle}`} />
                <p className={`${PROFILES[resultProfile].textStyle} opacity-70 font-bold text-[10px] tracking-widest`}>
                  korfufinance.com
                </p>
              </div>
            </div>
            
            {/* New Action Buttons */}
            <div className="flex gap-[10px] w-full justify-center mt-[15px]">
              <button
                onClick={downloadImage}
                disabled={isExporting}
                className="flex-1 max-w-[180px] border border-[#d4af37] rounded-[20px] py-2 px-4 bg-black/40 hover:bg-black/60 text-white font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isExporting ? (
                  <div className="w-4 h-4 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                )}
                <span className="text-sm">Analizi İndir</span>
              </button>
              
              <button
                onClick={handleShare}
                className="flex-1 max-w-[180px] border border-[#d4af37] rounded-[20px] py-2 px-4 bg-black/40 hover:bg-black/60 text-white font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#d4af37]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span className="text-sm">Paylaş</span>
              </button>
            </div>
          </div>
          
        </div>
      )}
      
    </div>
  );
}
