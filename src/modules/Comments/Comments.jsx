'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { useAuth } from '@/services/store/useAuth';
import { getComments, addComment as apiAdd } from '@/services/api/comments/api';
import CommentForm from './CommentForm/CommentForm';
import CommentItem from './CommentsItem/CommentsItem';
import s from './Comments.module.scss';
import Loader from '@/shared/Loader/Loader';

export default function Comments({ postId }) {
  const { socket, joinPost, leavePost } = useSocket();
  const { user } = useAuth();

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page] = useState(1);
  const [limit] = useState(100);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getComments(postId, { page, limit });
      const items = res?.data ?? res?.data?.data ?? res?.data ?? [];
      setComments(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error('Failed to load comments', err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [postId, page, limit]);

  useEffect(() => {
    if (!postId) return;
    load();
  }, [postId, load]);

  useEffect(() => {
    if (!socket || !postId) return;

    try {
      joinPost(postId);
    } catch (e) {
      console.warn('joinPost failed', e);
    }

    const onNew = ({ postId: pid, comment }) => {
      if (String(pid) !== String(postId)) return;
      setComments((prev) => {
        if (prev.some((c) => String(c._id) === String(comment._id)))
          return prev;
        return [comment, ...prev];
      });
    };

    const onUpdated = ({ postId: pid, comment }) => {
      if (String(pid) !== String(postId)) return;
      setComments((prev) =>
        prev.map((c) => (String(c._id) === String(comment._id) ? comment : c))
      );
    };

    const onDeleted = ({ postId: pid, commentId }) => {
      if (String(pid) !== String(postId)) return;
      setComments((prev) =>
        prev.filter((c) => String(c._id) !== String(commentId))
      );
    };

    const onLike = ({
      commentId,
      liked,
      likesCount,
      byUserId,
      postId: pid,
    }) => {
      if (String(pid) !== String(postId)) return;

      setComments((prev) =>
        prev.map((c) => {
          if (String(c._id) !== String(commentId)) return c;

          const isActorCurrentUser = Boolean(
            user && String(user._id) === String(byUserId)
          );

          return {
            ...c,

            likesCount:
              typeof likesCount === 'number' ? likesCount : (c.likesCount ?? 0),

            liked: isActorCurrentUser ? Boolean(liked) : Boolean(c.liked),
          };
        })
      );
    };

    socket.on('comment:new', onNew);
    socket.on('comment:updated', onUpdated);
    socket.on('comment:deleted', onDeleted);
    socket.on('comment:like', onLike);

    return () => {
      try {
        socket.off('comment:new', onNew);
        socket.off('comment:updated', onUpdated);
        socket.off('comment:deleted', onDeleted);
        socket.off('comment:like', onLike);
        leavePost(postId);
      } catch (e) {}
    };
  }, [socket, postId, joinPost, leavePost, user]);

  const handleAdd = async (text, opts = {}) => {
    try {
      const res = await apiAdd(postId, text, opts);
      const created = res?.data ?? res;
      setComments((prev) => {
        if (prev.some((c) => String(c._id) === String(created._id)))
          return prev;
        return [created, ...prev];
      });
    } catch (e) {
      console.error('add comment failed', e);
      throw e;
    }
  };

  const onUpdateLocal = (updated) => {
    setComments((prev) =>
      prev.map((c) => (String(c._id) === String(updated._id) ? updated : c))
    );
  };

  const onRemoveLocal = (id) => {
    setComments((prev) => prev.filter((c) => String(c._id) !== String(id)));
  };

  const tree = useMemo(() => {
    const map = new Map();
    comments.forEach((c) => map.set(String(c._id), { ...c, children: [] }));
    const roots = [];

    for (const [, c] of map) {
      if (c.parentComment) {
        const parent = map.get(String(c.parentComment));
        if (parent) {
          parent.children.push(c);
        } else {
          roots.push(c);
        }
      } else {
        roots.push(c);
      }
    }

    roots.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const sortChildrenRec = (nodes) => {
      nodes.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      nodes.forEach((n) => sortChildrenRec(n.children));
    };
    sortChildrenRec(roots);

    return roots;
  }, [comments]);

  if (loading) return <Loader />;

  return (
    <div className={s.comments}>
      <h3>Комментарии ({comments.length})</h3>

      {user ? (
        <CommentForm onSubmit={(text) => handleAdd(text)} />
      ) : (
        <div className={s.loginNotice}>Войдите, чтобы оставить комментарий</div>
      )}

      <div className={s.list}>
        {tree.length === 0 ? (
          <div className={s.empty}>Нет комментариев</div>
        ) : (
          tree.map((c) => (
            <CommentItem
              key={c._id}
              comment={c}
              postId={postId}
              onUpdateLocal={(u) =>
                setComments((prev) =>
                  prev.map((x) => (String(x._id) === String(u._id) ? u : x))
                )
              }
              onRemoveLocal={(id) =>
                setComments((prev) =>
                  prev.filter((x) => String(x._id) !== String(id))
                )
              }
              onAddLocal={(created) =>
                setComments((prev) =>
                  prev.some((x) => String(x._id) === String(created._id))
                    ? prev
                    : [created, ...prev]
                )
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
