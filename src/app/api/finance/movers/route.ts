export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const fetchMovers = async (sortOrder: 'asc' | 'desc') => {
      const res = await fetch('https://scanner.tradingview.com/turkey/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          columns: ['name', 'close', 'change', 'description'],
          sort: { sortBy: 'change', sortOrder },
          range: [0, 5]
        }),
        cache: 'no-store'
      });
      
      if (!res.ok) throw new Error('Failed to fetch from TV scanner');
      const data = await res.json();
      return data.data.map((item: any) => ({
        symbol: item.d[0],
        price: item.d[1],
        change: item.d[2],
        name: item.d[3]
      }));
    };

    const [gainers, losers] = await Promise.all([
      fetchMovers('desc'),
      fetchMovers('asc')
    ]);

    return NextResponse.json({ gainers, losers });
  } catch (error) {
    console.error('Error fetching market movers:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
