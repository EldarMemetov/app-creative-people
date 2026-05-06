'use client';

import { useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import Loader from '@/shared/Loader/Loader';
import { ImageWithFallback } from '@/shared/ImageWithFallback/ImageWithFallback';
import { uploadPhoto, deletePhoto } from '@/services/api/profileEdit/media';
import s from './EditProfileAvatar.module.scss';

export default function EditProfileAvatar({ user, t, refreshUser }) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handlePhotoChange = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error(t('invalid_file'));
      return;
    }

    setLoading(true);
    try {
      if (user.photo) await deletePhoto();

      const formData = new FormData();
      formData.append('photo', file);

      await uploadPhoto(formData);
      await refreshUser();

      toast.success(t('photo_updated'));
    } catch (err) {
      console.error('Upload photo error:', err.response?.data || err);
      toast.error(t('upload_error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await deletePhoto();
      await refreshUser();
      toast.success(t('photo_deleted'));
    } catch (err) {
      console.error('Delete photo error:', err.response?.data || err);
      toast.error(t('delete_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={s.wrapper}>
      <div className={s.avatarBox}>
        {loading ? (
          <div className={s.loaderBox}>
            <Loader />
          </div>
        ) : (
          <ImageWithFallback
            src={user.photo || '/image/logo.png'}
            alt="avatar"
            width={140}
            height={140}
            className={s.avatar}
          />
        )}
      </div>

      <div className={s.controls}>
        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          className={s.fileInput}
          onChange={(e) => handlePhotoChange(e.target.files?.[0])}
        />

        <button
          type="button"
          className={s.changeBtn}
          onClick={() => inputRef.current?.click()}
          disabled={loading}
        >
          {loading ? t('saving') : t('change_photo')}
        </button>

        {user.photo && (
          <button
            type="button"
            className={s.removeBtn}
            disabled={loading}
            onClick={handleDelete}
          >
            {loading ? t('deleting') : t('remove_photo')}
          </button>
        )}
      </div>
    </div>
  );
}
