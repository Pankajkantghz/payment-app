import { useEffect, useMemo, useState } from "react";
import api from "../../../lib/api";

const money = (amount) => new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
}).format(amount);

export function TransactionHistory({ refreshKey = 0 }) {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [copiedReference, setCopiedReference] = useState("");
    const [copyError, setCopyError] = useState("");
    const [filter, setFilter] = useState("all");
    const [query, setQuery] = useState("");

    const copyReference = async (referenceId) => {
        try {
            await navigator.clipboard.writeText(referenceId);
            setCopiedReference(referenceId);
            setCopyError("");
            window.setTimeout(() => setCopiedReference(""), 2000);
        } catch {
            setCopyError("Clipboard access is unavailable. Select and copy the reference ID.");
        }
    };

    useEffect(() => {
        let active = true;
        api.get("/account/transactions")
            .then(({ data }) => {
                if (active) setTransactions(data.transactions);
            })
            .catch((requestError) => {
                if (active) setError(requestError.response?.data?.message || "Could not load transaction history.");
            })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [refreshKey]);

    const filteredTransactions = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        return transactions.filter((transaction) => {
            const matchesFilter = filter === "all"
                || (filter === "sent" && transaction.direction === "sent")
                || (filter === "received" && transaction.direction === "received")
                || (filter === "demo" && transaction.direction === "demo_fund");
            const searchable = `${transaction.counterparty || ""} ${transaction.referenceId || ""} ${transaction.amount} ${transaction.type} ${transaction.direction}`.toLowerCase();
            return matchesFilter && (!normalizedQuery || searchable.includes(normalizedQuery));
        });
    }, [transactions, filter, query]);

    return <section aria-labelledby="transaction-history-heading" className="mt-0 min-w-0">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
                <h2 id="transaction-history-heading" className="text-lg font-bold">Transaction history</h2>
                <p className="text-sm text-slate-500">Search activity and open any item for its receipt.</p>
            </div>
            {!loading && !error && transactions.length > 0 && <span className="text-sm text-slate-500">{filteredTransactions.length} of {transactions.length}</span>}
        </div>
        {loading && <p className="text-slate-500">Loading activity…</p>}
        {error && <p role="alert" className="text-red-600">{error}</p>}
        {!loading && !error && transactions.length === 0 && <p className="text-slate-500">No recorded activity yet. New demo top-ups and transfers will appear here.</p>}
        {!loading && !error && transactions.length > 0 && <>
            <div className="mb-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_12rem]">
                <label className="sr-only" htmlFor="activity-search">Search transaction history</label>
                <input id="activity-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by person, amount, or reference…" className="rounded border border-slate-300 px-3 py-2" />
                <label className="sr-only" htmlFor="activity-filter">Filter transaction history</label>
                <select id="activity-filter" value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded border border-slate-300 bg-white px-3 py-2">
                    <option value="all">All activity</option>
                    <option value="sent">Money sent</option>
                    <option value="received">Money received</option>
                    <option value="demo">Demo funds added</option>
                </select>
            </div>
            {filteredTransactions.length === 0 ? <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No activity matches this search. Try another name, amount, or filter.</p> : <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white">
            {filteredTransactions.map((transaction) => {
                const isCredit = transaction.direction === "received" || transaction.direction === "demo_fund";
                const label = transaction.direction === "demo_fund"
                    ? "Demo funds added"
                    : transaction.direction === "received"
                        ? `Received from ${transaction.counterparty || "another user"}`
                        : `Sent to ${transaction.counterparty || "another user"}`;
                return <li key={transaction.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-3 sm:px-4">
                    <div>
                        <p className="font-medium">{label}</p>
                        <time className="text-sm text-slate-500" dateTime={transaction.date}>
                            {new Date(transaction.date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        </time>
                    </div>
                    <span className={`font-semibold ${isCredit ? "text-green-700" : "text-slate-800"}`}>
                        {isCredit ? "+" : "−"}{money(transaction.amount)}
                    </span>
                    <details className="basis-full pt-1 text-sm">
                        <summary className="cursor-pointer text-slate-600">View receipt</summary>
                        <div className="mt-2 rounded bg-slate-50 p-3">
                            <p><span className="font-medium">Reference:</span> <code className="select-all">{transaction.referenceId}</code></p>
                            <p><span className="font-medium">Type:</span> {transaction.type === "demo_fund" ? "Demo top-up" : "Wallet transfer"}</p>
                            <p><span className="font-medium">Direction:</span> {transaction.direction === "demo_fund" ? "Added to wallet" : transaction.direction === "received" ? "Received" : "Sent"}</p>
                            <p><span className="font-medium">Amount:</span> {money(transaction.amount)}</p>
                            {transaction.counterparty && <p><span className="font-medium">Other party:</span> {transaction.counterparty}</p>}
                            <p><span className="font-medium">Date:</span> {new Date(transaction.date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
                            <button type="button" onClick={() => copyReference(transaction.referenceId)} className="mt-2 rounded border border-slate-300 px-3 py-1 hover:bg-white">
                                {copiedReference === transaction.referenceId ? "Copied" : "Copy reference"}
                            </button>
                        </div>
                    </details>
                </li>;
            })}
            </ul>}
        </>}
        {copyError && <p role="alert" className="mt-2 text-sm text-red-600">{copyError}</p>}
    </section>;
}
