'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getPostById, extendPostDate } from '@/services/api/post/api';
import { useAuth } from '@/services/store/useAuth';
import styles from './IdPostPage.module.scss';
import Container from '@/shared/container/Container';
import PostLikeButton from '@/shared/PostLikeButton/PostLikeButton';
import PostFavoriteButton from '@/shared/components/PostFavoriteButton/PostFavoriteButton';
import Comments from '@/modules/Comments/Comments';
import ApplyToPost from '@/modules/ApplyToPost/ApplyToPost';
import ReviewForm from '@/modules/Reviews/ReviewForm';
import StarRating from '@/shared/StarRating/StarRating';
import { groupRoles } from '@/utils/groupRoles';
import {
  assignCandidates,
  rejectApplication,
  unassignCandidate,
} from '@/services/api/postRole/api';
import {
  confirmShooting,
  getUserCompletedProjects,
} from '@/services/api/reviews/api';

const getBerlinTodayISO = () =>
  new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Berlin' });

const paymentLabel = (post) => {
  if (post.type === 'paid') return `Оплата: ${post.price} €`;
  if (post.type === 'percent') return `Процент: ${post.percent}%`;
  if (post.type === 'negotiable') return 'Оплата договорная';
  return 'TFP';
};

export default function IdPostPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = useAuth((s) => s.user);
  const [assignLoading, setAssignLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [projectDetails, setProjectDetails] = useState(null);

  // Extend date state
  const [extendDate, setExtendDate] = useState('');
  const [extendLoading, setExtendLoading] = useState(false);
  const [showExtendPicker, setShowExtendPicker] = useState(false);

  const loadPost = async () => {
    try {
      const postData = await getPostById(id);
      setPost(postData);

      if (postData.status === 'shooting_done') {
        try {
          const details = await getUserCompletedProjects(
            postData.author._id || postData.author
          );
          const thisProject = details.data?.find(
            (p) => String(p._id) === String(id)
          );
          setProjectDetails(thisProject || null);
        } catch (e) {
          console.warn('Could not load project details', e);
        }
      }
    } catch (err) {
      setError(err?.message || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) {
      setError('Post id is missing');
      setLoading(false);
      return;
    }
    loadPost();
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

  const handleConfirmShooting = async () => {
    if (
      !confirm(
        'Подтвердить что съёмка прошла? Участники смогут оставить отзывы.'
      )
    ) {
      return;
    }
    setConfirmLoading(true);
    try {
      await confirmShooting(post._id);
      await loadPost();
      alert('Съёмка подтверждена! Теперь все участники могут оставить отзывы.');
    } catch (err) {
      alert(err?.response?.data?.message || 'Ошибка при подтверждении');
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleExtendDate = async () => {
    if (!extendDate) return alert('Выберите новую дату');
    if (extendDate < getBerlinTodayISO())
      return alert('Дата не может быть в прошлом');

    setExtendLoading(true);
    try {
      await extendPostDate(post._id, new Date(extendDate).toISOString());
      setShowExtendPicker(false);
      setExtendDate('');
      await loadPost();
    } catch (err) {
      alert(err?.response?.data?.message || 'Ошибка при продлении даты');
    } finally {
      setExtendLoading(false);
    }
  };

  const handleRejectApplicant = async (applicant) => {
    const applicationId = applicant.id || applicant._id;
    const applicantName = applicant?.user
      ? `${applicant.user.name || ''} ${applicant.user.surname || ''}`.trim()
      : 'кандидата';
    if (!confirm(`Отклонить заявку ${applicantName}?`)) return;
    try {
      await rejectApplication(post._id, applicationId);
      await loadPost();
    } catch (err) {
      alert(err?.response?.data?.message || 'Не удалось отклонить заявку');
    }
  };

  const handleUnassignApplicant = async (applicant) => {
    const applicationId = applicant.id || applicant._id;
    const applicantName = applicant?.user
      ? `${applicant.user.name || ''} ${applicant.user.surname || ''}`.trim()
      : 'кандидата';
    if (!confirm(`Снять ${applicantName} с поста?`)) return;
    try {
      await unassignCandidate(post._id, applicationId);
      await loadPost();
    } catch (err) {
      alert(err?.response?.data?.message || 'Не удалось снять кандидата');
    }
  };

  const handleSelectApplicant = async (applicant) => {
    const applicantName = applicant?.user
      ? `${applicant.user.name || ''} ${applicant.user.surname || ''}`.trim()
      : 'кандидата';
    if (!confirm(`Назначить ${applicantName} как ${applicant.appliedRole}?`))
      return;
    setAssignLoading(true);
    try {
      await assignCandidates(post._id, [
        { userId: applicant.user._id, role: applicant.appliedRole },
      ]);
      await loadPost();
      alert('Кандидат назначен.');
    } catch (err) {
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

  const isAuthor =
    currentUser &&
    String(currentUser._id) === String(post?.author?._id || post?.author);

  const isParticipant =
    currentUser &&
    (post?.assignedTo || []).some(
      (uid) => String(uid) === String(currentUser._id)
    );

  const canLeaveReview =
    post?.status === 'shooting_done' && (isAuthor || isParticipant);

  const myReview = projectDetails?.reviews?.find(
    (r) => String(r.author?._id) === String(currentUser?._id)
  );

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

  const statusLabels = {
    open: 'Открыт',
    in_progress: 'Команда собрана',
    shooting_done: 'Съёмка завершена',
    expired: 'Истёк срок',
    canceled: 'Отменён',
  };

  return (
    <section>
      <Container>
        <div className={styles.post}>
          <Link href="/posts" className={styles.back}>
            ← Back
          </Link>

          <h1 className={styles.title}>{post.title}</h1>

          <p className={styles.meta}>
            {post.country}, {post.city} • {paymentLabel(post)} •{' '}
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
              <strong>Статус:</strong>{' '}
              <span className={styles[`status_${post.status}`]}>
                {statusLabels[post.status] || post.status}
              </span>
            </div>

            {/* Дата съёмки или "не определена" */}
            <div className={styles.detailItem}>
              <strong>Дата съёмки:</strong>{' '}
              {post.hasNoDate || !post.date
                ? 'Не определена'
                : new Date(post.date).toLocaleDateString()}
            </div>

            {/* Оплата */}
            <div className={styles.detailItem}>
              <strong>Оплата:</strong> {paymentLabel(post)}
            </div>

            {grouped.length > 0 && (
              <div className={styles.detailItem}>
                <strong>Нужны роли:</strong>
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
            <strong>Автор:</strong>{' '}
            {post.author ? (
              <Link href={`/talents/${post.author._id}`}>
                {post.author.name || ''} {post.author.surname || ''}
              </Link>
            ) : (
              'Unknown'
            )}
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

          {/* Кнопка "Съёмка прошла" */}
          {isAuthor && post.status === 'in_progress' && (
            <div className={styles.confirmSection}>
              <p>Команда собрана. После съёмки подтвердите завершение:</p>
              <button
                onClick={handleConfirmShooting}
                disabled={confirmLoading}
                className={styles.confirmButton}
              >
                {confirmLoading ? 'Подтверждение...' : '✅ Съёмка прошла'}
              </button>
            </div>
          )}

          {/* ⏳ Блок продления даты — только для автора при status === 'expired' */}
          {isAuthor && post.status === 'expired' && (
            <div className={styles.expiredSection}>
              <p className={styles.expiredText}>
                ⏳ Срок поста истёк, команда не собралась. Хотите продлить дату
                и попробовать снова?
              </p>
              {!showExtendPicker ? (
                <button
                  className={styles.extendButton}
                  onClick={() => setShowExtendPicker(true)}
                >
                  Продлить дату
                </button>
              ) : (
                <div className={styles.extendPicker}>
                  <label>Новая дата съёмки:</label>
                  <input
                    type="date"
                    min={getBerlinTodayISO()}
                    value={extendDate}
                    onChange={(e) => setExtendDate(e.target.value)}
                  />
                  <div className={styles.extendActions}>
                    <button
                      onClick={handleExtendDate}
                      disabled={extendLoading || !extendDate}
                      className={styles.extendConfirmButton}
                    >
                      {extendLoading ? 'Сохраняем...' : 'Подтвердить'}
                    </button>
                    <button
                      onClick={() => {
                        setShowExtendPicker(false);
                        setExtendDate('');
                      }}
                      disabled={extendLoading}
                      className={styles.extendCancelButton}
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Секция отзывов */}
          {post.status === 'shooting_done' && (
            <div className={styles.reviewsSection}>
              <h2>Проект завершён</h2>

              {projectDetails?.team && projectDetails.team.length > 0 && (
                <div className={styles.teamSection}>
                  <h3>Команда</h3>
                  <div className={styles.teamList}>
                    {projectDetails.team.map((member, idx) => (
                      <Link
                        key={idx}
                        href={`/talents/${member.user?._id}`}
                        className={styles.teamMember}
                      >
                        {member.user?.photo && (
                          <Image
                            src={member.user.photo}
                            alt={member.user.name}
                            width={40}
                            height={40}
                          />
                        )}
                        <span>
                          {member.user?.name} {member.user?.surname}
                        </span>
                        <span className={styles.memberRole}>{member.role}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {projectDetails?.results && (
                <div className={styles.resultsSection}>
                  <h3>Результаты работы</h3>
                  {projectDetails.results.photos?.length > 0 && (
                    <div className={styles.resultsPhotos}>
                      {projectDetails.results.photos.map((photo, idx) => (
                        <Image
                          key={idx}
                          src={photo.url}
                          alt={`Result ${idx + 1}`}
                          width={200}
                          height={150}
                          className={styles.resultPhoto}
                        />
                      ))}
                    </div>
                  )}
                  {projectDetails.results.videoLinks?.length > 0 && (
                    <div className={styles.resultsVideos}>
                      {projectDetails.results.videoLinks.map((video, idx) => (
                        <a
                          key={idx}
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.videoLink}
                        >
                          🎬 {video.title || video.url}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {projectDetails?.reviews && projectDetails.reviews.length > 0 && (
                <div className={styles.reviewsList}>
                  <h3>Отзывы ({projectDetails.reviews.length})</h3>
                  {projectDetails.reviews.map((review) => (
                    <div key={review._id} className={styles.reviewCard}>
                      <div className={styles.reviewHeader}>
                        <Link href={`/talents/${review.author?._id}`}>
                          {review.author?.name} {review.author?.surname}
                        </Link>
                        <StarRating value={review.rating} readonly size={18} />
                      </div>
                      <p className={styles.reviewText}>{review.text}</p>
                      <span className={styles.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {canLeaveReview && !myReview && (
                <ReviewForm
                  postId={post._id}
                  isAuthor={isAuthor}
                  onSuccess={loadPost}
                />
              )}

              {myReview && (
                <div className={styles.myReviewNote}>
                  ✅ Вы уже оставили отзыв на этот проект
                </div>
              )}
            </div>
          )}

          {/* Заявки для автора */}
          {isAuthor &&
            Array.isArray(post.applications) &&
            post.applications.length > 0 &&
            post.status === 'open' && (
              <div style={{ marginTop: 20 }}>
                <h3>Заявки ({post.applications.length})</h3>
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
                            {a.message && (
                              <div style={{ marginTop: 4 }}>{a.message}</div>
                            )}
                            <div style={{ fontSize: 12, color: '#666' }}>
                              {new Date(a.createdAt).toLocaleString()}
                            </div>
                            {isApplied && (
                              <div style={{ marginTop: 6, color: '#b7791f' }}>
                                Ожидает ответа
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
                            <div
                              style={{ marginTop: 8, display: 'flex', gap: 8 }}
                            >
                              {isApplied && (
                                <button
                                  type="button"
                                  onClick={() => handleRejectApplicant(a)}
                                >
                                  Отклонить
                                </button>
                              )}
                              {isSelected && (
                                <button
                                  type="button"
                                  onClick={() => handleUnassignApplicant(a)}
                                >
                                  Снять
                                </button>
                              )}
                              {isApplied &&
                                !roleFilled &&
                                post.status === 'open' && (
                                  <button
                                    onClick={() => handleSelectApplicant(a)}
                                    disabled={assignLoading}
                                  >
                                    {assignLoading ? 'Отправка…' : 'Выбрать'}
                                  </button>
                                )}
                            </div>
                            {isApplied && roleFilled && (
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

          <Comments targetType="post" targetId={post._id} />
        </div>
      </Container>
    </section>
  );
}
