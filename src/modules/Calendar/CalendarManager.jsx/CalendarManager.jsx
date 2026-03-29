'use client';

import { useEffect, useMemo, useState } from 'react';
import { Formik, Form } from 'formik';

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
    if (isPostEvent) return;

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

              return (
                <div key={event._id} className={styles.card}>
                  <div className={styles.cardMain}>
                    <h4 className={styles.cardTitle}>{event.title}</h4>

                    {event.description && (
                      <p className={styles.cardDescription}>
                        {event.description}
                      </p>
                    )}

                    {isPostEvent && (
                      <p className={styles.cardHint}>
                        Это событие пришло из поста и редактируется только в
                        самом посте.
                      </p>
                    )}
                  </div>

                  <div className={styles.cardActions}>
                    {!isPostEvent && (
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
