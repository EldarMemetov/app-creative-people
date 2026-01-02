'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAllPosts } from '@/services/api/post/api';
import styles from './PostsPage.module.scss';
import Container from '@/shared/container/Container';

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

  if (loading) {
    return (
      <div className={styles.centerWrap}>
        <div className={styles.centerText}>Loading posts…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.centerWrap}>
        <div className={styles.errorBox}>
          <div className={styles.errorMessage}>Error: {error}</div>
        </div>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className={styles.centerWrap}>
        <div className={styles.empty}>No posts found</div>
      </div>
    );
  }

  return (
    <section className={styles.page}>
      <Container>
        <div className={styles.header}>
          <h1 className={styles.title}>Posts</h1>
        </div>

        <ul className={styles.list}>
          {posts.map((post) => {
            const postHref = `/posts/${post._id}`;
            const authorName = post.author
              ? `${post.author.name || ''} ${post.author.surname || ''}`.trim()
              : 'Unknown';
            const desc = post.description || '';
            const shortDesc =
              desc.length > 160 ? desc.slice(0, 160) + '...' : desc;

            return (
              <li key={post._id} className={styles.card}>
                <Link href={postHref} className={styles.cardLink}>
                  <div className={styles.cardBody}>
                    <h2 className={styles.cardTitle}>{post.title || '—'}</h2>

                    <div className={styles.cardMeta}>
                      <span className={styles.cardMetaCity}>
                        {post.city || '—'}
                      </span>
                      <span className={styles.separator}>•</span>
                      <span className={styles.cardMetaType}>
                        {post.type || '—'}
                      </span>
                      <span className={styles.separator}>•</span>
                      <span className={styles.cardMetaAuthor}>
                        {authorName || 'Unknown'}
                      </span>
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
