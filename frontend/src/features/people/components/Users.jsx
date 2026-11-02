import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/Button";
import api from "../../../lib/api";
import { useNavigate } from "react-router-dom";

export const Users = () => {
    const [users, setUsers] = useState([]);
    const [filter, setFilter] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [addingRecipient, setAddingRecipient] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        let active = true;
        setLoading(true);
        const timer = window.setTimeout(() => {
            api.get("/user/bulk", { params: { filter } })
                .then(({ data }) => { if (active) { setUsers(data.user); setError(""); } })
                .catch((requestError) => { if (active) setError(requestError.response?.data?.message || "Could not load users."); })
                .finally(() => { if (active) setLoading(false); });
        }, 250);
        return () => { active = false; window.clearTimeout(timer); };
    }, [filter]);

    const addDemoRecipient = async () => {
        setAddingRecipient(true);
        setError("");
        try {
            const { data } = await api.post("/account/demo-recipient");
            setUsers((current) => current.some((user) => user._id === data.user._id) ? current : [...current, data.user]);
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Could not create a demo recipient.");
        } finally {
            setAddingRecipient(false);
        }
    };

    return <section aria-labelledby="users-heading">
        <h2 id="users-heading" className="font-bold text-lg text-slate-950">People</h2>
        <p className="mt-1 text-sm text-slate-500">Find a person to send demo funds to.</p>
        <div className="my-3">
            <label htmlFor="user-search" className="sr-only">Search people</label>
            <input id="user-search" value={filter} onChange={(event) => setFilter(event.target.value)} type="search" placeholder="Search people…" className="w-full px-3 py-2 border rounded border-slate-200" />
        </div>
        {error && <p role="alert" className="text-red-600">{error}</p>}
        <div className="space-y-2">
            {loading && <p role="status" className="py-3 text-slate-500">Searching people…</p>}
            {!loading && users.map((user) => <div key={user._id} className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 py-3">
                <div className="flex min-w-0 items-center">
                    <div className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-700" aria-hidden="true">
                        {user.firstName?.[0]?.toUpperCase() || "?"}
                    </div>
                    <span className="truncate font-medium text-slate-800">{user.firstName} {user.lastName}</span>
                </div>
                <Button onClick={() => navigate(`/send?id=${encodeURIComponent(user._id)}&name=${encodeURIComponent(`${user.firstName} ${user.lastName}`)}`)} label="Send" />
            </div>)}
            {!loading && !error && users.length === 0 && <div className="py-3">
                <p className="text-slate-500">{filter ? "No matching people found." : "No other accounts yet. Create a local test recipient to try a transfer."}</p>
                {!filter && import.meta.env.VITE_ENABLE_DEMO_FUNDING === "true" && <button type="button" disabled={addingRecipient} onClick={addDemoRecipient} className="mt-2 rounded bg-slate-800 px-4 py-2 text-white disabled:opacity-60">
                    {addingRecipient ? "Creating…" : "Create demo recipient"}
                </button>}
            </div>}
        </div>
    </section>;
};
