// components/Comments/CommentItem.jsx
'use client';
import React, { useState } from 'react';
import { useAuth } from '@/services/store/useAuth';
import CommentForm from '../CommentForm/CommentForm';
import s from './CommentsItem.module.scss';
import {
  updateComment as apiUpdate,
  deleteComment as apiDelete,
} from '@/services/api/comments/api';

export default function CommentItem({
  comment,
  postId,
  onUpdateLocal,
  onRemoveLocal,
}) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  const isAuthor =
    user && String(user._id) === String(comment.author?._id || comment.author);

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

  return (
    <div className={s.commentItem} data-id={comment._id}>
      <div className={s.commentHead}>
        <div className={s.author}>
          {comment.author?.name || 'User'} {comment.author?.surname || ''}
        </div>
        <div className={s.date}>
          {new Date(comment.createdAt).toLocaleString()}
        </div>
      </div>

      {!editing ? (
        <div className={s.commentText}>{comment.text}</div>
      ) : (
        <CommentForm
          initial={comment.text}
          submitLabel="Сохранить"
          onSubmit={handleEdit}
        />
      )}

      <div className={s.commentActions}>
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
    </div>
  );
}
