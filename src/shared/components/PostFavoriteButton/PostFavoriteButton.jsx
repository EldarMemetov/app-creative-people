// PostFavoriteButton.jsx
'use client';

import React, { useEffect, useState } from 'react';
import { toggleFavorite } from '@/services/api/post/api';
import s from './PostFavoriteButton.module.scss';
import { useAuth } from '@/services/store/useAuth';

export default function PostFavoriteButton({
  postId,
  initialFavorited,
  onUnfavorite,
}) {
  const { user, loading: authLoading } = useAuth();

  const [favorited, setFavorited] = useState(Boolean(initialFavorited));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof initialFavorited !== 'undefined') {
      setFavorited(Boolean(initialFavorited));
    }
  }, [initialFavorited]);

  if (!postId || authLoading) return null;

  const handleClick = async (e) => {
    e?.stopPropagation?.();
    if (!user || loading) return;

    const prev = favorited;

    setFavorited(!prev);
    setLoading(true);

    try {
      const res = await toggleFavorite({
        targetType: 'post',
        targetId: postId,
      });

      const next =
        res?.data?.favorited ?? res?.favorited ?? (res && res.favorited);

      if (typeof next === 'boolean') {
        setFavorited(next);
        if (!next && typeof onUnfavorite === 'function') {
          onUnfavorite(postId);
        }
      } else {
      }
    } catch (err) {
      setFavorited(prev);
      console.error('[PostFavoriteButton] toggle error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`${s.favoriteButton} ${favorited ? s.favorited : ''}`}
      onClick={handleClick}
      disabled={loading}
      aria-pressed={favorited}
      title={favorited ? 'Убрать из избранного' : 'Добавить в избранное'}
    >
      {favorited ? '⭐' : '☆'}
    </button>
  );
}
