import fs from 'fs/promises'
import fetch from 'node-fetch'

const INPUT = 'public/wrestlers.json'
const OUTPUT = 'public/wrestlers.json'

const SUMMARY_API = 'https://en.wikipedia.org/api/rest_v1/page/summary/'
const OPENSEARCH_API =
  'https://en.wikipedia.org/w/api.php?action=opensearch&limit=1&namespace=0&format=json&origin=*'
const SEARCH_API =
  'https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*'

const USER_AGENT = 'ass-index-link-fixer/1.0 (local script)'

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const titleFromUrl = (url) => {
  if (!url) return null
  const idx = url.lastIndexOf('/wiki/')
  if (idx === -1) return null
  return url.slice(idx + 6)
}

const buildWikiFields = (title) => {
  const pageTitle = decodeURIComponent(title)
  return {
    wiki: `https://en.wikipedia.org/wiki/${title}`,
    wikipediaUrl: `https://en.wikipedia.org/wiki/${title}`,
    wikiSummaryApi: `${SUMMARY_API}${title}`,
    wikiPageImageApi: `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages%7Cinfo&inprop=url&redirects=1&pithumbsize=600&titles=${pageTitle}`,
  }
}

const fetchJson = async (url, attempts = 3) => {
  for (let i = 0; i < attempts; i += 1) {
    const res = await fetch(url, {
      headers: {
        'user-agent': USER_AGENT,
        'accept-language': 'en-US,en;q=0.9',
      },
    })
    if (res.ok) {
      return res.json()
    }
    if (res.status === 429 || res.status === 503) {
      await sleep(300 * (i + 1))
      continue
    }
    return null
  }
  return null
}

const fetchSummary = async (title) => {
  return fetchJson(`${SUMMARY_API}${title}`)
}

const searchTitle = async (name) => {
  const url = `${OPENSEARCH_API}&search=${encodeURIComponent(name)}`
  const data = await fetchJson(url)
  if (!data) return null
  const firstTitle = Array.isArray(data) && Array.isArray(data[1]) ? data[1][0] : null
  return firstTitle ? firstTitle.replace(/\s+/g, '_') : null
}

const searchTitles = async (name) => {
  const url = `${SEARCH_API}&srlimit=5&srsearch=${encodeURIComponent(name)}`
  const data = await fetchJson(url)
  const results = data?.query?.search || []
  return results
    .map((item) => item?.title)
    .filter(Boolean)
    .map((title) => title.replace(/\s+/g, '_'))
}

const resolveCanonicalTitle = async (wrestler) => {
  const explicitTitle = titleFromUrl(wrestler?.wikipediaUrl || wrestler?.wiki)
  if (explicitTitle) {
    const summary = await fetchSummary(explicitTitle)
    if (summary?.content_urls?.desktop?.page) {
      return titleFromUrl(summary.content_urls.desktop.page)
    }
  }

  if (wrestler?.name) {
    const rawName = wrestler.name
    const byName = await fetchSummary(
      encodeURIComponent(rawName.replace(/\s+/g, '_')),
    )
    if (byName?.content_urls?.desktop?.page) {
      return titleFromUrl(byName.content_urls.desktop.page)
    }

    const search = await searchTitle(wrestler.name)
    if (search) {
      const bySearch = await fetchSummary(encodeURIComponent(search))
      if (bySearch?.content_urls?.desktop?.page) {
        return titleFromUrl(bySearch.content_urls.desktop.page)
      }
    }

    const searchResults = await searchTitles(`${rawName} wrestler`)
    for (const result of searchResults) {
      const summary = await fetchSummary(encodeURIComponent(result))
      if (summary?.content_urls?.desktop?.page) {
        return titleFromUrl(summary.content_urls.desktop.page)
      }
    }
  }

  return null
}

async function main() {
  const raw = await fs.readFile(INPUT, 'utf8')
  const wrestlers = JSON.parse(raw)

  let updated = 0
  let missing = 0

  for (const w of wrestlers) {
    const currentTitle = titleFromUrl(w?.wikipediaUrl || w?.wiki)
    let title = currentTitle

    if (currentTitle) {
      const summary = await fetchSummary(currentTitle)
      if (!summary?.content_urls?.desktop?.page) {
        title = null
      }
    }

    if (!title) {
      title = await resolveCanonicalTitle(w)
    }

    if (!title) {
      missing += 1
      console.log(`No Wikipedia match: ${w?.name || w?.id}`)
      await sleep(120)
      continue
    }

    const fields = buildWikiFields(encodeURIComponent(decodeURIComponent(title)))
    w.wiki = fields.wiki
    w.wikipediaUrl = fields.wikipediaUrl
    w.wikiSummaryApi = fields.wikiSummaryApi
    w.wikiPageImageApi = fields.wikiPageImageApi
    updated += 1

    await sleep(120)
  }

  await fs.writeFile(OUTPUT, JSON.stringify(wrestlers, null, 2))
  console.log(`Done. Updated: ${updated}. Missing: ${missing}.`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
