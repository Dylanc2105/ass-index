import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import assIndexLogo from '../assets/placeholders/Ass-Index-Logo.svg'

const navLinkClass = ({ isActive }) =>
  [
    'nav-ink text-base font-semibold uppercase tracking-[0.3em] transition-colors',
    isActive ? 'nav-ink--active text-white' : 'text-zinc-300 hover:text-white',
  ].join(' ')

const ctaButtonClass = ({ isActive }) =>
  [
    'card-lift glow-outline min-h-[48px] rounded-full border border-white/20 px-4 py-2 text-base font-semibold uppercase tracking-[0.2em] text-white/80 hover:border-fuchsia-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-300',
    isActive ? 'border-fuchsia-300 text-white' : '',
  ].join(' ')

const ctaButtonMobileClass = ({ isActive }) =>
  [
    'card-lift glow-outline min-h-[48px] rounded-full border border-white/20 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/80 hover:border-fuchsia-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-300',
    isActive ? 'border-fuchsia-300 text-white' : '',
  ].join(' ')

function Navbar() {
  const [shareStatus, setShareStatus] = useState('')
  const [isMenuOpen, setIsMenuOpen] = useState(false)

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
    <header className="relative overflow-visible border-b border-white/10 bg-black/40 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 transition-[padding] duration-300 md:px-6 md:py-5">
        <div className="flex w-full items-center gap-6 pl-[58px] md:w-1/2 md:justify-end md:pl-[70px]">
          <div className="hidden items-center gap-6 md:flex">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>
            <NavLink to="/play" className={navLinkClass}>
              Play
            </NavLink>
            <NavLink to="/official" className={navLinkClass}>
              Official Table
            </NavLink>
          </div>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <NavLink to="/play" className={ctaButtonClass}>
            Play
          </NavLink>
          <NavLink to="/official" className={ctaButtonClass}>
            View Live Table
          </NavLink>
          <button
            type="button"
            onClick={handleShare}
            className="card-lift accent-pulse min-h-[48px] rounded-full bg-fuchsia-300/90 px-4 py-2 text-base font-semibold uppercase tracking-[0.2em] text-zinc-950 hover:bg-fuchsia-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-200"
          >
            Share
          </button>
          {shareStatus ? (
            <span className="text-base uppercase tracking-[0.2em] text-lime-300">
              {shareStatus}
            </span>
          ) : null}
        </div>
        <div className="flex items-center md:hidden">
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="card-lift glow-outline min-h-[48px] rounded-full border border-white/20 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-white hover:border-fuchsia-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-300"
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
      </div>
      <img
        src={assIndexLogo}
        alt="The Ass Index"
        className="floating-badge absolute left-4 top-[calc(50%+10px)] z-20 h-[140px] w-[140px] -translate-y-1/2 object-contain md:left-6 md:top-[calc(50%+15px)] md:h-[210px] md:w-[210px]"
      />
      <div
        className={`absolute left-0 right-0 top-full z-30 overflow-hidden border-b border-white/10 bg-black/95 shadow-[0_18px_40px_rgba(0,0,0,0.45)] transition-all duration-200 md:hidden ${
          isMenuOpen
            ? 'max-h-[420px] opacity-100'
            : 'pointer-events-none max-h-0 opacity-0'
        }`}
      >
        <nav className="flex flex-col gap-4 px-6 py-6">
          <NavLink
            to="/"
            className={navLinkClass}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </NavLink>
          <NavLink
            to="/play"
            className={navLinkClass}
            onClick={() => setIsMenuOpen(false)}
          >
            Play
          </NavLink>
          <NavLink
            to="/official"
            className={navLinkClass}
            onClick={() => setIsMenuOpen(false)}
          >
            Official Table
          </NavLink>
          <NavLink
            to="/play"
            className={ctaButtonMobileClass}
            onClick={() => setIsMenuOpen(false)}
          >
            Play
          </NavLink>
          <NavLink
            to="/official"
            className={ctaButtonMobileClass}
            onClick={() => setIsMenuOpen(false)}
          >
            View Live Table
          </NavLink>
          <button
            type="button"
            onClick={handleShare}
            className="min-h-[48px] rounded-full bg-fuchsia-300/90 px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-950 transition hover:bg-fuchsia-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-200"
          >
            Share
          </button>
          {shareStatus ? (
            <span className="text-sm uppercase tracking-[0.2em] text-lime-300">
              {shareStatus}
            </span>
          ) : null}
        </nav>
      </div>
    </header>
  )
}

export default Navbar
