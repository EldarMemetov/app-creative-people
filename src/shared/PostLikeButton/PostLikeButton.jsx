'use client';

import { useEffect, useState } from 'react';
import {
  likePost,
  unlikePost,
  getPostLikeStatus,
} from '@/services/api/post/api';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/services/store/useAuth';
import s from './PostLikeButton.module.scss';

export default function PostLikeButton({
  postId,
  initialCount = undefined,
  initialLiked = undefined,
}) {
  const { likesMap } = useSocket();
  const { user, loading: authLoading } = useAuth();

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
      if (!user) {
        if (mounted) setFetched(true);
        return;
      }

      try {
        const { liked: likedStatus, likesCount: count } =
          await getPostLikeStatus(postId);
        if (!mounted) return;
        setLiked(Boolean(likedStatus));
        if (typeof count === 'number') setLikesCount(count);
      } catch (err) {
        console.warn('[PostLikeButton] failed to fetch like status', err);
      } finally {
        if (mounted) setFetched(true);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [postId, fetched, user]);

  useEffect(() => {
    const payload = likesMap[`post:${postId}`];
    if (!payload) return;
    if (typeof payload.liked !== 'undefined') setLiked(Boolean(payload.liked));
    if (typeof payload.count === 'number') setLikesCount(payload.count);
  }, [likesMap, postId]);

  useEffect(() => {
    if (typeof initialLiked !== 'undefined') setLiked(Boolean(initialLiked));
  }, [initialLiked]);

  useEffect(() => {
    if (typeof initialCount === 'number') setLikesCount(initialCount);
  }, [initialCount]);

  const handleClick = async (e) => {
    e?.stopPropagation?.();
    if (!user || loading) return;
    setLoading(true);

    const prevLiked = liked;
    const prevCount = likesCount;
    const newLiked = !prevLiked;
    const newCount = prevCount + (newLiked ? 1 : -1);

    setLiked(newLiked);
    setLikesCount(Math.max(newCount, 0));

    try {
      if (newLiked) {
        const res = await likePost(postId);
        if (res?.likesCount !== undefined) setLikesCount(res.likesCount);
        if (typeof res?.liked !== 'undefined') setLiked(Boolean(res.liked));
      } else {
        const res = await unlikePost(postId);
        if (res?.likesCount !== undefined) setLikesCount(res.likesCount);
        if (typeof res?.liked !== 'undefined') setLiked(Boolean(res.liked));
      }
    } catch (err) {
      console.error('[PostLikeButton] Like/unlike error', err);
      setLiked(prevLiked);
      setLikesCount(prevCount);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return null;

  if (!user) {
    return (
      <div
        className={`${s.likeReadonly}`}
        title="Войдите, чтобы поставить лайк"
        aria-hidden="true"
      >
        ❤️ {likesCount}
      </div>
    );
  }

  return (
    <button
      className={`${s.likeButton} ${liked ? s.liked : ''}`}
      onClick={handleClick}
      disabled={loading}
      aria-pressed={liked}
      title={liked ? 'Убрать лайк' : 'Поставить лайк'}
    >
      {liked ? '❤️' : '🤍'} {likesCount}
    </button>
  );
}
