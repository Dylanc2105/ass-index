const wrestleTalkRatings = []

const placeholderRows = Array.from({ length: 6 }, (_, idx) => ({
  id: `placeholder-${idx}`,
  better: 'Awaiting WrestleTalk pick',
  worse: 'Awaiting WrestleTalk pick',
  note: 'Segment recording in progress',
}))

function OfficialTable() {
  const rows = wrestleTalkRatings.length > 0 ? wrestleTalkRatings : placeholderRows

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
            This page mirrors the live “Better or Worse than Billy Gunn?” segment from the WrestleTalk
            Podcast. Every time the crew locks in a verdict on-air, their call drops into the table
            below so the community can track the official show ratings. We’ll plug in the exact names
            the moment they hand them over.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white/80">
          <p className="text-xs uppercase tracking-[0.3em] text-white/60">Status</p>
          <p className="mt-2 font-semibold">
            Live feed primed — waiting on the next WrestleTalk taping.
          </p>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
        <div className="border-b border-white/10 bg-black/30 px-6 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/60">
            Better / Worse Ledger
          </p>
          <p className="mt-1 text-sm text-white/70">
            No rankings. Just the official “better” and “worse” calls as they happen.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-left text-sm text-white/80">
            <thead className="bg-black/40 text-xs uppercase tracking-[0.25em] text-white/60">
              <tr>
                <th className="px-6 py-4 font-semibold">Better Than Billy</th>
                <th className="px-6 py-4 font-semibold">Worse Than Billy</th>
                <th className="px-6 py-4 font-semibold">Segment Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {rows.map((entry, idx) => (
                <tr key={entry.id || `slot-${idx}`}>
                  <td className="px-6 py-4 font-semibold text-white">
                    {entry.better || (
                      <span className="text-white/50">WrestleTalk pick incoming</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold text-white">
                    {entry.worse || (
                      <span className="text-white/50">WrestleTalk pick incoming</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-white/70">
                    {entry.note || 'Recorded live during the next taping.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default OfficialTable
