'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { applyToPost } from '@/services/api/postRole/api';
import { handleError } from '@/utils/errorHandler';
import Modal from '@/shared/Modal/Modal';
import s from './ApplyToPost.module.scss';

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
  const [formError, setFormError] = useState('');

  useEffect(() => {
    setApplied(Boolean(initialApplied));
  }, [initialApplied]);

  const userRoles = useMemo(() => {
    if (!currentUser) return [];
    if (Array.isArray(currentUser.roles)) return currentUser.roles.map(String);
    if (currentUser.role) return [String(currentUser.role)];
    return [];
  }, [currentUser]);

  const rolesWithAvailability = useMemo(() => {
    if (!post?.roleSlots) return [];
    return post.roleSlots.map((slot) => {
      const assignedCount = (slot.assigned && slot.assigned.length) || 0;
      const available = Math.max(0, (slot.required || 1) - assignedCount);
      return {
        role: slot.role,
        required: slot.required || 1,
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
    setFormError('');
    setOpen(true);
  };

  const closeModal = () => {
    if (loading) return;
    setOpen(false);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setFormError('');

    if (!selectedRole) {
      setFormError('Выберите роль из списка');
      return;
    }

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
      setFormError(
        err?.response?.data?.message ||
          err?.message ||
          'Не удалось отправить заявку'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!canApply) return null;

  return (
    <>
      <button
        type="button"
        className={`${s.triggerButton} ${applied ? s.triggerApplied : ''}`}
        onClick={openModal}
        disabled={applied}
      >
        {applied ? 'Заявка отправлена' : 'Откликнуться'}
      </button>

      <Modal show={open} onClose={closeModal} contentClassName={s.modalPanel}>
        <div className={s.modalContent}>
          <header className={s.modalHeader}>
            <span className={s.eyebrow}>
              <span className={s.eyebrowDot} />
              Заявка
            </span>
            <h3 className={s.title}>Откликнуться на «{post.title}»</h3>
            <p className={s.subtitle}>
              Выберите свою роль и при желании оставьте сообщение автору.
            </p>
          </header>

          <form className={s.form} onSubmit={handleSubmit}>
            <div className={s.field}>
              <label className={s.label} htmlFor="apply-role">
                Роль
              </label>
              <div className={s.selectWrap}>
                <select
                  id="apply-role"
                  className={s.select}
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                >
                  <option value="">— выберите роль —</option>
                  {rolesWithAvailability.map((r) => {
                    const allowed = userRoles.includes(String(r.role));
                    return (
                      <option
                        key={r.role}
                        value={r.role}
                        disabled={r.available <= 0 || !allowed}
                      >
                        {r.role}
                        {r.available <= 0
                          ? ' (мест нет)'
                          : ` — свободно: ${r.available}`}
                        {!allowed ? ' (не в ваших ролях)' : ''}
                      </option>
                    );
                  })}
                </select>
                <span className={s.selectChevron} aria-hidden>
                  ▾
                </span>
              </div>
            </div>

            <div className={s.field}>
              <label className={s.label} htmlFor="apply-message">
                Сообщение <span className={s.optional}>(необязательно)</span>
              </label>
              <textarea
                id="apply-message"
                className={s.textarea}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                placeholder="Расскажите кратко о себе и почему вам интересен проект…"
              />
            </div>

            {formError && (
              <div className={s.errorBox} role="alert">
                {formError}
              </div>
            )}

            <div className={s.actions}>
              <button
                type="button"
                className={s.btnGhost}
                onClick={closeModal}
                disabled={loading}
              >
                Отмена
              </button>
              <button type="submit" className={s.btnPrimary} disabled={loading}>
                {loading ? 'Отправляем…' : 'Отправить заявку'}
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
