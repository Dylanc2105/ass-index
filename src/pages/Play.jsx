import { useEffect, useMemo, useRef, useState } from 'react'
import useRun from '../hooks/useRun.js'
import MobileTableSheet from '../components/MobileTableSheet.jsx'
import top100Logo from '../assets/placeholders/top-100.svg'
import top250Logo from '../assets/placeholders/top-250.svg'
import top300Logo from '../assets/placeholders/top-300.svg'
import fullAssLogo from '../assets/placeholders/full-ass.svg'
import playButtonImage from '../assets/placeholders/Play.svg'
import assIndexLogo from '../assets/placeholders/Ass-Index-Logo.svg'
import betterOrWorseLogo from '../assets/placeholders/Better-Or-Worse-Logo.svg'
import betterButtonImage from '../assets/placeholders/BetterButton.svg'
import worseButtonImage from '../assets/placeholders/worseButton.svg'

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

const formatDuration = (ms) => {
  if (!ms || Number.isNaN(ms)) return '0s'
  const totalSeconds = Math.max(Math.floor(ms / 1000), 0)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  const parts = []
  if (minutes > 0) {
    parts.push(`${minutes}m`)
  }
  parts.push(`${seconds}s`)
  return parts.join(' ')
}

function Play() {
  const {
    loading,
    error,
    settings,
    current,
    locked,
    better,
    worse,
    remaining,
    isComplete,
    handleBetter,
    handleWorse,
    reset,
    startRun,
    totalWrestlers,
    hasRun,
    runStats,
  } = useRun()

  const [showSetup, setShowSetup] = useState(true)
  const [poolChoice, setPoolChoice] = useState('top100')
  const [isTableOpen, setIsTableOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)
  const [shareVariant, setShareVariant] = useState(0)
  const [decisionBurst, setDecisionBurst] = useState('')
  const burstTimeoutRef = useRef()

  const poolOptions = useMemo(() => {
    const total = totalWrestlers || 0
    return [
      {
        id: 'top100',
        label: 'SOFT LAUNCH',
        size: Math.min(100, total),
        logo: top100Logo,
        blurb:
          "For little girls who don't wanna hurt Billy's feelings. Keep it safe, keep it cute, keep it kind. A light jog through the top tier without stepping on any ego or tearing up the locker room group chat.",
      },
      {
        id: 'top250',
        label: 'FULL ROSTER',
        size: Math.min(250, total),
        logo: top250Logo,
        blurb:
          'Respectful grind. You still care about Billy. Solid workrate, steady pace, and a list that feels complete without becoming your full-time job. You want the drama, not the marathon.',
      },
      {
        id: 'top300',
        label: 'MAIN EVENT MARATHON',
        size: Math.min(300, total),
        logo: top300Logo,
        blurb:
          'No mercy. Billy can handle it. This is the long haul with heavy hitters, deep cuts, and heated takes. You are here to sweat, argue, and crown the true cheeks of the era.',
      },
      {
        id: 'full',
        label: 'FULL ASS INDEX',
        size: total,
        logo: fullAssLogo,
        blurb:
          'Absolute chaos. Full roster, full judgment. Every wrestler, every era, every hot take. If you pick this, you are choosing violence, and you are ready to defend it.',
      },
    ].filter((option) => option.size > 0)
  }, [totalWrestlers])

  const selectedOption =
    poolOptions.find((option) => option.id === poolChoice) || poolOptions[0]

  const modeDetails = useMemo(() => {
    if (!selectedOption) return null
    return {
      id: selectedOption.id,
      label: selectedOption.label,
      logo: selectedOption.logo || assIndexLogo,
    }
  }, [selectedOption])

  const poolSize = useMemo(() => {
    return resolvePoolSize(settings?.pool || poolChoice, totalWrestlers || 0)
  }, [settings?.pool, poolChoice, totalWrestlers])

  const wikiExcerpt = useMemo(() => {
    if (!current) return ''
    const summary =
      (typeof current.wikiSummary === 'string' && current.wikiSummary.trim()) ||
      (typeof current.wikiSummaryDescription === 'string' &&
        current.wikiSummaryDescription.trim()) ||
      ''

    if (!summary) return ''
    return summary.length > 520 ? `${summary.slice(0, 517).trim()}...` : summary
  }, [current])

  const betterSample = useMemo(() => better.slice(0, 10), [better])
  const worseSample = useMemo(() => worse.slice(0, 10), [worse])
  const betterSampleNames = useMemo(
    () =>
      betterSample
        .map((wrestler) => (typeof wrestler?.name === 'string' ? wrestler.name : ''))
        .filter(Boolean),
    [betterSample],
  )
  const worseSampleNames = useMemo(
    () =>
      worseSample
        .map((wrestler) => (typeof wrestler?.name === 'string' ? wrestler.name : ''))
        .filter(Boolean),
    [worseSample],
  )

  const shareVariants = [
    {
      id: 'logoLists',
      label: 'Hero Lists',
      blurb: 'Logo header with 10 picks per side.',
    },
    {
      id: 'impactDial',
      label: 'Impact Dial',
      blurb: 'Big dial energy with stat chips.',
    },
    {
      id: 'posterized',
      label: 'Posterized',
      blurb: 'Vertical poster with gradient bands.',
    },
    {
      id: 'taleOfTape',
      label: 'Tale of Tape',
      blurb: 'Side-by-side tale of the tape.',
    },
    {
      id: 'minimalWave',
      label: 'Minimal Wave',
      blurb: 'Clean text-first share tile.',
    },
  ]

  const ModeBadge = ({ className = '', textClassName = '' }) => {
    if (!modeDetails) return null
    return (
      <div
        className={`inline-flex items-center gap-3 rounded-2xl border px-3 py-2 text-[0.6rem] uppercase tracking-[0.35em] ${className}`}
      >
        <img
          src={modeDetails.logo}
          alt={`${modeDetails.label} mode logo`}
          className="h-6 w-auto"
        />
        <span className={`font-semibold ${textClassName}`}>{modeDetails.label}</span>
      </div>
    )
  }

  useEffect(() => {
    if (settings?.pool) {
      setPoolChoice(settings.pool)
    }
  }, [settings?.pool])

  useEffect(() => {
    if (!isTableOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [isTableOpen])

  useEffect(() => {
    return () => {
      if (burstTimeoutRef.current) {
        clearTimeout(burstTimeoutRef.current)
      }
    }
  }, [])

  const triggerDecisionBurst = (type) => {
    if (burstTimeoutRef.current) {
      clearTimeout(burstTimeoutRef.current)
    }
    setDecisionBurst(type)
    burstTimeoutRef.current = window.setTimeout(() => {
      setDecisionBurst('')
    }, 520)
  }

  const handleBetterChoice = () => {
    triggerDecisionBurst('better')
    handleBetter()
  }

  const handleWorseChoice = () => {
    triggerDecisionBurst('worse')
    handleWorse()
  }

  const handleShare = async (platform) => {
    const url = window.location.origin
    const text = `I ranked ${better.length} wrestlers better than Billy Gunn on The Ass Index.`

    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({ title: 'The Ass Index', text, url })
      } catch {
        // user cancelled
      }
      return
    }

    if (platform === 'copy' && navigator.clipboard) {
      await navigator.clipboard.writeText(url)
      return
    }

    const encodedText = encodeURIComponent(text)
    const encodedUrl = encodeURIComponent(url)

    const links = {
      x: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      reddit: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedText}`,
    }

    const shareUrl = links[platform]
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer')
    }
  }

  const renderShareCard = (variantId) => {
    switch (variantId) {
      case 'impactDial':
        return (
          <div className="card-lift rounded-[32px] border border-white/10 bg-gradient-to-br from-black via-fuchsia-900/40 to-lime-900/40 p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.4em] text-white/60">
              <span>The Ass Index</span>
              <span>{new Date().getFullYear()}</span>
            </div>
            <div className="mt-4 flex justify-center">
              <ModeBadge className="border-white/20 bg-white/5 text-white/80" />
            </div>
            <div className="mt-6 flex flex-col items-center gap-4">
              <img src={assIndexLogo} alt="Ass Index logo" className="h-14 w-auto" />
              <div className="relative flex h-40 w-40 items-center justify-center rounded-full border-4 border-lime-300/70 bg-black/70 text-center">
                <span className="text-5xl font-black text-lime-200">
                  {better.length}
                </span>
                <span className="absolute inset-x-4 top-3 text-[0.55rem] uppercase tracking-[0.4em] text-white/60">
                  Better
                </span>
                <span className="absolute inset-x-4 bottom-3 text-[0.55rem] uppercase tracking-[0.4em] text-white/40">
                  Than Billy
                </span>
              </div>
              <p className="text-lg font-semibold text-fuchsia-100">
                Out of {poolSize} wrestlers
              </p>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs uppercase tracking-[0.3em]">
              <div className="rounded-2xl border border-lime-300/40 bg-lime-300/10 px-3 py-2">
                <p className="text-lime-200/80">Better</p>
                <p className="text-2xl font-bold text-lime-200">{better.length}</p>
              </div>
              <div className="rounded-2xl border border-fuchsia-300/40 bg-fuchsia-300/10 px-3 py-2">
                <p className="text-fuchsia-200/80">Worse</p>
                <p className="text-2xl font-bold text-fuchsia-200">{worse.length}</p>
              </div>
              <div className="rounded-2xl border border-white/20 bg-white/5 px-3 py-2">
                <p className="text-white/70">Pool</p>
                <p className="text-2xl font-bold text-white">{poolSize}</p>
              </div>
            </div>
          </div>
        )
      case 'posterized':
        return (
          <div className="card-lift rounded-[32px] border border-white/10 bg-gradient-to-b from-fuchsia-700/30 via-zinc-950 to-lime-600/20 p-6 text-white shadow-[0_12px_40px_rgba(0,0,0,0.55)]">
            <div className="flex flex-col gap-2 text-center">
              <p className="text-xs uppercase tracking-[0.5em] text-white/60">
                Better or Worse
              </p>
              <h3 className="text-4xl font-black">BILLY GUNN CHECK</h3>
            </div>
            <div className="mt-4 flex justify-center">
              <ModeBadge className="border-white/20 bg-white/5 text-white/80" />
            </div>
            <p className="mt-6 text-center text-lg text-white/80">
              You placed <span className="text-lime-200">{better.length}</span> names
              above Billy Gunn across a {poolSize}-deep pool.
            </p>
            <div className="mt-6 space-y-3 text-sm">
              <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                  Better Highlights
                </p>
                <p className="mt-2 font-medium text-white/90">
                  {betterSampleNames.length
                    ? betterSampleNames.join(' • ')
                    : 'Keep ranking to build this list.'}
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                  Worse Highlights
                </p>
                <p className="mt-2 font-medium text-white/90">
                  {worseSampleNames.length
                    ? worseSampleNames.join(' • ')
                    : 'Keep ranking to build this list.'}
                </p>
              </div>
            </div>
            <div className="mt-6 text-center text-xs uppercase tracking-[0.5em] text-white/50">
              #AssIndex
            </div>
          </div>
        )
      case 'taleOfTape':
        return (
          <div className="card-lift rounded-[32px] border border-white/10 bg-black/85 p-6 text-white shadow-[0_25px_45px_rgba(0,0,0,0.65)]">
            <div className="flex items-center justify-between">
              <img src={assIndexLogo} alt="Ass Index logo" className="h-12 w-auto" />
              <img
                src={betterOrWorseLogo}
                alt="Better or Worse"
                className="h-12 w-auto"
              />
            </div>
            <div className="mt-4 flex justify-center">
              <ModeBadge className="border-white/20 bg-white/5 text-white/80" />
            </div>
            <p className="mt-6 text-center text-xs uppercase tracking-[0.4em] text-white/60">
              Tale of the Tape
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-lime-300/30 bg-gradient-to-b from-lime-300/15 to-black/60 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-lime-200/70">
                  Better ({better.length})
                </p>
                <ul className="mt-3 space-y-2 text-sm text-white/85">
                  {betterSample.length ? (
                    betterSample.map((wrestler) => (
                      <li
                        key={`better-tape-${wrestler.id}`}
                        className="rounded-xl border border-lime-200/20 bg-lime-200/5 px-3 py-2"
                      >
                        {wrestler.name}
                      </li>
                    ))
                  ) : (
                    <li className="text-white/40">No entrants yet.</li>
                  )}
                </ul>
              </div>
              <div className="rounded-2xl border border-fuchsia-300/30 bg-gradient-to-b from-fuchsia-300/15 to-black/60 p-4">
                <p className="text-xs uppercase tracking-[0.35em] text-fuchsia-200/70">
                  Worse ({worse.length})
                </p>
                <ul className="mt-3 space-y-2 text-sm text-white/85">
                  {worseSample.length ? (
                    worseSample.map((wrestler) => (
                      <li
                        key={`worse-tape-${wrestler.id}`}
                        className="rounded-xl border border-fuchsia-200/20 bg-fuchsia-200/5 px-3 py-2"
                      >
                        {wrestler.name}
                      </li>
                    ))
                  ) : (
                    <li className="text-white/40">No entrants yet.</li>
                  )}
                </ul>
              </div>
            </div>
            <p className="mt-6 text-center text-base text-white/70">
              Locked on Billy Gunn. Finish the fight at TheAssIndex.com
            </p>
          </div>
        )
      case 'minimalWave':
        return (
          <div className="card-lift rounded-[32px] border border-white/10 bg-gradient-to-r from-zinc-950 via-black to-zinc-900 p-6 text-white">
            <div className="flex flex-col gap-2 text-left">
              <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                The Ass Index
              </p>
              <h3 className="text-4xl font-semibold">My Billy Gunn Spread</h3>
            </div>
            <div className="mt-4">
              <ModeBadge className="border-white/15 bg-white/5 text-white/80" />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-4">
                <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                  Better
                </p>
                <p className="text-4xl font-bold text-lime-200">{better.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-4">
                <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                  Worse
                </p>
                <p className="text-4xl font-bold text-fuchsia-200">{worse.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-4">
                <p className="text-xs uppercase tracking-[0.4em] text-white/50">
                  Pool
                </p>
                <p className="text-4xl font-bold text-white">{poolSize}</p>
              </div>
            </div>
            <p className="mt-6 text-sm text-white/70">
              Better picks:{' '}
              {betterSampleNames.length ? betterSampleNames.join(', ') : 'n/a'}
            </p>
            <p className="mt-2 text-sm text-white/70">
              Worse picks:{' '}
              {worseSampleNames.length ? worseSampleNames.join(', ') : 'n/a'}
            </p>
            <p className="mt-4 text-xs uppercase tracking-[0.4em] text-white/40">
              Screenshot this tile &amp; tag @billyassindex
            </p>
          </div>
        )
      case 'logoLists':
      default:
        return (
          <div className="card-lift rounded-[32px] border border-white/10 bg-gradient-to-b from-black/80 via-zinc-950 to-black/90 p-6 text-white shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
            <div className="flex flex-col items-center gap-3 text-center">
              <ModeBadge className="border-white/20 bg-white/5 text-white/80" />
              <img src={assIndexLogo} alt="Ass Index logo" className="h-14 w-auto" />
              <p className="text-xs uppercase tracking-[0.5em] text-white/60">
                Official Share Card
              </p>
              <p className="text-4xl font-bold text-lime-200">
                {better.length} better than Billy Gunn
              </p>
              <p className="text-sm uppercase tracking-[0.4em] text-white/50">
                {poolSize} considered
              </p>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-2xl border border-lime-300/30 bg-lime-300/5 p-4">
                <p className="text-xs uppercase tracking-[0.4em] text-lime-200/80">
                  Better Picks
                </p>
                <ul className="mt-3 space-y-2 text-white/90">
                  {betterSample.length ? (
                    betterSample.map((wrestler) => (
                      <li
                        key={`better-hero-${wrestler.id}`}
                        className="rounded-xl border border-lime-200/20 bg-black/30 px-3 py-2"
                      >
                        {wrestler.name}
                      </li>
                    ))
                  ) : (
                    <li className="text-white/40">Lock in your picks.</li>
                  )}
                </ul>
              </div>
              <div className="rounded-2xl border border-fuchsia-300/30 bg-fuchsia-300/5 p-4">
                <p className="text-xs uppercase tracking-[0.4em] text-fuchsia-200/80">
                  Worse Picks
                </p>
                <ul className="mt-3 space-y-2 text-white/90">
                  {worseSample.length ? (
                    worseSample.map((wrestler) => (
                      <li
                        key={`worse-hero-${wrestler.id}`}
                        className="rounded-xl border border-fuchsia-200/20 bg-black/30 px-3 py-2"
                      >
                        {wrestler.name}
                      </li>
                    ))
                  ) : (
                    <li className="text-white/40">Lock in your picks.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )
    }
  }

  const renderSharePanelBody = () => (
    <>
      <div className="card-lift rounded-2xl border border-white/10 bg-white/5 p-4">
        <p className="text-xs uppercase tracking-[0.35em] text-white/60">
          Share a vibe
        </p>
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {shareVariants.map((variant, index) => {
            const active = index === shareVariant
            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => setShareVariant(index)}
                className={`card-lift glow-outline min-w-[140px] rounded-2xl border px-3 py-2 text-left transition ${
                  active
                    ? 'border-lime-300 bg-lime-300/10 text-white'
                    : 'border-white/10 bg-black/40 text-white/70 hover:border-white/30'
                }`}
              >
                <p className="text-sm font-semibold">{variant.label}</p>
                <p className="text-xs text-white/60">{variant.blurb}</p>
              </button>
            )
          })}
        </div>
      </div>

      <div className="mt-6 space-y-5">
        {renderShareCard(shareVariants[shareVariant]?.id)}

        <div className="card-lift rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-white/60">
            Share Snapshot
          </p>
          <div className="mt-4 flex flex-col items-center gap-3">
            <img src={assIndexLogo} alt="Ass Index logo" className="h-12 w-auto" />
            <p className="text-4xl font-semibold text-lime-200">
              {better.length} better
            </p>
            <p className="text-base uppercase tracking-[0.3em] text-white/50">
              Out of {poolSize}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleShare('native')}
            className="card-lift glow-outline min-h-[44px] rounded-full bg-lime-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-950 hover:bg-lime-200"
          >
            Share Now
          </button>
          <button
            type="button"
            onClick={() => handleShare('copy')}
            className="card-lift glow-outline min-h-[44px] rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:border-white/60"
          >
            Copy Link
          </button>
          <button
            type="button"
            onClick={() => handleShare('x')}
            className="card-lift glow-outline min-h-[44px] rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:border-white/60"
          >
            Share to X
          </button>
          <button
            type="button"
            onClick={() => handleShare('facebook')}
            className="card-lift glow-outline min-h-[44px] rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:border-white/60"
          >
            Share to Facebook
          </button>
          <button
            type="button"
            onClick={() => handleShare('reddit')}
            className="card-lift glow-outline min-h-[44px] rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:border-white/60"
          >
            Share to Reddit
          </button>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(window.location.origin)}
            className="card-lift glow-outline min-h-[44px] rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:border-white/60"
          >
            Save For Later
          </button>
        </div>
      </div>
    </>
  )

  if (loading) {
    return (
      <section className="fade-in-up rounded-3xl border border-white/10 bg-black/40 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">
          Loading Wrestlers...
        </p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="fade-in-up rounded-3xl border border-red-400/40 bg-red-500/10 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-red-200">{error}</p>
      </section>
    )
  }

  if (showSetup) {
    return (
      <section className="fade-in-up rounded-3xl border border-white/10 bg-black/50 p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">
          Choose your run
        </p>
        <div className="mt-6 flex flex-col items-center gap-4 xl:flex-row xl:justify-center">
          {poolOptions.map((option) => {
            const active = option.id === selectedOption?.id
            const ratingCount = Math.max(option.size - 1, 1)
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setPoolChoice(option.id)}
                className={`card-lift flex min-h-[120px] w-full max-w-[420px] flex-col items-center gap-1 rounded-2xl border px-3 py-3 text-center transition grayscale opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300 xl:flex-1 ${
                  active
                    ? 'border-lime-300 bg-lime-300/10 grayscale-0 opacity-100'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <img
                  src={option.logo}
                  alt={`${option.label} logo`}
                  className="h-[220px] w-full max-w-[240px] object-contain sm:h-[280px] sm:max-w-[300px]"
                />
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {option.label}
                  </h3>
                  <p className="text-sm text-white/60">{option.blurb}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.3em] text-white/50">
                    {option.size} wrestlers Â· {ratingCount} to rate
                  </p>
                </div>
              </button>
            )
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              const ratingCount = Math.max(
                selectedOption ? selectedOption.size - 1 : 1,
                1,
              )
              startRun({ pool: poolChoice, count: ratingCount })
              setShowSetup(false)
            }}
            className="group card-lift glow-outline mx-auto flex min-h-[48px] w-full max-w-sm items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-200 sm:w-auto"
          >
            <span className="sr-only">Play Now</span>
            <img
              src={playButtonImage}
              alt="Play now"
              className="h-28 w-full object-contain drop-shadow-[0_0_18px_rgba(157,255,57,0.6)] transition group-hover:brightness-110 sm:h-36 sm:w-auto"
            />
          </button>
        </div>
      </section>
    )
  }

  if (isComplete) {
    const betterPreview = better.slice(0, 5)
    const worsePreview = worse.slice(0, 5)
    const runDurationLabel = formatDuration(runStats?.durationMs || 0)

    return (
      <>
        <section className="fade-in-up flex flex-col gap-6 lg:grid lg:grid-cols-[1.2fr_0.8fr]">
        <div className="card-lift rounded-3xl border border-white/10 bg-black/50 p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">
            Run complete
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-white">
            Congrats, you finished the list.
          </h2>
          <p className="mt-3 text-lg text-white/70">
            You ranked{' '}
            <span className="text-lime-300">{better.length}</span> wrestlers
            above Billy Gunn and{' '}
            <span className="text-fuchsia-200">{worse.length}</span> below him
            across a {poolSize}-person run.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-white/15 bg-white/5 p-4 text-center">
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/60">
                Run Time
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {runDurationLabel}
              </p>
            </div>
            <div className="rounded-2xl border border-lime-300/30 bg-lime-300/5 p-4 text-center">
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-lime-200/70">
                Better
              </p>
              <p className="mt-2 text-2xl font-semibold text-lime-200">
                {better.length}
              </p>
            </div>
            <div className="rounded-2xl border border-fuchsia-300/30 bg-fuchsia-300/5 p-4 text-center">
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-fuchsia-200/70">
                Worse
              </p>
              <p className="mt-2 text-2xl font-semibold text-fuchsia-200">
                {worse.length}
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/5 p-4 text-center">
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/60">
                Pool
              </p>
              <p className="mt-2 text-2xl font-semibold text-white">
                {poolSize}
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-lime-300/30 bg-lime-300/5 p-4">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-lime-200/70">
                <span>Better Table</span>
                <span>{better.length}</span>
              </div>
              <div className="mt-3 space-y-2">
                {betterPreview.length === 0 ? (
                  <p className="text-sm text-white/70">No picks yet.</p>
                ) : (
                  betterPreview.map((wrestler) => (
                    <div
                      key={wrestler.id}
                      className="rounded-xl border border-lime-300/20 bg-black/40 px-3 py-2 text-sm text-white"
                    >
                      {wrestler.name}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-fuchsia-300/30 bg-fuchsia-300/5 p-4">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-fuchsia-200/70">
                <span>Worse Table</span>
                <span>{worse.length}</span>
              </div>
              <div className="mt-3 space-y-2">
                {worsePreview.length === 0 ? (
                  <p className="text-sm text-white/70">No picks yet.</p>
                ) : (
                  worsePreview.map((wrestler) => (
                    <div
                      key={wrestler.id}
                      className="rounded-xl border border-fuchsia-300/20 bg-black/40 px-3 py-2 text-sm text-white"
                    >
                      {wrestler.name}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={reset}
              className="min-h-[48px] rounded-full bg-lime-300 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-950 transition hover:bg-lime-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-200"
            >
              Play Again
            </button>
            <button
              type="button"
              onClick={() => setShowSetup(true)}
              className="min-h-[48px] rounded-full border border-white/30 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:border-fuchsia-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-300"
            >
              Change Run Settings
            </button>
            <button
              type="button"
              onClick={() => setIsTableOpen(true)}
              className="min-h-[48px] rounded-full border border-lime-200/50 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-lime-200 transition hover:border-lime-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-200"
            >
              View Full Tables
            </button>
            <button
              type="button"
              onClick={() => setIsShareOpen(true)}
              className="min-h-[48px] rounded-full border border-fuchsia-200/60 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-fuchsia-200 transition hover:border-fuchsia-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-200 md:hidden"
            >
              Share Run
            </button>
          </div>
        </div>

        <div className="hidden card-lift rounded-3xl border border-white/10 bg-black/60 p-6 shadow-2xl max-h-[680px] overflow-y-auto md:block">
          {renderSharePanelBody()}
        </div>
      </section>
      {isShareOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 px-3 py-6 md:hidden">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/95 p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <p className="text-sm uppercase tracking-[0.35em] text-white/60">
                Share your run
              </p>
              <button
                type="button"
                onClick={() => setIsShareOpen(false)}
                className="rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/70 transition hover:border-white/60"
              >
                Close
              </button>
            </div>
            <div className="mt-4">{renderSharePanelBody()}</div>
          </div>
        </div>
      ) : null}
      </>
    )
  }

  return (
    <>
      <section className="flex flex-col gap-6 pb-24 lg:grid lg:grid-cols-[1.35fr_0.85fr] lg:items-start lg:gap-8">
        <div className="relative">
          {decisionBurst ? (
            <span
              key={`${decisionBurst}-${current?.id || 'idle'}`}
              className={`decision-burst rounded-3xl ${
                decisionBurst === 'better'
                  ? 'decision-burst--better'
                  : 'decision-burst--worse'
              }`}
            />
          ) : null}
          <div className="rounded-3xl border border-white/10 bg-black/50 p-4 md:p-8">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/60">
            <span>Current Wrestler</span>
            <span>{remaining} remaining</span>
          </div>

          {!current ? (
            <div className="mt-6">
              <h2 className="text-2xl font-semibold text-white">Run complete</h2>
              <p className="mt-2 text-white/70">
                You have placed every wrestler in your table. Reset to play
                again.
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-6 min-h-[48px] rounded-full bg-lime-300 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-950 transition hover:bg-lime-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-200"
              >
                Start New Run
              </button>
              <button
                type="button"
                onClick={() => setShowSetup(true)}
                className="mt-3 min-h-[48px] rounded-full border border-white/30 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:border-fuchsia-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-300"
              >
                Change Run Settings
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-3 md:mt-6 md:space-y-5">
              <div className="grid gap-4 md:grid-cols-[240px_1fr] md:items-start md:gap-6 2xl:grid-cols-[280px_1fr]">
                <div className="space-y-3">
                  <img
                    src={current.imageUrl || current.image}
                    alt={current.name}
                    className="h-[280px] w-full rounded-2xl border border-white/10 object-cover sm:h-[320px] md:h-[300px] lg:h-auto lg:flex-1"
                  />
                  <div className="flex flex-wrap items-center justify-center gap-3 text-center md:justify-start md:text-left">
                    <p className="text-sm text-white/70">{current.era}</p>
                    <a
                      href={current.wiki}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-[36px] items-center text-xs uppercase tracking-[0.25em] text-lime-300 transition hover:text-lime-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-200"
                    >
                      Wikipedia
                    </a>
                  </div>
                </div>

                <div className="space-y-4 md:space-y-5 lg:flex lg:flex-col">
                  <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
                    <h2 className="text-3xl font-semibold text-white">is {current.name}</h2>
                    <img
                      src={betterOrWorseLogo}
                      alt="Better or worse than Billy Gunn"
                      className="h-16 w-auto max-w-full object-contain sm:h-20"
                    />
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/60 p-4 shadow-inner">
                    {wikiExcerpt ? (
                      <>
                        <p className="text-sm leading-relaxed text-white/70 line-clamp-4">
                          {wikiExcerpt}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <span className="text-xs uppercase tracking-[0.3em] text-white/40">
                            Source: Wikipedia summary
                          </span>
                          <a
                            href={current.wiki}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border border-lime-300/50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-lime-200 transition hover:border-lime-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-200"
                          >
                            Read more on Wikipedia
                            <span aria-hidden="true">-&gt;</span>
                          </a>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-white/40">
                        Pulling details from Wikipedia...
                      </p>
                    )}
                  </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button
                    type="button"
                    onClick={handleBetterChoice}
                    className="decision-button decision-button--better group w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-200 sm:w-auto"
                    aria-label="Better"
                  >
                      <img
                        src={betterButtonImage}
                        alt="Better"
                        className="h-14 w-full object-contain transition group-hover:brightness-110 sm:h-16 sm:w-auto"
                      />
                    </button>
                  <button
                    type="button"
                    onClick={handleWorseChoice}
                    className="decision-button decision-button--worse group w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-200 sm:w-auto"
                    aria-label="Worse"
                  >
                      <img
                        src={worseButtonImage}
                        alt="Worse"
                        className="h-14 w-full object-contain transition group-hover:brightness-110 sm:h-16 sm:w-auto"
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 via-black/70 to-black/90 p-6 shadow-2xl">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl border border-lime-300/30 bg-lime-300/5 px-3 py-2 text-center">
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-lime-200/70">
                  Better
                </p>
                <p className="text-2xl font-semibold text-lime-200">
                  {better.length}
                </p>
              </div>
              <div className="rounded-2xl border border-fuchsia-300/30 bg-fuchsia-300/5 px-3 py-2 text-center">
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-fuchsia-200/70">
                  Worse
                </p>
                <p className="text-2xl font-semibold text-fuchsia-200">
                  {worse.length}
                </p>
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/5 px-3 py-2 text-center">
                <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/60">
                  Remaining
                </p>
                <p className="text-2xl font-semibold text-white">
                  {remaining}
                </p>
              </div>
            </div>
          </div>

          <div className="hidden rounded-3xl border border-white/10 bg-black/50 p-6 md:block">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/60">
              <span>Your Tables</span>
              <span>{better.length + worse.length}</span>
            </div>

            <div className="mt-4 flex flex-1 flex-col gap-4 overflow-hidden">
              <div className="rounded-2xl border border-lime-300/30 bg-gradient-to-br from-lime-300/10 to-black/60 p-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-lime-200">
                  <span>Better Table</span>
                  <span>{better.length}</span>
                </div>
                <div className="mt-3 max-h-[260px] space-y-2 overflow-y-auto pr-1 xl:max-h-[320px]">
                  {better.length === 0 ? (
                    <p className="text-sm text-white/70">No picks yet.</p>
                  ) : (
                    better.map((wrestler) => (
                      <div
                        key={wrestler.id}
                        className="rounded-xl border border-lime-300/20 bg-black/40 px-3 py-2 text-sm text-white"
                      >
                        {wrestler.name}
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-center text-sm font-semibold uppercase tracking-[0.3em] text-white/80">
                Billy Gunn - Locked
              </div>

              <div className="rounded-2xl border border-fuchsia-300/30 bg-gradient-to-br from-fuchsia-300/10 to-black/60 p-4">
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-fuchsia-200">
                  <span>Worse Table</span>
                  <span>{worse.length}</span>
                </div>
                <div className="mt-3 max-h-[260px] space-y-2 overflow-y-auto pr-1 xl:max-h-[320px]">
                  {worse.length === 0 ? (
                    <p className="text-sm text-white/70">No picks yet.</p>
                  ) : (
                    worse.map((wrestler) => (
                      <div
                        key={wrestler.id}
                        className="rounded-xl border border-fuchsia-300/20 bg-black/40 px-3 py-2 text-sm text-white"
                      >
                        {wrestler.name}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-black/80 px-4 py-3 backdrop-blur md:hidden">
        <button
          type="button"
          onClick={() => setIsTableOpen(true)}
          className="min-h-[48px] w-full rounded-full bg-fuchsia-300 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-950 transition hover:bg-fuchsia-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-200"
        >
          â˜… View Your Table
        </button>
      </div>

      <MobileTableSheet
        isOpen={isTableOpen}
        onClose={() => setIsTableOpen(false)}
        better={better}
        worse={worse}
        locked={locked}
      />
    </>
  )
}

export default Play


