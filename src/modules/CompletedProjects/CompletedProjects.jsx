'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  getUserCompletedProjects,
  getUserReviews,
} from '@/services/api/reviews/api';
import StarRating from '@/shared/StarRating/StarRating';
import styles from './CompletedProjects.module.scss';

const PAGE_STEP = 3;
const VIDEO_PLACEHOLDER = '/image/hero-image.png';

export default function CompletedProjects({ userId }) {
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const [projectsVisible, setProjectsVisible] = useState(PAGE_STEP);
  const [reviewsVisible, setReviewsVisible] = useState(PAGE_STEP);

  // lightbox: { images: [{url}], index }
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [projectsRes, reviewsRes] = await Promise.all([
          getUserCompletedProjects(userId),
          getUserReviews(userId),
        ]);
        setProjects(projectsRes.data || []);
        setReviews(reviewsRes.data || []);
      } catch (err) {
        console.error('Failed to load completed projects', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  // ----- lightbox controls -----
  const openLightbox = (images, index) => setLightbox({ images, index });
  const closeLightbox = useCallback(() => setLightbox(null), []);

  const nextImage = useCallback(() => {
    setLightbox((lb) =>
      lb ? { ...lb, index: (lb.index + 1) % lb.images.length } : lb
    );
  }, []);

  const prevImage = useCallback(() => {
    setLightbox((lb) =>
      lb
        ? {
            ...lb,
            index: (lb.index - 1 + lb.images.length) % lb.images.length,
          }
        : lb
    );
  }, []);

  useEffect(() => {
    if (!lightbox) return;

    const onKey = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightbox, closeLightbox, nextImage, prevImage]);

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  const visibleProjects = projects.slice(0, projectsVisible);
  const visibleReviews = reviews.slice(0, reviewsVisible);

  return (
    <div className={styles.wrapper}>
      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'projects' ? styles.active : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          Завершённые проекты
          <span className={styles.tabCount}>{projects.length}</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'reviews' ? styles.active : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Отзывы
          <span className={styles.tabCount}>{reviews.length}</span>
        </button>
      </div>

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div className={styles.content}>
          {projects.length === 0 ? (
            <p className={styles.empty}>Нет завершённых проектов</p>
          ) : (
            <>
              <div className={styles.projectsList}>
                {visibleProjects.map((project) => (
                  <article key={project._id} className={styles.projectCard}>
                    <div className={styles.cardGlow} />

                    <div className={styles.projectHeader}>
                      <Link
                        href={`/posts/${project._id}`}
                        className={styles.projectTitle}
                      >
                        {project.title}
                      </Link>
                      {project.averageRating && (
                        <div className={styles.avgRating}>
                          <StarRating
                            value={Math.round(project.averageRating)}
                            readonly
                            size={16}
                          />
                          <span>{project.averageRating}</span>
                        </div>
                      )}
                    </div>

                    <div className={styles.projectMeta}>
                      {(project.city || project.country) && (
                        <span className={styles.metaPill}>
                          📍{' '}
                          {[project.city, project.country]
                            .filter(Boolean)
                            .join(', ')}
                        </span>
                      )}
                      {project.date && (
                        <span className={styles.metaPill}>
                          📅 {new Date(project.date).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {project.team && project.team.length > 0 && (
                      <div className={styles.team}>
                        <span className={styles.teamLabel}>Команда</span>
                        <div className={styles.teamMembers}>
                          {project.team.map((member, idx) => (
                            <Link
                              key={idx}
                              href={`/talents/${member.user?._id}`}
                              className={styles.teamMember}
                            >
                              {member.user?.photo && (
                                <Image
                                  src={member.user.photo}
                                  alt={member.user.name || ''}
                                  width={28}
                                  height={28}
                                  className={styles.teamAvatar}
                                />
                              )}
                              <span className={styles.teamName}>
                                {member.user?.name}
                              </span>
                              <span className={styles.memberRole}>
                                {member.role}
                              </span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {project.results && (
                      <div className={styles.results}>
                        {project.results.photos?.length > 0 && (
                          <div className={styles.resultsPhotos}>
                            {project.results.photos
                              .slice(0, 3)
                              .map((photo, idx) => (
                                <button
                                  type="button"
                                  key={idx}
                                  className={styles.resultThumbBtn}
                                  onClick={() =>
                                    openLightbox(project.results.photos, idx)
                                  }
                                  aria-label={`Открыть фото ${idx + 1}`}
                                >
                                  <Image
                                    src={photo.url}
                                    alt={`Result ${idx}`}
                                    width={120}
                                    height={90}
                                    className={styles.resultThumb}
                                  />
                                </button>
                              ))}
                            {project.results.photos.length > 3 && (
                              <button
                                type="button"
                                className={styles.morePhotos}
                                onClick={() =>
                                  openLightbox(project.results.photos, 3)
                                }
                              >
                                +{project.results.photos.length - 3}
                              </button>
                            )}
                          </div>
                        )}

                        {project.results.videoLinks?.length > 0 && (
                          <div className={styles.videosRow}>
                            {project.results.videoLinks
                              .slice(0, 3)
                              .map((link, idx) => (
                                <a
                                  key={idx}
                                  href={
                                    typeof link === 'string' ? link : link.url
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.videoThumb}
                                  title="Открыть видео"
                                >
                                  <Image
                                    src={VIDEO_PLACEHOLDER}
                                    alt="Видео"
                                    width={120}
                                    height={90}
                                    className={styles.videoThumbImg}
                                  />
                                  <span className={styles.playIcon}>▶</span>
                                </a>
                              ))}
                            {project.results.videoLinks.length > 3 && (
                              <span className={styles.morePhotos}>
                                +{project.results.videoLinks.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {project.reviews && project.reviews.length > 0 && (
                      <div className={styles.reviewsPreview}>
                        <span>💬 {project.reviewsCount} отзывов</span>
                      </div>
                    )}
                  </article>
                ))}
              </div>

              {projectsVisible < projects.length && (
                <div className={styles.showMoreWrap}>
                  <button
                    type="button"
                    className={styles.showMoreBtn}
                    onClick={() => setProjectsVisible((v) => v + PAGE_STEP)}
                  >
                    Показать ещё
                    <span className={styles.showMoreCount}>
                      +{Math.min(PAGE_STEP, projects.length - projectsVisible)}
                    </span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className={styles.content}>
          {reviews.length === 0 ? (
            <p className={styles.empty}>Нет отзывов</p>
          ) : (
            <>
              <div className={styles.reviewsList}>
                {visibleReviews.map((review) => (
                  <article key={review._id} className={styles.reviewCard}>
                    <div className={styles.cardGlow} />
                    <div className={styles.reviewHeader}>
                      <Link
                        href={`/talents/${review.author?._id}`}
                        className={styles.reviewAuthor}
                      >
                        {review.author?.photo && (
                          <Image
                            src={review.author.photo}
                            alt={review.author.name || ''}
                            width={40}
                            height={40}
                            className={styles.reviewAvatar}
                          />
                        )}
                        <span className={styles.reviewAuthorName}>
                          {review.author?.name} {review.author?.surname}
                        </span>
                      </Link>
                      <StarRating value={review.rating} readonly size={16} />
                    </div>

                    <p className={styles.reviewText}>{review.text}</p>

                    <div className={styles.reviewFooter}>
                      <Link
                        href={`/posts/${review.post?._id}`}
                        className={styles.reviewProject}
                      >
                        Проект: {review.post?.title}
                      </Link>
                      <span className={styles.reviewDate}>
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </article>
                ))}
              </div>

              {reviewsVisible < reviews.length && (
                <div className={styles.showMoreWrap}>
                  <button
                    type="button"
                    className={styles.showMoreBtn}
                    onClick={() => setReviewsVisible((v) => v + PAGE_STEP)}
                  >
                    Показать ещё
                    <span className={styles.showMoreCount}>
                      +{Math.min(PAGE_STEP, reviews.length - reviewsVisible)}
                    </span>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          onClick={closeLightbox}
        >
          <button
            type="button"
            className={styles.lbClose}
            onClick={closeLightbox}
            aria-label="Закрыть"
          >
            ✕
          </button>

          {lightbox.images.length > 1 && (
            <>
              <button
                type="button"
                className={`${styles.lbNav} ${styles.lbPrev}`}
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                aria-label="Предыдущее"
              >
                ‹
              </button>
              <button
                type="button"
                className={`${styles.lbNav} ${styles.lbNext}`}
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                aria-label="Следующее"
              >
                ›
              </button>
            </>
          )}

          <div
            className={styles.lbContent}
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              width={1000}
              height={1000}
              src={lightbox.images[lightbox.index]?.url}
              alt={`Фото ${lightbox.index + 1}`}
              className={styles.lbImage}
            />
            <div className={styles.lbCounter}>
              {lightbox.index + 1} / {lightbox.images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
