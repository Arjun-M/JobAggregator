"use client";

import { useState, useEffect } from "react";
import { getUserToken } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

const LOCAL_STORAGE_KEY = "jobaggregator_saved_jobs";

export function SaveJobButton({ jobId, initialIsSaved = false, showLabel = false }: { jobId: string, initialIsSaved?: boolean, showLabel?: boolean }) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Sync with localStorage on mount
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const savedIds = JSON.parse(saved);
      if (savedIds.includes(jobId)) {
        setIsSaved(true);
      }
    }
  }, [jobId]);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const token = getUserToken();
    if (!token) {
      alert("Please login to save jobs");
      return;
    }

    setLoading(true);
    try {
      const res = await apiFetch<any>("/api/user/saved-jobs", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ jobId })
      });
      
      const newSavedState = res.isSaved;
      setIsSaved(newSavedState);

      // Update localStorage
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      let savedIds = saved ? JSON.parse(saved) : [];
      
      if (newSavedState) {
        if (!savedIds.includes(jobId)) {
          savedIds.push(jobId);
        }
      } else {
        savedIds = savedIds.filter((id: string) => id !== jobId);
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedIds));

    } catch (err) {
      console.error("Failed to toggle save", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleToggleSave}
      disabled={loading}
      className={showLabel ? "button secondary small" : ""}
      style={!showLabel ? { 
        background: 'none', 
        border: 'none', 
        padding: '0.25rem', 
        cursor: 'pointer',
        color: isSaved ? 'var(--accent)' : 'var(--muted)',
        transition: 'color 0.2s',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      } : {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: isSaved ? 'var(--accent)' : 'inherit',
        borderColor: isSaved ? 'var(--accent)' : 'inherit'
      }}
      title={isSaved ? "Unsave Job" : "Save Job"}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
      </svg>
      {showLabel && (isSaved ? "Saved" : "Save Job")}
    </button>
  );
}
