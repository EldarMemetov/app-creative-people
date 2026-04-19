'use client';
import { useRouter } from 'next/navigation';
import { useMemo, useState, useRef, useEffect } from 'react';
import styles from './Calendar.module.scss';

const months = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

function toNoonDate(value) {
  const d = new Date(value);
  d.setHours(12, 0, 0, 0);
  return d;
}

function formatKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isSameDay(a, b) {
  return formatKey(a) === formatKey(b);
}

function startOfCalendarGrid(date) {
  const firstDayOfMonth = new Date(
    date.getFullYear(),
    date.getMonth(),
    1,
    12,
    0,
    0,
    0
  );
  const day = firstDayOfMonth.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  firstDayOfMonth.setDate(firstDayOfMonth.getDate() + diff);
  return firstDayOfMonth;
}

function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  next.setHours(12, 0, 0, 0);
  return next;
}

export default function Calendar({
  events = [],
  initialDate,
  onDateSelect,
  className = '',
}) {
  const [monthOpen, setMonthOpen] = useState(false);
  const [yearOpen, setYearOpen] = useState(false);
  const monthRef = useRef(null);
  const yearRef = useRef(null);
  const router = useRouter();
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    return d;
  }, []);

  const initial = useMemo(() => {
    if (initialDate) return toNoonDate(initialDate);
    return today;
  }, [initialDate, today]);

  const [viewDate, setViewDate] = useState(
    new Date(initial.getFullYear(), initial.getMonth(), 1, 12, 0, 0, 0)
  );
  const [selectedDate, setSelectedDate] = useState(initial);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (monthRef.current && !monthRef.current.contains(e.target)) {
        setMonthOpen(false);
      }

      if (yearRef.current && !yearRef.current.contains(e.target)) {
        setYearOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const eventMap = useMemo(() => {
    const map = new Map();

    for (const event of events) {
      const date = toNoonDate(event.date);
      const key = formatKey(date);
      const list = map.get(key) || [];
      list.push({ ...event, date });
      map.set(key, list);
    }

    return map;
  }, [events]);

  const gridDays = useMemo(() => {
    const start = startOfCalendarGrid(viewDate);
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
  }, [viewDate]);

  const selectedKey = formatKey(selectedDate);
  const selectedEvents = eventMap.get(selectedKey) || [];

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 81 }, (_, i) => currentYear - 40 + i);
  }, []);

  const handlePrevMonth = () => {
    setViewDate(
      (prev) =>
        new Date(prev.getFullYear(), prev.getMonth() - 1, 1, 12, 0, 0, 0)
    );
  };

  const handleNextMonth = () => {
    setViewDate(
      (prev) =>
        new Date(prev.getFullYear(), prev.getMonth() + 1, 1, 12, 0, 0, 0)
    );
  };

  const handleMonthChange = (monthIndex) => {
    setViewDate(
      (prev) => new Date(prev.getFullYear(), monthIndex, 1, 12, 0, 0, 0)
    );
  };

  const handleYearChange = (year) => {
    setViewDate((prev) => new Date(year, prev.getMonth(), 1, 12, 0, 0, 0));
  };

  const handleToday = () => {
    setViewDate(
      new Date(today.getFullYear(), today.getMonth(), 1, 12, 0, 0, 0)
    );
    setSelectedDate(today);
    if (onDateSelect) onDateSelect(today);
  };

  const handleDayClick = (day) => {
    setSelectedDate(day);

    if (
      day.getMonth() !== viewDate.getMonth() ||
      day.getFullYear() !== viewDate.getFullYear()
    ) {
      setViewDate(new Date(day.getFullYear(), day.getMonth(), 1, 12, 0, 0, 0));
    }

    if (onDateSelect) onDateSelect(day);
  };

  return (
    <section
      className={[styles.calendarShell, className].filter(Boolean).join(' ')}
    >
      <div className={styles.header}>
        <div>
          <p className={styles.kicker}>Календарь</p>
          <h2 className={styles.title}>
            {months[viewDate.getMonth()]} {viewDate.getFullYear()}
          </h2>
        </div>

        <div className={styles.controls}>
          <button
            type="button"
            className={styles.ghostButton}
            onClick={handleToday}
          >
            Сегодня
          </button>

          <button
            type="button"
            className={styles.iconButton}
            onClick={handlePrevMonth}
            aria-label="Предыдущий месяц"
          >
            ‹
          </button>

          <button
            type="button"
            className={styles.iconButton}
            onClick={handleNextMonth}
            aria-label="Следующий месяц"
          >
            ›
          </button>
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.selectWrap}>
          <span>Месяц</span>

          <div
            className={styles.customSelect}
            ref={monthRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={styles.selected}
              onClick={() => {
                setMonthOpen((prev) => !prev);
                setYearOpen(false);
              }}
            >
              {months[viewDate.getMonth()]}
            </div>

            {monthOpen && (
              <div className={styles.dropdown}>
                {months.map((month, index) => (
                  <div
                    key={month}
                    className={styles.option}
                    onClick={() => {
                      handleMonthChange(index);
                      setMonthOpen(false);
                    }}
                  >
                    {month}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.selectWrap}>
          <span>Год</span>

          <div
            className={styles.customSelect}
            ref={yearRef}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={styles.selected}
              onClick={() => {
                setYearOpen((prev) => !prev);
                setMonthOpen(false);
              }}
            >
              {viewDate.getFullYear()}
            </div>

            {yearOpen && (
              <div className={styles.dropdown}>
                {years.map((year) => (
                  <div
                    key={year}
                    className={styles.option}
                    onClick={() => {
                      handleYearChange(year);
                      setYearOpen(false);
                    }}
                  >
                    {year}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.legend}>
          <span className={styles.legendDot} />
          <span>Есть запись</span>
        </div>
      </div>

      <div className={styles.weekdays}>
        {weekDays.map((day) => (
          <div key={day} className={styles.weekday}>
            {day}
          </div>
        ))}
      </div>

      <div className={styles.grid}>
        {gridDays.map((day) => {
          const key = formatKey(day);
          const dayEvents = eventMap.get(key) || [];
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth =
            day.getMonth() === viewDate.getMonth() &&
            day.getFullYear() === viewDate.getFullYear();
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;
          const hasEvents = dayEvents.length > 0;

          return (
            <button
              key={key}
              type="button"
              onClick={() => handleDayClick(day)}
              className={[
                styles.day,
                !isCurrentMonth ? styles.outsideMonth : '',
                isToday ? styles.today : '',
                isSelected ? styles.selected : '',
                hasEvents ? styles.hasEvents : '',
                isWeekend ? styles.weekend : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className={styles.dayNumber}>{day.getDate()}</span>

              {hasEvents && (
                <span className={styles.eventBadge}>{dayEvents.length}</span>
              )}
            </button>
          );
        })}
      </div>

      <div className={styles.details}>
        <div className={styles.detailsHeader}>
          <h3>Записи на {selectedDate.toLocaleDateString('ru-RU')}</h3>
          <span>{selectedEvents.length} шт.</span>
        </div>

        {selectedEvents.map((event, index) => {
          const isPostEvent = event.type === 'post' || Boolean(event.post);
          const postId = event.post?._id || event.post;
          const postTitle = event.post?.title || 'Пост';
          const postAuthor = event.post?.author;
          const participants = Array.isArray(event.participants)
            ? event.participants
            : [];

          // Статус поста
          const postStatus =
            event.status === 'canceled' ? 'canceled' : event.post?.status;

          const statusLabels = {
            open: 'Открыт',
            in_progress: 'Команда собрана',
            shooting_done: 'Съёмка завершена',
            expired: 'Истёк',
            canceled: 'Отменён',
          };

          const statusColors = {
            open: '#2196f3',
            in_progress: '#ff9800',
            shooting_done: '#4caf50',
            expired: '#9e9e9e',
            canceled: '#f44336',
          };

          return (
            <article
              key={
                event._id ||
                event.id ||
                `${formatKey(toNoonDate(event.date))}-${index}`
              }
              className={styles.eventCard}
              style={
                event.color ? { '--event-accent': event.color } : undefined
              }
            >
              <div className={styles.eventDot} />

              <div className={styles.eventContent}>
                <div className={styles.eventHeader}>
                  <h4>{event.title}</h4>

                  {/* Статус */}
                  {isPostEvent && postStatus && (
                    <span
                      className={styles.eventStatusBadge}
                      style={{
                        backgroundColor: statusColors[postStatus] || '#999',
                      }}
                    >
                      {statusLabels[postStatus] || postStatus}
                    </span>
                  )}
                </div>

                {event.description && <p>{event.description}</p>}

                {isPostEvent && (
                  <div className={styles.infoBlock}>
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>Пост:</span>
                      <button
                        type="button"
                        className={styles.linkButton}
                        onClick={() => router.push(`/posts/${postId}`)}
                      >
                        {postTitle}
                      </button>
                    </div>

                    {postAuthor && (
                      <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Автор:</span>
                        <button
                          type="button"
                          className={styles.linkButton}
                          onClick={() =>
                            router.push(
                              `/talents/${postAuthor._id || postAuthor}`
                            )
                          }
                        >
                          {postAuthor.name} {postAuthor.surname}
                        </button>
                      </div>
                    )}

                    {participants.length > 0 && (
                      <div className={styles.teamBlock}>
                        <span className={styles.infoLabel}>Команда:</span>

                        <div className={styles.teamList}>
                          {participants.map((person) => {
                            const personId = person._id || person;
                            const personName =
                              person.name && person.surname
                                ? `${person.name} ${person.surname}`
                                : 'Участник';

                            return (
                              <button
                                key={personId}
                                type="button"
                                className={styles.linkButton}
                                onClick={() =>
                                  router.push(`/talents/${personId}`)
                                }
                              >
                                {personName}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
