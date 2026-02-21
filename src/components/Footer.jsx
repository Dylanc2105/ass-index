import assIndexLogo from '../assets/placeholders/Ass-Index-Logo.svg'

function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 text-xs uppercase tracking-[0.25em] text-white/60 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <img
            src={assIndexLogo}
            alt="The Ass Index"
            className="h-10 w-10 rounded-full border border-white/15 bg-black/40 object-contain p-1"
          />
          <span>About</span>
          <span>Rules</span>
          <span>FAQ</span>
          <span>Contact</span>
          <span>Privacy</span>
        </div>
        <div className="flex items-center gap-4 text-white/50">
          <span>(c) 2024 The Ass Index</span>
          <div className="flex items-center gap-2">
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/15 bg-white/5 p-2 text-white/70 transition hover:border-lime-300 hover:text-white"
              aria-label="Twitter"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="currentColor"
              >
                <path d="M18.9 2.3h3.2l-7 8 8.2 11.4h-6.4l-5-6.9-6 6.9H2.7l7.5-8.6L2.3 2.3h6.6l4.5 6.2 5.5-6.2z" />
              </svg>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/15 bg-white/5 p-2 text-white/70 transition hover:border-lime-300 hover:text-white"
              aria-label="Instagram"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="currentColor"
              >
                <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 3.5a5.5 5.5 0 1 1 0 11a5.5 5.5 0 0 1 0-11zm0 2a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7zm6.3-3.2a1.2 1.2 0 1 1 0 2.4a1.2 1.2 0 0 1 0-2.4z" />
              </svg>
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/15 bg-white/5 p-2 text-white/70 transition hover:border-lime-300 hover:text-white"
              aria-label="YouTube"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="currentColor"
              >
                <path d="M21.7 7.1a3 3 0 0 0-2.1-2.1C17.8 4.5 12 4.5 12 4.5s-5.8 0-7.6.5a3 3 0 0 0-2.1 2.1A31 31 0 0 0 2 12a31 31 0 0 0 .3 4.9a3 3 0 0 0 2.1 2.1c1.8.5 7.6.5 7.6.5s5.8 0 7.6-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 22 12a31 31 0 0 0-.3-4.9zM10 15.5v-7l6 3.5-6 3.5z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
