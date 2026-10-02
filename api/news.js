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
  { name: 'Publimetro', url: 'https://www.publimetro.cl/arc/outboundfeeds/rss/' },
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

/**
 * Image URLs come from XML attributes, so ampersands arrive as `&amp;`.
 * Left as-is, the browser treats the query string as one broken parameter and
 * the thumbnail fails to load, so entities must be decoded here.
 */
function cleanUrl(url) {
  if (!url) return '';
  const decoded = url
    .replace(/&amp;/g, '&')
    .replace(/&#38;/g, '&')
    .replace(/&#x26;/gi, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();

  // Protocol-relative URLs are common; normalize them.
  if (decoded.startsWith('//')) return `https:${decoded}`;
  return decoded;
}

function pickImage(block) {
  // media:thumbnail is the most reliable image source.
  const thumb = block.match(/<media:thumbnail[^>]*url="([^"]+)"/i);
  if (thumb) return cleanUrl(thumb[1]);

  // media:content, but only when it is an image (the tag also carries videos).
  const contentTags = block.match(/<media:content[^>]*>/gi) || [];
  for (const tag of contentTags) {
    if (/medium="image"/i.test(tag) || /type="image\//i.test(tag)) {
      const url = tag.match(/url="([^"]+)"/i);
      if (url) return cleanUrl(url[1]);
    }
  }

  const enclosure = block.match(/<enclosure[^>]*url="([^"]+)"[^>]*type="image\/[^"]*"/i);
  if (enclosure) return cleanUrl(enclosure[1]);

  // Fall back to the first <img> inside description/content.
  const body = `${pickRaw(block, 'description')} ${pickRaw(block, 'content:encoded')}`;
  const img = body.match(/<img[^>]*src="([^"]+)"/i);
  if (img) return cleanUrl(img[1]);

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

/**
 * Most Chilean feeds omit images, but every article page carries an og:image
 * meta tag. Fetching the article lets the panel show a thumbnail for all news,
 * keeping the list visually uniform.
 */
async function fetchOgImage(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' },
      signal: controller.signal,
    });
    if (!response.ok) return '';

    // Only the <head> matters, so stop reading once the body starts.
    const html = await response.text();
    const head = html.slice(0, 120000);
    const match =
      head.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
      head.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
    if (!match) return '';

    return cleanUrl(match[1]);
  } catch {
    return '';
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  const limit = Math.min(Number(req.query?.limit) || 9, 12);

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

  // Cap each outlet so one prolific source cannot dominate the list.
  const perSource = new Map();
  const balanced = [];
  for (const item of unique) {
    const count = perSource.get(item.source) || 0;
    if (count >= 2) continue;
    perSource.set(item.source, count + 1);
    balanced.push(item);
  }

  // Prefer items that already carry an image from the feed.
  const withImage = balanced.filter((item) => item.image);
  const withoutImage = balanced.filter((item) => !item.image);
  // Keep a couple of extras in reserve, since items without a resolvable
  // og:image are dropped afterwards.
  const selected = [...withImage.slice(0, 6), ...withoutImage].slice(0, limit + 4);

  // Fill the gaps by reading og:image from the article pages, in parallel.
  await Promise.all(
    selected.map(async (item) => {
      if (item.image) return;
      item.image = await fetchOgImage(item.link);
    }),
  );

  // Drop anything still without a photo so every row looks the same.
  const withPhotos = selected.filter((item) => item.image);
  const finalItems = (withPhotos.length >= 4 ? withPhotos : selected).slice(0, limit);

  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1200');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.status(200).json({ updatedAt: new Date().toISOString(), items: finalItems });
}
