'use client';
import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/services/store/useAuth';
import {
  getTopicById,
  deleteTopic,
  toggleTopicLike,
  updateTopic,
  moderateTopic,
} from '@/services/api/forum/api';
import Comments from '@/modules/Comments/Comments';
import TopicForm from '../TopicForm/TopicForm';
import s from './TopicView.module.scss';

const PinIcon = () => (
  <svg
    className={s.icon}
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="17" x2="12" y2="22" />
    <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a2 2 0 0 0 0-4H8a2 2 0 0 0 0 4h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z" />
  </svg>
);

const LockIcon = () => (
  <svg
    className={s.icon}
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const EyeIcon = () => (
  <svg
    className={s.icon}
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const HeartIcon = ({ filled }) => (
  <svg
    className={s.icon}
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);

const TrashIcon = () => (
  <svg
    className={s.icon}
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const EditIcon = () => (
  <svg
    className={s.icon}
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export default function TopicView() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [topic, setTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTopicById(id);
      setTopic(data);
    } catch (e) {
      setErr(e?.message || 'Не удалось загрузить тему');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) load();
  }, [id, load]);

  if (loading) return <div className={s.info}>Загрузка…</div>;
  if (err)
    return (
      <div className={s.info}>
        {err} <Link href="/forum">← К форуму</Link>
      </div>
    );
  if (!topic) return <div className={s.info}>Тема не найдена</div>;

  const author = topic.author || {};
  const authorName =
    [author.name, author.surname].filter(Boolean).join(' ') || 'User';
  const isAuthor = user && String(user._id) === String(author._id || author);
  const isMod = user && ['admin', 'moderator'].includes(user.role);

  const handleLike = async () => {
    if (!user || busy) return;
    setBusy(true);
    const prev = { liked: topic.liked, likesCount: topic.likesCount || 0 };
    const next = {
      liked: !prev.liked,
      likesCount: Math.max(prev.likesCount + (prev.liked ? -1 : 1), 0),
    };
    setTopic((t) => ({ ...t, ...next }));
    try {
      const res = await toggleTopicLike(topic._id);
      setTopic((t) => ({ ...t, liked: res.liked, likesCount: res.likesCount }));
    } catch (e) {
      setTopic((t) => ({ ...t, ...prev }));
      console.error('like error', e);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Удалить тему? Это действие нельзя отменить.')) return;
    setBusy(true);
    try {
      await deleteTopic(topic._id);
      router.push('/forum');
    } catch (e) {
      alert(e?.message || 'Ошибка удаления');
    } finally {
      setBusy(false);
    }
  };

  const handleEdit = async (values) => {
    const updated = await updateTopic(topic._id, values);
    setTopic(updated);
    setEditing(false);
  };

  const handleModerate = async (patch) => {
    try {
      const updated = await moderateTopic(topic._id, patch);
      setTopic(updated);
    } catch (e) {
      alert(e?.message || 'Ошибка модерации');
    }
  };

  return (
    <div className={s.topic}>
      <Link href="/forum" className={s.back}>
        ← К форуму
      </Link>

      <div className={s.topicHead}>
        {topic.pinned && (
          <span className={s.badgePin}>
            <PinIcon /> Закреп
          </span>
        )}
        {topic.closed && (
          <span className={s.badgeClose}>
            <LockIcon /> Закрыта
          </span>
        )}
        <h1 className={s.topicTitle}>{topic.title}</h1>
      </div>

      <div className={s.topicMeta}>
        <Link href={`/talents/${author._id}`} className={s.metaAuthor}>
          {authorName}
        </Link>
        <span className={s.metaDot}>·</span>
        <span className={s.metaDate}>
          {new Date(topic.createdAt).toLocaleString()}
        </span>
        <span className={s.metaStat}>
          <EyeIcon /> {topic.viewsCount ?? 0}
        </span>
      </div>

      {!editing ? (
        <>
          {topic.body && <p className={s.topicBody}>{topic.body}</p>}
          {Array.isArray(topic.tags) && topic.tags.length > 0 && (
            <div className={s.tags}>
              {topic.tags.map((t) => (
                <span key={t} className={s.tag}>
                  #{t}
                </span>
              ))}
            </div>
          )}

          <div className={s.topicActions}>
            <button
              className={`${s.actionBtnLike} ${topic.liked ? s.liked : ''}`}
              onClick={handleLike}
              disabled={!user || busy}
            >
              <HeartIcon filled={topic.liked} />
              <span>{topic.likesCount ?? 0}</span>
            </button>

            {isAuthor && !topic.closed && (
              <button
                className={s.actionBtn}
                onClick={() => setEditing(true)}
                disabled={busy}
              >
                <EditIcon /> Редактировать
              </button>
            )}

            {(isAuthor || isMod) && (
              <button
                className={s.actionBtnDanger}
                onClick={handleDelete}
                disabled={busy}
              >
                <TrashIcon /> Удалить
              </button>
            )}

            {isMod && (
              <>
                <button
                  className={s.actionBtnGhost}
                  onClick={() => handleModerate({ pinned: !topic.pinned })}
                >
                  {topic.pinned ? 'Открепить' : 'Закрепить'}
                </button>
                <button
                  className={s.actionBtnGhost}
                  onClick={() => handleModerate({ closed: !topic.closed })}
                >
                  {topic.closed ? 'Открыть' : 'Закрыть'}
                </button>
              </>
            )}
          </div>
        </>
      ) : (
        <div className={s.editWrap}>
          <TopicForm
            initial={topic}
            onSubmit={handleEdit}
            submitLabel="Сохранить"
          />
          <button className={s.editCancel} onClick={() => setEditing(false)}>
            Отмена
          </button>
        </div>
      )}

      {topic.closed && (
        <div className={s.closedNotice}>
          <LockIcon />
          <span>
            Тема закрыта. Новые комментарии недоступны, но можно читать старые.
          </span>
        </div>
      )}

      <Comments targetType="forumTopic" targetId={topic._id} />
    </div>
  );
}
