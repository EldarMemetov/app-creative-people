'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { getMyPosts, deletePost } from '@/services/api/post/api';
import MyPostCard from '../MyPostCard/MyPostCard';
import s from './MyPostPage.module.scss';
import Loader from '@/shared/Loader/Loader';
import Container from '@/shared/container/Container';
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
    if (!confirm('Видалити пост? Цю дію неможливо скасувати.')) return;
    setActionBusy(true);
    try {
      await deletePost(postId);
      setItems((prev) => prev.filter((p) => String(p._id) !== String(postId)));
      setTotal((t) => Math.max(0, t - 1));
    } catch (err) {
      console.error('Delete post failed', err);
      alert('Не вдалося видалити пост');
    } finally {
      setActionBusy(false);
    }
  };

  const goToEdit = (post) => {
    router.push(`/posts/edit/${post._id}`);
  };

  const goToCreate = () => {
    router.push('/posts/create');
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <Container>
      <section className={s.section}>
        <header className={s.header}>
          <div className={s.headerTop}>
            <span className={s.headerLine} />
            <p className={s.eyebrow}>Workspace · Posts</p>
          </div>

          <div className={s.headerRow}>
            <h1 className={s.title}>Мої публікації</h1>

            <button
              type="button"
              className={s.createBtn}
              onClick={goToCreate}
              disabled={actionBusy}
            >
              <span className={s.createIcon} aria-hidden="true">
                +
              </span>
              Створити пост
            </button>
          </div>

          <div className={s.meta}>
            <p className={s.counter}>
              <span className={s.counterNum}>
                {String(total).padStart(3, '0')}
              </span>
              <span className={s.counterLabel}>
                {total === 1 ? 'пост' : 'постів'}
                <br />у твоєму профілі
              </span>
            </p>
            <p className={s.subtitle}>
              Керуй своїми публікаціями — редагуй, оновлюй медіа або створюй
              нові роботи, якими пишаєшся.
            </p>
          </div>
        </header>

        {loading ? (
          <div className={s.loaderWrap}>
            <Loader />
          </div>
        ) : items.length === 0 ? (
          <div className={s.empty}>
            <div className={s.emptyBadge}>00</div>
            <h2 className={s.emptyTitle}>Поки що порожньо</h2>
            <p className={s.emptyText}>
              Тут з’являться твої публікації. Почни з першої — поділись
              проєктом, ідеєю або портфоліо.
            </p>
            <button type="button" className={s.emptyBtn} onClick={goToCreate}>
              <span className={s.createIcon} aria-hidden="true">
                +
              </span>
              Створити перший пост
            </button>
          </div>
        ) : (
          <>
            <ul className={s.grid}>
              {items.map((p, idx) => (
                <li
                  key={p._id}
                  className={s.cardItem}
                  style={{ animationDelay: `${Math.min(idx * 0.05, 0.6)}s` }}
                >
                  <MyPostCard
                    post={p}
                    onEdit={(post) => goToEdit(post)}
                    onDelete={() => handleDeletePost(p._id)}
                    disabled={actionBusy}
                  />
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <nav className={s.pagination} aria-label="Пагінація">
                <button
                  type="button"
                  className={s.pageBtn}
                  onClick={() => setPage((v) => Math.max(1, v - 1))}
                  disabled={page === 1}
                >
                  <span className={s.pageArrow}>←</span> Попередня
                </button>

                <span className={s.pageInfo}>
                  <span className={s.pageNum}>
                    {String(page).padStart(2, '0')}
                  </span>
                  <span className={s.pageDivider}>/</span>
                  <span className={s.pageTotal}>
                    {String(totalPages).padStart(2, '0')}
                  </span>
                </span>

                <button
                  type="button"
                  className={s.pageBtn}
                  onClick={() => setPage((v) => Math.min(totalPages, v + 1))}
                  disabled={page >= totalPages}
                >
                  Наступна <span className={s.pageArrow}>→</span>
                </button>
              </nav>
            )}
          </>
        )}
      </section>
    </Container>
  );
}
