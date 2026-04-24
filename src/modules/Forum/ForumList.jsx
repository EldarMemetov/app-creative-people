'use client';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/services/store/useAuth';
import { getTopics } from '@/services/api/forum/api';
import TopicCard from './TopicCard/TopicCard';
import s from './Forum.module.scss';

const SORTS = [
  { value: 'new', label: 'Новые' },
  { value: 'popular', label: 'Популярные' },
  { value: 'comments', label: 'По комментариям' },
];

export default function ForumList() {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [topics, setTopics] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [sort, setSort] = useState('new');
  const [q, setQ] = useState('');
  const [qDebounced, setQDebounced] = useState('');

  const limit = 20;

  // Debounce поиска
  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q.trim()), 400);
    return () => clearTimeout(t);
  }, [q]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTopics({
        page,
        limit,
        sort,
        q: qDebounced || undefined,
      });
      setTopics(Array.isArray(res?.data) ? res.data : []);
      setTotal(res?.total || 0);
      setTotalPages(res?.totalPages || 1);
    } catch (err) {
      console.error('Failed to load topics', err);
      setTopics([]);
    } finally {
      setLoading(false);
    }
  }, [page, sort, qDebounced]);

  useEffect(() => {
    load();
  }, [load]);

  // Real-time обновления списка
  useEffect(() => {
    if (!socket) return;

    const onNew = ({ topic }) => {
      if (!topic) return;
      // Показываем только если мы на первой странице и без фильтров/поиска
      if (page !== 1 || qDebounced) return;
      setTopics((prev) =>
        prev.some((t) => String(t._id) === String(topic._id))
          ? prev
          : [topic, ...prev].slice(0, limit)
      );
      setTotal((x) => x + 1);
    };

    const onUpdated = ({ topic }) => {
      if (!topic) return;
      setTopics((prev) =>
        prev.map((t) =>
          String(t._id) === String(topic._id) ? { ...t, ...topic } : t
        )
      );
    };

    const onDeleted = ({ topicId }) => {
      if (!topicId) return;
      setTopics((prev) =>
        prev.filter((t) => String(t._id) !== String(topicId))
      );
      setTotal((x) => Math.max(x - 1, 0));
    };

    socket.on('forumTopic:new', onNew);
    socket.on('forumTopic:updated', onUpdated);
    socket.on('forumTopic:deleted', onDeleted);

    return () => {
      socket.off('forumTopic:new', onNew);
      socket.off('forumTopic:updated', onUpdated);
      socket.off('forumTopic:deleted', onDeleted);
    };
  }, [socket, page, qDebounced]);

  const pages = useMemo(() => {
    const arr = [];
    for (let i = 1; i <= totalPages; i++) arr.push(i);
    return arr;
  }, [totalPages]);

  return (
    <div className={s.forum}>
      <div className={s.header}>
        <h1 className={s.title}>Форум</h1>
        {user && (
          <Link href="/forum/new" className={s.newBtn}>
            + Новая тема
          </Link>
        )}
      </div>

      <div className={s.toolbar}>
        <input
          className={s.search}
          type="text"
          placeholder="Поиск по темам…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
        />
        <select
          className={s.select}
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
        >
          {SORTS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <p className={s.meta}>Всего тем: {total}</p>

      {loading && <div className={s.info}>Загрузка…</div>}
      {!loading && topics.length === 0 && (
        <div className={s.info}>Пока нет тем. Будь первым!</div>
      )}

      <ul className={s.list}>
        {topics.map((t) => (
          <li key={t._id}>
            <TopicCard topic={t} />
          </li>
        ))}
      </ul>

      {totalPages > 1 && (
        <div className={s.pagination}>
          {pages.map((p) => (
            <button
              key={p}
              className={p === page ? s.pageActive : s.page}
              onClick={() => setPage(p)}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
