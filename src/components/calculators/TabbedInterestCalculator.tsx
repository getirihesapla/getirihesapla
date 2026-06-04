"use client";

import React, { useState } from "react";
import { formatCurrency } from "./shared";

type TabType = "basit" | "bilesik" | "vadeli";
type RateType = "yillik" | "aylik" | "gunluk";
type TermType = "gun" | "ay" | "yil";
type FrequencyType = "gunluk" | "aylik" | "ucaylik" | "altiaylik" | "yillik";

export default function TabbedInterestCalculator() {
  const [activeTab, setActiveTab] = useState<TabType>("basit");

  // Form State
  const [rateType, setRateType] = useState<RateType>("yillik");
  const [rate, setRate] = useState<string>("");
  const [capital, setCapital] = useState<string>("");
  const [termValue, setTermValue] = useState<string>("");
  const [termType, setTermType] = useState<TermType>("gun");
  const [frequency, setFrequency] = useState<FrequencyType>("gunluk");

  // Results
  const [result, setResult] = useState<{ total: number; interest: number } | null>(null);

  const calculate = () => {
    if (!capital || !rate || !termValue) return;

    const P = parseFloat(capital);
    const rInput = parseFloat(rate); // as percentage
    const tInput = parseFloat(termValue);

    // Normalize rate to annual
    let rAnnual = 0;
    if (activeTab === "basit") {
      if (rateType === "yillik") rAnnual = rInput / 100;
      else if (rateType === "aylik") rAnnual = (rInput * 12) / 100;
      else if (rateType === "gunluk") rAnnual = (rInput * 365) / 100;
    } else {
      // Bileşik ve Vadeli sadece yıllık faiz oranı kullanır
      rAnnual = rInput / 100;
    }
    
    // Normalize time to years
    let tYears = 0;
    let tDays = 0;
    if (termType === "gun") {
      tYears = tInput / 365;
      tDays = tInput;
    } else if (termType === "ay") {
      tYears = tInput / 12;
      tDays = tInput * 30;
    } else {
      tYears = tInput;
      tDays = tInput * 365;
    }

    let calculatedInterest = 0;
    let calculatedTotal = 0;

    if (activeTab === "basit") {
      // P * r * t
      calculatedInterest = P * rAnnual * tYears;
      calculatedTotal = P + calculatedInterest;
    } else if (activeTab === "bilesik") {
      // A = P(1 + r/n)^(nt)
      let n = 1;
      if (frequency === "gunluk") n = 365;
      if (frequency === "aylik") n = 12;
      if (frequency === "ucaylik") n = 4;
      if (frequency === "altiaylik") n = 2;
      if (frequency === "yillik") n = 1;

      calculatedTotal = P * Math.pow(1 + rAnnual / n, n * tYears);
      calculatedInterest = calculatedTotal - P;
    } else if (activeTab === "vadeli") {
      // Vadeli mevduat = Basit faiz * (1 - stopaj)
      // Assuming a default 5% withholding tax (stopaj) for simplicity as it wasn't specified in the UI screenshots
      // But standard Turkish deposit tax up to 6 months is 7.5%, up to 1 year 5%, over 1 year 2.5%. We will use a standard 5% if not specified, or just do pure simple interest if they didn't ask for tax input.
      // Wait, the prompt says: "Vadeli mevduat faiz hesaplaması, basit faiz yöntemi ile yapılır. Yani, yatırılan anapara üzerinden belirli bir faiz oranı uygulanarak hesaplanır. Basit Faiz Formülü: Faiz = Anapara × Faiz Oranı × VadeSuresi(Gün Cinsinden)"
      // So Vadeli Mevduat here is basically the same as Simple Interest. I will calculate it identically based on their formula:
      // Faiz = Anapara * Faiz Oranı * VadeSuresi(Gün) / 36500 (since rate is in % and time in days)
      
      // Vadeli Mevduat: Sadece yıllık faiz
      calculatedInterest = (P * rInput * tDays) / 36500;
      calculatedTotal = P + calculatedInterest;
    }

    setResult({
      total: calculatedTotal,
      interest: calculatedInterest
    });
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setResult(null);
    if (tab !== "basit") {
      setRateType("yillik");
    }
  };

  return (
    <div className="w-full">
      {/* Dynamic Header */}
      <header className="mb-12 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-white mb-6">
          {activeTab === "basit" && "Basit Faiz Hesaplama"}
          {activeTab === "bilesik" && "Bileşik Faiz Hesaplama"}
          {activeTab === "vadeli" && "Vadeli Mevduat Faizi Hesaplama"}
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed mx-auto md:mx-0">
          Aşağıdaki sekmeleri kullanarak faiz ve vade bilgilerinizi girin, yatırımınızın getirisini kolayca hesaplayın.
        </p>
      </header>

      <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      
      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-4 p-6 bg-white border-b border-slate-50">
        <button
          onClick={() => handleTabChange("basit")}
          className={`px-6 py-3 rounded-xl font-bold transition-all ${
            activeTab === "basit" 
              ? "bg-slate-900 dark:bg-amber-600 text-white shadow-md shadow-slate-900/20 dark:shadow-amber-600/20" 
              : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          }`}
        >
          Basit Faiz
        </button>
        <button
          onClick={() => handleTabChange("bilesik")}
          className={`px-6 py-3 rounded-xl font-bold transition-all ${
            activeTab === "bilesik" 
              ? "bg-slate-900 dark:bg-amber-600 text-white shadow-md shadow-slate-900/20 dark:shadow-amber-600/20" 
              : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          }`}
        >
          Bileşik Faiz
        </button>
        <button
          onClick={() => handleTabChange("vadeli")}
          className={`px-6 py-3 rounded-xl font-bold transition-all ${
            activeTab === "vadeli" 
              ? "bg-slate-900 dark:bg-amber-600 text-white shadow-md shadow-slate-900/20 dark:shadow-amber-600/20" 
              : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
          }`}
        >
          Vadeli Mevduat Faizi
        </button>
      </div>

      {/* Form Area */}
      <div className="p-8 bg-[#f8fafc] flex justify-center">
        <div className="w-full max-w-lg space-y-6">
          
          {/* Sıklık (Sadece Bileşik Faiz) */}
          {activeTab === "bilesik" && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-800">Faizlendirme Sıklığı</label>
              <div className="relative">
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as FrequencyType)}
                  className="w-full appearance-none px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
                >
                  <option value="gunluk">Günlük</option>
                  <option value="aylik">Aylık</option>
                  <option value="ucaylik">3 Aylık</option>
                  <option value="altiaylik">6 Aylık</option>
                  <option value="yillik">Yıllık</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-amber-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
          )}

          {/* Faiz Oranı */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-800">Faiz Oranı</label>
            <div className="flex items-center gap-3">
              <div className="relative w-2/5">
                <select
                  value={activeTab === "basit" ? rateType : "yillik"}
                  onChange={(e) => setRateType(e.target.value as RateType)}
                  className="w-full appearance-none px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
                >
                  {activeTab === "basit" ? (
                    <>
                      <option value="yillik">Yıllık</option>
                      <option value="aylik">Aylık</option>
                      <option value="gunluk">Günlük</option>
                    </>
                  ) : (
                    <option value="yillik">Yıllık</option>
                  )}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-amber-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
              <span className="font-bold text-slate-500">%</span>
              <input 
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-200 font-medium"
              />
            </div>
          </div>

          {/* Anapara */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-800">Anapara</label>
            <div className="relative">
              <input 
                type="number"
                value={capital}
                onChange={(e) => setCapital(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-200 font-medium"
              />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4">
                <span className="text-slate-800 dark:text-slate-400 font-bold">TL</span>
              </div>
            </div>
          </div>

          {/* Vade */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-800">Vade</label>
            <div className="flex items-center gap-3">
              <input 
                type="number"
                value={termValue}
                onChange={(e) => setTermValue(e.target.value)}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-200 font-medium"
              />
              <div className="relative w-2/5">
                <select
                  value={termType}
                  onChange={(e) => setTermType(e.target.value as TermType)}
                  className="w-full appearance-none px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-700 dark:text-slate-200 font-medium cursor-pointer"
                >
                  <option value="gun">Gün</option>
                  <option value="ay">Ay</option>
                  <option value="yil">Yıl</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-amber-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button 
              onClick={calculate}
              className="w-full py-4 bg-slate-900 dark:bg-amber-600 text-white rounded-xl font-bold text-lg hover:bg-slate-800 dark:hover:bg-amber-700 transition-colors shadow-lg shadow-slate-900/20 dark:shadow-amber-600/20"
            >
              Faiz Hesapla
            </button>
          </div>

          {result && (
            <div className="mt-8 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-slate-500 text-sm font-semibold uppercase tracking-wider mb-4 text-center">Hesaplama Sonucu</h3>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Anapara:</span>
                  <span className="text-slate-900 dark:text-white font-bold">{formatCurrency(parseFloat(capital))}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Kazanılan Faiz:</span>
                  <span className="text-emerald-600 dark:text-emerald-500 font-bold">+{formatCurrency(result.interest)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-900 dark:text-white font-bold text-lg">Toplam:</span>
                  <span className="text-amber-600 dark:text-amber-500 font-black text-2xl">{formatCurrency(result.total)}</span>
                </div>
              </div>
            </div>
          )}

        </div>
        </div>
      </div>
    </div>
  );
}
