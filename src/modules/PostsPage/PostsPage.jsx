'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllPosts } from '@/services/api/post/api';
import styles from './PostsPage.module.scss';
import Container from '@/shared/container/Container';
import { LINKDATA, ROUTES } from '@/shared/constants';
import LinkButton from '@/shared/components/LinkButton/LinkButton';

const statusLabels = {
  open: 'Открыт',
  in_progress: 'Команда собрана',
  shooting_done: 'Завершён',
  expired: 'Истёк',
  canceled: 'Отменён',
};

const statusColors = {
  open: '#2196f3',
  in_progress: '#ff9800',
  shooting_done: '#4caf50',
  expired: '#9e9e9e',
  canceled: '#f44336',
};

const paymentLabel = (post) => {
  if (post.type === 'paid') return `${post.price} €`;
  if (post.type === 'percent') return `${post.percent}%`;
  if (post.type === 'negotiable') return 'Договорная';
  return 'TFP';
};

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
        if (mounted) setError(err?.message || 'Failed to load posts');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading)
    return (
      <div className={styles.centerWrap}>
        <div className={styles.centerText}>Loading posts…</div>
      </div>
    );

  if (error)
    return (
      <div className={styles.centerWrap}>
        <div className={styles.errorBox}>
          <div className={styles.errorMessage}>Error: {error}</div>
        </div>
      </div>
    );

  if (!posts || posts.length === 0)
    return (
      <div className={styles.centerWrap}>
        <div className={styles.empty}>No posts found</div>
      </div>
    );

  return (
    <section className={styles.page}>
      <Container>
        <div className={styles.header}>
          <h1 className={styles.title}>Posts</h1>
        </div>
        <LinkButton path={ROUTES.CREATE} type={LINKDATA.CREATE}>
          Створити пост
        </LinkButton>
        <ul className={styles.list}>
          {posts.map((post) => {
            const postHref = `/posts/${post._id}`;
            const authorName = post.author
              ? `${post.author.name || ''} ${post.author.surname || ''}`.trim()
              : 'Unknown';
            const desc = post.description || '';
            const shortDesc =
              desc.length > 160 ? desc.slice(0, 160) + '...' : desc;

            const status = post.status || 'open';
            const statusLabel = statusLabels[status] || status;
            const statusColor = statusColors[status] || '#999';

            return (
              <li key={post._id} className={styles.card}>
                <Link href={postHref} className={styles.cardLink}>
                  <div className={styles.cardBody}>
                    <div className={styles.cardHeader}>
                      <h2 className={styles.cardTitle}>{post.title || '—'}</h2>
                      <span
                        className={styles.statusBadge}
                        style={{ backgroundColor: statusColor }}
                      >
                        {statusLabel}
                      </span>
                    </div>

                    <div className={styles.cardMeta}>
                      <span className={styles.cardMetaCity}>
                        {post.city || '—'}
                      </span>
                      <span className={styles.separator}>•</span>
                      <span className={styles.cardMetaType}>
                        {paymentLabel(post)}
                      </span>
                      <span className={styles.separator}>•</span>
                      <span className={styles.cardMetaAuthor}>
                        {authorName || 'Unknown'}
                      </span>
                      {post.hasNoDate || !post.date ? (
                        <>
                          <span className={styles.separator}>•</span>
                          <span className={styles.cardMetaDate}>
                            Дата не определена
                          </span>
                        </>
                      ) : (
                        <>
                          <span className={styles.separator}>•</span>
                          <span className={styles.cardMetaDate}>
                            {new Date(post.date).toLocaleDateString()}
                          </span>
                        </>
                      )}
                    </div>

                    <p className={styles.cardDesc}>{shortDesc}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
