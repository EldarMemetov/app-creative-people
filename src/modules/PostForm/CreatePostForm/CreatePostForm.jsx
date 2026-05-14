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
import s from './CreatePostForm.module.scss';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Container from '@/shared/container/Container';
import RoleSelector from '@/modules/RegisterPage/RoleSelector/RoleSelector';
import CountryCitySelector from '@/shared/CountryCitySelector/CountryCitySelector';
import ConfirmDialog from '@/shared/ConfirmDialog/ConfirmDialog';

const MAX_PHOTO_COUNT = 3;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

const getBerlinTodayISO = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });

const INITIAL_DIALOG = {
  show: false,
  variant: 'info',
  title: '',
  message: '',
  confirmText: 'OK',
  cancelText: 'Отмена',
  onConfirm: null,
  loading: false,
};

export default function CreatePostForm({ initial = null }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [newFiles, setNewFiles] = useState([]);
  const [existingMedia, setExistingMedia] = useState(initial?.media ?? []);
  const [dialog, setDialog] = useState(INITIAL_DIALOG);
  const isEdit = Boolean(initial && initial._id);

  useEffect(() => {
    setExistingMedia(initial?.media ?? []);
  }, [initial]);

  // ---------- Dialog helpers ----------
  const closeDialog = () =>
    setDialog((d) => ({ ...d, show: false, loading: false }));

  const notifyInfo = (message, title = 'Информация') =>
    setDialog({
      ...INITIAL_DIALOG,
      show: true,
      variant: 'info',
      title,
      message,
      confirmText: 'OK',
    });

  const notifyError = (message, title = 'Ошибка') =>
    setDialog({
      ...INITIAL_DIALOG,
      show: true,
      variant: 'error',
      title,
      message,
      confirmText: 'OK',
    });

  const confirmAction = ({
    title = 'Подтверждение',
    message,
    confirmText = 'Удалить',
    cancelText = 'Отмена',
    onConfirm,
  }) =>
    setDialog({
      ...INITIAL_DIALOG,
      show: true,
      variant: 'confirm',
      title,
      message,
      confirmText,
      cancelText,
      onConfirm,
    });

  // ---------- Helpers ----------
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

  const countExistingPhotos = () =>
    existingMedia.filter((m) => m.type === 'photo').length;

  const countNewPhotos = (filesArr) =>
    filesArr.filter((f) => f.type.startsWith('image')).length;

  const handleFilesChange = (e) => {
    const list = Array.from(e.target.files || []);
    if (list.length === 0) return;

    const existingPhotos = countExistingPhotos();
    const newPhotos = countNewPhotos(list);

    if (existingPhotos + newPhotos > MAX_PHOTO_COUNT) {
      notifyError(
        `Можно загрузить максимум ${MAX_PHOTO_COUNT} фото (включая уже загруженные).`,
        'Слишком много файлов'
      );
      e.target.value = '';
      return;
    }

    for (const f of list) {
      if (!f.type.startsWith('image')) {
        notifyError('Можно загружать только изображения');
        e.target.value = '';
        return;
      }
      if (f.size > MAX_PHOTO_BYTES) {
        notifyError(
          `${f.name} превышает максимальный размер ${MAX_PHOTO_BYTES / (1024 * 1024)}MB`,
          'Файл слишком большой'
        );
        e.target.value = '';
        return;
      }
    }

    setNewFiles((prev) => [...prev, ...list]);
    e.target.value = '';
  };

  const removeNewFile = (index) =>
    setNewFiles((prev) => prev.filter((_, i) => i !== index));

  const removeExistingMedia = (mediaId) => {
    if (!isEdit) return;

    confirmAction({
      title: 'Удалить медиа?',
      message: 'Это действие нельзя отменить.',
      confirmText: 'Удалить',
      cancelText: 'Отмена',
      onConfirm: async () => {
        setDialog((d) => ({ ...d, loading: true }));
        try {
          await deletePostMedia(initial._id, mediaId);
          setExistingMedia((prev) =>
            prev.filter((m) => String(m._id) !== String(mediaId))
          );
          closeDialog();
        } catch (err) {
          console.error('Failed to delete media', err);
          notifyError('Не удалось удалить медиа.');
        }
      },
    });
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
      notifyError(err?.message || 'Ошибка при сохранении поста');
    } finally {
      setSubmitting(false);
      setFormikSubmitting(false);
    }
  };

  return (
    <section className={s.section}>
      <Container>
        <p className={s.info}>
          QVRIX не проводить платежі та не несе відповідальності за фінансові
          розрахунки між учасниками. Домовляйтесь напряму.
        </p>
        <div className={s.formWrap}>
          <h2 className={s.title}>
            {isEdit ? 'Редактировать пост' : 'Создать пост'}
          </h2>

          <Formik
            enableReinitialize={true}
            initialValues={initialValues}
            validationSchema={postFormSchema}
            onSubmit={onSubmit}
          >
            {({ values, setFieldValue, errors }) => (
              <Form className={s.form}>
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
                <CountryCitySelector />

                <div className={s.dateRow}>
                  <label className={s.checkboxLabel}>
                    <input
                      className={s.checkbox}
                      type="checkbox"
                      checked={values.hasNoDate}
                      onChange={(e) => {
                        setFieldValue('hasNoDate', e.target.checked);
                        if (e.target.checked) setFieldValue('date', '');
                      }}
                    />
                    <span className={s.checkboxText}>Дата не определена</span>
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

                <div className={s.row}>
                  <div className={s.field}>
                    <label className={s.label}>Тип оплаты</label>
                    <select
                      className={s.select}
                      name="type"
                      value={values.type}
                      onChange={(e) => {
                        setFieldValue('type', e.target.value);
                        setFieldValue('price', 0);
                        setFieldValue('percent', 0);
                      }}
                    >
                      <option value="tfp">TFP (Time for Portfolio)</option>
                      <option value="paid">Paid (фиксированная сумма)</option>
                      <option value="percent">
                        Percent (процент от дохода)
                      </option>
                      <option value="negotiable">
                        Negotiable (договорная)
                      </option>
                    </select>
                  </div>

                  {values.type === 'paid' && (
                    <div className={s.field}>
                      <FormInput
                        label="Цена (€)"
                        name="price"
                        type="number"
                        min={1}
                      />
                    </div>
                  )}

                  {values.type === 'percent' && (
                    <div className={s.field}>
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

                <div className={s.roleSection}>
                  <RoleSelector
                    label="Роли"
                    values={values.roleSlots || []}
                    onChange={(slots) => setFieldValue('roleSlots', slots)}
                    error={
                      typeof errors.roleSlots === 'string'
                        ? errors.roleSlots
                        : undefined
                    }
                    max={0}
                    slotsMode
                    minPerSlot={1}
                    maxPerSlot={20}
                  />
                </div>

                <div className={s.filesRow}>
                  <label className={s.label}>
                    Файлы (фото): макс {MAX_PHOTO_COUNT}
                  </label>
                  <input
                    className={s.fileInput}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFilesChange}
                  />
                  {newFiles.length > 0 && (
                    <p className={s.filesHint}>
                      {newFiles.length} новых файлов готовы к загрузке
                    </p>
                  )}
                </div>

                {existingMedia.length > 0 && (
                  <div className={s.mediaList}>
                    <h4 className={s.mediaTitle}>Загруженные медиа</h4>
                    <div className={s.mediaGrid}>
                      {existingMedia.map((m) => (
                        <div key={m._id} className={s.mediaCard}>
                          <Image
                            width={100}
                            height={100}
                            src={m.url}
                            alt="media"
                            className={s.mediaThumb}
                          />
                          <button
                            type="button"
                            className={s.removeBtn}
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
                  <div className={s.mediaList}>
                    <h4 className={s.mediaTitle}>
                      Новые файлы (еще не загружены)
                    </h4>
                    <div className={s.mediaGrid}>
                      {newFiles.map((f, i) => {
                        const url = URL.createObjectURL(f);
                        return (
                          <div key={i} className={s.mediaCard}>
                            <Image
                              width={100}
                              height={100}
                              src={url}
                              alt={f.name}
                              className={s.mediaThumb}
                            />
                            <div className={s.mediaInfo}>
                              <div className={s.mediaName}>{f.name}</div>
                              <div className={s.mediaSize}>
                                {(f.size / (1024 * 1024)).toFixed(2)} MB
                              </div>
                              <button
                                type="button"
                                onClick={() => removeNewFile(i)}
                                className={s.removeBtn}
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

                <div className={s.actions}>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={s.submitBtn}
                  >
                    {isEdit ? 'Сохранить' : 'Создать пост'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </Container>

      <ConfirmDialog
        show={dialog.show}
        variant={dialog.variant}
        title={dialog.title}
        message={dialog.message}
        confirmText={dialog.confirmText}
        cancelText={dialog.cancelText}
        loading={dialog.loading}
        onConfirm={dialog.onConfirm || closeDialog}
        onClose={closeDialog}
      />
    </section>
  );
}
