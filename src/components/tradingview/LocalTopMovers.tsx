"use client";

import React, { useState, useEffect } from 'react';

interface MoverData {
  symbol: string;
  price: number;
  change: number;
  name: string;
}

export default function LocalTopMovers() {
  const [activeTab, setActiveTab] = useState<'gainers' | 'losers'>('gainers');
  const [gainers, setGainers] = useState<MoverData[]>([]);
  const [losers, setLosers] = useState<MoverData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMovers = async () => {
      try {
        const res = await fetch('/api/finance/movers');
        if (res.ok) {
          const data = await res.json();
          setGainers(data.gainers || []);
          setLosers(data.losers || []);
        }
      } catch (err) {
        console.error("Günün yıldızları yüklenemedi", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovers();
    const interval = setInterval(fetchMovers, 60000); // 1 dakikada bir yenile
    return () => clearInterval(interval);
  }, []);

  const displayList = activeTab === 'gainers' ? gainers : losers;

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
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
          </div>
        ) : displayList.length === 0 ? (
          <div className="text-center text-slate-500 py-12 text-sm flex flex-col items-center justify-center h-full">
            <span className="text-3xl mb-2 opacity-20">📊</span>
            Burada henüz veri yok
          </div>
        ) : (
          displayList.map(asset => {
            const isPositive = asset.change >= 0;
            // Kısaltılmış isimler gösterimi
            const shortName = asset.name.length > 25 ? asset.name.substring(0, 25) + '...' : asset.name;
            
            return (
              <div key={asset.symbol} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 transition-all border border-slate-700/50 shadow-sm hover:shadow-md hover:scale-[1.02] cursor-default">
                <div className="flex flex-col">
                  <span className="font-bold text-slate-100 text-sm tracking-wide">{asset.symbol}</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest" title={asset.name}>{shortName}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-bold text-slate-100 text-sm">
                    ₺{asset.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded mt-1 text-white shadow-sm ${isPositive ? 'bg-emerald-500/80 shadow-emerald-500/20' : 'bg-rose-500/80 shadow-rose-500/20'}`}>
                    {isPositive ? '+' : ''}{asset.change.toFixed(2)}%
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
