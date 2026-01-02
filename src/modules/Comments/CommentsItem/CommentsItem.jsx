'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/services/store/useAuth';
import CommentForm from '../CommentForm/CommentForm';
import s from './CommentsItem.module.scss';
import {
  updateComment as apiUpdate,
  deleteComment as apiDelete,
  toggleCommentLike,
  addComment as apiAddComment,
} from '@/services/api/comments/api';

export default function CommentItem({
  comment,
  postId,
  onUpdateLocal,
  onRemoveLocal,
  onAddLocal,
}) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [replying, setReplying] = useState(false);
  const [busy, setBusy] = useState(false);

  const authorId = comment.author?._id || comment.author;
  const isAuthor = user && String(user._id) === String(authorId);
  const liked = Boolean(comment.liked);
  const likesCount = comment.likesCount ?? 0;

  const displayReplyTo = () => {
    const r = comment.replyTo;
    if (!r) return null;
    if (typeof r === 'object') {
      return { id: r._id, name: `${r.name || ''} ${r.surname || ''}`.trim() };
    }
    return { id: r, name: null };
  };

  const authorHref = isAuthor ? '/profile' : `/talents/${authorId}`;
  const replyToObj = displayReplyTo();
  const replyToHref = replyToObj
    ? String(replyToObj.id) === String(user?._id)
      ? '/profile'
      : `/talents/${replyToObj.id}`
    : null;

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
    if (!confirm('Удалить комментарий?')) return;
    setBusy(true);
    try {
      await apiDelete(postId, comment._id);
      onRemoveLocal(comment._id);
    } catch (e) {
      console.error('delete comment error', e);
    } finally {
      setBusy(false);
    }
  };

  const handleToggleLike = async () => {
    if (!user) return;
    setBusy(true);

    const newLiked = !liked;
    const newCount = Math.max(likesCount + (newLiked ? 1 : -1), 0);

    onUpdateLocal?.({
      ...comment,
      liked: newLiked,
      likesCount: newCount,
    });

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

      onUpdateLocal?.({
        ...comment,
        liked,
        likesCount,
      });
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

  return (
    <div className={s.commentItem} data-id={comment._id}>
      <div className={s.commentHead}>
        <div className={s.author}>
          <Link href={authorHref} className={s.authorLink}>
            {comment.author?.name || 'User'} {comment.author?.surname || ''}
          </Link>
        </div>
        <div className={s.date}>
          {new Date(comment.createdAt).toLocaleString()}
        </div>
      </div>

      <div className={s.commentBody}>
        {!editing ? (
          <div className={s.commentText}>
            {replyToObj && (
              <Link href={replyToHref} className={s.authorLink}>
                <strong>@{replyToObj.name ? replyToObj.name : 'user'} </strong>
              </Link>
            )}
            {comment.text}
          </div>
        ) : (
          <CommentForm
            initial={comment.text}
            submitLabel="Сохранить"
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
                ? 'Убрать лайк'
                : 'Поставить лайк'
              : 'Войдите чтобы лайкать'
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
            Ответить
          </button>
        )}

        {isAuthor && !editing && (
          <>
            <button
              className={s.linkBtn}
              onClick={() => setEditing(true)}
              disabled={busy}
            >
              Редактировать
            </button>
            <button
              className={s.linkBtn}
              onClick={handleDelete}
              disabled={busy}
            >
              Удалить
            </button>
          </>
        )}
        {isAuthor && editing && (
          <button
            className={s.linkBtn}
            onClick={() => setEditing(false)}
            disabled={busy}
          >
            Отмена
          </button>
        )}
      </div>

      {replying && (
        <div className={s.replyForm}>
          <CommentForm
            submitLabel="Ответить"
            onSubmit={handleReplySubmit}
            initial={''}
          />
          <div>
            <button
              className={s.linkBtn}
              onClick={() => setReplying(false)}
              disabled={busy}
            >
              Отмена
            </button>
          </div>
        </div>
      )}

      {Array.isArray(comment.children) && comment.children.length > 0 && (
        <div className={s.replies}>
          {comment.children.map((child) => (
            <CommentItem
              key={child._id}
              comment={child}
              postId={postId}
              onUpdateLocal={onUpdateLocal}
              onRemoveLocal={onRemoveLocal}
              onAddLocal={onAddLocal}
            />
          ))}
        </div>
      )}
    </div>
  );
}
