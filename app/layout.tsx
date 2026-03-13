"use client";

import "./globals.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getUserToken, getUserData, clearUserSession } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = getUserToken();
    if (token) {
      setUser(getUserData());
    } else {
      setUser(null);
    }
  }, [pathname]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const isHome = pathname === "/";

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <title>JobAggregator | The Intelligent Job Board</title>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body>
        <div className={`nav-wrapper ${!isHome ? 'nav-sticky' : ''}`}>
          <div className="shell">
            <header className="page-header-container">
              <div className="header-left">
                <Link href="/" className="brand">
                  <span style={{ color: 'var(--accent)' }}>Job</span>Aggregator
                </Link>
                <nav className={`main-nav ${isMenuOpen ? 'open' : ''}`}>
                  <Link href="/explore" className={`nav-link ${pathname === '/explore' ? 'active' : ''}`}>All Listings</Link>
                  <Link href="/reports" className={`nav-link ${pathname?.startsWith('/reports') ? 'active' : ''}`}>Reports</Link>
                  <Link href="/archive" className={`nav-link ${pathname === '/archive' ? 'active' : ''}`}>Archive</Link>
                  <Link href="/about" className={`nav-link ${pathname === '/about' ? 'active' : ''}`}>About</Link>
                  
                  {/* Mobile-only links inside nav when open */}
                  <div className="mobile-only-nav">
                    {user ? (
                      <>
                        <Link href="/dashboard" className={`nav-link ${pathname === '/dashboard' ? 'active' : ''}`}>Dashboard</Link>
                        <button 
                          className="nav-link" 
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: 'var(--danger)', textAlign: 'left', padding: '0.75rem 1rem' }}
                          onClick={() => { if(confirm("Logout?")) { clearUserSession(); setUser(null); router.push("/"); } }}
                        >
                          Logout
                        </button>
                      </>
                    ) : (
                      <Link href="/login" className="nav-link">Sign In</Link>
                    )}
                  </div>
                </nav>
              </div>
              
              <div className="header-right">
                <nav className="toolbar">
                  {user ? (
                    <>
                      <Link href="/dashboard" className={`nav-link ${pathname === '/dashboard' ? 'active' : ''}`} style={{ fontWeight: 600 }}>Dashboard</Link>
                      <button 
                        className="nav-link logout-btn" 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, color: 'var(--danger)' }}
                        onClick={() => { if(confirm("Logout?")) { clearUserSession(); setUser(null); router.push("/"); } }}
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link href="/login" className="nav-link">Sign In</Link>
                  )}
                </nav>
                
                <button 
                  className="mobile-menu-toggle"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  aria-label="Toggle menu"
                >
                  {isMenuOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                  )}
                </button>
              </div>
            </header>
          </div>
        </div>
        <div className="layout-content">
          {children}
        </div>

        <footer className="footer">
          <div className="shell">
            <div className="footer-grid">
              <div>
                <Link href="/" className="brand" style={{ marginBottom: '1.5rem', display: 'block' }}>
                  <span style={{ color: 'var(--accent)' }}>Job</span>Aggregator
                </Link>
                <p className="muted" style={{ fontSize: '0.875rem', lineHeight: '1.6', maxWidth: '240px' }}>
                  A private, AI-powered intelligence platform for career opportunities. No noise, just signals.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem', fontWeight: 700 }}>Platform</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '1rem', fontSize: '0.875rem' }}>
                  <li><Link href="/explore" className="muted-link">All Listings</Link></li>
                  <li><Link href="/reports" className="muted-link">Market Reports</Link></li>
                  <li><Link href="/archive" className="muted-link">Archive</Link></li>
                </ul>
              </div>

              <div>
                <h4 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem', fontWeight: 700 }}>User</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '1rem', fontSize: '0.875rem' }}>
                  <li><Link href="/dashboard" className="muted-link">Dashboard</Link></li>
                  <li><Link href="/login" className="muted-link">Sign In</Link></li>
                  <li><Link href="/about" className="muted-link">About Project</Link></li>
                </ul>
              </div>

              <div>
                <h4 style={{ fontSize: '0.8125rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem', fontWeight: 700 }}>Information</h4>
                <p className="muted" style={{ fontSize: '0.875rem', lineHeight: '1.6' }}>
                Developed by the Batch of 2025 in support of the SSKZM OBA initiative to connect alumni job seekers and hirers through a shared opportunities network.
Inspired by the Daily Career & Education Digest curated by Dr. Rajookrishnan and contributing Kazaks.
                </p>
              </div>
            </div>

            <div className="footer-bottom" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '2.5rem', borderTop: '1px solid var(--line)', opacity: 0.6, fontSize: '0.75rem' }}>
              <p>&copy; 2026 JobAggregator. SSKZM OBA Use Only.</p>
              <div style={{ display: 'flex', gap: '2rem' }}>
                <span className="muted">Private Tool</span>
                <span className="muted">v0.0.1</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
