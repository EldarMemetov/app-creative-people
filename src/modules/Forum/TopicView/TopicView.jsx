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
import s from '../Forum.module.scss';

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
        {topic.pinned && <span className={s.badgePin}>📌 Закреп</span>}
        {topic.closed && <span className={s.badgeClose}>🔒 Закрыта</span>}
        <h1 className={s.topicTitle}>{topic.title}</h1>
      </div>

      <div className={s.topicMeta}>
        <Link href={`/talents/${author._id}`}>{authorName}</Link>
        <span>·</span>
        <span>{new Date(topic.createdAt).toLocaleString()}</span>
        <span>·</span>
        <span>👁 {topic.viewsCount ?? 0}</span>
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
              className={s.actionBtn}
              onClick={handleLike}
              disabled={!user || busy}
            >
              {topic.liked ? '❤️' : '🤍'} {topic.likesCount ?? 0}
            </button>

            {isAuthor && !topic.closed && (
              <button
                className={s.actionBtn}
                onClick={() => setEditing(true)}
                disabled={busy}
              >
                Редактировать
              </button>
            )}

            {(isAuthor || isMod) && (
              <button
                className={s.actionBtn}
                onClick={handleDelete}
                disabled={busy}
              >
                Удалить
              </button>
            )}

            {isMod && (
              <>
                <button
                  className={s.actionBtn}
                  onClick={() => handleModerate({ pinned: !topic.pinned })}
                >
                  {topic.pinned ? 'Открепить' : 'Закрепить'}
                </button>
                <button
                  className={s.actionBtn}
                  onClick={() => handleModerate({ closed: !topic.closed })}
                >
                  {topic.closed ? 'Открыть' : 'Закрыть'}
                </button>
              </>
            )}
          </div>
        </>
      ) : (
        <>
          <TopicForm
            initial={topic}
            onSubmit={handleEdit}
            submitLabel="Сохранить"
          />
          <button className={s.actionBtn} onClick={() => setEditing(false)}>
            Отмена
          </button>
        </>
      )}

      {/* Комментарии — тот же универсальный компонент */}
      {topic.closed ? (
        <div className={s.closedNotice}>
          Тема закрыта. Новые комментарии недоступны, но можно читать старые.
        </div>
      ) : null}
      <Comments targetType="forumTopic" targetId={topic._id} />
    </div>
  );
}
