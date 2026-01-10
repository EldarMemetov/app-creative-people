'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getMyPosts, deletePost } from '@/services/api/post/api';
import MyPostCard from '../MyPostCard/MyPostCard';
import s from './MyPostPage.module.scss';
import Loader from '@/shared/Loader/Loader';
import { useRouter } from 'next/navigation';

export default function MyPostsPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const router = useRouter();

  const load = useCallback(
    async (p = page) => {
      setLoading(true);
      try {
        const res = await getMyPosts({ page: p, limit });
        setItems(res.data || []);
        setTotal(res.total ?? 0);
      } catch (err) {
        console.error('Failed to load my posts', err);
        setItems([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    },
    [page, limit]
  );

  useEffect(() => {
    load(page);
  }, [load, page]);

  const handleDeletePost = async (postId) => {
    if (!confirm('Удалить пост? Это действие необратимо.')) return;
    setActionBusy(true);
    try {
      await deletePost(postId);
      setItems((prev) => prev.filter((p) => String(p._id) !== String(postId)));
    } catch (err) {
      console.error('Delete post failed', err);
      alert('Не удалось удалить пост');
    } finally {
      setActionBusy(false);
    }
  };

  const goToEdit = (post) => {
    router.push(`/posts/edit/${post._id}`);
  };

  if (loading) return <Loader />;

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className={s.myPosts}>
      <h1>Мои посты</h1>
      {items.length === 0 ? (
        <div className={s.empty}>
          У вас пока нет постов.{' '}
          <button onClick={() => router.push('/posts/create')}>
            Создать пост
          </button>
        </div>
      ) : (
        <>
          <div className={s.grid}>
            {items.map((p) => (
              <MyPostCard
                key={p._id}
                post={p}
                onEdit={(post) => goToEdit(post)}
                onDelete={() => handleDeletePost(p._id)}
                onDeleteMedia={(mediaId) => handleDeleteMedia(p._id, mediaId)}
                onUpload={(files) => handleUploadMedia(p._id, files)}
                disabled={actionBusy}
              />
            ))}
          </div>

          <div className={s.pagination}>
            <button
              onClick={() => setPage((s) => Math.max(1, s - 1))}
              disabled={page === 1}
            >
              ◀ Prev
            </button>
            <span>
              Стр. {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((s) => Math.min(totalPages, s + 1))}
              disabled={page >= totalPages}
            >
              Next ▶
            </button>
          </div>
        </>
      )}
    </div>
  );
}
