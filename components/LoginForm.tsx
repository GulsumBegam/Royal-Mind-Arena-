"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (data.error) setError(data.error);
    else router.push("/game");
  }

  return (
    <div className="card-glass rounded-2xl p-8">
      <h2 className="text-xl font-semibold text-white mb-6 text-center">Welcome Back</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-royal-300 text-sm mb-1.5">Username</label>
          <input className="input-royal" placeholder="Enter username" value={form.username}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required />
        </div>
        <div>
          <label className="block text-royal-300 text-sm mb-1.5">Password</label>
          <input className="input-royal" type="password" placeholder="Enter password" value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
        </div>
        {error && <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">{error}</p>}
        <button type="submit" className="btn-primary w-full text-center" disabled={loading}>
          {loading ? "Signing in..." : "Enter the Arena"}
        </button>
      </form>
      <p className="text-center text-royal-400 text-sm mt-6">
        New player?{" "}
        <Link href="/register" className="text-royal-300 hover:text-white transition-colors font-medium">
          Create account
        </Link>
      </p>
    </div>
  );
}
