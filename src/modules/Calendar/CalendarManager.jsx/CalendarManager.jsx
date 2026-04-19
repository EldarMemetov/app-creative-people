'use client';

import { useEffect, useMemo, useState } from 'react';
import { Formik, Form } from 'formik';
import Link from 'next/link';

import Calendar from '../Calendar';
import FormInput from '@/shared/FormInput/FormInput';

import {
  fetchCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from '@/services/api/calendar/api';

import styles from './CalendarManager.module.scss';

function formatDateForInput(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function toSafeDateTime(dateString) {
  if (!dateString) return null;
  return `${dateString}T12:00:00`;
}

// Статусы постов
const postStatusLabels = {
  open: 'Открыт',
  in_progress: 'Команда собрана',
  shooting_done: 'Съёмка завершена',
  expired: 'Истёк',
  canceled: 'Отменён',
};

const postStatusColors = {
  open: '#2196f3',
  in_progress: '#ff9800',
  shooting_done: '#4caf50',
  expired: '#9e9e9e',
  canceled: '#f44336',
};

export default function CalendarManager() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState('create');
  const [loading, setLoading] = useState(false);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await fetchCalendarEvents({ showExpired: true });
      setEvents(res.data || []);
    } catch (err) {
      console.error('Failed to load calendar events', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const selectedEvents = useMemo(() => {
    const selectedKey = formatDateForInput(selectedDate);
    return events.filter(
      (event) => formatDateForInput(event.date) === selectedKey
    );
  }, [events, selectedDate]);

  const openCreate = () => {
    setMode('create');
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const openEdit = (event) => {
    const isPostEvent = event.type === 'post' || Boolean(event.post);
    const isCanceled = event.status === 'canceled';

    if (isPostEvent || isCanceled) return;

    setMode('edit');
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleDelete = async (eventId) => {
    const ok = window.confirm('Удалить эту запись?');
    if (!ok) return;

    try {
      await deleteCalendarEvent(eventId);
      await loadEvents();
      setSelectedEvent(null);
    } catch (err) {
      console.error('Failed to delete event', err);
    }
  };

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const payload = {
        title: values.title,
        description: values.description,
        date: toSafeDateTime(values.date),
      };

      if (mode === 'create') {
        await createCalendarEvent(payload);
      } else if (mode === 'edit' && selectedEvent?._id) {
        await updateCalendarEvent(selectedEvent._id, payload);
      }

      resetForm();
      setIsModalOpen(false);
      setSelectedEvent(null);
      await loadEvents();
    } catch (err) {
      console.error('Failed to save event', err);
    }
  };

  const initialValues = {
    title: selectedEvent?.title || '',
    description: selectedEvent?.description || '',
    date: selectedEvent?.date
      ? formatDateForInput(selectedEvent.date)
      : formatDateForInput(selectedDate),
  };

  // Получить статус поста
  const getPostStatus = (event) => {
    if (event.status === 'canceled') return 'canceled';
    if (event.post?.status) return event.post.status;
    return null;
  };

  return (
    <div className={styles.wrapper}>
      <Calendar
        events={events}
        initialDate={selectedDate}
        onDateSelect={setSelectedDate}
      />

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h3 className={styles.panelTitle}>
              {selectedDate.toLocaleDateString('ru-RU')}
            </h3>
            <p className={styles.panelText}>
              {selectedEvents.length > 0
                ? `Записей: ${selectedEvents.length}`
                : 'На этот день пока нет записей'}
            </p>
          </div>

          <button
            type="button"
            className={styles.createButton}
            onClick={openCreate}
          >
            Создать заметку
          </button>
        </div>

        {selectedEvents.length > 0 && (
          <div className={styles.list}>
            {selectedEvents.map((event) => {
              const isPostEvent = event.type === 'post' || Boolean(event.post);
              const isCanceled = event.status === 'canceled';
              const postStatus = getPostStatus(event);
              const statusLabel = postStatus
                ? postStatusLabels[postStatus]
                : null;
              const statusColor = postStatus
                ? postStatusColors[postStatus]
                : null;

              return (
                <div key={event._id} className={styles.card}>
                  <div className={styles.cardMain}>
                    <div className={styles.cardHeader}>
                      <h4 className={styles.cardTitle}>{event.title}</h4>

                      {/* Статус поста */}
                      {isPostEvent && statusLabel && (
                        <span
                          className={styles.statusBadge}
                          style={{ backgroundColor: statusColor }}
                        >
                          {statusLabel}
                        </span>
                      )}
                    </div>

                    {event.description && (
                      <p className={styles.cardDescription}>
                        {event.description}
                      </p>
                    )}

                    {/* Ссылка на пост */}
                    {isPostEvent && event.post && (
                      <div className={styles.postLink}>
                        <Link href={`/posts/${event.post._id || event.post}`}>
                          Перейти к посту →
                        </Link>
                      </div>
                    )}

                    {/* Участники */}
                    {event.participants && event.participants.length > 0 && (
                      <div className={styles.participants}>
                        <span className={styles.participantsLabel}>
                          Участники:
                        </span>
                        <div className={styles.participantsList}>
                          {event.participants.map((p) => (
                            <Link
                              key={p._id || p}
                              href={`/talents/${p._id || p}`}
                              className={styles.participantChip}
                            >
                              {p.name
                                ? `${p.name} ${p.surname || ''}`
                                : 'Участник'}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {isPostEvent && !isCanceled && (
                      <p className={styles.cardHint}>
                        Событие из поста — редактируется в самом посте.
                      </p>
                    )}

                    {isCanceled && (
                      <p className={styles.cardHintCanceled}>
                        ❌ Событие отменено
                      </p>
                    )}
                  </div>

                  <div className={styles.cardActions}>
                    {!isPostEvent && !isCanceled && (
                      <>
                        <button
                          type="button"
                          className={styles.editButton}
                          onClick={() => openEdit(event)}
                        >
                          Редактировать
                        </button>
                        <button
                          type="button"
                          className={styles.deleteButton}
                          onClick={() => handleDelete(event._id)}
                        >
                          Удалить
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setIsModalOpen(false)}
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>
              {mode === 'create' ? 'Создать заметку' : 'Редактировать заметку'}
            </h3>

            <Formik
              initialValues={initialValues}
              enableReinitialize
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className={styles.form}>
                  <FormInput
                    label="Название"
                    name="title"
                    placeholder="Введите название"
                  />

                  <FormInput
                    label="Описание"
                    name="description"
                    placeholder="Введите описание"
                    as="textarea"
                  />

                  <FormInput label="Дата" name="date" type="date" />

                  <div className={styles.formActions}>
                    <button
                      type="button"
                      className={styles.secondaryButton}
                      onClick={() => setIsModalOpen(false)}
                    >
                      Отмена
                    </button>

                    <button
                      type="submit"
                      className={styles.primaryButton}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Сохранение...' : 'Сохранить'}
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}

      {loading && <div className={styles.loading}>Загрузка...</div>}
    </div>
  );
}
