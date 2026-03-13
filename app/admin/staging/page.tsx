"use client";

import { AdminShell } from "@/components/AdminShell";
import { apiFetch } from "@/lib/api";
import { getToken } from "@/lib/auth";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";

export default function StagingPage() {
  const [items, setItems] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [processing, setProcessing] = useState<{ running: boolean; pending_count: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActionRunning, setIsActionRunning] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showNotification = useCallback((message: string, type: 'success' | 'info' | 'error' = 'info') => {
    setNotification({ message, type });
    // Remove previous timeout if any
    const timer = setTimeout(() => setNotification(null), 6000);
    return () => clearTimeout(timer);
  }, []);

  async function load() {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const [stagingResult, processingResult] = await Promise.all([
        apiFetch<{ items: any[] }>("/api/admin/staging?status=pending_review&page=1&limit=50", undefined, token),
        apiFetch<{ running: boolean; pending_count: number }>("/api/admin/process-pending/status", undefined, token)
      ]);
      setItems(stagingResult.items);
      setProcessing(processingResult);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // Refresh status periodically while running
    const interval = setInterval(() => {
      if (processing?.running) void load();
    }, 10000);
    return () => clearInterval(interval);
  }, [processing?.running]);

  async function runAction(path: string, body?: unknown) {
    if (isActionRunning) return;
    
    const token = getToken();
    if (!token) return;

    setIsActionRunning(true);
    try {
      const response = await apiFetch<any>(path, {
        method: "POST",
        body: JSON.stringify(body ?? {})
      }, token);
      
      if (path.includes("process-pending")) {
        const type = response.started ? 'success' : 'info';
        showNotification(response.message || "Request handled", type);
        if (response.running) {
          setProcessing(prev => prev ? { ...prev, running: true } : { running: true, pending_count: response.count || 0 });
        }
      } else {
        showNotification("Action completed successfully", 'success');
      }
    } catch (err: any) {
      showNotification(err.message || "Action failed", 'error');
    } finally {
      setIsActionRunning(false);
      await load();
    }
  }

  const allSelected = items.length > 0 && selectedIds.length === items.length;

  return (
    <AdminShell>
      {/* Toast Notification */}
      {notification && (
        <div 
          style={{ 
            position: 'fixed', 
            top: '2rem', 
            right: '2rem', 
            zIndex: 9999, 
            padding: '1rem 1.5rem', 
            borderRadius: 'var(--radius-md)', 
            boxShadow: 'var(--shadow-lg)',
            background: notification.type === 'success' ? '#10b981' : notification.type === 'error' ? '#ef4444' : '#3b82f6',
            color: 'white',
            fontWeight: 700,
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          <span style={{ fontSize: '1.25rem' }}>{notification.type === 'success' ? '✅' : notification.type === 'error' ? '❌' : 'ℹ️'}</span>
          <div style={{ flex: 1 }}>{notification.message}</div>
          <button 
            onClick={() => setNotification(null)}
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '1.5rem', opacity: 0.7 }}
          >
            &times;
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>

      <div className="staging-actions-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Review Queue</h1>
          <p className="muted">Approve or edit extracted job data before it goes live.</p>
        </div>
        <div className="staging-buttons" style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            className="button secondary" 
            onClick={() => void runAction("/api/admin/process-pending")}
            disabled={processing?.running || isActionRunning}
            style={{ position: 'relative' }}
          >
            {(processing?.running || isActionRunning) ? (
              <>
                <span style={{ marginRight: '0.5rem' }}>⚙️</span> 
                Processing AI...
              </>
            ) : "Re-run Extraction"}
          </button>
          <button
            className="button bulk-approve-btn"
            disabled={selectedIds.length === 0 || isActionRunning}
            onClick={async () => {
              if (!confirm(`Approve ${selectedIds.length} selected items?`)) return;
              await runAction("/api/admin/staging/bulk-approve", { ids: selectedIds });
              setSelectedIds([]);
            }}
          >
            Bulk Approve ({selectedIds.length})
          </button>
        </div>
      </div>

      {loading && items.length === 0 ? (
        <div style={{ padding: '4rem', textAlign: 'center' }}>
          <p className="muted">Loading items...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="panel empty-state" style={{ padding: '4rem', textAlign: 'center' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Queue is empty</h3>
          <p className="muted">All uploads have been processed and reviewed.</p>
          <Link href="/admin/upload" className="button" style={{ marginTop: '1.5rem' }}>Upload More</Link>
        </div>
      ) : (
        <div className="panel" style={{ overflow: 'hidden' }}>
          <div className="staging-table-header" style={{ padding: '1rem 1.5rem', background: 'var(--panel-strong)', borderBottom: '1px solid var(--line)', display: 'grid', gridTemplateColumns: '40px 100px 1fr 200px', gap: '1.5rem', alignItems: 'center' }}>
            <input 
              type="checkbox" 
              checked={allSelected} 
              onChange={(e) => {
                if (e.target.checked) setSelectedIds(items.map(i => i._id));
                else setSelectedIds([]);
              }}
            />
            <span className="col-preview" style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--muted)' }}>Preview</span>
            <span className="col-details" style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--muted)' }}>Details</span>
            <span className="col-actions" style={{ fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--muted)', textAlign: 'right' }}>Actions</span>
          </div>
          
          <div className="staging-list" style={{ display: 'grid' }}>
            {items.map((item) => (
              <div 
                key={item._id} 
                className="staging-item"
                style={{ 
                  padding: '1.25rem 1.5rem', 
                  borderBottom: '1px solid var(--line)', 
                  display: 'grid', 
                  gridTemplateColumns: '40px 100px 1fr 200px', 
                  gap: '1.5rem', 
                  alignItems: 'start',
                  transition: 'background 0.2s'
                }}
              >
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(item._id)}
                  style={{ marginTop: '0.5rem' }}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedIds(prev => [...prev, item._id]);
                    else setSelectedIds(prev => prev.filter(id => id !== item._id));
                  }}
                />
                <img src={item.source.image_url} alt="Source" className="staging-item-img" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }} />
                <div className="staging-item-content">
                  <h3 style={{ fontSize: '1.125rem', marginBottom: '0.25rem' }}>{item.job.title || "Untitled Role"}</h3>
                  <p style={{ fontWeight: '600', color: 'var(--accent)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{item.job.organization || "Unknown Organization"}</p>
                  <div className="staging-item-tags" style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                    {item.job.tags.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="tag" style={{ fontSize: '0.7rem' }}>{tag}</span>
                    ))}
                    {item.job.tags.length > 3 && <span className="muted" style={{ fontSize: '0.7rem' }}>+{item.job.tags.length - 3} more</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }} className="muted staging-item-meta">
                    <span>📍 {item.job.location || "No location"}</span>
                    <span>💰 {item.job.salary || "No salary info"}</span>
                    <span>🎯 Confidence: {(item.meta.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
                <div className="staging-item-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <button className="button" style={{ padding: '0.5rem' }} disabled={isActionRunning} onClick={() => void runAction(`/api/admin/staging/${item._id}/approve`)}>Approve</button>
                  <div className="staging-item-sub-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <Link href={`/admin/staging/${item._id}`} className="button secondary" style={{ padding: '0.5rem' }}>Edit</Link>
                    <button className="button secondary" style={{ padding: '0.5rem', color: 'var(--danger)' }} disabled={isActionRunning} onClick={() => void runAction(`/api/admin/staging/${item._id}/reject`, { reason: "Manual rejection" })}>Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
