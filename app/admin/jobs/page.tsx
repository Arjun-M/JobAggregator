"use client";

import { useEffect, useState } from "react";
import { getAdminToken } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { AdminShell } from "@/components/AdminShell";
import Link from "next/link";

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const token = getAdminToken();
      const res = await apiFetch<any>(`/api/admin/jobs?q=${encodeURIComponent(query)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setJobs(res.items || []);
    } catch (err) {
      console.error("Failed to fetch jobs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [query]);

  const handleAction = async (jobId: string, action: string) => {
    if (action === "delete" && !confirm("Delete this job permanently?")) return;
    
    try {
      const token = getAdminToken();
      if (action === "delete") {
        await apiFetch(`/api/admin/jobs/${jobId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await apiFetch(`/api/admin/jobs/${jobId}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ action })
        });
      }
      fetchJobs();
    } catch (err) {
      alert("Action failed");
    }
  };

  return (
    <AdminShell>
      <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1>Manage Job Opportunities</h1>
          <input 
            type="text" 
            placeholder="Search by title, org, or location..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input-static"
            style={{ maxWidth: '300px' }}
          />
        </div>

        <div className="panel" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--line)', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>Organization</th>
                <th style={{ padding: '1rem' }}>Title</th>
                <th style={{ padding: '1rem' }}>Location</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job._id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '1rem' }}>{job.job.organization}</td>
                  <td style={{ padding: '1rem' }}>{job.job.title}</td>
                  <td style={{ padding: '1rem' }}>{job.job.location}</td>
                  <td style={{ padding: '1rem' }}>
                    {job.archived_at ? <span className="badge secondary">Archived</span> : <span className="badge success">Active</span>}
                  </td>
                  <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <Link href={`/admin/staging/${job.staging_id || job._id}`} className="button secondary small">Edit</Link>
                    {job.archived_at ? (
                      <button onClick={() => handleAction(job._id, "unarchive")} className="button secondary small">Unarchive</button>
                    ) : (
                      <button onClick={() => handleAction(job._id, "archive")} className="button secondary small">Archive</button>
                    )}
                    <button onClick={() => handleAction(job._id, "delete")} className="button secondary small" style={{ color: 'var(--danger)' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div style={{ padding: '2rem', textAlign: 'center' }}>Loading jobs...</div>}
          {!loading && jobs.length === 0 && <div style={{ padding: '2rem', textAlign: 'center' }}>No jobs found</div>}
        </div>
      </div>
    </AdminShell>
  );
}
