import assIndexLogo from '../assets/placeholders/Ass-Index-Logo.svg'

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/70">
      <div className="border-b border-white/5 bg-black/80 px-6 py-3 text-center text-[0.55rem] uppercase tracking-[0.3em] text-white/50">
        Based on the WrestleTalk Podcast - Not affiliated with the podcast or WWE
      </div>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 text-xs uppercase tracking-[0.25em] text-white/60 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
          <img
            src={assIndexLogo}
            alt="The Ass Index"
            className="h-20 w-20 rounded-full border border-white/15 bg-black/40 object-contain p-1"
          />
          <a
            href="https://www.youtube.com/@WrestleTalk"
            target="_blank"
            rel="noreferrer"
            className="min-h-[48px] rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/80 transition hover:border-fuchsia-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-300"
          >
            Listen to the Podcast
          </a>
        </div>
        <span className="text-center text-white/50 md:text-left">
          No copyright intended.
        </span>
      </div>
    </footer>
  )
}

export default Footer
