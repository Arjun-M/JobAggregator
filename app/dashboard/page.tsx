"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getUserToken, getUserData, clearUserSession } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import { JOB_TAXONOMY } from "@/lib/job_taxonomy";
import { JobCard } from "@/components/JobCard";

interface RecursiveCheckboxGroupProps {
  title: string;
  options: (string | { [key: string]: string[] })[];
  selected: string[];
  onChange: (value: string[]) => void;
  depth?: number;
}

// Recursive Checkbox Group Component
const RecursiveCheckboxGroup = ({ title, options, selected, onChange, depth = 0 }: RecursiveCheckboxGroupProps) => {
  const [isOpen, setIsOpen] = useState(false); // Collapsed by default

  // Helper to flatten options for 'Select All' logic and internal checks
  const flattenOptions = useCallback((opts: (string | { [key: string]: string[] })[]) => {
    let flattened: string[] = [];
    opts.forEach(opt => {
      if (typeof opt === 'string') {
        flattened.push(opt);
      } else { // Nested object (e.g., { 'Engineering / Technical': [...] })
        // Assuming nested options are always string arrays
        flattened = flattened.concat(Object.values(opt)[0] as string[]);
      }
    });
    return flattened;
  }, []);

  const currentLevelFlatOptions = flattenOptions(options);
  const isAllSelected = currentLevelFlatOptions.every(option => selected.includes(option));
  const isIndeterminate = currentLevelFlatOptions.some(option => selected.includes(option)) && !isAllSelected;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Add all current level options that are not already selected
      onChange(Array.from(new Set([...selected, ...currentLevelFlatOptions])));
    } else {
      // Remove all current level options from selected
      onChange(selected.filter(item => !currentLevelFlatOptions.includes(item)));
    }
  };

  const handleOptionChange = (option: string | { [key: string]: string[] }, checked: boolean) => {
    if (typeof option === 'string') { // Leaf option
      if (checked) {
        onChange([...selected, option]);
      } else {
        onChange(selected.filter(item => item !== option));
      }
    } else { // Group option (e.g., { 'Engineering / Technical': [...] })
      const subOptions = Object.values(option)[0] as string[]; // Get the array of sub-options
      if (checked) {
        // Add all sub-options that are not already selected
        onChange(Array.from(new Set([...selected, ...subOptions])));
      } else {
        // Remove all sub-options from selected
        onChange(selected.filter(item => !subOptions.includes(item)));
      }
    }
  };

  return (
    <div style={{ paddingLeft: depth > 0 ? '1rem' : '0' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          marginBottom: '0.5rem',
          fontWeight: depth === 0 ? '600' : '500',
          fontSize: depth === 0 ? '1rem' : '0.9rem',
          color: depth === 0 ? 'var(--ink)' : 'var(--muted)',
          padding: '0.5rem 0',
          borderBottom: depth === 0 ? '1px solid var(--line)' : 'none'
        }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>
          {title}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)'
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
      {isOpen && (
        <div style={{ borderLeft: depth > 0 ? '1px solid var(--line)' : 'none' }}>
          {options.length > 0 && (
            <label className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', cursor: 'pointer', paddingLeft: '1rem' }}>
              <input
                type="checkbox"
                checked={isAllSelected}
                // Correct way to pass indeterminate as a prop
                ref={el => { if (el) el.indeterminate = isIndeterminate; }}
                onChange={(e) => handleSelectAll(e.target.checked)}
                style={{ width: '1rem', height: '1rem', accentColor: 'var(--accent)' }}
              />
              <span style={{ fontWeight: '600', color: 'var(--accent)', fontSize: '0.875rem' }}>Select All ({title})</span>
            </label>
          )}

          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {options.map((option, index) => {
              if (typeof option === 'string') {
                const uniqueKey = `${title}-${option.replace(/\s+/g, '-')}-${index}`; // Generate unique key
                return (
                  <label key={uniqueKey} className="field" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', paddingLeft: '1rem' }}>
                    <input
                      type="checkbox"
                      checked={selected.includes(option)}
                      onChange={(e) => handleOptionChange(option, e.target.checked)}
                      style={{ width: '1rem', height: '1rem', accentColor: 'var(--accent)' }}
                    />
                    <span>{option}</span>
                  </label>
                );
              } else { // Nested object (e.g., { 'Engineering / Technical': [...] })
                const groupName = Object.keys(option)[0];
                const subOptions = Object.values(option)[0] as string[];
                const uniqueKey = `${title}-${groupName?.replace(/\s+/g, '-') || index}-${index}`; // Generate unique key for nested group
                return (
                  <RecursiveCheckboxGroup
                    key={uniqueKey}
                    title={groupName || 'Unknown'}
                    options={subOptions}
                    selected={selected}
                    onChange={onChange} // Pass the same onChange for consistency
                    depth={depth + 1}
                  />
                );
              }
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default function UserDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const userData = getUserData();

  useEffect(() => {
    const token = getUserToken();
    if (!token) {
      router.push("/login");
      return;
    }

    async function loadData() {
      try {
        const [profileData, statsData, savedJobsData] = await Promise.all([
          apiFetch<any>("/api/user/profile", { headers: { Authorization: `Bearer ${token}` } }),
          apiFetch<any>("/api/user/reports"),
          apiFetch<any>("/api/user/saved-jobs", { headers: { Authorization: `Bearer ${token}` } })
        ]);
        // Initialize multi-select fields if they are null/undefined
        const initializedProfile = {
          ...profileData,
          personalized_filters: {
            employment_types: [],
            industries: [],
            functional_roles: [],
            seniority_levels: [],
            locations: [],
            min_salary: null,
            ...profileData.personalized_filters,
          }
        };
        setProfile(initializedProfile);
        setStats(statsData);
        setSavedJobs(savedJobsData.items || []);
      } catch (err) {
        console.error("Dashboard load failed", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const token = getUserToken();
      await apiFetch("/api/user/profile", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(profile)
      });
      alert("Settings saved successfully!");
    } catch (err) {
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  const updateFilter = (key: string, value: string[]) => {
    setProfile((prev: any) => ({
      ...prev,
      personalized_filters: {
        ...prev.personalized_filters,
        [key]: value
      }
    }));
  };

  if (loading) return <div className="shell" style={{ padding: '4rem', textAlign: 'center' }}>Loading your dashboard...</div>;

  return (
    <main className="shell page-stack" style={{ paddingTop: '2rem' }}>
      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem', gap: '1rem' }}>
        <div>
          <p className="eyebrow">Personalized Dashboard</p>
          <h1>Hello, {userData?.username}</h1>
        </div>
        <div className="dashboard-header-actions" style={{ display: 'flex', gap: '0.75rem' }}>
          <Link href="/" className="button secondary">Back to Listings</Link>
          <button className="button secondary logout-btn" style={{ color: 'var(--danger)' }} onClick={() => { clearUserSession(); router.push("/"); }}>Logout</button>
        </div>
      </header>

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2rem', alignItems: 'start' }}>
        <section className="dashboard-main">
          <div className="panel dashboard-panel" style={{ padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Your Preferences</h2>
            <form onSubmit={handleUpdateProfile} style={{ display: 'grid', gap: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Personalized Filters</h3>
                <p className="muted" style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>Narrow down your feed by specifying roles, locations, employment types, and more.</p>

                <div className="filters-stack" style={{ display: 'grid', gap: '1.5rem' }}>
                  <RecursiveCheckboxGroup
                    title="Employment Types"
                    options={JOB_TAXONOMY.employmentTypes}
                    selected={profile?.personalized_filters?.employment_types || []}
                    onChange={(val) => updateFilter('employment_types', val)}
                  />

                  {/* Industries */}
                  <RecursiveCheckboxGroup
                    title="Industries"
                    options={Object.keys(JOB_TAXONOMY.industries).map(key => ({ [key]: (JOB_TAXONOMY.industries as any)[key] }))}
                    selected={profile?.personalized_filters?.industries || []}
                    onChange={(val) => updateFilter('industries', val)}
                  />

                  {/* Functional Roles */}
                  <RecursiveCheckboxGroup
                    title="Functional Roles"
                    options={Object.keys(JOB_TAXONOMY.functionalRoles).map(key => ({ [key]: (JOB_TAXONOMY.functionalRoles as any)[key] }))}
                    selected={profile?.personalized_filters?.functional_roles || []}
                    onChange={(val) => updateFilter('functional_roles', val)}
                  />

                  <RecursiveCheckboxGroup
                    title="Seniority Levels"
                    options={JOB_TAXONOMY.seniorityLevels}
                    selected={profile?.personalized_filters?.seniority_levels || []}
                    onChange={(val) => updateFilter('seniority_levels', val)}
                  />

                  <label className="field">
                    <span className="field-label">Preferred Locations</span>
                    <input
                      value={profile?.personalized_filters?.locations?.join(", ") || ""}
                      onChange={e => setProfile({ ...profile, personalized_filters: { ...profile.personalized_filters, locations: e.target.value.split(",").map(s => s.trim()).filter(Boolean) } })}
                      placeholder="London, New York, Remote..."
                    />
                  </label>
                  <label className="field">
                    <span className="field-label">Minimum Salary (e.g., $50,000)</span>
                    <input
                      value={profile?.personalized_filters?.min_salary || ""}
                      onChange={e => setProfile({ ...profile, personalized_filters: { ...profile.personalized_filters, min_salary: e.target.value } })}
                      placeholder="e.g., $50,000 or 50k"
                    />
                  </label>
                </div>
              </div>

              <div style={{ padding: '1.5rem', background: 'var(--panel-strong)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={profile?.newsletter_subscription || false}
                    onChange={e => setProfile({ ...profile, newsletter_subscription: e.target.checked })}
                    style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer', accentColor: 'var(--accent)' }}
                  />
                  <div>
                    <span style={{ fontWeight: '600', display: 'block' }}>Weekly Job Digest</span>
                    <p className="muted" style={{ fontSize: '0.8125rem', margin: 0 }}>Receive a curated list of new roles matching your preferences every Monday.</p>
                  </div>
                </label>
              </div>

              <button className="button save-btn" type="submit" style={{ justifySelf: 'start', minWidth: '200px' }} disabled={saving}>
                {saving ? "Saving Changes..." : "Save Preferences"}
              </button>
            </form>
          </div>

          <div className="panel dashboard-panel" style={{ padding: '2.5rem', marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Saved Jobs</h2>
            {savedJobs.length > 0 ? (
              <div className="recent-list">
                {savedJobs.map((job) => (
                  <JobCard key={job._id.toString()} job={job} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <p className="muted">You haven't saved any jobs yet.</p>
                <Link href="/" className="muted" style={{ textDecoration: 'underline', fontSize: '0.875rem' }}>Browse listings to find roles you love.</Link>
              </div>
            )}
          </div>
        </section>

        <aside className="dashboard-aside">
          <div className="panel dashboard-panel" style={{ padding: '2rem', borderTop: '4px solid var(--accent)' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Board Activity</h2>

            <div className="stats-grid" style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ padding: '1.25rem', background: 'var(--panel-strong)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '1.75rem', fontWeight: '800' }}>{stats?.weekly_count || 0}</span>
                  <p className="muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>New this week</p>
                </div>
                <div style={{ background: 'var(--success)', width: '10px', height: '10px', borderRadius: '50%', boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.1)' }} />
              </div>

              <div style={{ padding: '1.25rem', background: 'var(--panel-strong)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '1.75rem', fontWeight: '800' }}>{stats?.monthly_count || 0}</span>
                  <p className="muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Past 30 days</p>
                </div>
              </div>

              <div style={{ padding: '1.25rem', background: 'var(--panel-strong)', borderRadius: 'var(--radius-md)', border: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '1.75rem', fontWeight: '800' }}>{stats?.archived_count || 0}</span>
                  <p className="muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Total Archive</p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2.5rem' }}>
              <h3 style={{ fontSize: '0.875rem', marginBottom: '1.25rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>Trending Now</h3>
              <div className="tag-row">
                {stats?.trending_tags?.map((tag: string) => (
                  <span key={tag} className="tag" style={{ background: 'white' }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="panel dashboard-panel report-promo" style={{ padding: '2rem', marginTop: '1.5rem', textAlign: 'center', background: 'linear-gradient(135deg, var(--accent-soft) 0%, #fff 100%)', border: '1px solid var(--accent-soft)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ marginBottom: '1rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></svg>
            </div>
            <p style={{ fontWeight: '700', color: 'var(--ink)', fontSize: '1rem', marginBottom: '0.5rem' }}>Weekly Market Report</p>
            <p className="muted" style={{ fontSize: '0.8125rem', marginBottom: '1.5rem', lineHeight: '1.4' }}>Your personalized weekly analysis based on {profile?.personalized_filters?.tags?.[0] || 'your interests'} is ready.</p>
            <a href="/reports/weekly" style={{ textDecoration: 'none' }}>
              <button className="button" style={{ width: '100%', fontSize: '0.875rem' }}>
                Download PDF
              </button>
            </a>
          </div>
        </aside>
      </div>
    </main>
  );
}
