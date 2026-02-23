export const defaultLiveTable = {
  better: [],
  worse: [],
  history: [],
  updatedAt: null,
}

const normalizeEntry = (value, fallbackBucket) => {
  if (!value || typeof value !== 'object') return null
  const name = typeof value.name === 'string' ? value.name.trim() : ''
  if (!name) return null
  return {
    id: typeof value.id === 'string' && value.id ? value.id : null,
    name,
    note: typeof value.note === 'string' ? value.note.trim() : '',
    addedAt:
      typeof value.addedAt === 'number' && !Number.isNaN(value.addedAt)
        ? value.addedAt
        : Date.now(),
    source:
      value.source === 'manual' || value.source === 'live'
        ? value.source
        : fallbackBucket === 'better' || fallbackBucket === 'worse'
          ? fallbackBucket
          : 'manual',
  }
}

export const sanitizeLiveTable = (raw) => {
  if (!raw || typeof raw !== 'object') {
    return { ...defaultLiveTable }
  }

  const better = Array.isArray(raw.better)
    ? raw.better
        .map((entry) => normalizeEntry(entry, 'better'))
        .filter(Boolean)
    : []

  const worse = Array.isArray(raw.worse)
    ? raw.worse
        .map((entry) => normalizeEntry(entry, 'worse'))
        .filter(Boolean)
    : []

  const history = Array.isArray(raw.history)
    ? raw.history
        .map((entry) => {
          if (!entry || typeof entry !== 'object') return null
          const timestamp =
            typeof entry.timestamp === 'number' && !Number.isNaN(entry.timestamp)
              ? entry.timestamp
              : Date.now()
          return {
            timestamp,
            summary: typeof entry.summary === 'string' ? entry.summary : '',
          }
        })
        .filter(Boolean)
    : []

  const updatedAt =
    typeof raw.updatedAt === 'number' && !Number.isNaN(raw.updatedAt)
      ? raw.updatedAt
      : null

  return {
    better,
    worse,
    history,
    updatedAt,
  }
}

const entryMatches = (a, b) => {
  if (!a || !b) return false
  if (a.id && b.id) return a.id === b.id
  return a.name.trim().toLowerCase() === b.name.trim().toLowerCase()
}

export const mergeLiveEntries = (original, additions) => {
  if (!Array.isArray(additions) || additions.length === 0) {
    return original.slice()
  }
  const merged = original.slice()
  additions.forEach((entry) => {
    if (!entry) return
    const existingIndex = merged.findIndex((item) => entryMatches(item, entry))
    if (existingIndex >= 0) {
      merged[existingIndex] = entry
    } else {
      merged.push(entry)
    }
  })
  return merged
}
