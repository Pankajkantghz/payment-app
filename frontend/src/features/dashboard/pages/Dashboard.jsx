import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../../lib/api";
import { Appbar } from "../../../components/layout/Appbar";
import { Balance } from "../components/Balance";
import { Users } from "../../people/components/Users";
import { TransactionHistory } from "../../transactions/components/TransactionHistory";

export const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [balance, setBalance] = useState(null);
    const [error, setError] = useState("");
    const [fundAmount, setFundAmount] = useState("1000");
    const [funding, setFunding] = useState(false);
    const [activityVersion, setActivityVersion] = useState(0);
    const [notice, setNotice] = useState("");
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        Promise.all([api.get("/user/me"), api.get("/account/balance")])
            .then(([userResponse, balanceResponse]) => {
                setUser(userResponse.data.user);
                setBalance(balanceResponse.data.balance);
            })
            .catch((requestError) => {
                if (requestError.response?.status === 401) {
                    localStorage.removeItem("token");
                    navigate("/signin", { replace: true });
                } else setError(requestError.response?.data?.message || "Could not load your account.");
            });
    }, [navigate]);

    const addDemoFunds = async (event) => {
        event.preventDefault();
        const amount = Number(fundAmount);
        if (!Number.isFinite(amount) || amount <= 0 || amount > 100_000) {
            setError("Enter an amount between ₹0.01 and ₹100,000.");
            return;
        }
        setFunding(true);
        setError("");
        setNotice("");
        try {
            const response = await api.post("/account/demo-funds", { amount });
            setBalance(response.data.balance);
            setActivityVersion((version) => version + 1);
            setNotice(`₹${amount.toLocaleString("en-IN")} in demo funds added to your wallet.`);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Could not add demo funds.");
        } finally {
            setFunding(false);
        }
    };

    return <div>
        <Appbar user={user} />
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-green-800">Your wallet</p>
                    <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Welcome{user?.firstName ? `, ${user.firstName}` : ""}</h1>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">Demo app · No real money</span>
            </div>
            {(notice || location.state?.notice) && <p role="status" className="mb-4 rounded border border-green-200 bg-green-50 p-3 text-green-800">{notice || location.state.notice}</p>}
            {error && <p role="alert" className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-red-700">{error}</p>}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                {balance === null ? <p role="status" className="text-slate-500">Loading account…</p> : <Balance value={balance} />}
            </div>
            {import.meta.env.VITE_ENABLE_DEMO_FUNDING === "true" && <form onSubmit={addDemoFunds} className="mt-4 flex flex-wrap items-end gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
                <div className="flex-1 min-w-48">
                    <label htmlFor="demo-fund-amount" className="mb-1 block text-sm font-semibold text-amber-950">Add demo funds</label>
                    <input id="demo-fund-amount" type="number" min="0.01" max="100000" step="0.01" value={fundAmount} onChange={(event) => setFundAmount(event.target.value)} className="w-full rounded border border-amber-300 bg-white px-3 py-2" />
                </div>
                <button type="submit" disabled={funding} className="rounded-lg bg-amber-800 px-4 py-2 font-medium text-white hover:bg-amber-900 disabled:opacity-60">
                    {funding ? "Adding…" : "Add demo funds"}
                </button>
                <p className="basis-full text-xs text-amber-900">Adds sample balance for local testing only; it is not a real deposit. Top-ups are capped at ₹100,000.</p>
            </form>}
            <div className="mt-8 grid gap-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <Users />
                <TransactionHistory refreshKey={activityVersion} />
            </div>
        </main>
    </div>;
};
