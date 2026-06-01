"use client";

import React, { useState } from 'react';
import { useMarketData, ASSETS } from '@/context/MarketContext';

export default function LocalTopMovers() {
  const { dataMap } = useMarketData();
  const [activeTab, setActiveTab] = useState<'gainers' | 'losers'>('gainers');

  const availableAssets = ASSETS.filter(asset => dataMap[asset.id]);

  const sortedAssets = [...availableAssets].sort((a, b) => {
    return dataMap[b.id].change - dataMap[a.id].change;
  });

  const gainers = sortedAssets.filter(a => dataMap[a.id].change > 0).slice(0, 5);
  const losers = [...sortedAssets].reverse().filter(a => dataMap[a.id].change < 0).slice(0, 5);

  const displayList = activeTab === 'gainers' ? gainers : losers;

  // Currency formatter helper
  const formatPrice = (asset: typeof ASSETS[0], price: number) => {
    if (asset.symbol.includes('.IS')) {
      return `₺${price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (asset.id === 'USDTRY') {
      return `₺${price.toFixed(4)}`;
    } else {
      return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/50 rounded-xl overflow-hidden shadow-inner border border-slate-800/50">
      <div className="flex border-b border-slate-700/50 bg-slate-900">
        <button 
          onClick={() => setActiveTab('gainers')}
          className={`flex-1 py-3 text-sm font-bold transition-all ${activeTab === 'gainers' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-emerald-400/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
        >
          📈 Artanlar
        </button>
        <button 
          onClick={() => setActiveTab('losers')}
          className={`flex-1 py-3 text-sm font-bold transition-all ${activeTab === 'losers' ? 'text-rose-400 border-b-2 border-rose-400 bg-rose-400/10' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
        >
          📉 Azalanlar
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
        {displayList.length === 0 ? (
          <div className="text-center text-slate-500 py-12 text-sm flex flex-col items-center justify-center h-full">
            <span className="text-3xl mb-2 opacity-20">📊</span>
            Burada henüz veri yok
          </div>
        ) : (
          displayList.map(asset => {
            const data = dataMap[asset.id];
            const isPositive = data.change >= 0;
            return (
              <div key={asset.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-all border border-slate-700/50 shadow-sm hover:shadow-md hover:scale-[1.02] cursor-default">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-100 text-sm tracking-wide">{asset.name}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest">{asset.symbol}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-bold text-slate-100 text-sm">
                    {formatPrice(asset, data.price)}
                  </span>
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded mt-1 text-white shadow-sm ${isPositive ? 'bg-emerald-500/80 shadow-emerald-500/20' : 'bg-rose-500/80 shadow-rose-500/20'}`}>
                    {isPositive ? '+' : ''}{data.change.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
