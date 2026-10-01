/**
 * Chilean news aggregator.
 *
 * Runs server-side because none of the Chilean news feeds send CORS headers,
 * so the browser cannot fetch them directly. This endpoint reads the feeds,
 * normalizes them, and returns JSON.
 */

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36';

const SOURCES = [
  { name: 'Google News Chile', url: 'https://news.google.com/rss?hl=es-419&gl=CL&ceid=CL:es-419' },
  { name: 'DUPLOS', url: 'https://www.duplos.cl/feed/' },
  { name: 'The Clinic', url: 'https://www.theclinic.cl/feed/' },
  { name: 'CIPER Chile', url: 'https://www.ciperchile.cl/feed/' },
  { name: 'El Periodista', url: 'https://www.elperiodista.cl/feed/' },
];

function decodeEntities(text) {
  if (!text) return '';
  return text
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, '&')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function pickRaw(block, tag) {
  const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  return match ? match[1] : '';
}

function pickTag(block, tag) {
  return decodeEntities(pickRaw(block, tag));
}

function pickImage(block) {
  // media:thumbnail is the most reliable image source.
  const thumb = block.match(/<media:thumbnail[^>]*url="([^"]+)"/i);
  if (thumb) return thumb[1];

  // media:content, but only when it is an image (the tag also carries videos).
  const contentTags = block.match(/<media:content[^>]*>/gi) || [];
  for (const tag of contentTags) {
    if (/medium="image"/i.test(tag) || /type="image\//i.test(tag)) {
      const url = tag.match(/url="([^"]+)"/i);
      if (url) return url[1];
    }
  }

  const enclosure = block.match(/<enclosure[^>]*url="([^"]+)"[^>]*type="image\/[^"]*"/i);
  if (enclosure) return enclosure[1];

  // Fall back to the first <img> inside description/content.
  const body = `${pickRaw(block, 'description')} ${pickRaw(block, 'content:encoded')}`;
  const img = body.match(/<img[^>]*src="([^"]+)"/i);
  if (img) return img[1];

  return '';
}

function parseFeed(xml, sourceName) {
  const items = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];
  const parsed = [];

  for (const block of items) {
    const title = pickTag(block, 'title');
    const link = pickTag(block, 'link');
    if (!title || !link) continue;

    // Google News titles end with " - Publisher"; surface that as the source.
    let cleanTitle = title;
    let outlet = sourceName;
    const outletMatch = title.match(/\s+-\s+([^-]+)$/);
    if (sourceName === 'Google News Chile' && outletMatch) {
      cleanTitle = title.slice(0, title.length - outletMatch[0].length).trim();
      outlet = outletMatch[1].trim();
    }

    parsed.push({
      title: cleanTitle,
      link,
      source: outlet,
      publishedAt: pickTag(block, 'pubDate') || pickTag(block, 'dc:date'),
      image: pickImage(block),
    });
  }

  return parsed;
}

async function fetchFeed(source) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);

  try {
    const response = await fetch(source.url, {
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'application/rss+xml, application/xml, text/xml',
      },
      signal: controller.signal,
    });
    if (!response.ok) return [];
    const xml = await response.text();
    return parseFeed(xml, source.name);
  } catch {
    return [];
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  const limit = Math.min(Number(req.query?.limit) || 6, 12);

  const results = await Promise.all(SOURCES.map(fetchFeed));
  const all = results.flat();

  // De-duplicate by title so the same story from two outlets is not repeated.
  const seen = new Set();
  const unique = [];
  for (const item of all) {
    const key = item.title.toLowerCase().slice(0, 60);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
  }

  unique.sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));

  // Prefer items that carry an image so the panel keeps its visual weight.
  const withImage = unique.filter((item) => item.image);
  const withoutImage = unique.filter((item) => !item.image);
  const selected = [...withImage.slice(0, 3), ...withoutImage].slice(0, limit);

  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1200');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(200).json({ updatedAt: new Date().toISOString(), items: selected });
}
