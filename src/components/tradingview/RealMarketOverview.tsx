"use client";

import React, { useState, useEffect } from 'react';
import { useMarketData, ASSETS } from '@/context/MarketContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

import LivePriceCard from './LivePriceCard';
import LocalTopMovers from './LocalTopMovers';

const TABS = [
  { id: 'all', label: 'Tümü' },
  { id: 'bist', label: 'Borsa İstanbul' },
  { id: 'crypto', label: 'Kripto & Döviz' },
];

export default function RealMarketOverview() {
  const { dataMap } = useMarketData();
  const [activeTab, setActiveTab] = useState('all');
  const [isClient, setIsClient] = useState(false);

  // Fix hydration issues with favorites
  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredAssets = ASSETS.filter(asset => {
    if (activeTab === 'all') return true;
    if (activeTab === 'bist') {
      return ['XU100', 'THYAO', 'TUPRS', 'KCHOL', 'AKBNK', 'ISCTR', 'EREGL'].includes(asset.id);
    } else {
      return ['BTCUSDT', 'ETHUSDT', 'USDTRY', 'GOLD'].includes(asset.id);
    }
  });

  return (
    <div className="flex flex-col xl:flex-row gap-6">
      <div className="flex-1 w-full bg-slate-900/80 backdrop-blur-3xl rounded-3xl border border-slate-700/50 shadow-2xl shadow-black/80 overflow-hidden flex flex-col">
      
      {/* Live Market Status Bar */}
      <div className="bg-[#0a0f18] border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/20">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <span className="text-emerald-400 font-bold tracking-widest text-sm uppercase">Piyasalar Açık (Canlı Veri)</span>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Son Güncelleme: Anlık
        </div>
      </div>

      <div className="border-b border-slate-700/50 px-6 pt-5 flex gap-6 bg-slate-800/20 overflow-x-auto no-scrollbar">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 px-2 text-sm md:text-base font-bold tracking-wide transition-all border-b-2 whitespace-nowrap relative ${
              activeTab === tab.id
                ? 'border-indigo-400 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.5)]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAssets.map((asset) => {
            const data = dataMap[asset.id];

            if (!data || !isClient) {
              return (
                <div key={asset.id} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5 animate-pulse h-48 flex flex-col justify-between">
                  <div className="flex justify-between w-full">
                    <div className="h-4 bg-slate-700 rounded w-1/3"></div>
                    <div className="h-4 bg-slate-700 rounded w-1/4"></div>
                  </div>
                  <div className="h-8 bg-slate-700 rounded w-1/2 my-4"></div>
                  <div className="w-8 h-8 self-center border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin"></div>
                </div>
              );
            }

            return <LivePriceCard key={asset.id} asset={asset} data={data} />;
          })}
        </div>
      </div>
      </div>

      {/* Right Side: Top Gainers/Losers */}
      <div className="w-full xl:w-[350px] bg-slate-900/80 backdrop-blur-3xl rounded-3xl border border-slate-700/50 shadow-2xl shadow-black/80 overflow-hidden flex flex-col min-h-[500px]">
        <div className="bg-[#0a0f18] border-b border-slate-800 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-amber-500 font-bold tracking-widest text-sm uppercase">Günün Verileri</span>
          </div>
        </div>
        <div className="flex-1 p-2">
          <LocalTopMovers />
        </div>
      </div>
    </div>
  );
}
