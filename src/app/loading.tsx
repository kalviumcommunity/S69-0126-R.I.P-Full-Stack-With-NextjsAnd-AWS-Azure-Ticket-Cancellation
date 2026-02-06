export default function Loading() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0a0a0a] text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_55%),radial-gradient(circle_at_20%_20%,rgba(244,63,94,0.12),transparent_45%)]" />

      <div className="relative mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 pb-20 pt-28">
        <div className="inline-flex items-center gap-3 self-start rounded-full border border-slate-800 bg-slate-900/60 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.32em] text-slate-300">
          <span className="h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.7)]" />
          Loading Dashboard
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8">
          <h1 className="text-2xl font-semibold text-white">Preparing your route data</h1>
          <p className="mt-2 text-sm text-slate-300">
            Syncing tickets, refunds, and real-time bus status.
          </p>

          <div className="mt-8">
            <div className="relative h-2 w-full rounded-full bg-slate-800">
              <div className="route-line" />
              <div className="route-bus animate-route-bus">
                <div className="h-3 w-3 rounded-sm bg-rose-500" />
                <div className="ml-1 h-2 w-2 rounded-full bg-slate-200" />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-400">
              <span>Origin</span>
              <span>Destination</span>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              "Scanning cancellations",
              "Matching tickets",
              "Scheduling payouts",
            ].map((label) => (
              <div key={label} className="rounded-2xl border border-slate-800 bg-slate-950/40 px-4 py-4 text-sm text-slate-200">
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
