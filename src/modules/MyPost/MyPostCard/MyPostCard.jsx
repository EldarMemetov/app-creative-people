'use client';

import React from 'react';
import s from './MyPostCard.module.scss';
import Image from 'next/image';
import { groupRoles } from '@/utils/groupRoles';

export default function MyPostCard({ post, onEdit, onDelete, disabled }) {
  const photos = (post.media || []).filter((m) => m.type === 'photo');
  const videos = (post.media || []).filter((m) => m.type === 'video');

  const grouped = groupRoles(post.roleSlots);

  return (
    <div className={s.card}>
      <div className={s.mediaWrap}>
        {photos.length > 0 ? (
          <div className={s.photosGrid}>
            {photos.map((m) => (
              <div key={m._id || m.public_id || m.url} className={s.mediaItem}>
                <Image src={m.url} alt={post.title} width={100} height={100} />
              </div>
            ))}
          </div>
        ) : videos.length > 0 ? (
          <div className={s.mediaItem}>
            <video controls src={videos[0].url} />
          </div>
        ) : (
          <div className={s.noMedia}>Нет медиа</div>
        )}
      </div>

      <div className={s.body}>
        <h3 className={s.title}>{post.title}</h3>

        <div className={s.meta}>
          <span>
            {post.city}, {post.country}
          </span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          {post.date && (
            <span>Дата: {new Date(post.date).toLocaleDateString()}</span>
          )}
          <span>Статус: {post.status}</span>
        </div>

        <div className={s.roles}>
          {grouped.length > 0 ? (
            <div className={s.roleBadges}>
              {grouped.map((r) => (
                <span key={r.role} className={s.roleBadge}>
                  {r.role} ×{r.count}
                </span>
              ))}
            </div>
          ) : (
            <small>Роли: не указано</small>
          )}
        </div>

        <div className={s.actions}>
          <button onClick={() => onEdit(post)} disabled={disabled}>
            Редактировать
          </button>
          <button onClick={onDelete} disabled={disabled}>
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}
