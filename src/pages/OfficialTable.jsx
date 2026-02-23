import assIndexLogo from '../assets/placeholders/Ass-Index-Logo.svg'
import betterOrWorseLogo from '../assets/placeholders/Better-Or-Worse-Logo.svg'
import useLiveTable from '../hooks/useLiveTable.js'

const renderEntry = (entry, index, bucket) => (
  <div
    key={`${bucket}-${entry.id || entry.name}-${index}`}
    className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3"
  >
    <p className="text-base font-semibold text-white">{entry.name}</p>
    {entry.note ? <p className="mt-1 text-sm text-white/60">{entry.note}</p> : null}
    <p
      className={`mt-3 text-[0.6rem] uppercase tracking-[0.4em] ${
        bucket === 'better' ? 'text-lime-200/70' : 'text-fuchsia-200/70'
      }`}
    >
      {bucket === 'better' ? 'Better pick' : 'Worse pick'}
    </p>
  </div>
)

function OfficialTable() {
  const { liveTable, loading, error } = useLiveTable()

  const betterList = liveTable.better
  const worseList = liveTable.worse

  return (
    <section className="rounded-3xl border border-white/10 bg-black/40 p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-lime-200/80">
            WrestleTalk Live Segment
          </p>
          <h1 className="mt-2 text-3xl font-semibold leading-tight text-white">
            Official WrestleTalk Podcast Table
          </h1>
          <p className="mt-4 max-w-2xl text-base text-white/70">
            Every Better or Worse call from the WrestleTalk Podcast lands here. No extra ranking,
            no fluff—just the canon ledger of who the crew ruled better or worse than Billy Gunn
            on-air.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white/80">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Status</p>
          {loading ? (
            <p className="mt-2 font-semibold">Syncing live table…</p>
          ) : error ? (
            <p className="mt-2 font-semibold text-fuchsia-200">{error}</p>
          ) : (
            <>
              <p className="mt-2 font-semibold">Live feed primed for the next taping.</p>
              <p className="text-xs uppercase tracking-[0.3em] text-white/40">
                Updated{' '}
                {liveTable.updatedAt
                  ? new Date(liveTable.updatedAt).toLocaleString()
                  : 'Awaiting first update'}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_auto_1fr]">
        <div className="rounded-3xl border border-lime-300/20 bg-lime-300/5 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-lime-200/80">
            Better Than Billy ({betterList.length})
          </p>
          <div className="mt-4 max-h-[520px] space-y-3 overflow-y-auto pr-2">
            {betterList.length === 0 ? (
              <p className="text-sm text-white/60">No better calls logged yet.</p>
            ) : (
              betterList.map((entry, index) => renderEntry(entry, index, 'better'))
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-6 px-6 text-center">
          <img src={betterOrWorseLogo} alt="Better or Worse" className="h-20 w-auto" />
          <img src={assIndexLogo} alt="Ass Index logo" className="h-16 w-auto" />
          <div className="rounded-full border border-white/20 px-5 py-2 text-xs uppercase tracking-[0.5em] text-white/60">
            WrestleTalk Feed
          </div>
          <p className="text-sm text-white/60">
            Two independent scrolls keep Better on the left and Worse on the right, mirroring how
            the team builds the live segment in studio.
          </p>
        </div>

        <div className="rounded-3xl border border-fuchsia-300/20 bg-fuchsia-300/5 p-6">
          <p className="text-xs uppercase tracking-[0.4em] text-fuchsia-200/80">
            Worse Than Billy ({worseList.length})
          </p>
          <div className="mt-4 max-h-[520px] space-y-3 overflow-y-auto pr-2">
            {worseList.length === 0 ? (
              <p className="text-sm text-white/60">No worse calls logged yet.</p>
            ) : (
              worseList.map((entry, index) => renderEntry(entry, index, 'worse'))
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default OfficialTable
