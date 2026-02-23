import { useCallback, useEffect, useState } from 'react'
import {
  defaultLiveTable,
  sanitizeLiveTable,
} from '../utils/liveTable.js'
import {
  fetchLiveTableRemote,
  saveLiveTableRemote,
} from '../services/liveTableClient.js'

const STORAGE_KEY = 'ass-index-live-table-v1'

const hasWindow = () => typeof window !== 'undefined'

const readCachedTable = () => {
  if (!hasWindow()) return null
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored ? sanitizeLiveTable(JSON.parse(stored)) : null
  } catch {
    return null
  }
}

const writeCachedTable = (value) => {
  if (!hasWindow()) return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // no-op for storage quota failures
  }
}

function useLiveTable() {
  const [liveTable, setLiveTable] = useState(defaultLiveTable)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [syncStatus, setSyncStatus] = useState('idle')

  useEffect(() => {
    let active = true
    const load = async () => {
      setLoading(true)
      try {
        const remote = await fetchLiveTableRemote()
        if (!active) return
        setLiveTable(remote)
        writeCachedTable(remote)
        setError('')
      } catch (remoteError) {
        const cached = readCachedTable()
        if (cached) {
          if (active) {
            setLiveTable(cached)
            setError('Using cached live table while offline.')
          }
        } else {
          try {
            const response = await fetch('/liveSeed.json')
            if (!response.ok) {
              throw new Error('Unable to load live table seed')
            }
            const seed = sanitizeLiveTable(await response.json())
            if (active) {
              setLiveTable(seed)
              writeCachedTable(seed)
              setError(
                remoteError instanceof Error
                  ? remoteError.message
                  : 'Failed to reach live table API',
              )
            }
          } catch (seedError) {
            if (active) {
              setLiveTable(defaultLiveTable)
              setError(
                seedError instanceof Error
                  ? seedError.message
                  : 'Failed to load live data',
              )
            }
          }
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

  const persistRemote = useCallback(async (payload) => {
    try {
      setSyncStatus('saving')
      await saveLiveTableRemote(payload)
      setSyncStatus('saved')
    } catch (err) {
      setSyncStatus('error')
      setError(err instanceof Error ? err.message : 'Failed to sync live table')
    }
  }, [])

  const updateLiveTable = useCallback(
    (updater) => {
      setLiveTable((prev) => {
        const nextValue =
          typeof updater === 'function' ? updater(prev) : updater
        const sanitized = sanitizeLiveTable(nextValue)
        writeCachedTable(sanitized)
        persistRemote(sanitized)
        return sanitized
      })
    },
    [persistRemote],
  )

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
    syncStatus,
  }
}

export default useLiveTable
