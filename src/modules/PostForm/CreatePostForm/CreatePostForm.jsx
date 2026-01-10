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
const MAX_VIDEO_COUNT = 1;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 30 * 1024 * 1024;

const getBerlinTodayISO = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' }); // 'YYYY-MM-DD'

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
    title: '',
    description: '',
    country: '',
    city: '',
    date: '',
    type: 'tfp',
    price: 0,
    roleSlots: [],
    roleSlotsText: '',
    maxAssigned: 5,
    ...(initial
      ? {
          title: initial.title ?? '',
          description: initial.description ?? '',
          country: initial.country ?? '',
          city: initial.city ?? '',
          date: formatDateForInput(initial.date),
          type: initial.type ?? 'tfp',
          price: initial.price ?? 0,
          roleSlots: initial.roleSlots ?? [],
          roleSlotsText: initial.roleSlots
            ? JSON.stringify(initial.roleSlots, null, 2)
            : '',
          maxAssigned: initial.maxAssigned ?? 5,
        }
      : {}),
  };

  const countExisting = () => {
    let photos = 0,
      videos = 0;
    existingMedia.forEach((m) => (m.type === 'photo' ? photos++ : videos++));
    return { photos, videos };
  };

  const countNewFiles = (filesArr) => {
    let photos = 0,
      videos = 0;
    filesArr.forEach((f) => {
      if (f.type.startsWith('image')) photos++;
      else if (f.type.startsWith('video')) videos++;
    });
    return { photos, videos };
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
    if (existing.videos + newCounts.videos > MAX_VIDEO_COUNT) {
      alert(
        `Можно загрузить максимум ${MAX_VIDEO_COUNT} видео (включая уже загруженные).`
      );
      return;
    }

    for (const f of list) {
      if (f.type.startsWith('image')) {
        if (f.size > MAX_PHOTO_BYTES) {
          alert(
            `${f.name} превышает максимальный размер фото ${MAX_PHOTO_BYTES / (1024 * 1024)}MB`
          );
          return;
        }
      } else if (f.type.startsWith('video')) {
        if (f.size > MAX_VIDEO_BYTES) {
          alert(
            `${f.name} превышает максимальный размер видео ${MAX_VIDEO_BYTES / (1024 * 1024)}MB`
          );
          return;
        }
      } else {
        alert('Только изображения и видео разрешены');
        return;
      }
    }

    setNewFiles((prev) => [...prev, ...list]);
    e.target.value = '';
  };

  const removeNewFile = (index) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

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
    // сравниваем строковые YYYY-MM-DD — это надёжнее для "дата без времени"
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

    // парсим роли один раз и используем дальше
    let roleSlots = values.roleSlots || [];
    if (values.roleSlotsText && values.roleSlotsText.trim()) {
      try {
        const parsed = JSON.parse(values.roleSlotsText);
        if (Array.isArray(parsed)) roleSlots = parsed;
      } catch (e) {
        setErrors({ roleSlotsText: 'Невалидный JSON для ролей' });
        setSubmitting(false);
        setFormikSubmitting(false);
        return;
      }
    }

    // быстрые проверки на фронте (бек тоже должен проверять)
    if (values.date && isDateInPastBerlin(values.date)) {
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
        date: values.date ? new Date(values.date).toISOString() : undefined,
        type: values.type,
        price: values.price,
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

      router.push(`/posts/${resultPost._id}`);
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
        {({ values, setFieldValue, errors, touched }) => (
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

            {/* Если FormInput поддерживает min — отлично. Если нет, замени на нативный input (см. комментарий ниже) */}
            <FormInput
              label="Дата"
              name="date"
              type="date"
              min={getBerlinTodayISO()}
            />

            <div className={styles.row}>
              <div>
                <label>Тип</label>
                <select
                  name="type"
                  value={values.type}
                  onChange={(e) => setFieldValue('type', e.target.value)}
                >
                  <option value="tfp">TFP</option>
                  <option value="paid">Paid</option>
                  <option value="collaboration">Collaboration</option>
                </select>
              </div>
              <div>
                <FormInput label="Цена" name="price" type="number" />
              </div>
            </div>

            <div className={styles.roleSection}>
              <label>Роли</label>

              <div className={styles.quickButtons}>
                <span>Быстрые роли:</span>
                {roles.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      const parsed = values.roleSlots
                        ? [...values.roleSlots]
                        : [];
                      parsed.push({ role: r, required: 1 });
                      setFieldValue('roleSlots', parsed);
                    }}
                    className={styles.roleBtn}
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Показываем выбранные роли (если есть) */}
              {Array.isArray(values.roleSlots) &&
              values.roleSlots.length > 0 ? (
                <div className={styles.selectedRoles}>
                  {values.roleSlots.map((rs, idx) => (
                    <div key={idx} className={styles.selectedRole}>
                      <span>
                        {rs.role} ×{rs.required}
                      </span>
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

              {errors && (errors.roleSlots || errors.roleSlotsText) && (
                <div className={styles.error}>
                  {errors.roleSlots || errors.roleSlotsText}
                </div>
              )}
            </div>

            <div className={styles.filesRow}>
              <label>
                Файлы (фото/видео): фото макс {MAX_PHOTO_COUNT}, видео макс{' '}
                {MAX_VIDEO_COUNT}
              </label>
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFilesChange}
              />
              {newFiles.length > 0 && (
                <p>{newFiles.length} новых файлов готовы к загрузке</p>
              )}
            </div>

            {/* previews: existing */}
            {existingMedia.length > 0 && (
              <div className={styles.mediaList}>
                <h4>Загруженные медиа</h4>
                <div className={styles.mediaGrid}>
                  {existingMedia.map((m) => (
                    <div key={m._id} className={styles.mediaCard}>
                      {m.type === 'photo' ? (
                        <Image
                          width={100}
                          height={100}
                          src={m.url}
                          alt="media"
                          className={styles.mediaThumb}
                        />
                      ) : (
                        <video className={styles.mediaThumb} controls>
                          <source src={m.url} />
                        </video>
                      )}
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
                        {f.type.startsWith('image') ? (
                          <Image
                            width={100}
                            height={100}
                            src={url}
                            alt={f.name}
                            className={styles.mediaThumb}
                          />
                        ) : (
                          <video className={styles.mediaThumb} controls>
                            <source src={url} />
                          </video>
                        )}
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
