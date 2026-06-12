"use client";

import React, { useEffect, useState, useRef } from 'react';
import { MarketData } from '@/context/MarketContext';
import { Line } from 'react-chartjs-2';

interface LivePriceCardProps {
  asset: { id: string; name: string; symbol: string; type: string };
  data: MarketData;
}

export default function LivePriceCard({ asset, data }: LivePriceCardProps) {
  const prevPriceRef = useRef(data.price);
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('korfu_favorites');
    if (saved) {
      const parsed = JSON.parse(saved);
      setIsFavorite(parsed.includes(asset.id));
    }
  }, [asset.id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    const saved = localStorage.getItem('korfu_favorites');
    let parsed: string[] = saved ? JSON.parse(saved) : [];
    
    if (parsed.includes(asset.id)) {
      parsed = parsed.filter(id => id !== asset.id);
      setIsFavorite(false);
    } else {
      parsed.push(asset.id);
      setIsFavorite(true);
    }
    localStorage.setItem('korfu_favorites', JSON.stringify(parsed));
  };

  useEffect(() => {
    if (data.price > prevPriceRef.current) {
      setFlash('up');
      setTimeout(() => setFlash(null), 1000);
    } else if (data.price < prevPriceRef.current) {
      setFlash('down');
      setTimeout(() => setFlash(null), 1000);
    }
    prevPriceRef.current = data.price;
  }, [data.price]);

  const isPositive = data.change >= 0;
  const color = isPositive ? '#10b981' : '#f43f5e'; 
  const bgColor = isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)';
  const cardTint = isPositive ? 'bg-emerald-950/20 border-emerald-900/30' : 'bg-rose-950/20 border-rose-900/30';

  const chartData = {
    labels: data.labels,
    datasets: [
      {
        data: data.history,
        borderColor: color,
        backgroundColor: bgColor,
        borderWidth: 2,
        pointRadius: 0,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: { x: { display: false }, y: { display: false } },
    animation: { duration: 0 },
    layout: { padding: 0 }
  };

  let priceFormatted = data.price.toFixed(2);
  if (asset.type === 'yahoo' && asset.id !== 'XU100' && asset.id !== 'GOLD' && asset.id !== 'SILVER') {
     priceFormatted = `₺${data.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (asset.id === 'USDTRY') {
     priceFormatted = `₺${data.price.toFixed(4)}`;
  } else if (asset.type === 'crypto') {
     priceFormatted = `$${data.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } else if (asset.id === 'GOLD' || asset.id === 'SILVER') {
     priceFormatted = `$${data.price.toFixed(2)}`;
  } else if (asset.id === 'XU100') {
     priceFormatted = data.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Flash Effect CSS classes
  const flashBgClass = flash === 'up' ? 'bg-emerald-500/20' : flash === 'down' ? 'bg-rose-500/20' : '';
  const flashTextClass = flash === 'up' ? 'text-emerald-400' : flash === 'down' ? 'text-rose-400' : 'text-white';

  return (
    <div 
      className={`relative overflow-hidden rounded-2xl p-5 transition-all duration-300 ease-out backdrop-blur-md border ${cardTint} hover:-translate-y-1 hover:shadow-xl group cursor-pointer ${flashBgClass}`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl opacity-20 rounded-full pointer-events-none transition-opacity group-hover:opacity-40 ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>

      <div className="flex justify-between items-start mb-3 relative z-10">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-100 text-lg group-hover:text-amber-400 transition-colors drop-shadow-sm">{asset.name}</span>
            <button onClick={toggleFavorite} className="text-lg hover:scale-110 transition-transform">
              {isFavorite ? '⭐' : <span className="text-slate-600">☆</span>}
            </button>
          </div>
          <span className="text-xs text-slate-400 font-medium tracking-wider flex items-center gap-1.5">
            {asset.symbol}
            <span className={`h-1.5 w-1.5 rounded-full ${asset.type === 'crypto' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} title={asset.type === 'crypto' ? '7/24 Canlı Piyasa' : 'Piyasa Saatlerinde Canlı'}></span>
          </span>
        </div>
        <div className={`tabular-nums text-sm font-bold px-2.5 py-1 rounded-lg backdrop-blur-sm border transition-colors ${flash ? (flash === 'up' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white') : (isPositive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-rose-500/20 text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]')}`}>
          {isPositive ? '▲' : '▼'} {Math.abs(data.change).toFixed(2)}%
        </div>
      </div>
      
      <div className={`tabular-nums text-3xl font-black mb-4 tracking-tight relative z-10 drop-shadow-md transition-colors duration-300 ${flashTextClass}`}>
        {priceFormatted}
      </div>
      
      <div className="h-20 w-full relative z-10 -mx-1">
        <Line data={chartData} options={chartOptions as any} />
      </div>
    </div>
  );
}
