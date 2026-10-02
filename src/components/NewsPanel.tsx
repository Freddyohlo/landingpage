import { useEffect, useState } from 'react';
import { ExternalLink, Newspaper, RefreshCw } from 'lucide-react';

type NewsItem = {
  title: string;
  link: string;
  source: string;
  publishedAt: string;
  image: string;
};

type Status = 'loading' | 'ready' | 'error';

function relativeTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);
  if (minutes < 1) return 'ahora';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.round(hours / 24);
  return `hace ${days} d`;
}

export default function NewsPanel() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [refreshing, setRefreshing] = useState(false);
  const [failed, setFailed] = useState<Record<string, boolean>>({});

  async function load() {
    setRefreshing(true);
    try {
      const response = await fetch('/api/news?limit=6');
      if (!response.ok) throw new Error('bad status');
      const data = await response.json();
      setItems(Array.isArray(data.items) ? data.items : []);
      setStatus('ready');
    } catch {
      setStatus('error');
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="news">
      <div className="news__head">
        <span className="news__title">
          <Newspaper size={16} /> Noticias de Chile
        </span>
        <button
          className="news__refresh"
          onClick={load}
          disabled={refreshing}
          aria-label="Actualizar noticias"
        >
          <RefreshCw size={14} className={refreshing ? 'news__spin' : ''} />
        </button>
      </div>

      {status === 'loading' && (
        <div className="news__list">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="news__skeleton" />
          ))}
        </div>
      )}

      {status === 'error' && (
        <p className="news__empty">
          No se pudieron cargar las noticias. Intenta actualizar.
        </p>
      )}

      {status === 'ready' && items.length === 0 && (
        <p className="news__empty">Sin noticias por ahora.</p>
      )}

      {status === 'ready' && items.length > 0 && (
        <ul className="news__list">
          {items.map((item) => (
            <li key={item.link}>
              <a className="news__item" href={item.link} target="_blank" rel="noreferrer">
                {item.image && !failed[item.link] ? (
                  <img
                    className="news__thumb"
                    src={item.image}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onError={() =>
                      setFailed((current) => ({ ...current, [item.link]: true }))
                    }
                  />
                ) : (
                  <span className="news__thumb news__thumb--empty" aria-hidden="true">
                    📰
                  </span>
                )}
                <span className="news__body">
                  <span className="news__item-title">{item.title}</span>
                  <span className="news__meta">
                    {item.source}
                    {item.publishedAt ? ` · ${relativeTime(item.publishedAt)}` : ''}
                    <ExternalLink size={11} className="news__meta-icon" />
                  </span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
