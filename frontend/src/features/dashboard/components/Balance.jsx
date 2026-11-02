

export function Balance({ value }) {
  const formatted = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-slate-500">Available balance</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{formatted}</p>
      </div>
      <span className="rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-800">Demo wallet</span>
    </div>
  );
}
