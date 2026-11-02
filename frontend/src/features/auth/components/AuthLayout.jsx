import { BottomWarning } from "../../../components/ui/BottomWarning";

export function AuthLayout({ title, description, footerLabel, footerAction, footerTo, children }) {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-slate-950 px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-green-500/20 blur-3xl" aria-hidden="true" />
        <div className="relative flex items-center gap-3 font-semibold">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500 text-xl">W</span>
          <span className="text-lg">Wallet demo</span>
        </div>
        <div className="relative max-w-lg pb-10">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-green-300">A simple way to explore</p>
          <h1 className="text-4xl font-bold leading-tight xl:text-5xl">Practice wallet transfers with confidence.</h1>
          <p className="mt-5 max-w-md leading-7 text-slate-300">Try a clear send-and-review flow, demo balances, and searchable receipts in a safe sample environment.</p>
          <p className="mt-8 inline-flex rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-xs font-medium text-amber-100">Demo only · No real money moves</p>
        </div>
        <p className="relative text-xs text-slate-400">A learning project for wallet and transaction flows.</p>
      </aside>

      <section className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-700 font-semibold text-white">W</span>
            <div><p className="font-semibold text-slate-900">Wallet demo</p><p className="text-xs text-amber-800">Demo only · No real money</p></div>
          </div>
          <div className="mb-7">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">{title}</h2>
            <p className="mt-2 text-slate-600">{description}</p>
          </div>
          {children}
          <div className="mt-7 border-t border-slate-100 pt-5">
            <BottomWarning label={footerLabel} buttonText={footerAction} to={footerTo} />
          </div>
        </div>
      </section>
    </main>
  );
}
