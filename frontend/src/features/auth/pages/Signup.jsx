import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../lib/api";
import { Button } from "../../../components/ui/Button";
import { InputBox } from "../../../components/ui/InputBox";
import { AuthLayout } from "../components/AuthLayout";

export function Signup() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const signUp = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const { data } = await api.post("/user/signup", { username, firstName, lastName, password });
      localStorage.setItem("token", data.token);
      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not create your account. Check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return <AuthLayout title="Create your account" description="Set up a demo wallet in a few seconds." footerLabel="Already have an account?" footerAction="Sign in" footerTo="/signin">
    <form onSubmit={signUp} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <InputBox id="first-name" label="First name" placeholder="Alex" value={firstName} onChange={(event) => setFirstName(event.target.value)} autoComplete="given-name" maxLength={50} />
        <InputBox id="last-name" label="Last name" placeholder="Morgan" value={lastName} onChange={(event) => setLastName(event.target.value)} autoComplete="family-name" maxLength={50} />
      </div>
      <InputBox id="email" label="Email address" placeholder="you@example.com" value={username} onChange={(event) => setUsername(event.target.value)} type="email" autoComplete="email" />
      <InputBox id="password" label="Password" placeholder="At least 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="new-password" minLength={8} maxLength={128} />
      {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <Button type="submit" disabled={submitting} label={submitting ? "Creating account…" : "Create account"} />
      <p className="text-center text-xs leading-5 text-slate-500">This sample app stores demo balances only. Do not enter financial details.</p>
    </form>
  </AuthLayout>;
}
