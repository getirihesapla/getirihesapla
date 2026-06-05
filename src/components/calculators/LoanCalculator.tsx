"use client";

import React, { useState, useEffect } from "react";
import { formatCurrency } from "./shared";

type LoanType = "ihtiyac" | "konut" | "tasit";

interface AmortizationRow {
  month: number;
  installment: number;
  principalPayment: number;
  interestPayment: number;
  taxPayment: number;
  remainingBalance: number;
}

export default function LoanCalculator() {
  const [activeTab, setActiveTab] = useState<LoanType>("ihtiyac");
  
  const [amount, setAmount] = useState<string>("");
  const [rate, setRate] = useState<string>("");
  const [term, setTerm] = useState<number>(12);

  const [result, setResult] = useState<{
    monthlyPayment: number;
    totalPayment: number;
    totalInterestAndTax: number;
    schedule: AmortizationRow[];
  } | null>(null);

  // Dynamic limits
  const amountVal = parseFloat(amount) || 0;
  
  let maxTerm = 36;
  let warningMsg = "";

  if (activeTab === "ihtiyac") {
    if (amountVal > 250000) {
      maxTerm = 12;
      warningMsg = "Yasal düzenlemelere göre, 250.000 TL üzeri ihtiyaç kredilerinde vade 12 ay ile sınırlandırılmıştır.";
    } else {
      maxTerm = 36;
    }
  } else if (activeTab === "tasit") {
    if (amountVal > 1200000 && amountVal <= 2000000) {
      maxTerm = 12;
      warningMsg = "Yasal düzenlemelere göre, 1.200.001 TL – 2.000.000 TL taşıt kredilerinde vade 12 ay ile sınırlandırılmıştır.";
    } else {
      maxTerm = 48; // Standard fallback
    }
  } else if (activeTab === "konut") {
    maxTerm = 120;
  }

  // Adjust term if it exceeds the new dynamic max
  useEffect(() => {
    if (term > maxTerm) {
      setTerm(maxTerm);
    }
  }, [maxTerm, term]);

  const handleTabChange = (tab: LoanType) => {
    setActiveTab(tab);
    setResult(null);
  };

  const calculate = () => {
    if (!amount || !rate || !term) {
      alert("Lütfen hesaplama için gerekli tüm alanları doldurun.");
      return;
    }
    
    if (!amountVal || !parseFloat(rate) || !term) return;

    const P = amountVal;
    const baseRate = parseFloat(rate) / 100; // e.g. 0.035
    const n = term;

    let kkdfRate = 0;
    let bsmvRate = 0;

    if (activeTab === "ihtiyac") {
      kkdfRate = 0.15;
      bsmvRate = 0.15;
    } else if (activeTab === "tasit") {
      kkdfRate = 0;
      bsmvRate = 0.05;
    } else if (activeTab === "konut") {
      kkdfRate = 0;
      bsmvRate = 0;
    }

    const effectiveRate = baseRate * (1 + kkdfRate + bsmvRate);

    // PMT Formula: M = P * [ r * (1+r)^n ] / [ (1+r)^n - 1 ]
    const M = P * (effectiveRate * Math.pow(1 + effectiveRate, n)) / (Math.pow(1 + effectiveRate, n) - 1);

    const schedule: AmortizationRow[] = [];
    let remainingBalance = P;
    let totalInterestAndTax = 0;

    for (let i = 1; i <= n; i++) {
      const interestForMonth = remainingBalance * baseRate;
      const kkdfForMonth = interestForMonth * kkdfRate;
      const bsmvForMonth = interestForMonth * bsmvRate;
      const taxForMonth = kkdfForMonth + bsmvForMonth;
      
      const totalInterestTaxMonth = interestForMonth + taxForMonth;
      const principalForMonth = M - totalInterestTaxMonth;
      
      remainingBalance -= principalForMonth;
      
      // Fix floating point errors on last month
      if (i === n && Math.abs(remainingBalance) < 1) {
        remainingBalance = 0;
      }

      totalInterestAndTax += totalInterestTaxMonth;

      schedule.push({
        month: i,
        installment: M,
        principalPayment: principalForMonth,
        interestPayment: interestForMonth,
        taxPayment: taxForMonth,
        remainingBalance: remainingBalance > 0 ? remainingBalance : 0
      });
    }

    setResult({
      monthlyPayment: M,
      totalPayment: M * n,
      totalInterestAndTax: totalInterestAndTax,
      schedule
    });
  };

  return (
    <div className="w-full">
      {/* Removed massive header to match grid compactness */}

      <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Tabs */}
        <div className="flex p-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
          <div className="w-full grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
            <button
              onClick={() => handleTabChange("ihtiyac")}
              className={`py-3 rounded-xl font-bold transition-all text-sm md:text-base ${
                activeTab === "ihtiyac" 
                  ? "bg-white dark:bg-amber-600 text-slate-900 dark:text-white shadow-sm" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              İhtiyaç
            </button>
            <button
              onClick={() => handleTabChange("konut")}
              className={`py-3 rounded-xl font-bold transition-all text-sm md:text-base ${
                activeTab === "konut" 
                  ? "bg-white dark:bg-amber-600 text-slate-900 dark:text-white shadow-sm" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Konut
            </button>
            <button
              onClick={() => handleTabChange("tasit")}
              className={`py-3 rounded-xl font-bold transition-all text-sm md:text-base ${
                activeTab === "tasit" 
                  ? "bg-white dark:bg-amber-600 text-slate-900 dark:text-white shadow-sm" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
              }`}
            >
              Taşıt
            </button>
          </div>
        </div>

        {/* Form Area */}
        <div className="p-6 md:p-8 space-y-8">
          
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Lütfen kredi bilgilerinizi girin.</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Amount */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200">Kredi Tutarı (TL)</label>
              <div className="flex items-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-amber-500">
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent focus:outline-none text-slate-800 dark:text-slate-200 font-medium"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Rate */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200">Aylık faiz oranı (%)</label>
              <div className="flex items-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-amber-500">
                <input 
                  type="number"
                  step="0.01"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent focus:outline-none text-slate-800 dark:text-slate-200 font-medium"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Warning */}
          {warningMsg && (
            <div className="flex items-start gap-3 text-amber-700 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
              <p className="text-sm font-medium">{warningMsg}</p>
            </div>
          )}

          {/* Slider */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200">Vade sayısı (ay)</label>
              <span className="text-xl font-bold text-slate-900 dark:text-white">{term} ay</span>
            </div>
            
            <div className="px-2">
              <input 
                type="range" 
                min="1" 
                max={maxTerm} 
                value={term} 
                onChange={(e) => setTerm(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-slate-900 dark:accent-amber-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                <span>1</span>
                <span>{maxTerm}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={calculate}
            className="w-full py-4 bg-slate-900 dark:bg-amber-600 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 dark:hover:bg-amber-700 transition-colors shadow-lg shadow-slate-900/20 dark:shadow-amber-600/20"
          >
            Hesapla
          </button>

          {/* Results Area */}
          {result && (
            <div className="mt-12 animate-in fade-in slide-in-from-bottom-4">
              
              <div className="w-full grid grid-cols-3 gap-1.5 mb-8">
                <div className="bg-slate-900 dark:bg-slate-800 p-2 rounded-xl text-white min-w-0 overflow-hidden">
                  <div className="text-xs md:text-sm text-slate-400 mb-1 truncate">Aylık Taksit</div>
                  <div className="text-base md:text-lg font-bold text-amber-500 truncate">{Number(result.monthlyPayment.toFixed(2)).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 min-w-0 overflow-hidden">
                  <div className="text-xs md:text-sm text-slate-500 mb-1 truncate">Toplam Geri Ödeme</div>
                  <div className="text-base md:text-lg font-bold text-slate-900 dark:text-white truncate">{Number(result.totalPayment.toFixed(2)).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</div>
                </div>
                <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800 min-w-0 overflow-hidden">
                  <div className="text-xs md:text-sm text-slate-500 mb-1 truncate">Toplam Faiz & Vergi</div>
                  <div className="text-base md:text-lg font-bold text-slate-900 dark:text-white truncate">{Number(result.totalInterestAndTax.toFixed(2)).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL</div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Amortisman (Ödeme) Planı</h3>
              
              <div className="max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400 relative">
                  <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 sticky top-0 z-10 shadow-sm">
                    <tr>
                      <th className="px-3 py-2 rounded-tl-lg">Ay</th>
                      <th className="px-3 py-2">Taksit</th>
                      <th className="px-3 py-2">Anapara</th>
                      <th className="px-3 py-2">Faiz/Vergi</th>
                      <th className="px-3 py-2 rounded-tr-lg">Borç</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.schedule.map((row) => (
                      <tr key={row.month} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-3 py-1.5 font-bold text-slate-900 dark:text-white">{row.month}</td>
                        <td className="px-3 py-1.5 font-medium text-amber-600 dark:text-amber-500">{formatCurrency(row.installment)}</td>
                        <td className="px-3 py-1.5 text-slate-700 dark:text-slate-300">{formatCurrency(row.principalPayment)}</td>
                        <td className="px-3 py-1.5 text-slate-700 dark:text-slate-300">{formatCurrency(row.interestPayment + row.taxPayment)}</td>
                        <td className="px-3 py-1.5 font-medium text-slate-900 dark:text-white">{formatCurrency(row.remainingBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
