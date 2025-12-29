// Favorites.jsx
'use client';
import React, { useEffect, useState } from 'react';
import { getMyFavorites } from '@/services/api/post/api';
import Loader from '@/shared/Loader/Loader';
import PostCard from './PostCard/PostCard';
import styles from './Favorites.module.scss';
import Container from '@/shared/container/Container';

export default function Favorites() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const removePost = (id) => {
    setPosts((prev) => prev.filter((p) => String(p._id) !== String(id)));
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await getMyFavorites({ type: 'post', page: 1, limit: 50 });
        const arr = res?.data ?? res?.data?.data ?? [];

        const marked = arr.map((p) => ({ ...p, isFavorited: true }));
        if (mounted) setPosts(marked);
      } catch (err) {
        console.error('Failed to load favorites', err);
        if (mounted) setError(err.message || 'Failed to load');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, []);

  if (loading) return <Loader />;

  if (error) return <div className={styles.error}>Error: {error}</div>;

  if (!posts.length) return <div className={styles.empty}>Нет избранных</div>;

  return (
    <Container>
      <section className={styles.page}>
        <h1>Избранное</h1>
        <ul className={styles.list}>
          {posts.map((p) => (
            <li key={p._id}>
              <PostCard post={p} onRemove={() => removePost(p._id)} />
            </li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
