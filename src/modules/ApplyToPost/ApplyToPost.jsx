'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

import { applyToPost } from '@/services/api/postRole/api';
import { handleError } from '@/utils/errorHandler';
import Modal from '@/shared/Modal/Modal';
import FormInput from '@/shared/FormInput/FormInput';
import s from './ApplyToPost.module.scss';

const validationSchema = Yup.object({
  appliedRole: Yup.string().required('Выберите роль из списка'),
  message: Yup.string().max(2000, 'Слишком длинное сообщение'),
});

export default function ApplyToPost({
  post,
  currentUser,
  onApplied,
  initialApplied = false,
}) {
  const [open, setOpen] = useState(false);
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
    setFormError('');
    setOpen(true);
  };

  const closeModal = () => {
    setOpen(false);
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setFormError('');
    try {
      await applyToPost(String(post._id), {
        appliedRole: values.appliedRole,
        message: values.message,
      });
      setApplied(true);
      if (typeof onApplied === 'function')
        onApplied(post._id, values.appliedRole);
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
      setSubmitting(false);
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

          <Formik
            initialValues={{ appliedRole: '', message: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className={s.form}>
                {/* ─── Роль (select через Formik) ─── */}
                <div className={s.field}>
                  <label htmlFor="appliedRole" className={s.label}>
                    Роль
                  </label>
                  <div className={s.selectWrap}>
                    <Field
                      as="select"
                      id="appliedRole"
                      name="appliedRole"
                      className={s.select}
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
                    </Field>
                    <span className={s.selectChevron} aria-hidden>
                      ▾
                    </span>
                  </div>
                  <ErrorMessage
                    name="appliedRole"
                    component="p"
                    className={s.error}
                  />
                </div>

                <FormInput
                  label="Сообщение (необязательно)"
                  name="message"
                  as="textarea"
                  placeholder="Расскажите кратко о себе и почему вам интересен проект…"
                />

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
                    disabled={isSubmitting}
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className={s.btnPrimary}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Отправляем…' : 'Отправить заявку'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </Modal>
    </>
  );
}
