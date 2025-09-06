import { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("Invalid credentials");
      window.location.href = "/";
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 text-center">
      <div>
        <input
          type="email"
          placeholder="Email"
          className="w-full text-center rounded-xl bg-white border border-black/10 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Password"
          className="w-full text-center rounded-xl bg-white border border-black/10 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-600"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
      </div>

      {error && (
        <div className="text-red-600 text-xs">{error}</div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-xl bg-blue-600 text-white py-3 text-sm font-semibold hover:bg-blue-700 disabled:opacity-60"
      >
        {busy ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}