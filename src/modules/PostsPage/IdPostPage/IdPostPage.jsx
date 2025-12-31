'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getPostById } from '@/services/api/post/api';
import styles from './IdPostPage.module.scss';
import Container from '@/shared/container/Container';
import PostLikeButton from '@/shared/PostLikeButton/PostLikeButton';
import PostFavoriteButton from '@/shared/components/PostFavoriteButton/PostFavoriteButton';
import Comments from '@/modules/Comments/Comments';
export default function IdPostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError('Post id is missing');
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const data = await getPostById(id);
        setPost(data);
      } catch (err) {
        setError(err?.message || 'Failed to load post');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleUnfavorite = () => {
    setPost((prev) => (prev ? { ...prev, isFavorited: false } : prev));
  };

  if (loading) return <div className={styles.center}>Loading post…</div>;

  if (error)
    return (
      <div className={styles.center}>
        <p>Error: {error}</p>
        <Link href="/posts">Back to posts</Link>
      </div>
    );

  if (!post) return <div className={styles.center}>Post not found</div>;

  return (
    <section>
      <Container>
        <div className={styles.post}>
          <Link href="/posts" className={styles.back}>
            ← Back
          </Link>

          <h1 className={styles.title}>{post.title}</h1>

          <p className={styles.meta}>
            {post.country}, {post.city} • {post.type} •{' '}
            {new Date(post.createdAt).toLocaleString()}
          </p>

          {post.media?.length > 0 && (
            <div className={styles.media}>
              {post.media.map((m) =>
                m.type === 'photo' ? (
                  <div className={styles.mediaItem} key={m.public_id || m.url}>
                    <Image
                      className={styles.mediaImg}
                      src={m.url}
                      alt={post.title}
                      width={600}
                      height={400}
                    />
                  </div>
                ) : (
                  <div className={styles.mediaItem} key={m.public_id || m.url}>
                    <video className={styles.mediaImg} controls>
                      <source src={m.url} />
                    </video>
                  </div>
                )
              )}
            </div>
          )}

          <p className={styles.description}>{post.description}</p>

          <div className={styles.details}>
            <div className={styles.detailItem}>
              <strong>Status:</strong> {post.status}
            </div>

            {post.date && (
              <div className={styles.detailItem}>
                <strong>Date:</strong>{' '}
                {new Date(post.date).toLocaleDateString()}
              </div>
            )}

            {post.type === 'paid' && (
              <div className={styles.detailItem}>
                <strong>Price:</strong> {post.price}
              </div>
            )}

            {post.roleNeeded?.length > 0 && (
              <div className={styles.detailItem}>
                <strong>Roles needed:</strong> {post.roleNeeded.join(', ')}
              </div>
            )}
          </div>

          <div className={styles.author}>
            <strong>Author:</strong>{' '}
            {post.author
              ? `${post.author.name || ''} ${post.author.surname || ''}`
              : 'Unknown'}
          </div>

          <div className={styles.stats}>
            <PostLikeButton
              postId={post._id}
              initialCount={post.likesCount ?? post.likes?.length}
              initialLiked={post.liked}
            />
            <PostFavoriteButton
              postId={post._id}
              initialFavorited={post.isFavorited}
              onUnfavorite={handleUnfavorite}
            />
            <div className={styles.stat}>
              Interested: {post.interestedUsers?.length || 0}
            </div>
          </div>
          <Comments postId={post._id} />
        </div>
      </Container>
    </section>
  );
}
