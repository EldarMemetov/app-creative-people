'use client';
import { useState } from 'react';
import StarRating from '@/shared/StarRating/StarRating';
import { addReview, addResults } from '@/services/api/reviews/api';
import styles from './ReviewForm.module.scss';
import Image from 'next/image';

export default function ReviewForm({ postId, isAuthor = false, onSuccess }) {
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [photos, setPhotos] = useState([]);
  const [videoLinks, setVideoLinks] = useState([{ url: '', title: '' }]);
  const [loading, setLoading] = useState(false);

  const handleAddVideoLink = () => {
    setVideoLinks([...videoLinks, { url: '', title: '' }]);
  };

  const handleVideoLinkChange = (index, field, value) => {
    const updated = [...videoLinks];
    updated[index][field] = value;
    setVideoLinks(updated);
  };

  const handleRemoveVideoLink = (index) => {
    setVideoLinks(videoLinks.filter((_, i) => i !== index));
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 5) {
      alert('Максимум 5 фотографий');
      return;
    }
    setPhotos([...photos, ...files]);
  };

  const handleRemovePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim()) {
      alert('Напишите отзыв');
      return;
    }
    if (rating === 0) {
      alert('Поставьте оценку');
      return;
    }

    setLoading(true);
    try {
      await addReview(postId, { text, rating });

      if (isAuthor) {
        const filteredLinks = videoLinks.filter((v) => v.url.trim());
        if (photos.length > 0 || filteredLinks.length > 0) {
          await addResults(postId, {
            photos,
            videoLinks: filteredLinks,
          });
        }
      }

      setText('');
      setRating(0);
      setPhotos([]);
      setVideoLinks([{ url: '', title: '' }]);

      onSuccess?.();
    } catch (err) {
      alert(err?.response?.data?.message || 'Ошибка при отправке');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h3 className={styles.title}>Оставить отзыв о проекте</h3>

      <div className={styles.field}>
        <label className={styles.label}>Оценка</label>
        <StarRating value={rating} onChange={setRating} size={32} />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Отзыв</label>
        <textarea
          className={styles.textarea}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Напишите ваш отзыв о работе в команде..."
          rows={4}
          maxLength={2000}
        />
      </div>

      {isAuthor && (
        <>
          <div className={styles.field}>
            <label className={styles.label}>
              Фотографии результата (макс. 5)
            </label>
            <input
              className={styles.fileInput}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              disabled={photos.length >= 5}
            />
            {photos.length > 0 && (
              <div className={styles.photoPreview}>
                {photos.map((file, idx) => (
                  <div key={idx} className={styles.photoItem}>
                    <Image
                      className={styles.photoImg}
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${idx}`}
                      width={100}
                      height={100}
                    />
                    <button
                      type="button"
                      className={styles.photoRemoveBtn}
                      onClick={() => handleRemovePhoto(idx)}
                      aria-label="Удалить фото"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>
              Ссылки на видео (YouTube, Vimeo)
            </label>

            <div className={styles.videoLinkList}>
              {videoLinks.map((link, idx) => (
                <div key={idx} className={styles.videoLinkRow}>
                  <input
                    className={styles.input}
                    type="url"
                    placeholder="https://youtube.com/..."
                    value={link.url}
                    onChange={(e) =>
                      handleVideoLinkChange(idx, 'url', e.target.value)
                    }
                  />
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="Название (опционально)"
                    value={link.title}
                    onChange={(e) =>
                      handleVideoLinkChange(idx, 'title', e.target.value)
                    }
                  />
                  {videoLinks.length > 1 && (
                    <button
                      type="button"
                      className={styles.videoRemoveBtn}
                      onClick={() => handleRemoveVideoLink(idx)}
                      aria-label="Удалить ссылку"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAddVideoLink}
              className={styles.addLink}
            >
              + Добавить ссылку
            </button>
          </div>
        </>
      )}

      <button type="submit" disabled={loading} className={styles.submitBtn}>
        {loading ? 'Отправка...' : 'Отправить отзыв'}
      </button>
    </form>
  );
}
