'use client';
import Link from 'next/link';
import s from '../Forum.module.scss';

export default function TopicCard({ topic }) {
  const author = topic.author || {};
  const authorName =
    [author.name, author.surname].filter(Boolean).join(' ') || 'User';

  return (
    <Link href={`/forum/${topic._id}`} className={s.card}>
      <div className={s.cardHead}>
        {topic.pinned && <span className={s.badgePin}>📌 Закреп</span>}
        {topic.closed && <span className={s.badgeClose}>🔒 Закрыта</span>}
        <h3 className={s.cardTitle}>{topic.title}</h3>
      </div>

      {topic.body && (
        <p className={s.cardBody}>
          {String(topic.body).slice(0, 200)}
          {String(topic.body).length > 200 ? '…' : ''}
        </p>
      )}

      <div className={s.cardMeta}>
        <span>{authorName}</span>
        <span>·</span>
        <span>{new Date(topic.createdAt).toLocaleDateString()}</span>
        <span>·</span>
        <span>💬 {topic.commentsCount ?? 0}</span>
        <span>❤ {topic.likesCount ?? 0}</span>
        <span>👁 {topic.viewsCount ?? 0}</span>
      </div>

      {Array.isArray(topic.tags) && topic.tags.length > 0 && (
        <div className={s.tags}>
          {topic.tags.map((tag) => (
            <span key={tag} className={s.tag}>
              #{tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
