import { Link, useNavigate } from "react-router-dom";

export function Appbar({ user }) {
  const navigate = useNavigate();
  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "U";

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/signin", { replace: true });
  };

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/dashboard" aria-label="Wallet demo home" className="flex items-center gap-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-700">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-green-700 font-bold text-white">W</span>
          <span className="font-semibold tracking-tight text-slate-900">Wallet demo</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="hidden text-sm text-slate-600 sm:inline">{user ? user.firstName : "Loading profile…"}</span>
          <div aria-label={`${user?.firstName || "User"} avatar`} className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-900">
            {initials}
          </div>
          <button type="button" onClick={logout} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-green-700">Sign out</button>
        </div>
      </div>
    </header>
  );
}
