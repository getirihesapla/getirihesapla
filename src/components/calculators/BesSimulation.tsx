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
  const [scenario, setScenario] = useState<"iyimser" | "kotumser">("kotumser");
  const [retirementAge, setRetirementAge] = useState<string>("56");

  const [result, setResult] = useState<{
    totalSavings: number;
    labels: string[];
    mySavingsData: number[];
    stateContributionData: number[];
  } | null>(null);

  const calculate = () => {
    if (!monthlyContribution || !age || !contributionIncreaseRate) {
      alert("Lütfen hesaplama için gerekli tüm alanları doldurun.");
      return;
    }

    const pMonthly = parseFloat(monthlyContribution) || 0;
    const pAge = parseInt(age) || 0;
    const pIncreaseRate = (parseFloat(contributionIncreaseRate) || 0) / 100;
    const pFundReturn = scenario === "iyimser" ? 0.03 : 0.01;

    const pRetirementAge = parseInt(retirementAge) || 56;

    if (pAge >= pRetirementAge) {
      alert(`Mevcut yaşınız seçilen emeklilik yaşından (${pRetirementAge}) küçük olmalıdır.`);
      return;
    }

    const nYears = pRetirementAge - pAge;
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
          <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white">Bireysel Emeklilik (BES)</h2>
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
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200">Yıllık Reel Getiri (Net %)</label>
              <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="scenario" 
                    value="iyimser"
                    checked={scenario === "iyimser"}
                    onChange={() => setScenario("iyimser")}
                    className="w-4 h-4 text-amber-500 bg-white border-slate-300 focus:ring-amber-500 dark:focus:ring-amber-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">İyimser (%3)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="radio" 
                    name="scenario" 
                    value="kotumser"
                    checked={scenario === "kotumser"}
                    onChange={() => setScenario("kotumser")}
                    className="w-4 h-4 text-amber-500 bg-white border-slate-300 focus:ring-amber-500 dark:focus:ring-amber-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600 cursor-pointer"
                  />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Kötümser (%1)</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200">Emeklilik Yaşınız</label>
              <div className="relative">
                <select
                  value={retirementAge}
                  onChange={(e) => setRetirementAge(e.target.value)}
                  className="w-full appearance-none px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-200 font-medium cursor-pointer"
                >
                  {Array.from({ length: 20 }, (_, i) => 56 + i).map(age => (
                    <option key={age} value={age}>{age}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500 dark:text-amber-500">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
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
