import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import assIndexLogo from '../assets/placeholders/Ass-Index-Logo.svg'

function Footer() {
  const [shareStatus, setShareStatus] = useState('')

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
    <footer className="border-t border-white/10 bg-black/70">
      <div className="border-b border-white/5 bg-black/80 px-6 py-3 text-center text-[0.55rem] uppercase tracking-[0.3em] text-white/50">
        Based on the WrestleTalk Podcast - Not affiliated with the podcast or WWE
      </div>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10 text-xs uppercase tracking-[0.25em] text-white/60">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-center">
          <NavLink to="/" className="nav-ink text-white/70 hover:text-white">
            Home
          </NavLink>
          <NavLink
            to="/play"
            className="nav-ink text-white/70 hover:text-white"
          >
            Play
          </NavLink>
          <NavLink
            to="/official"
            className="nav-ink text-white/70 hover:text-white"
          >
            Official Table
          </NavLink>
        </div>
        <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:gap-8 md:text-left">
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <img
              src={assIndexLogo}
              alt="The Ass Index"
              className="floating-badge h-20 w-20 rounded-full border border-white/15 bg-black/40 object-contain p-1"
            />
          </div>
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <a
              href="https://www.youtube.com/@WrestleTalk"
              target="_blank"
              rel="noreferrer"
              className="card-lift glow-outline min-h-[48px] rounded-full border border-fuchsia-300/60 bg-fuchsia-500/80 px-6 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-black hover:bg-fuchsia-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-200"
            >
              Podcast
            </a>
            <button
              type="button"
              onClick={handleShare}
              className="card-lift accent-pulse min-h-[48px] rounded-full border border-lime-300/50 bg-lime-300/90 px-6 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-black hover:bg-lime-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-200"
            >
              Share
            </button>
            {shareStatus ? (
              <span className="text-xs uppercase tracking-[0.25em] text-lime-300">
                {shareStatus}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
