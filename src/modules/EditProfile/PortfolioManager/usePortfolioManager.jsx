'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  uploadPortfolioFiles,
  deletePortfolioItem,
} from '@/services/api/portfolio/api';
import { useAuth } from '@/services/store/useAuth';
import { addCacheBust } from '@/utils/url';

const MAX_IMAGE_BYTES =
  Number(process.env.NEXT_PUBLIC_MAX_IMAGE_BYTES) || 5 * 1024 * 1024;
const MAX_VIDEO_BYTES =
  Number(process.env.NEXT_PUBLIC_MAX_VIDEO_BYTES) || 100 * 1024 * 1024;
const MAX_PHOTOS = Number(process.env.NEXT_PUBLIC_MAX_PHOTOS) || 10;
const MAX_VIDEOS = Number(process.env.NEXT_PUBLIC_MAX_VIDEOS) || 1;

export function usePortfolioManager({
  initialPortfolio = [],
  refreshUser,
} = {}) {
  const [items, setItems] = useState(() => initialPortfolio || []);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState([]);
  const inputRef = useRef(null);

  const setUserStore = useAuth((s) => s.setUser);
  const setUserStoreRef = useRef(setUserStore);
  useEffect(() => {
    setUserStoreRef.current = setUserStore;
  }, [setUserStore]);

  useEffect(() => {
    if (!Array.isArray(initialPortfolio)) return;

    const prevIds = items.map((i) => String(i._id)).join(',');
    const nextIds = initialPortfolio.map((i) => String(i._id)).join(',');

    if (prevIds === nextIds) return;
    setItems(initialPortfolio || []);
  }, [initialPortfolio, items]);

  const pushError = useCallback((msg) => {
    setErrors((e) => [msg, ...e].slice(0, 6));

    setTimeout(() => {
      setErrors((e) => e.filter((m) => m !== msg));
    }, 6000);
  }, []);

  const updateUpload = useCallback((id, patch) => {
    setUploadQueue((q) => q.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }, []);

  const startUpload = useCallback(
    async (uploadItem) => {
      updateUpload(uploadItem.id, { status: 'uploading', progress: 0 });

      const fd = new FormData();
      fd.append('files', uploadItem.file);

      try {
        const result = await uploadPortfolioFiles(fd, (p) =>
          updateUpload(uploadItem.id, { progress: p })
        );

        let newPortfolio = null;
        if (Array.isArray(result)) newPortfolio = result;
        else if (result?.portfolio) newPortfolio = result.portfolio;
        else if (result?.data) newPortfolio = result.data;

        if (newPortfolio) {
          const patched = newPortfolio.map((it) => ({
            ...it,
            url: addCacheBust(it.url),
          }));
          setItems(patched);
          try {
            if (setUserStoreRef.current) {
              setUserStoreRef.current((prev) => ({
                ...prev,
                portfolio: patched,
              }));
            }
          } catch (e) {
            console.warn('setUserStore failed', e);
          }
        } else {
          const newItem = {
            _id: `local-${uploadItem.id}`,
            type: uploadItem.file.type.startsWith('video') ? 'video' : 'photo',
            url: URL.createObjectURL(uploadItem.file),
            description: '',
          };
          setItems((prev) => [...prev, newItem]);
          try {
            if (setUserStoreRef.current) {
              setUserStoreRef.current((prev) => ({
                ...prev,
                portfolio: prev?.portfolio
                  ? [...prev.portfolio, newItem]
                  : [newItem],
              }));
            }
          } catch (e) {}
        }

        updateUpload(uploadItem.id, { status: 'done', progress: 100 });
        refreshUser?.();
      } catch (err) {
        console.error(
          'Upload failed for',
          uploadItem.file?.name ?? uploadItem.id,
          err
        );
        updateUpload(uploadItem.id, { status: 'error' });
        pushError(`Ошибка загрузки ${uploadItem.file?.name ?? ''}`);
      } finally {
        setTimeout(
          () => setUploadQueue((q) => q.filter((u) => u.id !== uploadItem.id)),
          900
        );
      }
    },
    [refreshUser, updateUpload, pushError]
  );

  const detectKind = (file) => {
    if (file.type) {
      if (file.type.startsWith('image')) return 'photo';
      if (file.type.startsWith('video')) return 'video';
      return 'unknown';
    }
    const name = (file.name || '').toLowerCase();
    const ext = name.split('.').pop();
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) return 'photo';
    if (['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(ext)) return 'video';
    return 'unknown';
  };

  const validateFile = useCallback((file) => {
    const kind = detectKind(file);

    if (kind === 'photo') {
      if (file.size > MAX_IMAGE_BYTES) {
        return {
          ok: false,
          message: `${file.name} — фото больше 5 МБ`,
        };
      }
      return { ok: true, kind: 'photo' };
    }

    if (kind === 'video') {
      if (file.size > MAX_VIDEO_BYTES) {
        return {
          ok: false,
          message: `${file.name} — видео больше 100 МБ`,
        };
      }
      return { ok: true, kind: 'video' };
    }

    return {
      ok: false,
      message: `${file.name} — неподдерживаемый файл`,
    };
  }, []);

  const onFilesSelected = useCallback(
    (filesList) => {
      const files = Array.from(filesList || []);
      if (!files.length) return;

      const currentPhotoCount = items.filter(
        (it) => it.type === 'photo'
      ).length;
      const currentVideoCount = items.filter(
        (it) => it.type === 'video'
      ).length;

      let photoCount = currentPhotoCount;
      let videoCount = currentVideoCount;

      const validFiles = [];

      for (const file of files) {
        const v = validateFile(file);
        if (!v.ok) {
          pushError(v.message);
          continue;
        }

        if (v.kind === 'photo') {
          if (photoCount + 1 > MAX_PHOTOS) {
            pushError(`${file.name} — превысит лимит фото (${MAX_PHOTOS})`);
            continue;
          }
          photoCount += 1;
          validFiles.push(file);
        } else if (v.kind === 'video') {
          if (videoCount + 1 > MAX_VIDEOS) {
            pushError(
              `${file.name} — можно добавить только ${MAX_VIDEOS} видео`
            );
            continue;
          }
          videoCount += 1;
          validFiles.push(file);
        }
      }

      if (!validFiles.length) return;

      const newUploads = validFiles.map((file, i) => ({
        id: `${Date.now()}_${i}`,
        file,
        progress: 0,
        status: 'queued',
      }));

      setUploadQueue((q) => [...newUploads, ...q]);
      newUploads.forEach((u) => void startUpload(u));
    },
    [items, startUpload, pushError, validateFile]
  );

  const handleInputChange = useCallback(
    (e) => {
      onFilesSelected(e.target.files);
      e.target.value = '';
    },
    [onFilesSelected]
  );

  const handleDelete = useCallback(
    async (id) => {
      const confirmed = window.confirm('Удалить элемент портфолио?');
      if (!confirmed) return;

      const prev = items;
      setItems((it) => it.filter((x) => String(x._id) !== String(id)));

      try {
        const res = await deletePortfolioItem(id);

        let newPortfolio = null;
        if (res?.data) newPortfolio = res.data;

        if (Array.isArray(newPortfolio)) {
          const patched = newPortfolio.map((it) => ({
            ...it,
            url: addCacheBust(it.url),
          }));
          setItems(patched);
          try {
            if (setUserStoreRef.current)
              setUserStoreRef.current((prev) => ({
                ...prev,
                portfolio: patched,
              }));
          } catch (e) {}
        } else {
          try {
            if (setUserStoreRef.current) {
              setUserStoreRef.current((prev) => ({
                ...prev,
                portfolio: Array.isArray(prev?.portfolio)
                  ? prev.portfolio.filter((x) => String(x._id) !== String(id))
                  : [],
              }));
            }
          } catch (e) {}
        }

        refreshUser?.();
      } catch (err) {
        console.error('Failed to delete portfolio item', err);
        setItems(prev);
        pushError('Ошибка удаления. Попробуйте ещё раз.');
      }
    },
    [items, refreshUser, pushError]
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer?.files?.length) onFilesSelected(e.dataTransfer.files);
    },
    [onFilesSelected]
  );

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);
  const onDragLeave = useCallback(() => setDragOver(false), []);
  const openFileDialog = useCallback(() => inputRef.current?.click(), []);

  return {
    items,
    setItems,
    uploadQueue,
    dragOver,
    inputRef,
    onFilesSelected,
    handleInputChange,
    handleDelete,
    onDrop,
    onDragOver,
    onDragLeave,
    openFileDialog,
    errors,
    clearErrors: () => setErrors([]),
  };
}
