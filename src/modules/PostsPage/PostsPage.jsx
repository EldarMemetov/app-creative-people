'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllPosts } from '@/services/api/post/api';
import styles from './PostsPage.module.scss';
import Container from '@/shared/container/Container';
import { LINKDATA, ROUTES } from '@/shared/constants';
import LinkButton from '@/shared/components/LinkButton/LinkButton';

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
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllPosts();
        const postsArray = Array.isArray(data)
          ? data
          : Array.isArray(data?.posts)
            ? data.posts
            : Array.isArray(data?.data)
              ? data.data
              : [];
        if (mounted) setPosts(postsArray);
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
  }, []);

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
                {String(posts.length).padStart(3, '0')}
              </span>
              <span className={styles.counterLabel}>
                {posts.length === 1 ? 'публікація' : 'публікацій'}
                <br />у стрічці
              </span>
            </p>
            <p className={styles.subtitle}>
              Зйомки, колаборації, кастинги та запити від креативної спільноти.
              Знайди свій проєкт або запропонуй власний.
            </p>
          </div>
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
            <h2 className={styles.emptyTitle}>Постів поки немає</h2>
            <p className={styles.emptyText}>
              Будь першим, хто поділиться проєктом або зйомкою — створи
              публікацію і знайди свою команду.
            </p>
          </div>
        ) : (
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
                          className={`${styles.status} ${
                            styles[`status_${status}`] || ''
                          }`}
                        >
                          <span className={styles.statusDot} />
                          {statusLabel}
                        </span>

                        <span className={styles.payment}>
                          {paymentLabel(post)}
                        </span>
                      </div>

                      <h2 className={styles.cardTitle}>{post.title || '—'}</h2>

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
        )}
      </section>
    </Container>
  );
}
