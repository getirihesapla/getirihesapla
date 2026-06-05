"use client";

import React, { useState } from "react";

export default function KmhCalculator() {
  const [amount, setAmount] = useState<string>("");
  const [rate, setRate] = useState<string>("");
  const [days, setDays] = useState<string>("");

  const [result, setResult] = useState<{
    totalPayment: number;
    interest: number;
    tax: number;
  } | null>(null);

  const calculate = () => {
    if (!amount || !rate || !days) {
      alert("Lütfen hesaplama için gerekli tüm alanları doldurun.");
      return;
    }

    const pAmount = parseFloat(amount) || 0;
    const pRate = parseFloat(rate) || 0;
    const pDays = parseFloat(days) || 0;

    // Brüt Faiz = (KMH Tutarı * (Aylık Faiz Oranı / 100) * Gün Sayısı) / 30
    const grossInterest = (pAmount * (pRate / 100) * pDays) / 30;

    // Yasal Vergiler: %15 KKDF ve %15 BSMV
    const kkdf = grossInterest * 0.15;
    const bsmv = grossInterest * 0.15;
    const totalTax = kkdf + bsmv;

    // Toplam Geri Ödeme = KMH Tutarı + Brüt Faiz + Toplam Vergi
    const totalPayment = pAmount + grossInterest + totalTax;

    setResult({
      totalPayment,
      interest: grossInterest,
      tax: totalTax
    });
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-full">
        
        {/* Title */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-center">
          <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">Kredili Mevduat Hesabı (KMH)</h2>
        </div>

        <div className="p-6 md:p-8 space-y-6 flex-grow flex flex-col">
          
          {/* Form Grid */}
          <div className="grid grid-cols-1 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200">KMH Tutar (TL)</label>
              <div className="flex items-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus-within:ring-2 focus-within:ring-amber-500">
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent focus:outline-none text-slate-800 dark:text-slate-200 font-medium text-left"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200">Aylık Faiz Oranı (%)</label>
              <div className="flex items-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus-within:ring-2 focus-within:ring-amber-500">
                <input 
                  type="number"
                  step="0.01"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent focus:outline-none text-slate-800 dark:text-slate-200 font-medium text-left"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200">Kullanıldığı Toplam Gün Sayısı</label>
              <div className="flex items-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus-within:ring-2 focus-within:ring-amber-500">
                <input 
                  type="number"
                  value={days}
                  onChange={(e) => setDays(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent focus:outline-none text-slate-800 dark:text-slate-200 font-medium text-left"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="mt-auto pt-6">
            <button 
              onClick={calculate}
              className="w-full py-4 bg-slate-900 dark:bg-amber-600 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 dark:hover:bg-amber-700 transition-colors shadow-lg shadow-slate-900/20 dark:shadow-amber-600/20"
            >
              KMH Hesapla
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex flex-col gap-3">
                
                {/* Toplam Ödeme */}
                <div className="flex justify-between items-center bg-slate-900 dark:bg-slate-800 p-4 rounded-xl text-white shadow-sm">
                  <span className="text-sm md:text-base font-medium text-slate-300">Toplam Ödeme</span>
                  <span className="text-lg md:text-xl font-bold text-amber-500">
                    {Number(result.totalPayment.toFixed(2)).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                  </span>
                </div>

                {/* Ödenecek Faiz */}
                <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-sm md:text-base font-medium text-slate-600 dark:text-slate-400">Ödenecek Faiz</span>
                  <span className="text-lg md:text-base font-bold text-slate-900 dark:text-white">
                    {Number(result.interest.toFixed(2)).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                  </span>
                </div>

                {/* Ödenecek Vergi */}
                <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-sm md:text-base font-medium text-slate-600 dark:text-slate-400">Ödenecek Vergi (KKDF+BSMV)</span>
                  <span className="text-lg md:text-base font-bold text-slate-900 dark:text-white">
                    {Number(result.tax.toFixed(2)).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                  </span>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
