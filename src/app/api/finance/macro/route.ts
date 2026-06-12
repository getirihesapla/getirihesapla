export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // 1. Fetch Economics, Crypto, and Indices from TV Scanner
    const tvRes = await fetch('https://scanner.tradingview.com/global/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbols: {
          tickers: [
            'ECONOMICS:USINTR', // FED
            'ECONOMICS:TRINTR', // TCMB
            'ECONOMICS:USIRYY', // US Enflasyon
            'ECONOMICS:TRIRYY', // TR Enflasyon
            'CRYPTOCAP:BTC.D',  // BTC Dominance
            'TVC:DXY',          // DXY
            'CBOE:VIX',         // VIX
            'TVC:US10Y',        // ABD 10 Yıllık
          ]
        },
        columns: ['close', 'change', 'change_abs']
      }),
      cache: 'no-store'
    });

    let macroData: any[] = [];
    if (tvRes.ok) {
      const data = await tvRes.json();
      macroData = data.data.map((item: any) => ({
        symbol: item.s,
        price: item.d[0],
        changePercent: item.d[1],
        change: item.d[2]
      }));
    }

    // 2. Fetch Commodities (Gold & Oil) directly from Yahoo Finance for 100% real-time guarantee
    const fetchYahoo = async (yahooSymbol: string, tvSymbolMatch: string) => {
      try {
        const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?range=1d&interval=1m`, { cache: 'no-store' });
        const data = await res.json();
        const result = data.chart.result[0];
        const currentPrice = result.meta.regularMarketPrice;
        const prevClose = result.meta.chartPreviousClose;
        const change = currentPrice - prevClose;
        const changePercent = prevClose ? (change / prevClose) * 100 : 0;
        return {
          symbol: tvSymbolMatch,
          price: currentPrice,
          changePercent: changePercent,
          change: change
        };
      } catch (e) {
        console.error(`Yahoo fetch failed for ${yahooSymbol}`, e);
        return null;
      }
    };

    const [gold, oil] = await Promise.all([
      fetchYahoo('GC=F', 'OANDA:XAUUSD'),
      fetchYahoo('CL=F', 'NYMEX:CL1!')
    ]);

    if (gold) macroData.push(gold);
    if (oil) macroData.push(oil);

    return NextResponse.json(macroData);
  } catch (error) {
    console.error('Error fetching macro data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
