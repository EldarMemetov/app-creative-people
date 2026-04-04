'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getPostById } from '@/services/api/post/api';
import { useAuth } from '@/services/store/useAuth';
import styles from './IdPostPage.module.scss';
import Container from '@/shared/container/Container';
import PostLikeButton from '@/shared/PostLikeButton/PostLikeButton';
import PostFavoriteButton from '@/shared/components/PostFavoriteButton/PostFavoriteButton';
import Comments from '@/modules/Comments/Comments';
import ApplyToPost from '@/modules/ApplyToPost/ApplyToPost';
import { groupRoles } from '@/utils/groupRoles';
import { assignCandidates } from '@/services/api/postRole/api';

export default function IdPostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = useAuth((s) => s.user);
  const [assignLoading, setAssignLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      setError('Post id is missing');
      setLoading(false);
      return;
    }

    const load = async () => {
      try {
        const postData = await getPostById(id);
        setPost(postData);
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

  const handleApplied = (postId) => {
    setPost((prev) =>
      prev && String(prev._id) === String(postId)
        ? {
            ...prev,
            applicationsCount: (prev.applicationsCount || 0) + 1,
            appliedByMe: true,
          }
        : prev
    );
  };

  const handleSelectApplicant = async (applicant) => {
    const applicantName = applicant?.user
      ? `${applicant.user.name || ''} ${applicant.user.surname || ''}`.trim()
      : 'кандидата';

    if (
      !confirm(
        `Вы уверены, что хотите назначить ${applicantName} как ${applicant.appliedRole}?`
      )
    ) {
      return;
    }

    setAssignLoading(true);
    try {
      await assignCandidates(post._id, [
        { userId: applicant.user._id, role: applicant.appliedRole },
      ]);

      const refreshed = await getPostById(id);
      setPost(refreshed);

      alert('Кандидат назначен.');
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || 'Не удалось назначить кандидата');
    } finally {
      setAssignLoading(false);
    }
  };

  const roleMap = useMemo(() => {
    const map = new Map();

    (post?.roleSlots || []).forEach((slot) => {
      const required = Number(slot.required) || 1;
      const assignedCount = Array.isArray(slot.assigned)
        ? slot.assigned.length
        : 0;

      map.set(String(slot.role), {
        required,
        assignedCount,
        available: Math.max(0, required - assignedCount),
      });
    });

    return map;
  }, [post]);

  const isRoleFilled = (role) => {
    const info = roleMap.get(String(role));
    return !info || info.available <= 0;
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

  const grouped = groupRoles(post.roleSlots);

  const isAuthor =
    currentUser &&
    String(currentUser._id) === String(post.author?._id || post.author);

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

            {grouped.length > 0 && (
              <div className={styles.detailItem}>
                <strong>Roles needed:</strong>
                <div className={styles.roleBadges}>
                  {grouped.map((g) => (
                    <span key={g.role} className={styles.roleBadge}>
                      <span className={styles.roleName}>{g.role}</span>
                      <span className={styles.roleCount}>×{g.count}</span>
                    </span>
                  ))}
                </div>
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

            <div style={{ marginLeft: 12 }}>
              <ApplyToPost
                post={post}
                currentUser={currentUser}
                initialApplied={!!post.appliedByMe}
                onApplied={handleApplied}
              />
            </div>
          </div>

          {isAuthor &&
            Array.isArray(post.applications) &&
            post.applications.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <h3>Applications ({post.applications.length})</h3>
                <ul>
                  {post.applications.map((a) => {
                    const isApplied = a.status === 'applied';
                    const isSelected = a.status === 'selected';
                    const isRejected = a.status === 'rejected';
                    const roleFilled = isRoleFilled(a.appliedRole);

                    return (
                      <li key={a._id || a.id} style={{ marginBottom: 10 }}>
                        {a.user ? (
                          <>
                            <Link href={`/talents/${a.user._id}`}>
                              {a.user.name} {a.user.surname}
                            </Link>{' '}
                            — <strong>{a.appliedRole}</strong>
                            {a.message ? (
                              <div style={{ marginTop: 4 }}>{a.message}</div>
                            ) : null}
                            <div style={{ fontSize: 12, color: '#666' }}>
                              {new Date(a.createdAt).toLocaleString()}
                            </div>
                            {isApplied &&
                              !roleFilled &&
                              post.status === 'open' && (
                                <div style={{ marginTop: 6 }}>
                                  <button
                                    onClick={() => handleSelectApplicant(a)}
                                    disabled={assignLoading}
                                  >
                                    {assignLoading ? 'Отправка…' : 'Выбрать'}
                                  </button>
                                </div>
                              )}
                            {isSelected && (
                              <div style={{ marginTop: 6, color: 'green' }}>
                                Уже назначен
                              </div>
                            )}
                            {isRejected && (
                              <div style={{ marginTop: 6, color: 'crimson' }}>
                                Отклонён
                              </div>
                            )}
                            {!isSelected && roleFilled && (
                              <div style={{ marginTop: 6, color: '#888' }}>
                                Роль уже заполнена
                              </div>
                            )}
                          </>
                        ) : (
                          <span>Информация о кандидате недоступна</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

          <Comments postId={post._id} />
        </div>
      </Container>
    </section>
  );
}
