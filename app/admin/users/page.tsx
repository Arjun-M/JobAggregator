"use client";

import { useEffect, useState } from "react";
import { getAdminToken } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { AdminShell } from "@/components/AdminShell";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = getAdminToken();
      const data = await apiFetch<any[]>("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = async (userId: string, action: string) => {
    if (action === "delete" && !confirm("Are you sure you want to delete this user?")) return;
    
    try {
      const token = getAdminToken();
      if (action === "delete") {
        await apiFetch(`/api/admin/users?userId=${userId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await apiFetch("/api/admin/users", {
          method: "PATCH",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({ userId, action })
        });
      }
      fetchUsers();
    } catch (err) {
      alert("Action failed");
    }
  };

  return (
    <AdminShell>
      <div style={{ padding: '2rem' }}>
        <h1 style={{ marginBottom: '2rem' }}>User Management</h1>
        <div className="panel" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--line)', textAlign: 'left' }}>
                <th style={{ padding: '1rem' }}>Username</th>
                <th style={{ padding: '1rem' }}>Email</th>
                <th style={{ padding: '1rem' }}>Role</th>
                <th style={{ padding: '1rem' }}>Status</th>
                <th style={{ padding: '1rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} style={{ borderBottom: '1px solid var(--line)' }}>
                  <td style={{ padding: '1rem' }}>{user.username}</td>
                  <td style={{ padding: '1rem' }}>{user.email}</td>
                  <td style={{ padding: '1rem' }}><span className="badge secondary">{user.role}</span></td>
                  <td style={{ padding: '1rem' }}>
                    {user.is_banned ? <span style={{ color: 'var(--danger)' }}>Banned</span> : <span style={{ color: 'var(--success)' }}>Active</span>}
                  </td>
                  <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                    {user.is_banned ? (
                      <button onClick={() => handleAction(user._id, "unban")} className="button secondary small">Unban</button>
                    ) : (
                      <button onClick={() => handleAction(user._id, "ban")} className="button secondary small" style={{ color: 'var(--danger)' }}>Ban</button>
                    )}
                    <button onClick={() => handleAction(user._id, "delete")} className="button secondary small" style={{ color: 'var(--danger)' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <div style={{ padding: '2rem', textAlign: 'center' }}>Loading users...</div>}
          {!loading && users.length === 0 && <div style={{ padding: '2rem', textAlign: 'center' }}>No users found</div>}
        </div>
      </div>
    </AdminShell>
  );
}
