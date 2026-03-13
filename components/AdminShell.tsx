"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearToken, getToken } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/admin/login");
      return;
    }
    setReady(true);
  }, [router]);

  if (!ready) {
    return (
      <div className="shell" style={{ padding: "4rem 0", textAlign: "center" }}>
        <p className="muted">Authenticating...</p>
      </div>
    );
  }

  const navItems = [
    { label: "Uploads", href: "/admin/upload" },
    { label: "Review Queue", href: "/admin/staging" },
    { label: "Jobs", href: "/admin/jobs" },
    { label: "Users", href: "/admin/users" },
    { label: "Bucket", href: "/admin/bucket" },
    { label: "Logs", href: "/admin/logs" },
  ];

  return (
    <div className="shell admin-shell" style={{ paddingBottom: '4rem' }}>
      <header className="panel admin-shell-header" style={{ padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '4px solid var(--accent)' }}>
        <div className="admin-header-nav-container" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link href="/admin/upload" className="brand" style={{ fontSize: '1rem' }}>
            <span style={{ color: 'var(--accent)' }}>Admin</span>Portal
          </Link>
          <nav className="admin-nav" style={{ display: 'flex', gap: '0.5rem' }}>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link 
                  key={item.href} 
                  href={item.href} 
                  className={`button ${isActive ? '' : 'secondary'} admin-nav-btn`}
                  style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <button
          className="button secondary logout-btn"
          style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem', color: 'var(--danger)' }}
          onClick={() => {
            if (confirm("Are you sure you want to logout?")) {
              clearToken();
              router.replace("/admin/login");
            }
          }}
        >
          Logout
        </button>
      </header>
      <main>
        {children}
      </main>
    </div>
  );
}
