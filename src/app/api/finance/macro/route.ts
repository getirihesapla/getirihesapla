export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch('https://scanner.tradingview.com/global/scan', {
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
            'OANDA:XAUUSD',     // Ons Altın
            'NYMEX:CL1!'        // WTI Petrol
          ]
        },
        columns: ['close', 'change', 'change_abs']
      }),
      cache: 'no-store'
    });

    if (!res.ok) throw new Error('Failed to fetch macro data');

    const data = await res.json();
    const formatted = data.data.map((item: any) => ({
      symbol: item.s,
      price: item.d[0],
      changePercent: item.d[1],
      change: item.d[2]
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Error fetching macro data:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
