'use client';

import { useEffect, useState } from 'react';
import { likeUser, unlikeUser, getLikeStatus } from '@/services/api/users/api';
import { useSocket } from '@/hooks/useSocket';
import s from './LikeButton.module.scss';

export default function LikeButton({
  userId,
  initialCount = undefined,
  initialLiked = undefined,
}) {
  const { likesMap } = useSocket();

  const [liked, setLiked] = useState(
    typeof initialLiked !== 'undefined' ? Boolean(initialLiked) : false
  );

  const [likesCount, setLikesCount] = useState(
    typeof initialCount === 'number' ? initialCount : 0
  );

  const [fetched, setFetched] = useState(typeof initialLiked !== 'undefined');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (fetched) return;
    let mounted = true;

    (async () => {
      try {
        const { liked: likedStatus, likesCount: count } =
          await getLikeStatus(userId);

        if (!mounted) return;
        setLiked(Boolean(likedStatus));
        if (typeof count === 'number') setLikesCount(count);
      } catch (err) {
        console.warn('[LikeButton] failed to fetch like status', err);
      } finally {
        if (mounted) setFetched(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [userId, fetched]);

  useEffect(() => {
    const payload = likesMap[String(userId)];
    if (!payload) return;
    if (typeof payload.liked !== 'undefined') setLiked(Boolean(payload.liked));
    if (typeof payload.count === 'number') setLikesCount(payload.count);
  }, [likesMap, userId]);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);

    const prevLiked = liked;
    const prevCount = likesCount;

    const newLiked = !prevLiked;
    const newCount = prevCount + (newLiked ? 1 : -1);

    setLiked(newLiked);
    setLikesCount(Math.max(newCount, 0));

    try {
      if (newLiked) {
        const res = await likeUser(userId);

        if (res?.likesCount !== undefined) setLikesCount(res.likesCount);

        if (typeof res?.liked !== 'undefined') setLiked(Boolean(res.liked));
      } else {
        const res = await unlikeUser(userId);
        if (res?.likesCount !== undefined) setLikesCount(res.likesCount);
        if (typeof res?.liked !== 'undefined') setLiked(Boolean(res.liked));
      }
    } catch (err) {
      console.error('[LikeButton] Like/unlike error', err);
      setLiked(prevLiked);
      setLikesCount(prevCount);
    } finally {
      setLoading(false);
    }
  };

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
