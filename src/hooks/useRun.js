import { useEffect, useMemo, useRef, useState } from 'react'

const STORAGE_KEY = 'ass-index-run-v1'
const SETTINGS_KEY = 'ass-index-settings-v1'
const LOCKED_ID = 'billy-gunn'

const resolvePoolSize = (pool, total) => {
  switch (pool) {
    case 'top100':
      return Math.min(100, total)
    case 'top250':
      return Math.min(250, total)
    case 'top300':
      return Math.min(300, total)
    case 'full':
      return total
    default:
      return Math.min(100, total)
  }
}

const buildPool = (wrestlers, pool) => {
  if (!Array.isArray(wrestlers) || wrestlers.length === 0) return []
  const size = resolvePoolSize(pool, wrestlers.length)
  const slice = wrestlers.slice(0, size)
  if (slice.some((wrestler) => wrestler.id === LOCKED_ID)) {
    return slice
  }
  const locked = wrestlers.find((wrestler) => wrestler.id === LOCKED_ID)
  return locked ? [locked, ...slice] : slice
}

const clampCount = (count, pool) => {
  const max = Math.max(
    pool.filter((wrestler) => wrestler.id !== LOCKED_ID).length,
    0,
  )
  if (max === 0) return 0
  if (typeof count !== 'number' || Number.isNaN(count)) {
    return max
  }
  return Math.min(Math.max(Math.floor(count), 1), max)
}

const sanitizeSettings = (raw, wrestlers) => {
  const pool = raw && typeof raw.pool === 'string' ? raw.pool : 'top100'
  const poolWrestlers = buildPool(wrestlers, pool)
  const count = clampCount(raw?.count, poolWrestlers)
  return { pool, count }
}

const shuffle = (items) => {
  const shuffled = [...items]
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

const ensureOrigin = (url) => {
  if (!url) return null
  return url.includes('origin=') ? url : `${url}&origin=*`
}

const encodeWikiTitle = (value) => {
  if (!value) return null
  return encodeURIComponent(value.trim().replace(/\s+/g, '_'))
}

const buildWikiTitleCandidates = (wrestler) => {
  const candidates = []
  const addCandidate = (value) => {
    const encoded = encodeWikiTitle(value)
    if (!encoded) return
    if (!candidates.includes(encoded)) {
      candidates.push(encoded)
    }
  }

  const fromUrl = (url) => {
    if (!url || typeof url !== 'string') return
    const slug = url.split('/').pop()
    if (slug) addCandidate(decodeURIComponent(slug))
  }

  if (typeof wrestler?.wikiTitle === 'string') {
    addCandidate(wrestler.wikiTitle)
  }

  fromUrl(wrestler?.wiki)
  fromUrl(wrestler?.wikipediaUrl)

  if (typeof wrestler?.wikiSummaryApi === 'string') {
    const titleParam = wrestler.wikiSummaryApi.split('/').pop()
    if (titleParam) {
      addCandidate(decodeURIComponent(titleParam))
    }
  }

  if (typeof wrestler?.wikiPageImageApi === 'string') {
    const titlesMatch = wrestler.wikiPageImageApi.match(/titles=([^&]+)/)
    if (titlesMatch?.[1]) {
      addCandidate(decodeURIComponent(titlesMatch[1]))
    }
  }

  if (typeof wrestler?.name === 'string') {
    addCandidate(wrestler.name)
    addCandidate(`${wrestler.name} (wrestler)`)
    addCandidate(`${wrestler.name} (professional wrestler)`)
  }

  return candidates
}

const buildWikiImageApi = (wrestler) => {
  const candidates = buildWikiTitleCandidates(wrestler)
  if (candidates.length === 0) return null

  const title = candidates[0]
  return `https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&redirects=1&pithumbsize=600&titles=${title}&origin=*`
}

const buildWikiSummaryApi = (title) => {
  if (!title) return null
  return `https://en.wikipedia.org/api/rest_v1/page/summary/${title}`
}

const buildWikiUrl = (wrestler) => {
  if (typeof wrestler?.wikiTitle === 'string' && wrestler.wikiTitle) {
    return `https://en.wikipedia.org/wiki/${wrestler.wikiTitle}`
  }

  const raw =
    (typeof wrestler?.wikipediaUrl === 'string' && wrestler.wikipediaUrl) ||
    (typeof wrestler?.wiki === 'string' && wrestler.wiki) ||
    ''

  if (raw) {
    if (raw.startsWith('https://en.wikipedia.org/wiki/')) return raw
    if (raw.startsWith('http://en.wikipedia.org/wiki/')) {
      return raw.replace('http://', 'https://')
    }
  }

  const name = typeof wrestler?.name === 'string' ? wrestler.name : ''
  if (!name) return null
  const title = encodeURIComponent(name.replace(/\s+/g, '_'))
  return `https://en.wikipedia.org/wiki/${title}`
}

const normalizeWrestler = (wrestler) => {
  const wiki = buildWikiUrl(wrestler)
  return wiki ? { ...wrestler, wiki, wikipediaUrl: wiki } : wrestler
}

const fetchWikiImage = async (wrestler) => {
  const apiUrl = buildWikiImageApi(wrestler)
  if (!apiUrl) return null
  const response = await fetch(apiUrl)
  if (!response.ok) return null
  const data = await response.json()
  const pages = data?.query?.pages || {}
  const page = Object.values(pages)[0]
  return page?.thumbnail?.source || null
}

const isWrestlerSummary = (data) => {
  if (!data || typeof data !== 'object') return false
  if (data.type === 'disambiguation') return false
  const text = `${data.description || ''} ${data.extract || ''}`.toLowerCase()
  return text.includes('wrestler') || text.includes('professional wrestling')
}

const fetchWikiSummary = async (wrestler) => {
  const candidates = buildWikiTitleCandidates(wrestler)
  for (const title of candidates) {
    const apiUrl = buildWikiSummaryApi(title)
    if (!apiUrl) continue
    const response = await fetch(apiUrl)
    if (!response.ok) continue
    const data = await response.json()
    if (!isWrestlerSummary(data)) continue

    const extract = data.extract || data.description || ''
    if (!extract) continue

    const description = data.description || ''
    const canonicalTitle =
      data.titles?.canonical || data.titles?.normalized || title
    const pageUrl =
      data.content_urls?.desktop?.page ||
      `https://en.wikipedia.org/wiki/${canonicalTitle}`
    const imageUrl =
      data.originalimage?.source || data.thumbnail?.source || null

    return {
      extract,
      description,
      title: canonicalTitle,
      pageUrl,
      imageUrl,
    }
  }

  return null
}

const buildRun = (wrestlers, count) => {
  const ids = wrestlers
    .filter((wrestler) => wrestler.id !== LOCKED_ID)
    .map((wrestler) => wrestler.id)

  const queue = shuffle(ids).slice(0, clampCount(count, wrestlers))

  const now = Date.now()
  return {
    queue,
    index: 0,
    better: [],
    worse: [],
    times: {},
    startedAt: now,
    updatedAt: now,
  }
}

const sanitizeRun = (raw, wrestlers) => {
  if (!raw || typeof raw !== 'object') {
    return buildRun(wrestlers)
  }

  const ids = new Set(wrestlers.map((wrestler) => wrestler.id))
  const queue = Array.isArray(raw.queue)
    ? raw.queue.filter((id) => ids.has(id) && id !== LOCKED_ID)
    : wrestlers
        .filter((wrestler) => wrestler.id !== LOCKED_ID)
        .map((wrestler) => wrestler.id)

  const index = typeof raw.index === 'number' ? Math.min(raw.index, queue.length) : 0
  const better = Array.isArray(raw.better)
    ? raw.better.filter((id) => ids.has(id))
    : []
  const worse = Array.isArray(raw.worse)
    ? raw.worse.filter((id) => ids.has(id))
    : []

  return {
    queue,
    index,
    better,
    worse,
    times: raw.times && typeof raw.times === 'object' ? raw.times : {},
    startedAt: typeof raw.startedAt === 'number' ? raw.startedAt : Date.now(),
    updatedAt: Date.now(),
  }
}

function useRun() {
  const [wrestlers, setWrestlers] = useState([])
  const [run, setRun] = useState(null)
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const timerStart = useRef(Date.now())
  const imageFetches = useRef(new Set())
  const summaryFetches = useRef(new Set())

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      try {
        const response = await fetch('/wrestlers.json')
        if (!response.ok) {
          throw new Error('Failed to load wrestler data')
        }
    const data = await response.json()
    if (!active) return

        const normalized = Array.isArray(data)
          ? data.map((wrestler) => normalizeWrestler(wrestler))
          : []

        setWrestlers(normalized)
        const storedSettings = window.localStorage.getItem(SETTINGS_KEY)
        const storedRun = window.localStorage.getItem(STORAGE_KEY)
        const resolvedSettings = storedSettings
          ? sanitizeSettings(JSON.parse(storedSettings), normalized)
          : null

        if (resolvedSettings) {
          const poolWrestlers = buildPool(normalized, resolvedSettings.pool)
          setSettings(resolvedSettings)
          if (storedRun) {
            const parsed = JSON.parse(storedRun)
            setRun(sanitizeRun(parsed, poolWrestlers))
          } else {
            setRun(buildRun(poolWrestlers, resolvedSettings.count))
          }
        } else {
          setSettings(null)
          setRun(null)
        }
      } catch (err) {
        if (!active) return
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!run) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(run))
  }, [run])

  useEffect(() => {
    if (!settings) return
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }, [settings])

  const wrestlerMap = useMemo(() => {
    return new Map(wrestlers.map((wrestler) => [wrestler.id, wrestler]))
  }, [wrestlers])

  const currentId = run?.queue[run.index] ?? null
  const current = currentId ? wrestlerMap.get(currentId) : null
  const locked = wrestlerMap.get(LOCKED_ID) || null
  const isComplete = run ? run.index >= run.queue.length : false
  const durationMs =
    run && typeof run.startedAt === 'number'
      ? Math.max((run.updatedAt || run.startedAt) - run.startedAt, 0)
      : 0

  useEffect(() => {
    timerStart.current = Date.now()
  }, [currentId])

  useEffect(() => {
    if (!current || current.imageUrl || imageFetches.current.has(current.id)) {
      return
    }

    imageFetches.current.add(current.id)

    fetchWikiImage(current)
      .then((imageUrl) => {
        if (!imageUrl) return
        setWrestlers((prev) =>
          prev.map((wrestler) =>
            wrestler.id === current.id ? { ...wrestler, imageUrl } : wrestler,
          ),
        )
      })
      .catch(() => {})
  }, [current])

  useEffect(() => {
    if (!current || current.wikiSummary || summaryFetches.current.has(current.id)) {
      return
    }

    summaryFetches.current.add(current.id)

    fetchWikiSummary(current)
      .then((summary) => {
        if (!summary) return
        setWrestlers((prev) =>
          prev.map((wrestler) =>
            wrestler.id === current.id
              ? {
                  ...wrestler,
                  wikiSummary: summary.extract,
                  wikiSummaryDescription: summary.description,
                  wiki: summary.pageUrl || wrestler.wiki,
                  wikipediaUrl: summary.pageUrl || wrestler.wikipediaUrl,
                  wikiTitle: summary.title || wrestler.wikiTitle,
                  imageUrl: wrestler.imageUrl || summary.imageUrl || null,
                }
              : wrestler,
          ),
        )
      })
      .catch(() => {})
  }, [current])

  const finalizeChoice = (bucket) => {
    if (!run || !currentId) return
    const elapsed = Date.now() - timerStart.current

    setRun((prev) => {
      if (!prev) return prev
      const alreadyPicked = new Set([...prev.better, ...prev.worse])
      if (alreadyPicked.has(currentId)) {
        return { ...prev, index: prev.index + 1, updatedAt: Date.now() }
      }

      return {
        ...prev,
        [bucket]: [...prev[bucket], currentId],
        index: prev.index + 1,
        times: {
          ...prev.times,
          [currentId]: (prev.times[currentId] || 0) + elapsed,
        },
        updatedAt: Date.now(),
      }
    })
  }

  const reset = () => {
    if (wrestlers.length === 0 || !settings) return
    const poolWrestlers = buildPool(wrestlers, settings.pool)
    setRun(buildRun(poolWrestlers, settings.count))
  }

  const startRun = (nextSettings) => {
    if (wrestlers.length === 0) return
    const resolved = sanitizeSettings(nextSettings, wrestlers)
    const poolWrestlers = buildPool(wrestlers, resolved.pool)
    setSettings(resolved)
    setRun(buildRun(poolWrestlers, resolved.count))
  }

  return {
    loading,
    error,
    settings,
    current,
    locked,
    better: run ? run.better.map((id) => wrestlerMap.get(id)).filter(Boolean) : [],
    worse: run ? run.worse.map((id) => wrestlerMap.get(id)).filter(Boolean) : [],
    remaining: run ? run.queue.length - run.index : 0,
    isComplete,
    handleBetter: () => finalizeChoice('better'),
    handleWorse: () => finalizeChoice('worse'),
    reset,
    startRun,
    totalWrestlers: wrestlers.length,
    hasRun: Boolean(run),
    runStats: {
      durationMs,
      totalDecisions: run ? run.better.length + run.worse.length : 0,
    },
  }
}

export default useRun
