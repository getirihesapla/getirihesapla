

async function test() {
  const res = await fetch('https://scanner.tradingview.com/turkey/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      columns: ['name', 'close', 'change', 'description'],
      sort: { sortBy: 'change', sortOrder: 'desc' },
      range: [0, 5]
    })
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
test();
