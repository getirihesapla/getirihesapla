"use client";

import React, { useState } from "react";
import { formatCurrency } from "./shared";
import { useSaveCalculation } from "@/lib/useSaveCalculation";

interface DcfRow {
  year: number;
  fcf: number;
  pv: number;
}

export default function DcfCalculator() {
  const [fcf0, setFcf0] = useState<string>("");
  const [growthRate, setGrowthRate] = useState<string>("");
  const [wacc, setWacc] = useState<string>("");
  const [terminalGrowth, setTerminalGrowth] = useState<string>("");
  const [netDebt, setNetDebt] = useState<string>("");
  const [shares, setShares] = useState<string>("");

  const { saveCalculation } = useSaveCalculation();

  const [result, setResult] = useState<{
    valuePerShare: number;
    enterpriseValue: number;
    equityValue: number;
    schedule: DcfRow[];
  } | null>(null);

  const calculate = () => {
    if (!fcf0 || !growthRate || !wacc || !terminalGrowth || !netDebt || !shares) {
      alert("Lütfen hesaplama için gerekli tüm alanları doldurun.");
      return;
    }

    const pFcf0 = parseFloat(fcf0) || 0;
    const pGrowth = (parseFloat(growthRate) || 0) / 100;
    const pWacc = (parseFloat(wacc) || 0) / 100;
    const pTerminalGrowth = (parseFloat(terminalGrowth) || 0) / 100;
    const pNetDebt = parseFloat(netDebt) || 0;
    const pShares = parseFloat(shares) || 1; // avoid div by 0

    if (pWacc <= pTerminalGrowth) {
      alert("Matematiksel Hata: İskonto Oranı (WACC), Sonsuz Büyüme Oranından büyük olmalıdır.");
      return;
    }

    const schedule: DcfRow[] = [];
    let sumPv = 0;

    let prevFcf = pFcf0;
    for (let i = 1; i <= 5; i++) {
      const fcf_t = prevFcf * (1 + pGrowth);
      const pv_t = fcf_t / Math.pow(1 + pWacc, i);
      
      schedule.push({ year: i, fcf: fcf_t, pv: pv_t });
      sumPv += pv_t;
      prevFcf = fcf_t;
    }

    const fcf5 = schedule[4].fcf;
    const terminalValue = (fcf5 * (1 + pTerminalGrowth)) / (pWacc - pTerminalGrowth);
    const pvTv = terminalValue / Math.pow(1 + pWacc, 5);

    const enterpriseValue = sumPv + pvTv;
    const equityValue = enterpriseValue - pNetDebt;
    const valuePerShare = equityValue / pShares;

    setResult({
      valuePerShare,
      enterpriseValue,
      equityValue,
      schedule
    });

    const summaryStr = `Firma Dğr: ${Number(enterpriseValue.toFixed(2)).toLocaleString('tr-TR')} TL, Büyüme: %${parseFloat(growthRate)}, WACC: %${parseFloat(wacc)}`;
    const resultStr = `${Number(valuePerShare.toFixed(2)).toLocaleString('tr-TR')} TL`;
    saveCalculation("İndirgenmiş Nakit Akımları (İNA)", summaryStr, resultStr);
  };

  // Helper to render compact input with +/- buttons
  const renderInput = (
    label: string, 
    val: string, 
    setVal: React.Dispatch<React.SetStateAction<string>>, 
    step: number = 1,
    placeholder: string = "0",
    isDecimal: boolean = false
  ) => {
    return (
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-800 dark:text-slate-200">{label}</label>
        <div className="flex items-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus-within:ring-2 focus-within:ring-amber-500">
          <input 
            type="number"
            step={isDecimal ? "0.01" : "1"}
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="w-full px-4 py-3 bg-transparent focus:outline-none text-slate-800 dark:text-slate-200 font-medium text-left"
            placeholder={placeholder}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-full">
      
      {/* Title */}
      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-center">
        <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">İndirgenmiş Nakit Akımları (İNA)</h2>
      </div>

      <div className="p-6 md:p-8 space-y-6 flex-grow">
        
        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderInput("Başlangıç Serbest Nakit Akımı (TL)", fcf0, setFcf0, 100000)}
          {renderInput("Şirketin Net Borcu (TL)", netDebt, setNetDebt, 100000)}
          {renderInput("Tahmin Dönemi Büyüme Oranı (%)", growthRate, setGrowthRate, 1, "0.0", true)}
          {renderInput("İskonto Oranı (WACC) (%)", wacc, setWacc, 1, "0.0", true)}
          {renderInput("Sonsuz (Terminal) Büyüme Oranı (%)", terminalGrowth, setTerminalGrowth, 0.5, "0.0", true)}
          {renderInput("Toplam Hisse Sayısı (Adet)", shares, setShares, 100000)}
        </div>

        <button 
          onClick={calculate}
          className="w-full py-4 mt-2 bg-slate-900 dark:bg-amber-600 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 dark:hover:bg-amber-700 transition-colors shadow-lg shadow-slate-900/20 dark:shadow-amber-600/20"
        >
          Hisse Değerini Hesapla
        </button>

        {/* Results */}
        {result && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 space-y-6">
            
            <div className="bg-slate-900 dark:bg-slate-800 p-6 rounded-2xl text-center shadow-lg shadow-amber-600/10 border border-slate-800 dark:border-slate-700">
              <div className="text-sm text-slate-400 uppercase tracking-widest font-semibold mb-2">Hisse Başına İçsel Değer</div>
              <div className="text-4xl md:text-5xl font-black text-amber-500">
                {formatCurrency(result.valuePerShare)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 text-center">
                  <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Firma Değeri</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(result.enterpriseValue)}</div>
               </div>
               <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 text-center">
                  <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Özsermaye Değeri</div>
                  <div className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(result.equityValue)}</div>
               </div>
            </div>

            <div className="max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400 relative">
                <thead className="text-xs uppercase bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-300 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="px-3 py-2 rounded-tl-lg">Yıl</th>
                    <th className="px-3 py-2">Tahmini Serbest Nakit Akımı</th>
                    <th className="px-3 py-2 rounded-tr-lg">Bugünkü Değeri (PV)</th>
                  </tr>
                </thead>
                <tbody>
                  {result.schedule.map((row) => (
                    <tr key={row.year} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-3 py-1.5 font-bold text-slate-900 dark:text-white">{row.year}</td>
                      <td className="px-3 py-1.5 font-medium text-amber-600 dark:text-amber-500">{formatCurrency(row.fcf)}</td>
                      <td className="px-3 py-1.5 text-slate-700 dark:text-slate-300">{formatCurrency(row.pv)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
