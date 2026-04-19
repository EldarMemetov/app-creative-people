'use client';

import React, { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import FormInput from '@/shared/FormInput/FormInput';
import { postFormSchema } from '@/shared/postFormSchema/postFormSchema';
import {
  createPost,
  createPostWithMedia,
  updatePost,
  uploadPostMedia,
  deletePostMedia,
} from '../../../services/api/post/api';
import styles from './CreatePostForm.module.scss';
import { useRouter } from 'next/navigation';
import roles from '@/utils/roles';
import Image from 'next/image';

const MAX_PHOTO_COUNT = 3;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

const getBerlinTodayISO = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });

export default function CreatePostForm({ initial = null }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [newFiles, setNewFiles] = useState([]);
  const [existingMedia, setExistingMedia] = useState(initial?.media ?? []);
  const isEdit = Boolean(initial && initial._id);

  useEffect(() => {
    setExistingMedia(initial?.media ?? []);
  }, [initial]);

  const formatDateForInput = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return '';
    return dt.toISOString().slice(0, 10);
  };

  const initialValues = {
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    country: initial?.country ?? '',
    city: initial?.city ?? '',
    date: initial ? formatDateForInput(initial.date) : '',
    hasNoDate: initial?.hasNoDate ?? false,
    type: initial?.type ?? 'tfp',
    price: initial?.price ?? 0,
    percent: initial?.percent ?? 0,
    roleSlots: initial?.roleSlots ?? [],
    maxAssigned: initial?.maxAssigned ?? 5,
  };

  const countExisting = () => {
    let photos = 0;
    existingMedia.forEach((m) => (m.type === 'photo' ? photos++ : null));
    return { photos };
  };

  const countNewFiles = (filesArr) => {
    let photos = 0;
    filesArr.forEach((f) => {
      if (f.type.startsWith('image')) photos++;
    });
    return { photos };
  };

  const handleFilesChange = (e) => {
    const list = Array.from(e.target.files || []);
    if (list.length === 0) return;

    const existing = countExisting();
    const newCounts = countNewFiles(list);

    if (existing.photos + newCounts.photos > MAX_PHOTO_COUNT) {
      alert(
        `Можно загрузить максимум ${MAX_PHOTO_COUNT} фото (включая уже загруженные).`
      );
      return;
    }

    for (const f of list) {
      if (!f.type.startsWith('image')) {
        alert('Можно загружать только изображения');
        return;
      }
      if (f.size > MAX_PHOTO_BYTES) {
        alert(
          `${f.name} превышает максимальный размер фото ${MAX_PHOTO_BYTES / (1024 * 1024)}MB`
        );
        return;
      }
    }

    setNewFiles((prev) => [...prev, ...list]);
    e.target.value = '';
  };

  const removeNewFile = (index) =>
    setNewFiles((prev) => prev.filter((_, i) => i !== index));

  const removeExistingMedia = async (mediaId) => {
    if (!isEdit) return;
    if (!confirm('Удалить это медиа?')) return;
    try {
      await deletePostMedia(initial._id, mediaId);
      setExistingMedia((prev) =>
        prev.filter((m) => String(m._id) !== String(mediaId))
      );
    } catch (err) {
      console.error('Failed to delete media', err);
      alert('Ошибка при удалении медиа');
    }
  };

  const isDateInPastBerlin = (value) => {
    if (!value) return false;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return false;
    const parsedStr = parsed.toISOString().slice(0, 10);
    const berlinTodayStr = getBerlinTodayISO();
    return parsedStr < berlinTodayStr;
  };

  const onSubmit = async (
    values,
    { setSubmitting: setFormikSubmitting, setErrors }
  ) => {
    setSubmitting(true);
    setFormikSubmitting(true);

    const roleSlots = values.roleSlots || [];

    if (!values.hasNoDate && values.date && isDateInPastBerlin(values.date)) {
      setErrors({ date: 'Дата не может быть в прошлом' });
      setSubmitting(false);
      setFormikSubmitting(false);
      return;
    }

    if (!Array.isArray(roleSlots) || roleSlots.length === 0) {
      setErrors({ roleSlots: 'Выберите хотя бы одну роль' });
      setSubmitting(false);
      setFormikSubmitting(false);
      return;
    }

    try {
      const payload = {
        title: values.title,
        description: values.description,
        country: values.country,
        city: values.city,
        hasNoDate: values.hasNoDate,
        date:
          values.hasNoDate || !values.date
            ? undefined
            : new Date(values.date).toISOString(),
        type: values.type,
        price: values.type === 'paid' ? Number(values.price) : 0,
        percent: values.type === 'percent' ? Number(values.percent) : 0,
        maxAssigned: values.maxAssigned,
        roleSlots,
      };

      let resultPost = null;
      if (isEdit) {
        resultPost = await updatePost(initial._id, payload);
        if (newFiles.length > 0) {
          await uploadPostMedia(initial._id, newFiles);
        }
      } else {
        if (newFiles.length > 0) {
          resultPost = await createPostWithMedia({ payload, files: newFiles });
        } else {
          resultPost = await createPost(payload);
        }
      }

      const savedPost = resultPost.data || resultPost;
      router.push(`/posts/${savedPost._id}`);
    } catch (err) {
      console.error('submit error', err);
      alert('Ошибка при сохранении поста');
    } finally {
      setSubmitting(false);
      setFormikSubmitting(false);
    }
  };

  return (
    <div className={styles.formWrap}>
      <h2>{isEdit ? 'Редактировать пост' : 'Создать пост'}</h2>

      <Formik
        enableReinitialize={true}
        initialValues={initialValues}
        validationSchema={postFormSchema}
        onSubmit={onSubmit}
      >
        {({ values, setFieldValue, errors }) => (
          <Form className={styles.form}>
            <FormInput
              label="Заголовок"
              name="title"
              placeholder="Название поста"
            />
            <FormInput
              as="textarea"
              label="Описание"
              name="description"
              placeholder="Описание..."
            />
            <FormInput label="Страна" name="country" />
            <FormInput label="Город" name="city" />

            {/* Дата + чекбокс "без даты" */}
            <div className={styles.dateRow}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={values.hasNoDate}
                  onChange={(e) => {
                    setFieldValue('hasNoDate', e.target.checked);
                    if (e.target.checked) setFieldValue('date', '');
                  }}
                />
                Дата не определена
              </label>

              {!values.hasNoDate && (
                <FormInput
                  label="Дата"
                  name="date"
                  type="date"
                  min={getBerlinTodayISO()}
                />
              )}
            </div>

            {/* Тип оплаты */}
            <div className={styles.row}>
              <div>
                <label>Тип оплаты</label>
                <select
                  name="type"
                  value={values.type}
                  onChange={(e) => {
                    setFieldValue('type', e.target.value);
                    // сбрасываем числовые поля при смене типа
                    setFieldValue('price', 0);
                    setFieldValue('percent', 0);
                  }}
                >
                  <option value="tfp">TFP (Time for Portfolio)</option>
                  <option value="paid">Paid (фиксированная сумма)</option>
                  <option value="percent">Percent (процент от дохода)</option>
                  <option value="negotiable">Negotiable (договорная)</option>
                </select>
              </div>

              {values.type === 'paid' && (
                <div>
                  <FormInput
                    label="Цена (€)"
                    name="price"
                    type="number"
                    min={1}
                  />
                </div>
              )}

              {values.type === 'percent' && (
                <div>
                  <FormInput
                    label="Процент (%)"
                    name="percent"
                    type="number"
                    min={1}
                    max={100}
                  />
                </div>
              )}
            </div>

            {/* Роли */}
            <div className={styles.roleSection}>
              <label>Роли</label>
              <div className={styles.quickButtons}>
                <span>Быстрые роли:</span>
                {roles.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      const parsed = [...(values.roleSlots || [])];
                      parsed.push({ role: r, required: 1 });
                      setFieldValue('roleSlots', parsed);
                    }}
                    className={styles.roleBtn}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {Array.isArray(values.roleSlots) &&
              values.roleSlots.length > 0 ? (
                <div className={styles.selectedRoles}>
                  {values.roleSlots.map((rs, idx) => (
                    <div key={idx} className={styles.selectedRole}>
                      <span>{rs.role}</span>
                      <input
                        type="number"
                        min={1}
                        value={rs.required}
                        onChange={(e) => {
                          const newSlots = [...values.roleSlots];
                          newSlots[idx] = {
                            ...newSlots[idx],
                            required: Math.max(1, Number(e.target.value)),
                          };
                          setFieldValue('roleSlots', newSlots);
                        }}
                        style={{ width: 50 }}
                      />
                      <button
                        type="button"
                        className={styles.removeRoleBtn}
                        onClick={() => {
                          const newSlots = [...(values.roleSlots || [])];
                          newSlots.splice(idx, 1);
                          setFieldValue('roleSlots', newSlots);
                        }}
                      >
                        Удалить
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.noRoles}>Роли не выбраны</div>
              )}

              {errors.roleSlots && (
                <div className={styles.error}>{errors.roleSlots}</div>
              )}
            </div>

            {/* Файлы */}
            <div className={styles.filesRow}>
              <label>Файлы (фото): макс {MAX_PHOTO_COUNT}</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesChange}
              />
              {newFiles.length > 0 && (
                <p>{newFiles.length} новых файлов готовы к загрузке</p>
              )}
            </div>

            {existingMedia.length > 0 && (
              <div className={styles.mediaList}>
                <h4>Загруженные медиа</h4>
                <div className={styles.mediaGrid}>
                  {existingMedia.map((m) => (
                    <div key={m._id} className={styles.mediaCard}>
                      <Image
                        width={100}
                        height={100}
                        src={m.url}
                        alt="media"
                        className={styles.mediaThumb}
                      />
                      <button
                        type="button"
                        className={styles.removeBtn}
                        onClick={() => removeExistingMedia(m._id)}
                      >
                        Удалить
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {newFiles.length > 0 && (
              <div className={styles.mediaList}>
                <h4>Новые файлы (еще не загружены)</h4>
                <div className={styles.mediaGrid}>
                  {newFiles.map((f, i) => {
                    const url = URL.createObjectURL(f);
                    return (
                      <div key={i} className={styles.mediaCard}>
                        <Image
                          width={100}
                          height={100}
                          src={url}
                          alt={f.name}
                          className={styles.mediaThumb}
                        />
                        <div className={styles.mediaInfo}>
                          <div>{f.name}</div>
                          <div>{(f.size / (1024 * 1024)).toFixed(2)} MB</div>
                          <button
                            type="button"
                            onClick={() => removeNewFile(i)}
                            className={styles.removeBtn}
                          >
                            Удалить
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className={styles.actions}>
              <button type="submit" disabled={submitting}>
                {isEdit ? 'Сохранить' : 'Создать пост'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
