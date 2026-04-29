'use client';
import Link from 'next/link';
import s from './TopicCard.module.scss';

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

const CommentIcon = () => (
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
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const HeartIcon = () => (
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
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
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

export default function TopicCard({ topic }) {
  const author = topic.author || {};
  const authorName =
    [author.name, author.surname].filter(Boolean).join(' ') || 'User';

  return (
    <Link href={`/forum/${topic._id}`} className={s.card}>
      <div className={s.cardHead}>
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
        <h3 className={s.cardTitle}>{topic.title}</h3>
      </div>

      {topic.body && (
        <p className={s.cardBody}>
          {String(topic.body).slice(0, 200)}
          {String(topic.body).length > 200 ? '…' : ''}
        </p>
      )}

      <div className={s.cardMeta}>
        <span className={s.metaAuthor}>{authorName}</span>
        <span className={s.metaDot}>·</span>
        <span className={s.metaDate}>
          {new Date(topic.createdAt).toLocaleDateString()}
        </span>

        <span className={s.metaStat}>
          <CommentIcon /> {topic.commentsCount ?? 0}
        </span>
        <span className={s.metaStat}>
          <HeartIcon /> {topic.likesCount ?? 0}
        </span>
        <span className={s.metaStat}>
          <EyeIcon /> {topic.viewsCount ?? 0}
        </span>
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
