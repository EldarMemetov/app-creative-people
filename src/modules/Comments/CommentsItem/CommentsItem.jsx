'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/services/store/useAuth';
import CommentForm from '../CommentForm/CommentForm';
import s from './CommentsItem.module.scss';
import {
  updateComment as apiUpdate,
  deleteComment as apiDelete,
  toggleCommentLike,
  addComment as apiAddComment,
  getComment as apiGetComment,
} from '@/services/api/comments/api';
import { ImageWithFallback } from '@/shared/ImageWithFallback/ImageWithFallback';
import { useTranslation } from 'react-i18next';
import { deleteCommentAsModerator } from '@/services/api/moderator/moderatorApi';
export default function CommentItem({
  comment,
  postId,
  commentsMap = {},
  onUpdateLocal,
  onRemoveLocal,
  onAddLocal,
}) {
  const { t } = useTranslation(['comments']);
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [replying, setReplying] = useState(false);
  const [busy, setBusy] = useState(false);

  const authorId = comment.author?._id || comment.author;
  const isAuthor = user && String(user._id) === String(authorId);
  const liked = Boolean(comment.liked);
  const likesCount = comment.likesCount ?? 0;

  const isModeratorOrAdmin = user && ['admin', 'moderator'].includes(user.role);

  const getSafePhoto = (url) => {
    if (!url) return '/image/avatar.png';
    return url && url.startsWith('http') ? url : '/image/avatar.png';
  };

  const avatarUrl = getSafePhoto(comment.author?.photo);

  const getParentCommentObj = () => {
    const p = comment.parentComment;
    if (!p) return null;
    if (typeof p === 'object') return { id: p._id, data: p };
    return { id: p, data: null };
  };

  const getReplyToUserObj = () => {
    const r = comment.replyTo;
    if (!r) return null;
    if (typeof r === 'object') return { id: r._id, name: r.nickname || null };
    return { id: r, name: null };
  };

  const parentObj = getParentCommentObj();
  const replyToUser = getReplyToUserObj();

  const parentHref = parentObj ? `#comment-${parentObj.id}` : null;

  const previewParent = parentObj
    ? commentsMap[String(parentObj.id)] || parentObj.data || null
    : null;

  const authorHref = isAuthor ? '/profile' : `/talents/${authorId}`;

  const handleEdit = async (text) => {
    setBusy(true);
    try {
      const res = await apiUpdate(postId, comment._id, text);
      const updated = res?.data ?? res;
      onUpdateLocal(updated);
      setEditing(false);
    } catch (e) {
      console.error('update comment error', e);
      throw e;
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (busy) return;
    setBusy(true);

    try {
      if (isAuthor) {
        await apiDelete(postId, comment._id);
      } else if (isModeratorOrAdmin) {
        await deleteCommentAsModerator(comment._id);
      } else {
        console.warn('Not authorized to delete this comment');
        return;
      }
      onRemoveLocal(comment._id);
    } catch (err) {
      console.error('delete comment error', err);
    } finally {
      setBusy(false);
    }
  };

  const handleToggleLike = async () => {
    if (!user) return;
    setBusy(true);
    const newLiked = !liked;
    const newCount = Math.max(likesCount + (newLiked ? 1 : -1), 0);
    onUpdateLocal?.({ ...comment, liked: newLiked, likesCount: newCount });
    try {
      const res = await toggleCommentLike(postId, comment._id);
      const data = res?.data ?? res;
      onUpdateLocal?.({
        ...comment,
        liked: Boolean(data.liked),
        likesCount: data.likesCount ?? newCount,
      });
    } catch (e) {
      console.error('toggle comment like error', e);
      onUpdateLocal?.({ ...comment, liked, likesCount });
    } finally {
      setBusy(false);
    }
  };

  const handleReplySubmit = async (text) => {
    setBusy(true);
    try {
      const resp = await apiAddComment(postId, text, {
        parentComment: comment._id,
        replyTo: authorId,
      });
      const created = resp?.data ?? resp;
      onAddLocal?.(created);
      setReplying(false);
    } catch (e) {
      console.error('reply submit error', e);
      throw e;
    } finally {
      setBusy(false);
    }
  };

  const fetchCommentById = async (id) => {
    try {
      if (typeof apiGetComment === 'function') {
        const resp = await apiGetComment(postId, id);
        return resp?.data ?? resp;
      }
      return null;
    } catch (err) {
      const status =
        err?.status ?? err?.response?.status ?? err?.statusCode ?? null;
      if (status === 404) return null;
      console.error('getComment failed', err);
      return null;
    }
  };

  const handlePreviewClick = async (e) => {
    e && e.preventDefault();
    if (!parentObj?.id) return;
    const id = String(parentObj.id);
    const el = document.getElementById(`comment-${id}`);
    if (el) {
      try {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        try {
          history.replaceState(null, '', `#comment-${id}`);
        } catch (err) {}
        el.classList.add(s.highlight);
        setTimeout(() => el.classList.remove(s.highlight), 1400);
      } catch (err) {
        console.warn('scroll error', err);
      }
      return;
    }

    setBusy(true);
    try {
      const fetched = await fetchCommentById(id);
      if (!fetched) {
        console.info('Комментарий не найден на сервере или недоступен.');
        return;
      }

      onAddLocal?.(fetched);

      setTimeout(() => {
        const newEl = document.getElementById(`comment-${id}`);
        if (newEl) {
          try {
            newEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            try {
              history.replaceState(null, '', `#comment-${id}`);
            } catch (err) {}
            newEl.classList.add(s.highlight);
            setTimeout(() => newEl.classList.remove(s.highlight), 1400);
          } catch (err) {
            console.warn('scroll after insert failed', err);
          }
        } else {
          console.warn('Элемент всё ещё не найден после вставки.');
        }
      }, 80);
    } catch (err) {
      console.error('Error while fetching/inserting parent comment', err);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.hash === `#comment-${comment._id}`) {
      const el = document.getElementById(`comment-${comment._id}`);
      if (el) {
        setTimeout(() => {
          try {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            el.classList.add(s.highlight);
            setTimeout(() => el.classList.remove(s.highlight), 1400);
          } catch (err) {}
        }, 60);
      }
    }
  }, [comment._id]);

  return (
    <div
      id={`comment-${comment._id}`}
      className={s.commentItem}
      data-id={comment._id}
    >
      <div className={s.commentHead}>
        <div className={s.author}>
          <Link href={authorHref} className={s.authorLink}>
            <ImageWithFallback
              width={50}
              height={50}
              src={avatarUrl}
              fallback="/image/avatar.png"
              alt={comment.author?.nickname || t('userFallback')}
              className={s.avatar}
            />
            <span>{comment.author?.nickname || t('userFallback')}</span>
          </Link>
        </div>
        <p className={s.date}>{new Date(comment.createdAt).toLocaleString()}</p>
      </div>

      <div className={s.commentBody}>
        {!editing ? (
          <>
            {parentObj &&
              (previewParent ? (
                previewParent.deleted ? (
                  <div
                    className={s.replyPreviewDeleted}
                    onClick={handlePreviewClick}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ')
                        handlePreviewClick(e);
                    }}
                    aria-label={t('aria.goToParentComment')}
                  >
                    <strong className={s.previewAuthor}>
                      {t('replyPreview.deleted')}
                    </strong>
                  </div>
                ) : (
                  <div
                    className={s.replyPreview}
                    onClick={handlePreviewClick}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ')
                        handlePreviewClick(e);
                    }}
                    aria-label={t('aria.goToParentComment')}
                  >
                    <strong className={s.previewAuthor}>
                      @
                      {replyToUser?.name ||
                        previewParent.author?.nickname ||
                        'User'}
                    </strong>
                    <p className={s.previewText}>
                      {String(previewParent.text ?? '')
                        .replace(/\n/g, ' ')
                        .slice(0, 140)}
                      {String(previewParent.text ?? '').length > 140 ? '…' : ''}
                    </p>
                  </div>
                )
              ) : (
                <div className={s.replyPreviewUnavailable}>
                  <a href={parentHref} onClick={handlePreviewClick}>
                    {t('replyPreview.unavailable')}
                  </a>
                </div>
              ))}

            <p className={s.commentText}>{comment.text}</p>
          </>
        ) : (
          <CommentForm
            initial={comment.text}
            submitLabel={t('actions.save')}
            onSubmit={handleEdit}
          />
        )}
      </div>

      <div className={s.commentActions}>
        <button
          className={s.linkBtn}
          onClick={handleToggleLike}
          disabled={busy || !user}
          title={
            user
              ? liked
                ? t('actions.unlike')
                : t('actions.like')
              : t('loginNotice')
          }
        >
          {liked ? '❤️' : '🤍'} {likesCount}
        </button>

        {user && !isAuthor && !editing && (
          <button
            className={s.linkBtn}
            onClick={() => setReplying((p) => !p)}
            disabled={busy}
          >
            {t('actions.replyLabel')}
          </button>
        )}

        {isAuthor && !editing && (
          <button
            className={s.linkBtn}
            onClick={() => setEditing(true)}
            disabled={busy}
          >
            {t('actions.edit')}
          </button>
        )}

        {!editing && (isAuthor || isModeratorOrAdmin) && (
          <button className={s.linkBtn} onClick={handleDelete} disabled={busy}>
            {t('actions.delete')}
          </button>
        )}

        {isAuthor && editing && (
          <button
            className={s.linkBtn}
            onClick={() => setEditing(false)}
            disabled={busy}
          >
            {t('actions.cancel')}
          </button>
        )}
      </div>

      {replying && (
        <div className={s.replyForm}>
          <CommentForm
            submitLabel={t('actions.replyLabel')}
            onSubmit={handleReplySubmit}
            initial={''}
          />
          <div>
            <button
              className={s.linkBtn}
              onClick={() => setReplying(false)}
              disabled={busy}
            >
              {t('actions.cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
