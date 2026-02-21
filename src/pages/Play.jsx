import { useEffect, useMemo, useState } from 'react'
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
  } = useRun()

  const [showSetup, setShowSetup] = useState(true)
  const [poolChoice, setPoolChoice] = useState('top100')
  const [isTableOpen, setIsTableOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)

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

  const poolSize = useMemo(() => {
    return resolvePoolSize(settings?.pool || poolChoice, totalWrestlers || 0)
  }, [settings?.pool, poolChoice, totalWrestlers])

  const fullList = useMemo(() => {
    const list = [...better]
    if (locked) list.push(locked)
    list.push(...worse)
    return list
  }, [better, locked, worse])

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

  if (loading) {
    return (
      <section className="rounded-3xl border border-white/10 bg-black/40 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-white/60">
          Loading Wrestlers...
        </p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="rounded-3xl border border-red-400/40 bg-red-500/10 p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-red-200">{error}</p>
      </section>
    )
  }

  if (showSetup) {
    return (
      <section className="rounded-3xl border border-white/10 bg-black/50 p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-white/60">
          Choose your run
        </p>
        <h2 className="mt-3 text-3xl font-semibold text-white">
          Pick your Ass Index tier
        </h2>
        <div className="mt-6 flex flex-col items-center gap-4 xl:flex-row xl:justify-center">
          {poolOptions.map((option) => {
            const active = option.id === selectedOption?.id
            const ratingCount = Math.max(option.size - 1, 1)
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setPoolChoice(option.id)}
                className={`flex min-h-[120px] w-full max-w-[420px] flex-col items-center gap-1 rounded-2xl border px-3 py-3 text-center transition grayscale opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-300 xl:flex-1 ${
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
                    {option.size} wrestlers · {ratingCount} to rate
                  </p>
                </div>
              </button>
            )
          })}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-3">
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
            className="group flex min-h-[48px] w-full max-w-sm items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-200 sm:w-auto"
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
    return (
      <>
        <section className="rounded-3xl border border-white/10 bg-black/50 p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/60">
                Run complete
              </p>
              <h2 className="mt-3 text-3xl font-semibold text-white">
                Congrats, you finished the list.
              </h2>
              <p className="mt-3 text-lg text-white/70">
                You think Billy Gunn has{' '}
                <span className="text-lime-300">{better.length}</span> wrestlers
                better than him out of{' '}
                <span className="text-fuchsia-200">{poolSize}</span>.
              </p>
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
                  onClick={() => setIsShareOpen(true)}
                  className="min-h-[48px] rounded-full border border-lime-300/70 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-lime-200 transition hover:border-lime-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-200"
                >
                  Share
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-fuchsia-500/15 via-black/50 to-lime-300/10 p-5">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/60">
                <span>Your full list</span>
                <span>{fullList.length}</span>
              </div>
              <div className="mt-4 max-h-[360px] space-y-2 overflow-y-auto pr-2">
                {fullList.length === 0 ? (
                  <p className="text-sm text-white/50">No picks yet.</p>
                ) : (
                  fullList.map((wrestler, index) => (
                    <div
                      key={wrestler.id}
                      className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                    >
                      <span className="text-white/60">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="flex-1 px-3">{wrestler.name}</span>
                      {wrestler.id === locked?.id ? (
                        <span className="text-xs uppercase tracking-[0.2em] text-lime-200">
                          Billy Gunn
                        </span>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {isShareOpen ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4 py-10 backdrop-blur">
            <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-black/90 p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <img
                  src={assIndexLogo}
                  alt="Ass Index logo"
                  className="h-16 w-auto object-contain"
                />
                <button
                  type="button"
                  onClick={() => setIsShareOpen(false)}
                  className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-[0.3em] text-white/70 transition hover:border-white/50"
                >
                  Close
                </button>
              </div>

              <div className="mt-6 rounded-2xl border border-lime-300/30 bg-gradient-to-b from-lime-300/15 via-black/70 to-fuchsia-500/20 p-6 text-center">
                <p className="text-xs uppercase tracking-[0.35em] text-white/60">
                  The Ass Index
                </p>
                <p className="mt-3 text-5xl font-semibold text-lime-200">
                  {better.length}
                </p>
                <div className="mt-4 flex flex-col items-center gap-3">
                  <img
                    src={locked?.imageUrl || locked?.image}
                    alt={locked?.name || 'Billy Gunn'}
                    className="h-40 w-28 rounded-2xl border border-white/10 object-cover"
                  />
                  <p className="text-lg font-semibold text-white">Billy Gunn</p>
                </div>
                <p className="mt-4 text-3xl font-semibold text-fuchsia-200">
                  out of {poolSize}
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleShare('native')}
                  className="min-h-[44px] rounded-full bg-lime-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-950 transition hover:bg-lime-200"
                >
                  Share Now
                </button>
                <button
                  type="button"
                  onClick={() => handleShare('copy')}
                  className="min-h-[44px] rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/60"
                >
                  Copy Link
                </button>
                <button
                  type="button"
                  onClick={() => handleShare('x')}
                  className="min-h-[44px] rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/60"
                >
                  Share to X
                </button>
                <button
                  type="button"
                  onClick={() => handleShare('facebook')}
                  className="min-h-[44px] rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/60"
                >
                  Share to Facebook
                </button>
                <button
                  type="button"
                  onClick={() => handleShare('reddit')}
                  className="min-h-[44px] rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/60"
                >
                  Share to Reddit
                </button>
                <button
                  type="button"
                  onClick={() => setIsShareOpen(false)}
                  className="min-h-[44px] rounded-full border border-white/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-white/60"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </>
    )
  }

  return (
    <>
      <section className="flex flex-col gap-6 pb-24 md:grid md:grid-cols-[1.3fr_0.3fr_1fr] md:pb-0 lg:gap-6">
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
              <div className="grid gap-4 md:gap-6 md:grid-cols-[220px_1fr] md:items-start md:gap-x-[15px]">
                <div className="space-y-3">
                  <img
                    src={current.imageUrl || current.image}
                    alt={current.name}
                    className="h-[280px] w-full rounded-2xl border border-white/10 object-cover sm:h-[320px] md:h-[300px]"
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

                <div className="space-y-3 md:space-y-5">
                  <h2 className="text-3xl font-semibold text-white text-center md:text-left">
                    is {current.name}
                  </h2>
                  <img
                    src={betterOrWorseLogo}
                    alt="Better or worse than Billy Gunn"
                    className="mx-auto h-20 w-auto max-w-full object-contain sm:h-24 md:mx-0"
                  />
                  <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <button
                      type="button"
                      onClick={handleBetter}
                      className="group w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-200 sm:w-auto"
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
                      onClick={handleWorse}
                      className="group w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-200 sm:w-auto"
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

        <div className="hidden items-center justify-center lg:flex">
          <span className="text-4xl text-white/30">-&gt;</span>
        </div>

        <div className="hidden rounded-3xl border border-white/10 bg-black/50 p-6 md:block">
          <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-white/60">
            <span>Your Tables</span>
            <span>{better.length + worse.length}</span>
          </div>

          <div className="mt-4 space-y-4">
            <div className="rounded-2xl border border-lime-300/30 bg-lime-300/10 p-4">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-lime-200">
                <span>Better Table</span>
                <span>{better.length}</span>
              </div>
              <div className="mt-3 max-h-[120px] space-y-2 overflow-y-auto pr-1">
                {better.length === 0 ? (
                  <p className="text-sm text-white/70">No picks yet.</p>
                ) : (
                  better.map((wrestler) => (
                    <div
                      key={wrestler.id}
                      className="rounded-xl border border-lime-300/20 bg-black/30 px-3 py-2 text-sm text-white"
                    >
                      {wrestler.name}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-center text-sm font-semibold uppercase tracking-[0.3em] text-white/80">
              {locked ? 'Billy Gunn - Locked' : 'Billy Gunn - Locked'}
            </div>

            <div className="rounded-2xl border border-fuchsia-300/30 bg-fuchsia-300/10 p-4">
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-fuchsia-200">
                <span>Worse Table</span>
                <span>{worse.length}</span>
              </div>
              <div className="mt-3 max-h-[120px] space-y-2 overflow-y-auto pr-1">
                {worse.length === 0 ? (
                  <p className="text-sm text-white/70">No picks yet.</p>
                ) : (
                  worse.map((wrestler) => (
                    <div
                      key={wrestler.id}
                      className="rounded-xl border border-fuchsia-300/20 bg-black/30 px-3 py-2 text-sm text-white"
                    >
                      {wrestler.name}
                    </div>
                  ))
                )}
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
          ★ View Your Table
        </button>
      </div>

      <div className="md:hidden">
        <MobileTableSheet
          isOpen={isTableOpen}
          onClose={() => setIsTableOpen(false)}
          better={better}
          worse={worse}
          locked={locked}
        />
      </div>
    </>
  )
}

export default Play
