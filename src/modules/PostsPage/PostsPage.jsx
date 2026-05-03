'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import { filterPosts } from '@/services/api/post/api';
import styles from './PostsPage.module.scss';
import Container from '@/shared/container/Container';
import { LINKDATA, ROUTES } from '@/shared/constants';
import LinkButton from '@/shared/components/LinkButton/LinkButton';
import FilterPost from '../Filter/FilterPost/FilterPost';

const statusLabels = {
  open: 'Відкритий',
  in_progress: 'Команда зібрана',
  shooting_done: 'Завершений',
  expired: 'Прострочений',
  canceled: 'Скасований',
};

const paymentLabel = (post) => {
  if (post.type === 'paid') return `${post.price} €`;
  if (post.type === 'percent') return `${post.percent}%`;
  if (post.type === 'negotiable') return 'Договірна';
  return 'TFP';
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString('uk-UA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const formatIndex = (n) => String(n + 1).padStart(2, '0');

export default function PostsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [posts, setPosts] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const page = Number(searchParams.get('page')) || 1;

  const paramsKey = useMemo(() => searchParams.toString(), [searchParams]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = Object.fromEntries(searchParams.entries());
        const { items, meta } = await filterPosts({
          ...params,
          page,
          limit: 20,
        });
        if (!mounted) return;
        setPosts(Array.isArray(items) ? items : []);
        setMeta(meta || { page, limit: 20, total: 0 });
      } catch (err) {
        if (mounted) setError(err?.message || 'Не вдалося завантажити пости');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [paramsKey, page, searchParams]);

  const totalPages = Math.max(
    1,
    Math.ceil((meta.total || 0) / (meta.limit || 20))
  );

  const goToPage = (p) => {
    const sp = new URLSearchParams(searchParams);
    sp.set('page', String(p));
    router.replace(`${pathname}?${sp.toString()}`);
  };

  return (
    <Container>
      <section className={styles.section}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <span className={styles.headerLine} />
            <p className={styles.eyebrow}>Feed · Community posts</p>
          </div>

          <div className={styles.headerRow}>
            <h1 className={styles.title}>Усі пости</h1>

            <div className={styles.headerCta}>
              <LinkButton path={ROUTES.CREATE} type={LINKDATA.CREATE}>
                + Створити пост
              </LinkButton>
            </div>
          </div>

          <div className={styles.meta}>
            <p className={styles.counter}>
              <span className={styles.counterNum}>
                {String(meta.total || 0).padStart(3, '0')}
              </span>
              <span className={styles.counterLabel}>
                {meta.total === 1 ? 'публікація' : 'публікацій'}
                <br />у стрічці
              </span>
            </p>
            <p className={styles.subtitle}>
              Зйомки, колаборації, кастинги та запити від креативної спільноти.
              Знайди свій проєкт або запропонуй власний.
            </p>
          </div>
          <FilterPost />
        </header>

        {loading ? (
          <div className={styles.state}>
            <span className={styles.stateDot} />
            Завантаження постів…
          </div>
        ) : error ? (
          <div className={`${styles.state} ${styles.stateError}`}>
            Помилка: {error}
          </div>
        ) : !posts.length ? (
          <div className={styles.empty}>
            <div className={styles.emptyBadge}>00</div>
            <h2 className={styles.emptyTitle}>Постів не знайдено</h2>
            <p className={styles.emptyText}>
              Спробуй змінити фільтри або скинути їх.
            </p>
          </div>
        ) : (
          <>
            <ul className={styles.list}>
              {posts.map((post, idx) => {
                const postHref = `/posts/${post._id}`;
                const authorName = post.author
                  ? `${post.author.name || ''} ${post.author.surname || ''}`.trim()
                  : 'Anonymous';
                const desc = post.description || '';
                const shortDesc =
                  desc.length > 180 ? desc.slice(0, 180).trim() + '…' : desc;

                const status = post.status || 'open';
                const statusLabel = statusLabels[status] || status;

                const thumb =
                  (post.media || []).find((m) => m.type === 'photo') ||
                  (post.media || [])[0];

                return (
                  <li
                    key={post._id}
                    className={styles.cardItem}
                    style={{ animationDelay: `${Math.min(idx * 0.04, 0.5)}s` }}
                  >
                    <Link href={postHref} className={styles.card}>
                      <span className={styles.accentBar} aria-hidden="true" />
                      <span className={styles.index}>{formatIndex(idx)}</span>

                      {thumb && thumb.type === 'photo' ? (
                        <div className={styles.thumb}>
                          <Image
                            src={thumb.url}
                            alt={post.title || ''}
                            fill
                            sizes="(max-width: 768px) 30vw, 200px"
                            className={styles.thumbImage}
                          />
                        </div>
                      ) : thumb && thumb.type === 'video' ? (
                        <div className={styles.thumb}>
                          <video
                            src={thumb.url}
                            muted
                            playsInline
                            preload="metadata"
                            className={styles.thumbVideo}
                          />
                          <span className={styles.thumbPlay} aria-hidden="true">
                            ▶
                          </span>
                        </div>
                      ) : (
                        <div className={`${styles.thumb} ${styles.thumbEmpty}`}>
                          <span>Без медіа</span>
                        </div>
                      )}

                      <div className={styles.body}>
                        <div className={styles.topRow}>
                          <span
                            className={`${styles.status} ${styles[`status_${status}`] || ''}`}
                          >
                            <span className={styles.statusDot} />
                            {statusLabel}
                          </span>
                          <span className={styles.payment}>
                            {paymentLabel(post)}
                          </span>
                        </div>

                        <h2 className={styles.cardTitle}>
                          {post.title || '—'}
                        </h2>
                        {shortDesc && (
                          <p className={styles.cardDesc}>{shortDesc}</p>
                        )}

                        <div className={styles.metaRow}>
                          {post.city && (
                            <span className={styles.metaItem}>
                              <span className={styles.metaLabel}>Локація</span>
                              <span className={styles.metaValue}>
                                {post.city}
                              </span>
                            </span>
                          )}
                          <span className={styles.metaItem}>
                            <span className={styles.metaLabel}>Дата</span>
                            <span className={styles.metaValue}>
                              {post.hasNoDate || !post.date
                                ? 'не визначена'
                                : formatDate(post.date)}
                            </span>
                          </span>
                          <span className={styles.metaItem}>
                            <span className={styles.metaLabel}>Автор</span>
                            <span className={styles.metaValue}>
                              {authorName || 'Anonymous'}
                            </span>
                          </span>
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button disabled={page <= 1} onClick={() => goToPage(page - 1)}>
                  ← Назад
                </button>
                <span>
                  {page} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages}
                  onClick={() => goToPage(page + 1)}
                >
                  Вперед →
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </Container>
  );
}
