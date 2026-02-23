import fs from 'fs/promises';
import fetch from 'node-fetch';

const INPUT = 'wrestlers.json';
const OUTPUT = 'wrestlers.json';

const WIKI_API = 'https://en.wikipedia.org/w/api.php';

const DESCRIPTION_KEYWORDS = [
  'professional wrestler',
  'wrestler',
  'wwe',
  'wwf',
  'aew',
  'pro wrestler'
];

function descriptionMatches(page) {
  const description =
    page?.description ||
    page?.descriptions?.en ||
    (Array.isArray(page?.terms?.description)
      ? page.terms.description.join(' ')
      : page?.terms?.description) ||
    '';

  const lcDesc = description.toLowerCase();
  return DESCRIPTION_KEYWORDS.some((keyword) => lcDesc.includes(keyword));
}

async function getImageFromWiki(name) {
  const encoded = encodeURIComponent(name);
  const url = `${WIKI_API}?action=query&prop=pageimages|description|pageterms&titles=${encoded}&pithumbsize=600&format=json&origin=*`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const pages = data?.query?.pages || {};
    const page = Object.values(pages)[0];

    if (!page || !page.thumbnail || !page.thumbnail.source) {
      return null;
    }

    if (!descriptionMatches(page)) {
      console.warn(
        `Skipping image for ${name} due to non-matching description:`,
        page.description || page.descriptions?.en || ''
      );
      return null;
    }

    return page.thumbnail.source;
  } catch (err) {
    console.error(`Error fetching wiki image for ${name}`, err);
    return null;
  }
}

async function main() {
  const raw = await fs.readFile(INPUT, 'utf8');
  const wrestlers = JSON.parse(raw);

  for (const w of wrestlers) {
    if (w.imageUrl) continue;

    const name = w.name || w.ringName || w.fullName;
    if (!name) continue;

    console.log(`Fetching image for: ${name}`);
    const img = await getImageFromWiki(name);
    w.imageUrl = img || null;

    await new Promise((r) => setTimeout(r, 200));
  }

  await fs.writeFile(OUTPUT, JSON.stringify(wrestlers, null, 2));
  console.log('Done. Saved to', OUTPUT);
}

main().catch(console.error);
