"use client";

import { FormEvent, useState } from "react";
import { apiFetch } from "@/lib/api";
import { setToken } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("your_strong_admin_password");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await apiFetch<{ token: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password })
      });
      setToken(result.token);
      router.push("/admin/upload");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 80px)' }}>
      <section className="panel" style={{ maxWidth: 440, width: '100%', padding: "2.5rem", borderTop: '4px solid var(--accent)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Admin Login</h1>
          <p className="muted" style={{ fontSize: '0.875rem' }}>Enter your credentials to access the admin portal.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.25rem' }}>
          <label className="field" style={{ marginBottom: 0 }}>
            <span className="field-label">Username</span>
            <input 
              value={username} 
              onChange={(event) => setUsername(event.target.value)} 
              placeholder="Enter username"
              required
            />
          </label>
          <label className="field" style={{ marginBottom: 0 }}>
            <span className="field-label">Password</span>
            <input 
              type="password" 
              value={password} 
              onChange={(event) => setPassword(event.target.value)} 
              placeholder="Enter password"
              required
            />
          </label>
          
          {error && (
            <div style={{ padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '0.875rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button className="button" type="submit" style={{ width: '100%', marginTop: '0.5rem' }} disabled={loading}>
            {loading ? "Logging in..." : "Secure Login"}
          </button>
        </form>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <Link href="/" className="muted" style={{ fontSize: '0.875rem', textDecoration: 'underline' }}>
            Back to Public Listings
          </Link>
        </div>
      </section>
    </main>
  );
}
