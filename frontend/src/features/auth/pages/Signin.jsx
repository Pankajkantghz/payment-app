import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../lib/api";
import { Button } from "../../../components/ui/Button";
import { InputBox } from "../../../components/ui/InputBox";
import { AuthLayout } from "../components/AuthLayout";

export function Signin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const signIn = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { data } = await api.post("/user/signin", { username, password });
      localStorage.setItem("token", data.token);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not sign in. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return <AuthLayout title="Welcome back" description="Sign in to continue to your wallet." footerLabel="New to the demo?" footerAction="Create an account" footerTo="/">
    <form onSubmit={signIn} className="space-y-5">
      <InputBox id="email" label="Email address" placeholder="you@example.com" value={username} onChange={(event) => setUsername(event.target.value)} type="email" autoComplete="email" />
      <InputBox id="password" label="Password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" />
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <Button type="submit" disabled={submitting} label={submitting ? "Signing in…" : "Sign in"} />
    </form>
  </AuthLayout>;
}
