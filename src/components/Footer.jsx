import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import assIndexLogo from '../assets/placeholders/Ass-Index-Logo.svg'
import backgroundTexture from '../assets/placeholders/Background.svg'

const podcastLink = 'https://www.youtube.com/@WrestleTalk'

function Footer() {
  const [shareStatus, setShareStatus] = useState('')
  const currentYear = new Date().getFullYear()

  const handleShare = async () => {
    const url = window.location.href

    try {
      if (navigator.share) {
        await navigator.share({ title: 'The Ass Index', url })
        setShareStatus('Shared')
        return
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
        setShareStatus('Link copied')
        return
      }

      setShareStatus('Copy failed')
    } catch (error) {
      setShareStatus('Share cancelled')
    } finally {
      window.setTimeout(() => setShareStatus(''), 2000)
    }
  }

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-gradient-to-b from-black/90 via-zinc-950/95 to-black/95 text-white/80">
      <img
        src={backgroundTexture}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black/95" />
      <div className="relative border-b border-white/5 bg-black/70 px-6 py-3 text-center text-[0.6rem] uppercase tracking-[0.35em] text-white/50">
        Based on the WrestleTalk Podcast – Not affiliated with the podcast or WWE
      </div>
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="flex flex-col gap-6 text-center lg:text-left">
            <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-center">
              <img
                src={assIndexLogo}
                alt="The Ass Index"
                className="floating-badge h-24 w-24 rounded-full border border-white/10 bg-black/40 p-2 shadow-[0_10px_40px_rgba(0,0,0,0.45)]"
              />
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/40">
                  The Ass Index
                </p>
                <p className="text-base font-semibold text-white">
                  Ranking the cheeks so you do not have to.
                </p>
                <p className="text-sm text-white/60">
                  Updated weekly with the latest listener table, clips, and
                  community highlights.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <a
                href={podcastLink}
                target="_blank"
                rel="noreferrer"
                className="card-lift accent-pulse min-h-[48px] rounded-full border border-fuchsia-300/60 bg-fuchsia-400/90 px-6 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-950 transition hover:bg-fuchsia-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-200"
              >
                Listen to the Podcast
              </a>
              <button
                type="button"
                onClick={handleShare}
                className="card-lift glow-outline min-h-[48px] rounded-full border border-white/20 px-6 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white hover:border-lime-200 hover:text-lime-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-200"
              >
                Share the Table
              </button>
              {shareStatus ? (
                <span className="text-xs uppercase tracking-[0.3em] text-lime-300">
                  {shareStatus}
                </span>
              ) : null}
            </div>
          </div>
          <div className="grid gap-8 text-center text-xs uppercase tracking-[0.3em] text-white/60 sm:grid-cols-2 lg:text-left">
            <div className="space-y-3">
              <p className="text-[0.65rem] text-white/50">Navigation</p>
              <div className="flex flex-col gap-2 text-sm tracking-[0.25em]">
                <NavLink to="/" className="nav-ink text-white/70 hover:text-white">
                  Home
                </NavLink>
                <NavLink to="/play" className="nav-ink text-white/70 hover:text-white">
                  Play
                </NavLink>
                <NavLink
                  to="/official"
                  className="nav-ink text-white/70 hover:text-white"
                >
                  Official Table
                </NavLink>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-[0.65rem] text-white/50">Connect</p>
              <div className="flex flex-col gap-2 text-sm tracking-[0.25em]">
                <a
                  href={podcastLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/70 transition hover:text-white"
                >
                  YouTube Podcast
                </a>
                <a
                  href="https://twitter.com/WrestleTalk_TV"
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/70 transition hover:text-white"
                >
                  Twitter
                </a>
                <a
                  href="https://www.instagram.com/wrestletalkofficial/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-white/70 transition hover:text-white"
                >
                  Instagram
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 border-t border-white/5 pt-6 text-center text-[0.6rem] uppercase tracking-[0.35em] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {currentYear} The Ass Index</span>
          <span>Made by degenerates for degenerates</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
