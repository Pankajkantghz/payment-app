import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../../lib/api";

const money = (value) => new Intl.NumberFormat("en-IN", {
  style: "currency", currency: "INR", minimumFractionDigits: 2, maximumFractionDigits: 2,
}).format(value);

export const SendMoney = () => {
  const [searchParams] = useSearchParams();
  const recipientId = searchParams.get("id") || "";
  const recipientName = searchParams.get("name") || "Recipient";
  const [amount, setAmount] = useState("");
  const [balance, setBalance] = useState(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState("edit");
  const [receipt, setReceipt] = useState(null);
  const navigate = useNavigate();
  const numericAmount = Number(amount);

  useEffect(() => {
    if (!recipientId) return;
    api.get("/account/balance")
      .then(({ data }) => setBalance(data.balance))
      .catch((requestError) => setError(requestError.response?.data?.message || "Could not load your balance."));
  }, [recipientId]);

  const reviewTransfer = (event) => {
    event.preventDefault();
    setError("");
    if (!recipientId) return setError("Choose a recipient from the people list first.");
    if (!Number.isFinite(numericAmount) || numericAmount <= 0 || Math.abs(numericAmount * 100 - Math.round(numericAmount * 100)) > 1e-7) {
      return setError("Enter an amount greater than zero with no more than two decimal places.");
    }
    if (balance === null) return setError("Wait for your available balance to load before continuing.");
    if (balance !== null && numericAmount > balance) return setError("This amount is higher than your available balance.");
    setStep("review");
  };

  const confirmTransfer = async () => {
    setSending(true);
    setError("");
    try {
      const { data } = await api.post("/account/transfer", { to: recipientId, amount: numericAmount });
      setReceipt(data);
      setStep("success");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Transfer failed. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8">
      <section className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg" aria-labelledby="send-heading">
        <button type="button" onClick={() => navigate("/dashboard")} className="mb-5 text-sm text-slate-600 hover:text-slate-900">← Back to wallet</button>
        {step === "success" ? <div className="space-y-5 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl text-green-700" aria-hidden="true">✓</div>
          <div>
            <p className="text-sm font-medium text-green-700">Transfer complete</p>
            <h1 id="send-heading" className="mt-1 text-3xl font-bold">{money(receipt.amount)}</h1>
            <p className="mt-2 text-slate-600">Sent to {recipientName}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4 text-left text-sm">
            <p className="text-slate-500">Transfer reference</p>
            <code className="mt-1 block select-all break-all font-semibold">{receipt.referenceId}</code>
          </div>
          <button type="button" onClick={() => navigate("/dashboard", { replace: true, state: { notice: `Transfer to ${recipientName} completed.` } })} className="w-full rounded-lg bg-green-700 px-4 py-3 font-semibold text-white hover:bg-green-800">Return to wallet</button>
        </div> : <>
          <p className="text-sm font-medium text-green-700">Wallet transfer · Demo only</p>
          <h1 id="send-heading" className="mt-1 text-2xl font-bold">{step === "review" ? "Review transfer" : "Send money"}</h1>
          <div className="my-5 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-green-700 text-lg font-semibold text-white" aria-hidden="true">{recipientName[0]?.toUpperCase() || "?"}</div>
            <div><p className="text-xs text-slate-500">Sending to</p><p className="font-semibold">{recipientName}</p></div>
          </div>
          {step === "edit" ? <form onSubmit={reviewTransfer} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium" htmlFor="amount">Amount in rupees</label>
              <div className="flex items-center rounded-lg border border-slate-300 focus-within:ring-2 focus-within:ring-green-600">
                <span className="pl-3 text-slate-500" aria-hidden="true">₹</span>
                <input type="number" className="w-full rounded-lg border-0 px-3 py-3 outline-none focus:ring-0" id="amount" placeholder="0.00" value={amount} onChange={(event) => setAmount(event.target.value)} min="0.01" step="0.01" max="1000000000" required />
              </div>
              <p className="mt-1 text-xs text-slate-500">Available balance: {balance === null ? "Loading…" : money(balance)}</p>
            </div>
            {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
            <button className="w-full rounded-lg bg-green-700 px-4 py-3 font-semibold text-white hover:bg-green-800">Review transfer</button>
          </form> : <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 p-4">
              <div className="flex justify-between gap-3 border-b border-slate-100 pb-3"><span className="text-slate-500">Recipient</span><span className="text-right font-medium">{recipientName}</span></div>
              <div className="flex justify-between gap-3 py-3"><span className="text-slate-500">Amount</span><span className="font-semibold">{money(numericAmount)}</span></div>
              <div className="flex justify-between gap-3 border-t border-slate-100 pt-3"><span className="text-slate-500">Balance after transfer</span><span className="font-semibold">{balance === null ? "—" : money(Math.max(0, balance - numericAmount))}</span></div>
            </div>
            <p className="text-xs text-amber-800">This moves demo funds within this project only. No real payment will be made.</p>
            <button type="button" disabled={sending} onClick={confirmTransfer} className="w-full rounded-lg bg-green-700 px-4 py-3 font-semibold text-white hover:bg-green-800 disabled:opacity-60">{sending ? "Sending…" : `Confirm and send ${money(numericAmount)}`}</button>
            <button type="button" disabled={sending} onClick={() => { setStep("edit"); setError(""); }} className="w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50 disabled:opacity-60">Change amount</button>
          </div>}
        </>}
        {step !== "edit" && error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}
      </section>
    </main>
  );
};
