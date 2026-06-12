export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://scanner.tradingview.com/global/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbols: { tickers: ['OANDA:XAUUSD', 'OANDA:XAGUSD'] },
        columns: ['close', 'change', 'change_abs']
      }),
      cache: 'no-store'
    });
    
    if (!res.ok) throw new Error('Failed to fetch from TV Scanner');
    
    const data = await res.json();
    return NextResponse.json(data.data);
  } catch (err) {
    console.warn("TV Scanner failed, falling back to Yahoo Finance server-side fetch");
    try {
       const goldRes = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/GC=F?range=1d&interval=1m', { cache: 'no-store' }).then(r=>r.json());
       const silverRes = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/SI=F?range=1d&interval=1m', { cache: 'no-store' }).then(r=>r.json());
       
       const parseYahoo = (data: any, symbol: string) => {
           const result = data.chart.result[0];
           const currentPrice = result.meta.regularMarketPrice;
           const prevClose = result.meta.chartPreviousClose;
           const changePercent = ((currentPrice - prevClose) / prevClose) * 100;
           return { s: symbol, d: [currentPrice, changePercent, currentPrice - prevClose] };
       };
       
       return NextResponse.json([
         parseYahoo(goldRes, 'OANDA:XAUUSD'), 
         parseYahoo(silverRes, 'OANDA:XAGUSD')
       ]);
    } catch (e) {
       console.error("All commodity feeds failed", e);
       return NextResponse.json({ error: 'All sources failed' }, { status: 500 });
    }
  }
}
