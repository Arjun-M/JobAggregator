"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { setUserToken, setUserData } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [rollNo, setRollNo] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const body = isLogin ? { username, password } : { username, password, email, roll_no: rollNo };
      
      const result = await apiFetch<any>(endpoint, {
        method: "POST",
        body: JSON.stringify(body)
      });

      setUserToken(result.token);
      setUserData({
        userId: result.userId,
        username: result.username || username,
        role: result.role || "user"
      });

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ 
      minHeight: 'calc(100vh - 140px)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem 1rem',
      background: 'radial-gradient(circle at top right, var(--accent-soft), transparent 40%), radial-gradient(circle at bottom left, var(--accent-soft), transparent 40%)'
    }}>
      <div className="shell" style={{ maxWidth: '1000px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', background: 'white', borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--line)' }}>
        
        {/* Left Side: Branding/Marketing */}
        <div style={{ 
          background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
          color: 'white', 
          padding: '4rem 3rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="brand" style={{ color: 'white', marginBottom: '3rem', fontSize: '1.5rem' }}>
              <span style={{ color: 'var(--accent)' }}>Job</span>Aggregator
            </div>
            <h1 style={{ fontSize: '2.5rem', lineHeight: '1.1', marginBottom: '1.5rem', fontWeight: '800' }}>
              {isLogin ? "Welcome back to your career search." : "Join the future of job hunting."}
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '1.125rem', maxWidth: '340px' }}>
              {isLogin 
                ? "Access your personalized dashboard, saved roles, and weekly career reports." 
                : "Create an account to save jobs, set personalized filters, and receive weekly job digests."}
            </p>
          </div>
          
          <div style={{ position: 'absolute', bottom: '-40px', right: '-40px', width: '200px', height: '200px', background: 'var(--accent)', borderRadius: '50%', opacity: 0.1, filter: 'blur(40px)' }} />
          <div style={{ position: 'absolute', top: '20%', left: '-20px', width: '100px', height: '100px', background: 'var(--success)', borderRadius: '50%', opacity: 0.05, filter: 'blur(30px)' }} />
        </div>

        {/* Right Side: Form */}
        <div style={{ padding: '4rem 3.5rem', background: 'white' }}>
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem' }}>{isLogin ? "Sign In" : "Register"}</h2>
            <p className="muted" style={{ fontSize: '0.875rem' }}>Please enter your details below.</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
            {!isLogin && (
              <>
                <div className="field">
                  <span className="field-label">Email Address</span>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                      placeholder="name@company.com" 
                      required 
                      style={{ paddingLeft: '2.75rem' }}
                    />
                    <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', display: 'flex' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    </div>
                  </div>
                </div>
                <div className="field">
                  <span className="field-label">Roll Number</span>
                  <div style={{ position: 'relative' }}>
                    <input 
                      value={rollNo} 
                      onChange={e => setRollNo(e.target.value)} 
                      placeholder="e.g. 2021CS01" 
                      required 
                      style={{ paddingLeft: '2.75rem' }}
                    />
                    <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', display: 'flex' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M17 3.13a4 4 0 0 1 0 7.75"/></svg>
                    </div>
                  </div>
                </div>
              </>
            )}
            <div className="field">
              <span className="field-label">{isLogin ? "Identifier" : "Username"}</span>
              <div style={{ position: 'relative' }}>
                <input 
                  value={username} 
                  onChange={e => setUsername(e.target.value)} 
                  placeholder={isLogin ? "Username, Email or Roll No" : "Your username"} 
                  required 
                  style={{ paddingLeft: '2.75rem' }}
                />
                <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', display: 'flex' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
              </div>
            </div>
            <div className="field">
              <span className="field-label">Password</span>
              <div style={{ position: 'relative' }}>
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required 
                  style={{ paddingLeft: '2.75rem' }}
                />
                <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--muted)', display: 'flex' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
              </div>
            </div>

            {error && (
              <div style={{ padding: '0.875rem', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', color: 'var(--danger)', fontSize: '0.8125rem', textAlign: 'center', fontWeight: '500' }}>
                {error}
              </div>
            )}

            <button className="button" type="submit" style={{ width: '100%', padding: '0.875rem', fontSize: '1rem', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
            </button>
          </form>

          <div style={{ marginTop: '2.5rem', textAlign: 'center', borderTop: '1px solid var(--line)', paddingTop: '2rem' }}>
            <p className="muted" style={{ fontSize: '0.875rem' }}>
              {isLogin ? "New to the platform?" : "Already have an account?"}
              <button 
                className="muted" 
                style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'none', color: 'var(--accent)', fontWeight: '700', marginLeft: '0.5rem' }}
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
                }}
              >
                {isLogin ? "Create an account" : "Sign in here"}
              </button>
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 860px) {
          .shell {
            grid-template-columns: 1fr !important;
            max-width: 480px !important;
          }
          .shell > div:first-child {
            display: none !important;
          }
        }
      `}</style>
    </main>
  );
}
