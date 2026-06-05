"use client";

import React, { useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function BesSimulation() {
  const [monthlyContribution, setMonthlyContribution] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [contributionIncreaseRate, setContributionIncreaseRate] = useState<string>("");
  const [fundReturnRate, setFundReturnRate] = useState<string>("");

  const [result, setResult] = useState<{
    totalSavings: number;
    labels: string[];
    mySavingsData: number[];
    stateContributionData: number[];
  } | null>(null);

  const calculate = () => {
    if (!monthlyContribution || !age || !contributionIncreaseRate || !fundReturnRate) {
      alert("Lütfen hesaplama için gerekli tüm alanları doldurun.");
      return;
    }

    const pMonthly = parseFloat(monthlyContribution) || 0;
    const pAge = parseInt(age) || 0;
    const pIncreaseRate = (parseFloat(contributionIncreaseRate) || 0) / 100;
    const pFundReturn = (parseFloat(fundReturnRate) || 0) / 100;

    if (pAge >= 56) {
      alert("Mevcut yaşınız 56 veya daha büyük olamaz. Emeklilik yaşı 56'dır.");
      return;
    }

    const nYears = 56 - pAge;
    let contributionYearly = pMonthly * 12;

    let myPool = 0;
    let statePool = 0;
    const labels: string[] = [];
    const mySavingsData: number[] = [];
    const stateContributionData: number[] = [];

    for (let i = 1; i <= nYears; i++) {
      myPool += contributionYearly;
      statePool += contributionYearly * 0.30; // %30 devlet katkısı
      
      myPool *= (1 + pFundReturn);
      statePool *= (1 + pFundReturn);
      
      labels.push((pAge + i).toString());
      mySavingsData.push(myPool);
      stateContributionData.push(statePool);
      
      contributionYearly *= (1 + pIncreaseRate);
    }

    const totalSavings = myPool + statePool;

    setResult({
      totalSavings,
      labels,
      mySavingsData,
      stateContributionData
    });
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col h-full">
        
        {/* Title */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-center">
          <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">Bireysel Emeklilik (BES) Simülasyonu</h2>
        </div>

        <div className="p-6 md:p-8 space-y-6 flex-grow flex flex-col">
          
          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200">Aylık Katkı Payı Tutar (TL)</label>
              <div className="flex items-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus-within:ring-2 focus-within:ring-amber-500">
                <input 
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent focus:outline-none text-slate-800 dark:text-slate-200 font-medium text-left"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200">Mevcut Yaşınız</label>
              <div className="flex items-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus-within:ring-2 focus-within:ring-amber-500">
                <input 
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent focus:outline-none text-slate-800 dark:text-slate-200 font-medium text-left"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200">Yıllık Katkı Payı Artış Oranı (%)</label>
              <div className="flex items-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus-within:ring-2 focus-within:ring-amber-500">
                <input 
                  type="number"
                  step="0.1"
                  value={contributionIncreaseRate}
                  onChange={(e) => setContributionIncreaseRate(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent focus:outline-none text-slate-800 dark:text-slate-200 font-medium text-left"
                  placeholder="0.0"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200">Tahmini Yıllık Fon Getiri Oranı (%)</label>
              <div className="flex items-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus-within:ring-2 focus-within:ring-amber-500">
                <input 
                  type="number"
                  step="0.1"
                  value={fundReturnRate}
                  onChange={(e) => setFundReturnRate(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent focus:outline-none text-slate-800 dark:text-slate-200 font-medium text-left"
                  placeholder="0.0"
                />
              </div>
            </div>
          </div>

          <div className="mt-2">
            <button 
              onClick={calculate}
              className="w-full py-4 bg-slate-900 dark:bg-amber-600 text-white rounded-2xl font-bold text-lg hover:bg-slate-800 dark:hover:bg-amber-700 transition-colors shadow-lg shadow-slate-900/20 dark:shadow-amber-600/20"
            >
              BES Hesapla
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 flex flex-col h-full space-y-6">
              
              <div className="bg-slate-900 dark:bg-slate-800 p-6 rounded-2xl text-center shadow-lg shadow-amber-600/10 border border-slate-800 dark:border-slate-700">
                <div className="text-sm text-slate-400 uppercase tracking-widest font-semibold mb-2">Tahmini Emeklilik Birikiminiz</div>
                <div className="text-3xl md:text-4xl font-black text-amber-500">
                  {Number(result.totalSavings.toFixed(2)).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TL
                </div>
              </div>

              <div className="h-64 w-full mt-4">
                <Bar 
                  data={{
                    labels: result.labels,
                    datasets: [
                      {
                        label: 'Kendi Birikiminiz',
                        data: result.mySavingsData,
                        backgroundColor: '#1e293b', // slate-800 equivalent
                        stack: 'Stack 0',
                      },
                      {
                        label: 'Devlet Katkısı',
                        data: result.stateContributionData,
                        backgroundColor: '#f59e0b', // amber-500 equivalent
                        stack: 'Stack 0',
                      },
                    ],
                  }} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                      mode: 'index',
                      intersect: false,
                    },
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          color: '#64748b',
                          font: {
                            family: "'Inter', sans-serif",
                            weight: 'bold'
                          }
                        }
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                              label += ': ';
                            }
                            if (context.parsed.y !== null) {
                              label += new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(context.parsed.y);
                            }
                            return label;
                          }
                        }
                      }
                    },
                    scales: {
                      x: { 
                        stacked: true,
                        grid: {
                          display: false
                        },
                        ticks: {
                          color: '#94a3b8'
                        }
                      },
                      y: { 
                        stacked: true,
                        border: { display: false },
                        grid: {
                          color: 'rgba(148, 163, 184, 0.1)'
                        },
                        ticks: {
                          color: '#94a3b8',
                          callback: function(value) {
                            if (Number(value) >= 1000000) {
                              return (Number(value) / 1000000).toFixed(1) + 'M';
                            } else if (Number(value) >= 1000) {
                              return (Number(value) / 1000).toFixed(0) + 'K';
                            }
                            return value;
                          }
                        }
                      }
                    }
                  }} 
                />
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
