/**
 * Market ticker for the portfolio header.
 *
 * Runs server-side for two reasons: Yahoo Finance does not send CORS headers,
 * and keeping the upstream calls here lets us cache the response at the edge.
 */

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

/** Global markets, via Yahoo Finance. */
const YAHOO_SYMBOLS = [
  { id: 'sp500', label: 'S&P 500', symbol: '^GSPC', kind: 'index' },
  { id: 'gold', label: 'Oro', symbol: 'GC=F', kind: 'usd' },
  { id: 'oil', label: 'Petróleo', symbol: 'CL=F', kind: 'usd' },
  { id: 'usdclp', label: 'Dólar', symbol: 'USDCLP=X', kind: 'clp' },
  { id: 'nasdaq', label: 'Nasdaq', symbol: '^IXIC', kind: 'index' },
  { id: 'btc', label: 'Bitcoin', symbol: 'BTC-USD', kind: 'usd' },
];

async function fetchYahoo(entry) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    entry.symbol,
  )}?interval=1d&range=1d`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) return null;

    const data = await response.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta) return null;

    const price = meta.regularMarketPrice;
    const previous = meta.chartPreviousClose ?? meta.previousClose;
    if (typeof price !== 'number') return null;

    const changePct =
      typeof previous === 'number' && previous !== 0
        ? ((price - previous) / previous) * 100
        : 0;

    return {
      id: entry.id,
      label: entry.label,
      value: price,
      changePct,
      kind: entry.kind,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/** Chilean indicators, via mindicador.cl (official local data). */
async function fetchChileIndicators() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch('https://mindicador.cl/api', {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!response.ok) return [];

    const data = await response.json();
    const out = [];

    if (data?.uf?.valor) {
      out.push({ id: 'uf', label: 'UF', value: data.uf.valor, changePct: null, kind: 'clp' });
    }
    if (data?.utm?.valor) {
      out.push({ id: 'utm', label: 'UTM', value: data.utm.valor, changePct: null, kind: 'clp' });
    }
    if (typeof data?.ipc?.valor === 'number') {
      out.push({
        id: 'ipc',
        label: 'IPC (mes)',
        value: data.ipc.valor,
        changePct: null,
        kind: 'pct',
      });
    }

    return out;
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  const [yahooResults, chile] = await Promise.all([
    Promise.all(YAHOO_SYMBOLS.map(fetchYahoo)),
    fetchChileIndicators(),
  ]);

  const markets = yahooResults.filter(Boolean);

  // Keep a stable order: equities, commodities, currency, crypto, then local.
  const order = ['sp500', 'nasdaq', 'gold', 'oil', 'usdclp', 'btc'];
  markets.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));

  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(200).json({
    updatedAt: new Date().toISOString(),
    items: [...markets, ...chile],
  });
}
