"use client";

import React, { useState } from "react";
import { Card, InputGroup, formatCurrency } from "./shared";
import { useSaveCalculation } from "@/lib/useSaveCalculation";

export default function UnifiedInterestCalculator() {
  const [params, setParams] = useState({
    capital: 100000,
    rate: 45,
    termValue: 32,
    termType: "gün" as "gün" | "ay" | "yıl",
    taxRate: 7.5,
  });

  const [result, setResult] = useState<{
    simpleGross: number;
    compoundGross: number;
    depositNet: number;
    bestScenario: "simple" | "compound" | "deposit";
  } | null>(null);

  const [error, setError] = useState<string | null>(null);
  const { saveCalculation, isSaving, user } = useSaveCalculation();

  const calculate = () => {
    setError(null);
    if (params.capital <= 0 || params.rate < 0 || params.termValue <= 0 || params.taxRate < 0) {
      setError("Lütfen geçerli pozitif değerler giriniz.");
      setResult(null);
      return;
    }

    const P = params.capital;
    const r = params.rate;
    const tax = params.taxRate / 100;
    
    let days = 0;
    let years = 0;

    if (params.termType === "gün") {
      days = params.termValue;
      years = params.termValue / 365;
    } else if (params.termType === "ay") {
      days = params.termValue * 30;
      years = params.termValue / 12;
    } else if (params.termType === "yıl") {
      days = params.termValue * 365;
      years = params.termValue;
    }

    // 1. Basit Faiz Brüt
    const simpleGross = (P * r * days) / 36500;

    // 2. Bileşik Faiz Brüt (Aylık Kapitalizasyon n=12)
    const n = 12; 
    const compoundTotal = P * Math.pow(1 + (r / 100) / n, n * years);
    const compoundGross = compoundTotal - P;

    // 3. Vadeli Mevduat Net
    const depositNet = simpleGross * (1 - tax);

    let bestScenario: "simple" | "compound" | "deposit" = "simple";
    const maxReturn = Math.max(simpleGross, compoundGross, depositNet);
    if (maxReturn === compoundGross) bestScenario = "compound";
    else if (maxReturn === simpleGross) bestScenario = "simple";
    else bestScenario = "deposit";

    setResult({
      simpleGross,
      compoundGross,
      depositNet,
      bestScenario
    });
  };

  const handleSave = () => {
    if (result) {
      saveCalculation("Faiz Karşılaştırma", `En Avantajlı Getiri: ${formatCurrency(Math.max(result.simpleGross, result.compoundGross, result.depositNet))}`);
    }
  };

  return (
    <Card title="Bütünleşik Faiz Karşılaştırma Motoru">
      <p className="text-sm text-slate-500 mb-6">
        Tek bir form doldurarak Basit Faiz, Bileşik Faiz ve Vadeli Mevduat getirilerini eşzamanlı olarak kıyaslayın.
      </p>

      {error && <div className="mb-4 text-sm text-red-500 font-semibold bg-red-100 dark:bg-red-900/30 p-3 rounded-lg">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputGroup label="Anapara (TL)" value={params.capital} onChange={(e: any) => setParams({ ...params, capital: +e.target.value })} />
        <InputGroup label="Yıllık Faiz Oranı (%)" value={params.rate} onChange={(e: any) => setParams({ ...params, rate: +e.target.value })} />
        
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Vade</label>
          <div className="flex gap-2">
            <input 
              type="number" 
              value={params.termValue} 
              onChange={(e) => setParams({ ...params, termValue: +e.target.value })}
              className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono text-slate-900 dark:text-slate-100 transition-all"
            />
            <select
              value={params.termType}
              onChange={(e: any) => setParams({ ...params, termType: e.target.value })}
              className="w-1/3 px-4 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-slate-900 dark:text-slate-100 transition-all"
            >
              <option value="gün">Gün</option>
              <option value="ay">Ay</option>
              <option value="yıl">Yıl</option>
            </select>
          </div>
        </div>

        <InputGroup label="Stopaj Oranı (%)" value={params.taxRate} onChange={(e: any) => setParams({ ...params, taxRate: +e.target.value })} />
      </div>

      <button onClick={calculate} className="w-full mt-6 py-3 bg-slate-900 dark:bg-amber-600 text-white rounded-xl font-bold hover:opacity-90 transition-all duration-300 shadow-lg shadow-amber-600/20">
        Senaryoları Karşılaştır
      </button>

      {result && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-serif font-bold text-slate-900 dark:text-white">Karşılaştırma Tablosu</h3>
            {user && (
              <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="text-xs font-bold text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-500/10 px-3 py-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors disabled:opacity-50"
              >
                {isSaving ? "Kaydediliyor..." : "💾 Sonucu Kaydet"}
              </button>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="py-4 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Senaryo</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Net Kâr / Getiri</th>
                  <th className="py-4 px-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Dönem Sonu Toplam</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                
                {/* Bileşik Faiz */}
                <tr className={`transition-colors ${result.bestScenario === "compound" ? "bg-amber-50 dark:bg-amber-900/20 border-l-4 border-l-amber-500" : "hover:bg-slate-50 dark:hover:bg-slate-800/30 border-l-4 border-l-transparent"}`}>
                  <td className="py-4 px-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                      Bileşik Faiz
                      {result.bestScenario === "compound" && <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">En Avantajlı</span>}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Aylık Kapitalizasyonlu Brüt Getiri</div>
                  </td>
                  <td className={`py-4 px-4 text-right font-mono font-bold ${result.bestScenario === "compound" ? "text-amber-600 dark:text-amber-500" : "text-emerald-600 dark:text-emerald-400"}`}>
                    +{formatCurrency(result.compoundGross)}
                  </td>
                  <td className="py-4 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrency(params.capital + result.compoundGross)}
                  </td>
                </tr>

                {/* Basit Faiz */}
                <tr className={`transition-colors ${result.bestScenario === "simple" ? "bg-amber-50 dark:bg-amber-900/20 border-l-4 border-l-amber-500" : "hover:bg-slate-50 dark:hover:bg-slate-800/30 border-l-4 border-l-transparent"}`}>
                  <td className="py-4 px-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                      Basit Faiz
                      {result.bestScenario === "simple" && <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">En Avantajlı</span>}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Stopajsız Brüt Getiri</div>
                  </td>
                  <td className={`py-4 px-4 text-right font-mono font-bold ${result.bestScenario === "simple" ? "text-amber-600 dark:text-amber-500" : "text-emerald-600 dark:text-emerald-400"}`}>
                    +{formatCurrency(result.simpleGross)}
                  </td>
                  <td className="py-4 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrency(params.capital + result.simpleGross)}
                  </td>
                </tr>

                {/* Vadeli Mevduat */}
                <tr className={`transition-colors ${result.bestScenario === "deposit" ? "bg-amber-50 dark:bg-amber-900/20 border-l-4 border-l-amber-500" : "hover:bg-slate-50 dark:hover:bg-slate-800/30 border-l-4 border-l-transparent"}`}>
                  <td className="py-4 px-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                      Vadeli Mevduat
                      {result.bestScenario === "deposit" && <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">En Avantajlı</span>}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">Stopaj Kesintili Net Getiri</div>
                  </td>
                  <td className={`py-4 px-4 text-right font-mono font-bold ${result.bestScenario === "deposit" ? "text-amber-600 dark:text-amber-500" : "text-emerald-600 dark:text-emerald-400"}`}>
                    +{formatCurrency(result.depositNet)}
                  </td>
                  <td className="py-4 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                    {formatCurrency(params.capital + result.depositNet)}
                  </td>
                </tr>

              </tbody>
            </table>
          </div>
          
          <div className="mt-6 bg-slate-900 dark:bg-slate-800 rounded-xl p-6 border border-slate-800 dark:border-slate-700">
            <h4 className="text-amber-500 font-bold mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Korfu Finansal Analiz
            </h4>
            <p className="text-sm text-slate-300 leading-relaxed">
              {result.bestScenario === "compound" 
                ? `Uzun vade etkisinden dolayı Bileşik Faiz mekanizması en kârlı senaryoyu oluşturuyor. Banka vadeli mevduatına göre kazancınız arasındaki makas zamanla daha da açılacaktır. Faiz getirisini yeniden yatırıma yönlendirmenin (kapitalizasyon) gücünü görüyorsunuz.` 
                : `Kısa vadeli (veya düşük oranlı) senaryolarda bileşik faizin eksponansiyel etkisi tam olarak devreye giremez. Vergi (stopaj) kesintisi de net getiriyi törpülemektedir. Kısa vadede brüt faiz veya standart mevduat yeterli görünse de, uzun vadeli zenginleşme için bileşik getirili (temettü/fon) yatırımlara odaklanmak servet artışını ivmelendirecektir.`}
            </p>
          </div>

        </div>
      )}
    </Card>
  );
}
