import { useEffect, useState } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';

type MarketItem = {
  id: string;
  label: string;
  value: number;
  changePct: number | null;
  kind: 'index' | 'usd' | 'clp' | 'fx' | 'pct';
};

function formatValue(item: MarketItem): string {
  if (item.kind === 'pct') {
    return `${item.value > 0 ? '+' : ''}${item.value.toFixed(1)}%`;
  }
  if (item.kind === 'fx') {
    return item.value.toFixed(4);
  }
  const decimals = item.value >= 1000 ? 0 : 2;
  return new Intl.NumberFormat('es-CL', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(item.value);
}

function formatChange(value: number): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
}

export default function MarketTicker() {
  const [items, setItems] = useState<MarketItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch('/api/markets');
        if (!response.ok) return;
        const data = await response.json();
        if (!cancelled && Array.isArray(data.items)) setItems(data.items);
      } catch {
        // Silent: the strip simply stays hidden if the data is unavailable.
      }
    }

    load();
    const timer = setInterval(load, 300000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  if (items.length === 0) return null;

  // Duplicated once so the marquee can loop seamlessly.
  const loop = [...items, ...items];

  return (
    <div className="ticker" aria-label="Indicadores de mercado">
      <div className="ticker__track">
        {loop.map((item, index) => {
          const up = (item.changePct ?? 0) >= 0;
          return (
            <span className="ticker__item" key={`${item.id}-${index}`}>
              <span className="ticker__label">{item.label}</span>
              <span className="ticker__value">{formatValue(item)}</span>
              {item.changePct !== null && (
                <span className={`ticker__change ${up ? 'is-up' : 'is-down'}`}>
                  {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {formatChange(item.changePct)}
                </span>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
