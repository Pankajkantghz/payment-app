

export function Button({ label, onClick, type = "button", disabled = false }) {
    return <button onClick={onClick} type={type} disabled={disabled} className="inline-flex min-h-10 items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">{label}</button>
}
  
