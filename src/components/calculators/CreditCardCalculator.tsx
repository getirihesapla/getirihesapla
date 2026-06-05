"use client";

import React, { useState } from "react";

export default function CreditCardCalculator() {
  const [limit, setLimit] = useState<string>("");
  const [debt, setDebt] = useState<string>("");

  const [result, setResult] = useState<{
    minimumPayment: number;
    availableRatio: number;
    limit: number;
    debt: number;
  } | null>(null);

  const calculate = () => {
    if (!limit || !debt) {
      alert("Lütfen hesaplama için gerekli tüm alanları doldurun.");
      return;
    }

    const pLimit = parseFloat(limit) || 0;
    const pDebt = parseFloat(debt) || 0;

    if (pDebt > pLimit) {
      alert("Dönem borcu, kredi kartı limitinden büyük olamaz.");
      return;
    }

    let minPaymentRate = 0.20;
    if (pLimit > 25000) {
      minPaymentRate = 0.40;
    }

    const minimumPayment = pDebt * minPaymentRate;
    const availableRatio = pLimit > 0 ? ((pLimit - pDebt) / pLimit) * 100 : 0;

    setResult({
      minimumPayment,
      availableRatio,
      limit: pLimit,
      debt: pDebt
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-full">
      
      {/* Title */}
      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-center">
        <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">Kredi Kartı Asgari Ödemesi</h2>
      </div>

      <div className="p-6 md:p-8 space-y-6 flex-grow flex flex-col">
        
        {/* Form Grid */}
        <div className="grid grid-cols-1 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-800 dark:text-slate-200">Kredi Kartı Limiti (TL)</label>
            <div className="flex items-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus-within:ring-2 focus-within:ring-amber-500">
              <input 
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="w-full px-4 py-3 bg-transparent focus:outline-none text-slate-800 dark:text-slate-200 font-medium text-left"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-800 dark:text-slate-200">Dönem Borcu (TL)</label>
            <div className="flex items-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus-within:ring-2 focus-within:ring-amber-500">
              <input 
                type="number"
                value={debt}
                onChange={(e) => setDebt(e.target.value)}
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
            Asgari Ödeme Hesapla
          </button>
        </div>

        {/* Results */}
        {result && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex flex-col gap-3">
              
              {/* Asgari Ödeme */}
              <div className="flex justify-between items-center bg-slate-900 dark:bg-slate-800 p-4 rounded-xl text-white shadow-sm">
                <span className="text-sm md:text-base font-medium text-slate-300">Asgari Ödeme Tutarı</span>
                <span className="text-lg md:text-xl font-bold text-amber-500">
                  {Number(result.minimumPayment.toFixed(2)).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                </span>
              </div>

              {/* Limit Oranı */}
              <div className="flex flex-col gap-2 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm md:text-base font-medium text-slate-600 dark:text-slate-400">Kullanılabilir Limit Oranı</span>
                  <span className="text-sm md:text-base font-bold text-amber-500">
                    %{result.availableRatio.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                  <div 
                    className="bg-amber-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, Math.max(0, result.availableRatio))}%` }}
                  ></div>
                </div>
              </div>

              {/* Dönem Borcu */}
              <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-sm md:text-base font-medium text-slate-600 dark:text-slate-400">Dönem Borcu</span>
                <span className="text-lg md:text-base font-bold text-slate-900 dark:text-white">
                  {Number(result.debt.toFixed(2)).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                </span>
              </div>

              {/* Toplam Limit */}
              <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <span className="text-sm md:text-base font-medium text-slate-600 dark:text-slate-400">Toplam Limit</span>
                <span className="text-lg md:text-base font-bold text-slate-900 dark:text-white">
                  {Number(result.limit.toFixed(2)).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                </span>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
