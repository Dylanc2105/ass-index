import { useEffect, useMemo, useState } from 'react'
import assIndexLogo from '../assets/placeholders/Ass-Index-Logo.svg'
import betterOrWorseLogo from '../assets/placeholders/Better-Or-Worse-Logo.svg'
import useLiveTable from '../hooks/useLiveTable.js'
import { mergeLiveEntries, sanitizeLiveTable } from '../utils/liveTable.js'

const shuffle = (items) => {
  const clone = [...items]
  for (let i = clone.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[clone[i], clone[j]] = [clone[j], clone[i]]
  }
  return clone
}

const formatTimestamp = (value) => {
  if (!value) return 'No updates yet'
  const date = new Date(value)
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const isSameEntry = (sessionEntries, item) => {
  if (!Array.isArray(sessionEntries)) return false
  return sessionEntries.some((entry) => {
    if (entry.id && item.id) return entry.id === item.id
    return entry.name.trim().toLowerCase() === item.name.trim().toLowerCase()
  })
}

function DatabaseEditor() {
  const { liveTable, loading, error, updateLiveTable, syncStatus } = useLiveTable()
  const [stage, setStage] = useState('wizard')
  const [sessionMode, setSessionMode] = useState('')
  const [sessionEntries, setSessionEntries] = useState({
    better: [],
    worse: [],
  })
  const [manualName, setManualName] = useState('')
  const [manualNote, setManualNote] = useState('')
  const [liveCount, setLiveCount] = useState(10)
  const [wrestlers, setWrestlers] = useState([])
  const [wrestlerStatus, setWrestlerStatus] = useState({
    loading: false,
    error: '',
  })
  const [gameQueue, setGameQueue] = useState([])
  const [gameIndex, setGameIndex] = useState(0)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      setWrestlerStatus({ loading: true, error: '' })
      try {
        const response = await fetch('/wrestlers.json')
        if (!response.ok) {
          throw new Error('Unable to load roster data')
        }
        const data = await response.json()
        if (!active) return
        const normalized = Array.isArray(data)
          ? data
              .filter((wrestler) => wrestler && typeof wrestler.name === 'string')
              .map((wrestler) => ({
                id: wrestler.id || wrestler.slug || wrestler.name,
                name: wrestler.name,
                imageUrl: wrestler.imageUrl || null,
                wikiSummary: wrestler.wikiSummary || '',
              }))
          : []
        setWrestlers(normalized)
      } catch (err) {
        if (active) {
          setWrestlerStatus({
            loading: false,
            error: err instanceof Error ? err.message : 'Roster request failed',
          })
        }
        return
      }
      if (active) {
        setWrestlerStatus({ loading: false, error: '' })
      }
    }

    load()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!message) return
    const timeout = setTimeout(() => setMessage(''), 4000)
    return () => clearTimeout(timeout)
  }, [message])

  const resetSession = () => {
    setSessionEntries({ better: [], worse: [] })
    setManualName('')
    setManualNote('')
    setGameQueue([])
    setGameIndex(0)
    setSessionMode('')
  }

  const combinedBetter = useMemo(
    () => mergeLiveEntries(liveTable.better, sessionEntries.better),
    [liveTable.better, sessionEntries.better],
  )
  const combinedWorse = useMemo(
    () => mergeLiveEntries(liveTable.worse, sessionEntries.worse),
    [liveTable.worse, sessionEntries.worse],
  )

  const handleManualEntry = (bucket) => {
    if (!manualName.trim()) return
    const entry = {
      id: null,
      name: manualName.trim(),
      note: manualNote.trim(),
      source: 'manual',
      addedAt: Date.now(),
    }
    setSessionEntries((prev) => ({
      ...prev,
      [bucket]: [...prev[bucket], entry],
    }))
    setManualName('')
    setManualNote('')
  }

  const handleRemoveSessionEntry = (bucket, index) => {
    setSessionEntries((prev) => ({
      ...prev,
      [bucket]: prev[bucket].filter((_, idx) => idx !== index),
    }))
  }

  const startLiveSession = () => {
    if (wrestlerStatus.loading) return
    const desired = Math.max(1, Math.min(100, Number(liveCount) || 1))
    const ratedIds = new Set(
      [...liveTable.better, ...liveTable.worse].map((entry) => entry.id).filter(Boolean),
    )
    const ratedNames = new Set(
      [...liveTable.better, ...liveTable.worse].map((entry) =>
        entry.name.trim().toLowerCase(),
      ),
    )
    const available = wrestlers.filter((wrestler) => {
      if (!wrestler || !wrestler.name) return false
      if (wrestler.id && ratedIds.has(wrestler.id)) return false
      if (ratedNames.has(wrestler.name.trim().toLowerCase())) return false
      return true
    })

    if (available.length === 0) {
      setMessage('All wrestlers are already on the live table.')
      return
    }

    const count = Math.min(desired, available.length)
    const queue = shuffle(available).slice(0, count)
    setGameQueue(queue)
    setGameIndex(0)
    setStage('liveGame')
  }

  const handleDecision = (bucket) => {
    const current = gameQueue[gameIndex]
    if (!current) return

    const entry = {
      id: current.id,
      name: current.name,
      note: current.wikiSummary ? current.wikiSummary.slice(0, 160) : '',
      source: 'live',
      addedAt: Date.now(),
    }

    setSessionEntries((prev) => ({
      ...prev,
      [bucket]: [...prev[bucket], entry],
    }))

    if (gameIndex + 1 >= gameQueue.length) {
      setStage('preview')
    } else {
      setGameIndex((prev) => prev + 1)
    }
  }

  const totalNewEntries = sessionEntries.better.length + sessionEntries.worse.length
  const readyForPreview = totalNewEntries > 0

  const handleApply = () => {
    const modeSummary =
      sessionMode === 'live' ? 'live session' : 'manual entry'
    updateLiveTable((prev) => {
      const next = sanitizeLiveTable(prev)
      const better = mergeLiveEntries(next.better, sessionEntries.better)
      const worse = mergeLiveEntries(next.worse, sessionEntries.worse)
      return {
        ...next,
        better,
        worse,
        updatedAt: Date.now(),
        history: [
          {
            timestamp: Date.now(),
            summary: `Added ${totalNewEntries} picks via ${modeSummary}.`,
          },
          ...next.history,
        ].slice(0, 20),
      }
    })
    setMessage('Live table updated.')
    resetSession()
    setStage('wizard')
  }

  const handleDiscard = () => {
    resetSession()
    setStage('wizard')
  }

  const renderWizard = () => (
    <div className="rounded-3xl border border-white/10 bg-black/60 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.6em] text-lime-200/70">Admin</p>
          <h1 className="mt-2 text-4xl font-semibold">Live Table Command Center</h1>
          <p className="mt-4 text-base text-white/70">
            Choose how you want to feed the WrestleTalk table. Manual entry lets you drop in
            names you already know, while Play Live deals you fresh random wrestlers that
            haven’t been rated yet.
          </p>
          <p className="mt-4 text-sm text-white/50">
            Last update: {formatTimestamp(liveTable.updatedAt)}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setStage('manual')
              setSessionMode('manual')
            }}
            className="rounded-2xl border border-white/15 bg-white/5 px-6 py-5 text-left transition hover:border-lime-300/50"
          >
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Manual Entry</p>
            <p className="mt-2 text-2xl font-bold text-white">Direct Input</p>
            <p className="mt-2 text-sm text-white/70">
              Type any wrestler name and tag it better or worse.
            </p>
          </button>
          <button
            type="button"
            onClick={() => {
              setStage('liveSetup')
              setSessionMode('live')
            }}
            className="rounded-2xl border border-white/15 bg-white/5 px-6 py-5 text-left transition hover:border-fuchsia-300/50"
          >
            <p className="text-xs uppercase tracking-[0.4em] text-white/60">Play Live</p>
            <p className="mt-2 text-2xl font-bold text-white">Random Run</p>
            <p className="mt-2 text-sm text-white/70">
              Pick how many fresh names to rate in Better or Worse mode.
            </p>
          </button>
        </div>
      </div>
    </div>
  )

  const renderManual = () => (
    <div className="rounded-3xl border border-white/10 bg-black/60 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => {
            resetSession()
            setStage('wizard')
          }}
          className="text-left text-sm font-semibold uppercase tracking-[0.35em] text-white/50"
        >
          ← Back to options
        </button>
        <div>
          <p className="text-xs uppercase tracking-[0.45em] text-white/60">
            Manual Entry
          </p>
          <h2 className="mt-2 text-3xl font-semibold text-white">
            Drop names straight into the live table
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-white/80">
            Wrestler name
            <input
              type="text"
              value={manualName}
              onChange={(event) => setManualName(event.target.value)}
              placeholder="Type the wrestler you want to add"
              className="rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-base text-white outline-none placeholder:text-white/40 focus:border-lime-300/70"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-white/80">
            Optional note
            <input
              type="text"
              value={manualNote}
              onChange={(event) => setManualNote(event.target.value)}
              placeholder="Segment note or context"
              className="rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-base text-white outline-none placeholder:text-white/40 focus:border-fuchsia-300/70"
            />
          </label>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled={!manualName.trim()}
            onClick={() => handleManualEntry('better')}
            className="rounded-2xl border border-lime-300/50 bg-lime-300/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-lime-100 transition hover:bg-lime-300/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add as Better
          </button>
          <button
            type="button"
            disabled={!manualName.trim()}
            onClick={() => handleManualEntry('worse')}
            className="rounded-2xl border border-fuchsia-300/50 bg-fuchsia-300/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-fuchsia-100 transition hover:bg-fuchsia-300/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Add as Worse
          </button>
          <button
            type="button"
            onClick={() => setStage('preview')}
            disabled={!readyForPreview}
            className="rounded-2xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-white transition hover:border-white/50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Review Updates
          </button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {['better', 'worse'].map((bucket) => (
            <div
              key={bucket}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                {bucket === 'better' ? 'Better picks' : 'Worse picks'}
              </p>
              {sessionEntries[bucket].length === 0 ? (
                <p className="mt-3 text-sm text-white/60">No names yet.</p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm text-white">
                  {sessionEntries[bucket].map((entry, index) => (
                    <li
                      key={`${bucket}-${entry.name}-${entry.addedAt}-${index}`}
                      className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/40 px-3 py-2"
                    >
                      <div>
                        <p className="font-semibold">{entry.name}</p>
                        {entry.note ? (
                          <p className="text-xs text-white/60">{entry.note}</p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSessionEntry(bucket, index)}
                        className="text-xs uppercase tracking-[0.3em] text-white/50 hover:text-white"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderLiveSetup = () => (
    <div className="rounded-3xl border border-white/10 bg-black/60 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => {
            resetSession()
            setStage('wizard')
          }}
          className="text-left text-sm font-semibold uppercase tracking-[0.35em] text-white/50"
        >
          ← Back to options
        </button>
        <div>
          <p className="text-xs uppercase tracking-[0.45em] text-white/60">Play Live</p>
          <h2 className="mt-2 text-3xl font-semibold text-white">
            Run Better or Worse for the live table
          </h2>
        </div>
        <label className="flex flex-col gap-2 text-sm text-white/80 md:max-w-sm">
          How many wrestlers do you want to rate?
          <input
            type="number"
            min="1"
            max="100"
            value={liveCount}
            onChange={(event) => setLiveCount(event.target.value)}
            className="rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-base text-white outline-none placeholder:text-white/40 focus:border-lime-300/70"
          />
        </label>
        <button
          type="button"
          onClick={startLiveSession}
          disabled={wrestlerStatus.loading}
          className="mt-4 inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-white transition hover:border-white/60 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {wrestlerStatus.loading ? 'Loading roster…' : 'Start Live Session'}
        </button>
        {wrestlerStatus.error ? (
          <p className="text-sm text-fuchsia-300/90">{wrestlerStatus.error}</p>
        ) : null}
      </div>
    </div>
  )

  const renderLiveGame = () => {
    const current = gameQueue[gameIndex]
    const remaining = gameQueue.length - gameIndex
    return (
      <div className="rounded-3xl border border-white/10 bg-black/60 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => {
              resetSession()
              setStage('wizard')
            }}
            className="text-left text-sm font-semibold uppercase tracking-[0.35em] text-white/50"
          >
            ← Cancel session
          </button>
          <div className="flex flex-col items-center gap-4 text-center">
            <img src={betterOrWorseLogo} alt="Better or Worse" className="h-16 w-auto" />
            <p className="text-xs uppercase tracking-[0.5em] text-white/60">
              Wrestler {gameIndex + 1} of {gameQueue.length}
            </p>
            <h2 className="text-4xl font-black text-white">{current?.name}</h2>
            <p className="max-w-2xl text-sm text-white/70">
              {current?.wikiSummary
                ? current.wikiSummary.slice(0, 200)
                : 'No wiki summary yet. Trust your gut.'}
            </p>
          </div>
          <div className="flex flex-col gap-3 text-center sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => handleDecision('better')}
              className="rounded-2xl border border-lime-300/60 bg-lime-300/10 px-8 py-4 text-sm font-semibold uppercase tracking-[0.4em] text-lime-100 transition hover:bg-lime-300/20"
            >
              Better
            </button>
            <button
              type="button"
              onClick={() => handleDecision('worse')}
              className="rounded-2xl border border-fuchsia-300/60 bg-fuchsia-300/10 px-8 py-4 text-sm font-semibold uppercase tracking-[0.4em] text-fuchsia-100 transition hover:bg-fuchsia-300/20"
            >
              Worse
            </button>
          </div>
          <p className="text-center text-xs uppercase tracking-[0.4em] text-white/50">
            {remaining - 1 > 0
              ? `${remaining - 1} wrestlers left after this`
              : 'Preview will unlock after this call'}
          </p>
        </div>
      </div>
    )
  }

  const renderPreview = () => (
    <div className="rounded-3xl border border-white/10 bg-black/60 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => setStage('wizard')}
          className="text-left text-sm font-semibold uppercase tracking-[0.35em] text-white/50"
        >
          ← Start over
        </button>
        <div className="flex flex-col items-center gap-2 text-center">
          <img src={assIndexLogo} alt="Ass Index" className="h-16 w-auto" />
          <p className="text-xs uppercase tracking-[0.5em] text-white/60">Preview</p>
          <h2 className="text-3xl font-semibold text-white">
            Review the better & worse lists before updating
          </h2>
          <p className="text-sm text-white/60">
            {totalNewEntries} new picks in this session
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr]">
          <div className="rounded-2xl border border-lime-300/20 bg-lime-300/5 p-4">
            <p className="text-xs uppercase tracking-[0.4em] text-lime-200/80">
              Better Than Billy ({combinedBetter.length})
            </p>
            <div className="mt-3 max-h-[420px] space-y-2 overflow-y-auto pr-2">
              {combinedBetter.length === 0 ? (
                <p className="text-sm text-white/60">No better picks yet.</p>
              ) : (
                combinedBetter.map((entry) => (
                  <div
                    key={`preview-better-${entry.id || entry.name}`}
                    className="rounded-xl border border-lime-200/20 bg-black/40 px-3 py-2"
                  >
                    <p className="font-semibold text-white">{entry.name}</p>
                    {entry.note ? (
                      <p className="text-xs text-white/60">{entry.note}</p>
                    ) : null}
                    {isSameEntry(sessionEntries.better, entry) ? (
                      <p className="text-[0.6rem] uppercase tracking-[0.4em] text-lime-200/70">
                        New
                      </p>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-4 px-4">
            <img src={betterOrWorseLogo} alt="Better or Worse logo" className="h-16 w-auto" />
            <div className="rounded-full border border-white/20 px-4 py-1 text-xs uppercase tracking-[0.5em] text-white/60">
              Live Table
            </div>
          </div>
          <div className="rounded-2xl border border-fuchsia-300/20 bg-fuchsia-300/5 p-4">
            <p className="text-xs uppercase tracking-[0.4em] text-fuchsia-200/80">
              Worse Than Billy ({combinedWorse.length})
            </p>
            <div className="mt-3 max-h-[420px] space-y-2 overflow-y-auto pr-2">
              {combinedWorse.length === 0 ? (
                <p className="text-sm text-white/60">No worse picks yet.</p>
              ) : (
                combinedWorse.map((entry) => (
                  <div
                    key={`preview-worse-${entry.id || entry.name}`}
                    className="rounded-xl border border-fuchsia-200/20 bg-black/40 px-3 py-2"
                  >
                    <p className="font-semibold text-white">{entry.name}</p>
                    {entry.note ? (
                      <p className="text-xs text-white/60">{entry.note}</p>
                    ) : null}
                    {isSameEntry(sessionEntries.worse, entry) ? (
                      <p className="text-[0.6rem] uppercase tracking-[0.4em] text-fuchsia-200/70">
                        New
                      </p>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={handleApply}
            disabled={!readyForPreview}
            className="rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-white transition hover:border-lime-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Update Live Table
          </button>
          <button
            type="button"
            onClick={handleDiscard}
            className="rounded-2xl border border-white/10 bg-black/40 px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-white/70 transition hover:border-white/50"
          >
            Discard Session
          </button>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    if (loading) {
      return (
        <div className="rounded-3xl border border-white/10 bg-black/60 p-8 text-center text-white/70">
          Loading live data…
        </div>
      )
    }
    if (error) {
      return (
        <div className="rounded-3xl border border-white/10 bg-black/60 p-8 text-center text-fuchsia-200">
          {error}
        </div>
      )
    }

    if (stage === 'manual') return renderManual()
    if (stage === 'liveSetup') return renderLiveSetup()
    if (stage === 'liveGame') return renderLiveGame()
    if (stage === 'preview') return renderPreview()
    return renderWizard()
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {message ? (
          <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white/80">
            {message}
          </div>
        ) : null}
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.4em] text-white/60">
          Sync:{' '}
          {syncStatus === 'saving'
            ? 'Saving…'
            : syncStatus === 'error'
              ? 'Error – changes cached'
              : 'Up to date'}
        </div>
      </div>
      {renderContent()}
    </section>
  )
}

export default DatabaseEditor
