"use client";

import React, { useState } from "react";

export default function FooterWithModals() {
  const [isAgreementOpen, setIsAgreementOpen] = useState(false);
  const [isKvkkOpen, setIsKvkkOpen] = useState(false);

  // Stop propagation to prevent clicking inside modal from closing it
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <>
      <footer className="text-center py-6 text-sm text-slate-500 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50">
        <p className="mb-2">Bu platform eğitim amaçlıdır. Yatırım tavsiyesi değildir.<br/>Veriler kullanıcı girişlerine dayalı yaklaşık hesaplamalar üretir.</p>
        <div className="flex justify-center items-center gap-4 text-xs">
          <button 
            onClick={() => setIsAgreementOpen(true)}
            className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
          >
            Kullanıcı Sözleşmesi
          </button>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <button 
            onClick={() => setIsKvkkOpen(true)}
            className="hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
          >
            Aydınlatma Metni
          </button>
        </div>
        <div className="flex justify-center items-center gap-6 mt-4">
          <a 
            href="mailto:korfuco@gmail.com" 
            className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-500 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            <span className="text-xs">İletişim</span>
          </a>
          <a 
            href="https://www.instagram.com/korfu.co/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-500 transition-colors duration-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
            <span className="text-xs">Instagram</span>
          </a>
        </div>
      </footer>

      {/* Kullanıcı Sözleşmesi Modal */}
      {isAgreementOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsAgreementOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
            onClick={handleModalClick}
          >
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">Kullanıcı Sözleşmesi</h3>
              <button 
                onClick={() => setIsAgreementOpen(false)}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto text-sm text-slate-600 dark:text-slate-400 space-y-4">
              <ul className="space-y-4 list-decimal pl-5">
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Yatırım Tavsiyesi Olmadığına Dair Beyan:</strong> Sitede yer alan tüm hesaplama araçları (Bileşik Faiz, Kredi, Gordon Modeli, Tahvil vb.) yalnızca eğitim ve simülasyon amaçlıdır. Kesinlikle yatırım danışmanlığı veya tavsiyesi niteliği taşımaz. Kullanıcının bu hesaplamalara dayanarak alacağı kararların sorumluluğu tamamen kendisine aittir.
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Hizmet Sorumluluğu:</strong> Matematiksel formüller yaklaşık değerler üretir. Altyapı kesintilerinden veya veri gecikmelerinden doğabilecek dolaylı zararlardan site yönetimi sorumlu tutulamaz.
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Fikri Mülkiyet:</strong> Sitenin tasarımı, kaynak kodları ve arayüz bütünlüğü koruma altındadır; izinsiz kopyalanamaz.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* KVKK Aydınlatma Metni Modal */}
      {isKvkkOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setIsKvkkOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
            onClick={handleModalClick}
          >
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-semibold text-lg text-slate-800 dark:text-slate-200">KVKK Aydınlatma Metni</h3>
              <button 
                onClick={() => setIsKvkkOpen(false)}
                className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto text-sm text-slate-600 dark:text-slate-400 space-y-4">
              <ul className="space-y-4 list-decimal pl-5">
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">İşlenen Veriler:</strong> Google Auth ile giriş yapıldığında e-posta adresiniz, adınız, soyadınız ve Firebase UID bilginiz işlenir. Vercel Analytics ile anonim kullanım verileri toplanır.
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">İşlenme Amacı:</strong> Verileriniz, portföy kaydetme özelliğinin sunulabilmesi ve site performans analizi amacıyla KVKK Madde 5 uyarınca işlenmektedir.
                </li>
                <li>
                  <strong className="text-slate-800 dark:text-slate-200">Veri Aktarımı:</strong> Verileriniz güvenli bulut altyapılarında (Firebase, Vercel) saklanır, yasal zorunluluklar haricinde üçüncü şahıslarla paylaşılmaz ve ticari amaçla satılmaz.
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
