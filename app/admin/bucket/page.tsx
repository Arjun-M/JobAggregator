"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/AdminShell";
import { getToken } from "@/lib/auth";

interface BucketAsset {
  public_id: string;
  secure_url: string;
  format: string;
  created_at: string;
  bytes: number;
}

interface RawUpload {
  _id: string;
  image_url: string;
  status: string;
  created_at: string;
}

export default function AdminBucketPage() {
  const [data, setData] = useState<{ database_records: RawUpload[], bucket_assets: BucketAsset[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/bucket", {
          headers: {
            Authorization: `Bearer ${getToken()}`
          }
        });
        if (!res.ok) throw new Error("Failed to fetch bucket data");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const closeModal = () => setSelectedImage(null);

  return (
    <AdminShell>
      <div className="page-stack">
        <section className="panel" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>S3 Bucket Storage</h1>
              <p className="muted" style={{ margin: '0.5rem 0 0' }}>Direct view of assets stored in the bucket and their database sync status.</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' }}>Total Assets</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)' }}>{data?.bucket_assets.length || 0}</div>
            </div>
          </div>
        </section>

        {loading ? (
          <div className="panel empty-state">
            <p className="muted">Loading bucket data...</p>
          </div>
        ) : error ? (
          <div className="panel" style={{ padding: '2rem', color: 'var(--danger)', borderLeft: '4px solid var(--danger)' }}>
            <h3 style={{ margin: 0 }}>Connection Error</h3>
            <p style={{ margin: '0.5rem 0 0' }}>{error}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Bucket Assets Table */}
            <section className="panel" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--line)', background: 'var(--panel-strong)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Bucket Assets (S3)</h2>
                <span className="badge" style={{ background: 'var(--accent-soft)', color: 'var(--accent-deep)', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>Cloud Storage</span>
              </div>
              <div className="scroll-x">
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg)', color: 'var(--muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Asset ID</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Format</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Size</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Created At</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.bucket_assets.map((asset) => (
                      <tr key={asset.public_id} style={{ borderBottom: '1px solid var(--line)', transition: 'background 0.2s' }}>
                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.8125rem', fontWeight: 500, color: 'var(--ink)' }}>{asset.public_id}</td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'var(--panel-strong)', borderRadius: '4px', fontWeight: 600, color: 'var(--muted)' }}>{asset.format.toUpperCase()}</span>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.8125rem', color: 'var(--muted)' }}>{(asset.bytes / 1024).toFixed(1)} KB</td>
                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.8125rem', color: 'var(--muted)' }}>{new Date(asset.created_at).toLocaleDateString()}</td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                          <button 
                            onClick={() => setSelectedImage(asset.secure_url)} 
                            className="button secondary" 
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                          >
                            Preview
                          </button>
                        </td>
                      </tr>
                    ))}
                    {data?.bucket_assets.length === 0 && (
                      <tr><td colSpan={5} style={{ padding: '4rem', textAlign: 'center' }} className="muted">No assets found in bucket.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Database Records Table */}
            <section className="panel" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--line)', background: 'var(--panel-strong)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Raw Uploads (Database Records)</h2>
                <span className="badge" style={{ background: '#ecfdf5', color: '#059669', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>MongoDB</span>
              </div>
              <div className="scroll-x">
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: 'var(--bg)', color: 'var(--muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Status</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Asset</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Created At</th>
                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.database_records.map((record) => (
                      <tr key={record._id} style={{ borderBottom: '1px solid var(--line)' }}>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <span style={{ 
                            fontSize: '0.7rem', 
                            fontWeight: 700, 
                            textTransform: 'uppercase', 
                            padding: '0.25rem 0.5rem', 
                            borderRadius: '4px',
                            background: record.status === 'done' ? '#dcfce7' : record.status === 'failed' ? '#fee2e2' : '#fef9c3',
                            color: record.status === 'done' ? '#166534' : record.status === 'failed' ? '#991b1b' : '#854d0e'
                          }}>
                            {record.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.8125rem', color: 'var(--muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                           {record.image_url.split('/').pop()}
                        </td>
                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.8125rem', color: 'var(--muted)' }}>{new Date(record.created_at).toLocaleString()}</td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                          <button 
                            onClick={() => setSelectedImage(record.image_url)}
                            style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                          >
                            View Image
                          </button>
                        </td>
                      </tr>
                    ))}
                    {data?.database_records.length === 0 && (
                      <tr><td colSpan={4} style={{ padding: '4rem', textAlign: 'center' }} className="muted">No database records found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>

      {/* Image Modal Viewer */}
      {selectedImage && (
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(15, 23, 42, 0.9)', 
            display: 'flex', justifyContent: 'center', alignItems: 'center', 
            zIndex: 1000,
            padding: '2rem',
            backdropFilter: 'blur(4px)'
          }}
          onClick={closeModal}
        >
          <div 
            style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={closeModal}
              style={{ 
                position: 'absolute', top: '-2.5rem', right: '-1rem', 
                background: 'none', border: 'none', color: 'white', 
                fontSize: '2rem', cursor: 'pointer' 
              }}
            >
              &times;
            </button>
            <img 
              src={selectedImage} 
              alt="Preview" 
              style={{ 
                maxWidth: '100%', maxHeight: '85vh', 
                borderRadius: 'var(--radius-lg)', 
                boxShadow: 'var(--shadow-lg)',
                border: '4px solid white'
              }} 
            />
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
              <a 
                href={selectedImage} 
                target="_blank" 
                rel="noreferrer" 
                className="button secondary"
                style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}
              >
                Open Original
              </a>
            </div>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
