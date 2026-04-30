'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import s from './MyPostCard.module.scss';
import { groupRoles } from '@/utils/groupRoles';

const STATUS_LABEL = {
  open: 'Відкритий',
  closed: 'Закритий',
  in_progress: 'В роботі',
  archived: 'Архів',
  draft: 'Чернетка',
};

export default function MyPostCard({ post, onEdit, onDelete, disabled }) {
  const photos = (post.media || []).filter((m) => m.type === 'photo');
  const videos = (post.media || []).filter((m) => m.type === 'video');

  const grouped = groupRoles(post.roleSlots) || [];
  const visibleRoles = grouped.slice(0, 3);
  const extraRoles = grouped.length - visibleRoles.length;

  const primaryMedia = photos[0] || videos[0] || null;
  const extraMedia =
    photos.length + videos.length > 1 ? photos.length + videos.length - 1 : 0;

  const statusKey = (post.status || '').toLowerCase();
  const statusLabel = STATUS_LABEL[statusKey] || post.status || '—';

  const postHref = `/posts/${post._id}`;

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString('uk-UA', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : null;

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onEdit?.(post);
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.();
  };

  return (
    <article className={s.card}>
      <span className={s.accentBar} aria-hidden="true" />

      <Link href={postHref} className={s.cardLink}>
        <div className={s.mediaWrap}>
          {primaryMedia ? (
            primaryMedia.type === 'photo' ? (
              <Image
                src={primaryMedia.url}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className={s.mediaImage}
              />
            ) : (
              <video
                className={s.mediaVideo}
                src={primaryMedia.url}
                muted
                loop
                playsInline
                preload="metadata"
              />
            )
          ) : (
            <div className={s.noMedia}>
              <span>Без медіа</span>
            </div>
          )}

          <div className={s.mediaGradient} />

          <span
            className={`${s.status} ${s[`status_${statusKey}`] || ''}`}
            title={statusLabel}
          >
            <span className={s.statusDot} />
            {statusLabel}
          </span>

          {extraMedia > 0 && (
            <span className={s.mediaCounter}>
              <span className={s.mediaCounterIcon} aria-hidden="true">
                ▣
              </span>
              +{extraMedia}
            </span>
          )}
        </div>

        <div className={s.body}>
          <div className={s.topRow}>
            {(post.city || post.country) && (
              <p className={s.location}>
                {[post.city, post.country].filter(Boolean).join(', ')}
              </p>
            )}
            <p className={s.date}>{formatDate(post.createdAt)}</p>
          </div>

          <h3 className={s.title}>{post.title}</h3>

          {post.date && (
            <p className={s.eventDate}>
              <span className={s.eventLabel}>Дата події</span>
              <span className={s.eventValue}>{formatDate(post.date)}</span>
            </p>
          )}

          <div className={s.roles}>
            {grouped.length > 0 ? (
              <ul className={s.roleBadges} aria-label="Ролі">
                {visibleRoles.map((r) => (
                  <li key={r.role} className={s.roleBadge}>
                    <span className={s.roleName}>{r.role}</span>
                    <span className={s.roleCount}>×{r.count}</span>
                  </li>
                ))}
                {extraRoles > 0 && (
                  <li className={`${s.roleBadge} ${s.roleMore}`}>
                    +{extraRoles}
                  </li>
                )}
              </ul>
            ) : (
              <p className={s.rolesEmpty}>— ролі не вказано</p>
            )}
          </div>
        </div>
      </Link>

      <div className={s.actions}>
        <button
          type="button"
          className={s.editBtn}
          onClick={handleEditClick}
          disabled={disabled}
        >
          Редагувати
        </button>
        <button
          type="button"
          className={s.deleteBtn}
          onClick={handleDeleteClick}
          disabled={disabled}
          aria-label="Видалити пост"
        >
          <span className={s.deleteIcon} aria-hidden="true">
            ✕
          </span>
          Видалити
        </button>
      </div>
    </article>
  );
}
