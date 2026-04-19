'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  getUserCompletedProjects,
  getUserReviews,
} from '@/services/api/reviews/api';
import StarRating from '@/shared/StarRating/StarRating';
import styles from './CompletedProjects.module.scss';

export default function CompletedProjects({ userId }) {
  const [activeTab, setActiveTab] = useState('projects');
  const [projects, setProjects] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  return (
    <div className={styles.wrapper}>
      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'projects' ? styles.active : ''}`}
          onClick={() => setActiveTab('projects')}
        >
          Завершённые проекты ({projects.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'reviews' ? styles.active : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          Отзывы ({reviews.length})
        </button>
      </div>

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div className={styles.content}>
          {projects.length === 0 ? (
            <p className={styles.empty}>Нет завершённых проектов</p>
          ) : (
            <div className={styles.projectsList}>
              {projects.map((project) => (
                <div key={project._id} className={styles.projectCard}>
                  {/* Header */}
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

                  {/* Meta */}
                  <div className={styles.projectMeta}>
                    <span>
                      {project.city}, {project.country}
                    </span>
                    {project.date && (
                      <span>{new Date(project.date).toLocaleDateString()}</span>
                    )}
                  </div>

                  {/* Team */}
                  {project.team && project.team.length > 0 && (
                    <div className={styles.team}>
                      <span className={styles.teamLabel}>Команда:</span>
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
                              />
                            )}
                            <span>{member.user?.name}</span>
                            <span className={styles.memberRole}>
                              {member.role}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Results */}
                  {project.results && (
                    <div className={styles.results}>
                      {project.results.photos?.length > 0 && (
                        <div className={styles.resultsPhotos}>
                          {project.results.photos
                            .slice(0, 3)
                            .map((photo, idx) => (
                              <Image
                                key={idx}
                                src={photo.url}
                                alt={`Result ${idx}`}
                                width={80}
                                height={60}
                                className={styles.resultThumb}
                              />
                            ))}
                          {project.results.photos.length > 3 && (
                            <span className={styles.morePhotos}>
                              +{project.results.photos.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {project.results.videoLinks?.length > 0 && (
                        <div className={styles.videoCount}>
                          🎬 {project.results.videoLinks.length} видео
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reviews preview */}
                  {project.reviews && project.reviews.length > 0 && (
                    <div className={styles.reviewsPreview}>
                      <span>{project.reviewsCount} отзывов</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'reviews' && (
        <div className={styles.content}>
          {reviews.length === 0 ? (
            <p className={styles.empty}>Нет отзывов</p>
          ) : (
            <div className={styles.reviewsList}>
              {reviews.map((review) => (
                <div key={review._id} className={styles.reviewCard}>
                  <div className={styles.reviewHeader}>
                    <Link
                      href={`/talents/${review.author?._id}`}
                      className={styles.reviewAuthor}
                    >
                      {review.author?.photo && (
                        <Image
                          src={review.author.photo}
                          alt={review.author.name || ''}
                          width={36}
                          height={36}
                        />
                      )}
                      <span>
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
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
