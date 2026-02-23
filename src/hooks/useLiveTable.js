import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'ass-index-live-table-v1'

const defaultLiveTable = {
  better: [],
  worse: [],
  history: [],
  updatedAt: null,
}

const toEntry = (value, fallbackBucket) => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const normalizedName =
    typeof value.name === 'string' ? value.name.trim() : ''
  if (!normalizedName) return null

  return {
    id: typeof value.id === 'string' && value.id ? value.id : null,
    name: normalizedName,
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
    return defaultLiveTable
  }

  const better = Array.isArray(raw.better)
    ? raw.better
        .map((entry) => toEntry(entry, 'better'))
        .filter(Boolean)
    : []

  const worse = Array.isArray(raw.worse)
    ? raw.worse
        .map((entry) => toEntry(entry, 'worse'))
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

const isSameEntry = (a, b) => {
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
    const existingIndex = merged.findIndex((item) => isSameEntry(item, entry))
    if (existingIndex >= 0) {
      merged[existingIndex] = entry
    } else {
      merged.push(entry)
    }
  })
  return merged
}

const hasWindow = () => typeof window !== 'undefined'

function useLiveTable() {
  const [liveTable, setLiveTable] = useState(defaultLiveTable)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      try {
        if (hasWindow()) {
          const stored = window.localStorage.getItem(STORAGE_KEY)
          if (stored) {
            const parsed = JSON.parse(stored)
            if (active) {
              setLiveTable(sanitizeLiveTable(parsed))
              setLoading(false)
              return
            }
          }
        }

        const response = await fetch('/liveSeed.json')
        if (!response.ok) {
          throw new Error('Unable to load live table seed')
        }
        const seed = await response.json()
        if (active) {
          setLiveTable(sanitizeLiveTable(seed))
        }
      } catch (err) {
        if (active) {
          setLiveTable(defaultLiveTable)
          setError(err instanceof Error ? err.message : 'Failed to load live data')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

  const updateLiveTable = useCallback((updater) => {
    setLiveTable((prev) => {
      const nextValue =
        typeof updater === 'function' ? updater(prev) : sanitizeLiveTable(updater)
      const sanitized = sanitizeLiveTable(nextValue)
      if (hasWindow()) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized))
      }
      return sanitized
    })
  }, [])

  const resetLiveTable = useCallback(() => {
    if (hasWindow()) {
      window.localStorage.removeItem(STORAGE_KEY)
    }
    setLiveTable(defaultLiveTable)
  }, [])

  return {
    liveTable,
    loading,
    error,
    updateLiveTable,
    resetLiveTable,
  }
}

export default useLiveTable
