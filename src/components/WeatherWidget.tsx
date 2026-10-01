import { useEffect, useState } from 'react';
import { Clock, MapPin } from 'lucide-react';

type Geo = {
  city: string;
  country: string;
  country_code: string;
  latitude: number;
  longitude: number;
};

type Weather = {
  temp: number;
  code: number;
};

type Status = 'loading' | 'ready' | 'fallback';

/** Santiago de Chile, used when the visitor's location cannot be resolved. */
const FALLBACK_GEO: Geo = {
  city: 'Santiago',
  country: 'Chile',
  country_code: 'CL',
  latitude: -33.4489,
  longitude: -70.6693,
};

/** WMO weather codes, as returned by Open-Meteo. */
const WMO: Record<number, { label: string; icon: string }> = {
  0: { label: 'Despejado', icon: '☀️' },
  1: { label: 'Mayormente despejado', icon: '🌤️' },
  2: { label: 'Parcialmente nublado', icon: '⛅' },
  3: { label: 'Nublado', icon: '☁️' },
  45: { label: 'Niebla', icon: '🌫️' },
  48: { label: 'Niebla helada', icon: '🌫️' },
  51: { label: 'Llovizna leve', icon: '🌦️' },
  53: { label: 'Llovizna', icon: '🌦️' },
  55: { label: 'Llovizna intensa', icon: '🌧️' },
  61: { label: 'Lluvia leve', icon: '🌧️' },
  63: { label: 'Lluvia', icon: '🌧️' },
  65: { label: 'Lluvia intensa', icon: '🌧️' },
  71: { label: 'Nieve leve', icon: '🌨️' },
  73: { label: 'Nieve', icon: '🌨️' },
  75: { label: 'Nieve intensa', icon: '❄️' },
  80: { label: 'Chubascos', icon: '🌦️' },
  81: { label: 'Chubascos', icon: '🌧️' },
  82: { label: 'Chubascos fuertes', icon: '⛈️' },
  95: { label: 'Tormenta', icon: '⛈️' },
  96: { label: 'Tormenta con granizo', icon: '⛈️' },
  99: { label: 'Tormenta con granizo', icon: '⛈️' },
};

function describe(code: number) {
  return WMO[code] ?? { label: 'Clima variable', icon: '🌡️' };
}

export default function WeatherWidget() {
  const [now, setNow] = useState(() => new Date());
  const [geo, setGeo] = useState<Geo>(FALLBACK_GEO);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      let resolved = FALLBACK_GEO;
      let usedFallback = false;

      try {
        const geoResponse = await fetch('https://ipwho.is/');
        const geoData = await geoResponse.json();
        if (geoData?.success && geoData.latitude && geoData.longitude) {
          resolved = {
            city: geoData.city || geoData.region || 'Tu ciudad',
            country: geoData.country || '',
            country_code: geoData.country_code || '',
            latitude: geoData.latitude,
            longitude: geoData.longitude,
          };
        } else {
          usedFallback = true;
        }
      } catch {
        usedFallback = true;
      }

      if (cancelled) return;
      setGeo(resolved);

      try {
        const weatherResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${resolved.latitude}&longitude=${resolved.longitude}&current=temperature_2m,weather_code`,
        );
        const weatherData = await weatherResponse.json();
        if (cancelled) return;
        setWeather({
          temp: Math.round(weatherData.current.temperature_2m),
          code: weatherData.current.weather_code,
        });
        setStatus(usedFallback ? 'fallback' : 'ready');
      } catch {
        if (!cancelled) setStatus(usedFallback ? 'fallback' : 'ready');
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const time = now.toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const dateRaw = now.toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const date = dateRaw.charAt(0).toUpperCase() + dateRaw.slice(1);
  const weatherInfo = weather ? describe(weather.code) : null;

  return (
    <div className="weather-strip">
      <div className="weather-strip__inner">
        <div className="weather-strip__item">
          <span className="weather-strip__icon" aria-hidden="true">
            <Clock size={15} />
          </span>
          <span className="weather-strip__value">{time}</span>
          <span className="weather-strip__label">{date}</span>
        </div>

        <span className="weather-strip__sep" aria-hidden="true" />

        <div className="weather-strip__item">
          <span className="weather-strip__icon" aria-hidden="true">
            {weatherInfo ? weatherInfo.icon : '🌡️'}
          </span>
          <span className="weather-strip__value">
            {status === 'loading' ? '…' : weather ? `${weather.temp}°C` : '—'}
          </span>
          {weatherInfo && (
            <span className="weather-strip__label">{weatherInfo.label}</span>
          )}
        </div>

        <span className="weather-strip__sep" aria-hidden="true" />

        <div className="weather-strip__item">
          <MapPin size={14} className="weather-strip__pin" aria-hidden="true" />
          <span className="weather-strip__label">
            {geo.city}
            {geo.country ? `, ${geo.country}` : ''}
            {status === 'fallback' && ' (aprox.)'}
          </span>
        </div>

        <span className="weather-strip__sep weather-strip__sep--wide" aria-hidden="true" />

        <div className="weather-strip__item weather-strip__item--tz">
          <span className="weather-strip__label">
            {status === 'loading'
              ? 'Detectando tu zona horaria…'
              : `Zona horaria: ${timeZone}`}
          </span>
        </div>
      </div>
    </div>
  );
}
