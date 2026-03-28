'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { applyToPost } from '@/services/api/postRole/api';
import { handleError } from '@/utils/errorHandler';

export default function ApplyToPost({
  post,
  currentUser,
  onApplied,
  initialApplied = false,
}) {
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(Boolean(initialApplied));

  useEffect(() => {
    setApplied(Boolean(initialApplied));
  }, [initialApplied]);

  // normalize user roles
  const userRoles = useMemo(() => {
    if (!currentUser) return [];
    if (Array.isArray(currentUser.roles)) return currentUser.roles.map(String);
    if (currentUser.role) return [String(currentUser.role)];
    return [];
  }, [currentUser]);

  // compute roles with availability
  const rolesWithAvailability = useMemo(() => {
    if (!post?.roleSlots) return [];
    return post.roleSlots.map((s) => {
      const assignedCount = (s.assigned && s.assigned.length) || 0;
      const available = Math.max(0, (s.required || 1) - assignedCount);
      return {
        role: s.role,
        required: s.required || 1,
        assignedCount,
        available,
      };
    });
  }, [post]);

  const isAuthor =
    currentUser &&
    String(currentUser._id) === String(post.author?._id || post.author);

  const canApply =
    post?.status === 'open' &&
    !isAuthor &&
    rolesWithAvailability.some((r) => r.available > 0) &&
    !!currentUser;

  const openModal = () => {
    if (applied) return;
    setSelectedRole('');
    setMessage('');
    setOpen(true);
  };

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    if (!selectedRole) return alert('Choose a role');
    setLoading(true);
    try {
      await applyToPost(String(post._id), {
        appliedRole: selectedRole,
        message,
      });
      setApplied(true);
      if (typeof onApplied === 'function') onApplied(post._id, selectedRole);
      setOpen(false);
    } catch (err) {
      console.error(err);
      handleError?.(err);
      alert(err?.response?.data?.message || err?.message || 'Failed to apply');
    } finally {
      setLoading(false);
    }
  };

  if (!canApply) return null;

  return (
    <div>
      <button onClick={openModal} disabled={applied}>
        {applied ? 'Applied' : 'Apply'}
      </button>

      {open && (
        <div
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.4)',
            zIndex: 1000,
          }}
          onClick={() => setOpen(false)}
        >
          <div
            style={{
              width: 400,
              background: '#fff',
              padding: 16,
              borderRadius: 8,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Apply to {post.title}</h3>
            <form onSubmit={handleSubmit}>
              <label>Role</label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                style={{ width: '100%', padding: 8 }}
              >
                <option value="">— choose role —</option>
                {rolesWithAvailability.map((r) => {
                  const allowed = userRoles.includes(String(r.role));
                  return (
                    <option
                      key={r.role}
                      value={r.role}
                      disabled={r.available <= 0 || !allowed}
                    >
                      {r.role}{' '}
                      {r.available <= 0
                        ? '(filled)'
                        : `— slots: ${r.available}`}{' '}
                      {!allowed ? ' (not in your roles)' : ''}
                    </option>
                  );
                })}
              </select>

              <label style={{ display: 'block', marginTop: 12 }}>
                Message (optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                style={{ width: '100%', padding: 8 }}
              />

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 8,
                  marginTop: 12,
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? 'Sending…' : 'Submit application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
