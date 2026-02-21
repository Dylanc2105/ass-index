function MobileTableSheet({ isOpen, onClose, better, worse, locked }) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/70 transition-opacity duration-200 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`fixed inset-x-0 bottom-0 z-50 transform transition-transform duration-200 ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!isOpen}
      >
        <div className="h-[80vh] w-full rounded-t-3xl border border-white/10 bg-zinc-950/95 px-6 pb-6 pt-5 shadow-[0_-20px_60px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">
              Your Table
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="min-h-[48px] rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:border-fuchsia-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fuchsia-300"
            >
              Close
            </button>
          </div>
          <div className="mt-4 h-[calc(80vh-96px)] space-y-4 overflow-y-auto pr-2">
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
      </div>
    </>
  )
}

export default MobileTableSheet
