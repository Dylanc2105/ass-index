import assIndexLogo from '../assets/placeholders/Ass-Index-Logo.svg'

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/70">
      <div className="border-b border-white/5 bg-black/80 px-6 py-3 text-center text-[0.55rem] uppercase tracking-[0.3em] text-white/50">
        Based on the WrestleTalk Podcast - Not affiliated with the podcast or WWE
      </div>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 text-xs uppercase tracking-[0.25em] text-white/60 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <img
            src={assIndexLogo}
            alt="The Ass Index"
            className="h-10 w-10 rounded-full border border-white/15 bg-black/40 object-contain p-1"
          />
        </div>
        <a
          href="/podcast"
          className="text-white transition hover:text-lime-300"
        >
          Listen to the Podcast
        </a>
        <span className="text-white/50">No copyright intended.</span>
      </div>
    </footer>
  )
}

export default Footer
