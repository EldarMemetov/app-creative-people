'use client';

import { useRef } from 'react';
import { toast } from 'react-hot-toast';
import Loader from '@/shared/Loader/Loader';
import { ImageWithFallback } from '@/shared/ImageWithFallback/ImageWithFallback';
import { uploadPhoto, deletePhoto } from '@/services/api/profileEdit/media';

export default function EditProfileAvatar({
  user,
  t,
  uploadingPhoto,
  setUploadingPhoto,
  refreshUser,
}) {
  const inputRef = useRef(null);

  const handlePhotoChange = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error(t('invalid_file'));
      return;
    }

    setUploadingPhoto(true);
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
      setUploadingPhoto(false);
    }
  };

  return (
    <div>
      <div>
        {uploadingPhoto ? (
          <Loader />
        ) : (
          <ImageWithFallback
            src={user.photo || '/image/logo.png'}
            alt="avatar"
            width={100}
            height={100}
          />
        )}
      </div>

      <div>
        <input
          type="file"
          accept="image/*"
          ref={inputRef}
          style={{ display: 'none' }}
          onChange={(e) => handlePhotoChange(e.target.files?.[0])}
        />

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploadingPhoto}
        >
          {uploadingPhoto ? t('saving') : t('change_photo')}
        </button>

        {user.photo && (
          <button
            type="button"
            disabled={uploadingPhoto}
            onClick={async () => {
              setUploadingPhoto(true);
              try {
                await deletePhoto();
                await refreshUser();
                toast.success(t('photo_deleted'));
              } catch (err) {
                console.error('Delete photo error:', err.response?.data || err);
                toast.error(t('delete_error'));
              } finally {
                setUploadingPhoto(false);
              }
            }}
          >
            {uploadingPhoto ? t('deleting') : t('remove_photo')}
          </button>
        )}
      </div>
    </div>
  );
}
