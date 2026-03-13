"use client";

import { useEffect, useState, useRef } from "react";
import { AdminShell } from "@/components/AdminShell";
import { getToken } from "@/lib/auth";

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLPreElement>(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/admin/logs", {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      setLogs(data.content);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 5000); // Auto-refresh every 5s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleClear = async () => {
    if (!confirm("Are you sure you want to clear all logs?")) return;
    await fetch("/api/admin/logs", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` }
    });
    fetchLogs();
  };

  return (
    <AdminShell>
      <div className="page-stack">
        <section className="panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>System Logs</h1>
            <p className="muted">Real-time view of background extraction tasks and API activity.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={fetchLogs} className="button secondary">Refresh</button>
            <button onClick={handleClear} className="button" style={{ background: 'var(--danger)' }}>Clear Logs</button>
          </div>
        </section>

        <section className="panel" style={{ overflow: 'hidden', background: '#0f172a', border: 'none' }}>
          <pre 
            ref={scrollRef}
            style={{ 
              padding: '1.5rem', 
              margin: 0, 
              height: '600px', 
              overflowY: 'auto', 
              color: '#38bdf8', 
              fontSize: '0.8125rem',
              lineHeight: '1.4',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all'
            }}
          >
            {loading ? "Loading logs..." : logs || "No log entries found."}
          </pre>
        </section>
      </div>
    </AdminShell>
  );
}
