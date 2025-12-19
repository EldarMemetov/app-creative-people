'use client';

import { useState, useEffect } from 'react';
import { likeUser, unlikeUser, getLikeStatus } from '@/services/api/users/api';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/services/store/useAuth';
import s from './LikeButton.module.scss';

export default function LikeButton({ userId }) {
  const { likesMap } = useSocket();
  const { user } = useAuth();

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    const init = async () => {
      try {
        const { liked: likedStatus, likesCount: count } =
          await getLikeStatus(userId);
        if (!active) return;
        setLiked(likedStatus);
        setLikesCount(count);
      } catch {}
    };

    init();
    return () => {
      active = false;
    };
  }, [userId]);

  useEffect(() => {
    if (!likesMap[userId]) return;

    const { liked: socketLiked, count } = likesMap[userId];

    if (socketLiked !== undefined) setLiked(socketLiked);
    if (count !== undefined) setLikesCount(count);
  }, [likesMap, userId]);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (liked) {
        const res = await unlikeUser(userId);
        setLiked(false);
        setLikesCount(res?.likesCount ?? Math.max(likesCount - 1, 0));
      } else {
        const res = await likeUser(userId);
        setLiked(true);
        setLikesCount(res?.likesCount ?? likesCount + 1);
      }
    } catch (err) {
      if (err?.status >= 500) {
        console.error('Like server error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user || user._id === userId) {
    return null;
  }

  return (
    <button
      className={`${s.likeButton} ${liked ? s.liked : ''}`}
      onClick={handleClick}
      disabled={loading}
      aria-pressed={liked}
    >
      {liked ? '❤️' : '🤍'} {likesCount}
    </button>
  );
}
