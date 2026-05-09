'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  uploadPortfolioFiles,
  deletePortfolioItem,
  setHeroMode as apiSetHeroMode,
  clearPortfolio as apiClearPortfolio,
} from '@/services/api/portfolio/api';
import { useAuth } from '@/services/store/useAuth';
import { addCacheBust } from '@/utils/url';
import {
  HERO_LIMITS,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
  ERROR_MESSAGES,
} from './constants';

export function usePortfolioManager({
  initialHeroType = null,
  initialHeroMedia = [],
  refreshUser,
} = {}) {
  const [heroType, setHeroType] = useState(initialHeroType);
  const [items, setItems] = useState(() =>
    (initialHeroMedia || []).map((it) => ({ ...it, url: addCacheBust(it.url) }))
  );
  const [uploadQueue, setUploadQueue] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [errors, setErrors] = useState([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef(null);

  const setUserStore = useAuth((s) => s.setUser);

  useEffect(() => {
    setHeroType(initialHeroType);
    setItems(
      (initialHeroMedia || []).map((it) => ({
        ...it,
        url: addCacheBust(it.url),
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    initialHeroType,
    JSON.stringify((initialHeroMedia || []).map((i) => i._id)),
  ]);

  const pushError = useCallback((msg) => {
    setErrors((e) => [msg, ...e].slice(0, 6));
    setTimeout(() => {
      setErrors((e) => e.filter((m) => m !== msg));
    }, 6000);
  }, []);

  const patchUserInStore = useCallback(
    (patch) => {
      const current = useAuth.getState().user;
      if (current) setUserStore({ ...current, ...patch });
    },
    [setUserStore]
  );

  const applyServerData = useCallback(
    (data) => {
      if (!data) return;
      const nextType = data.heroType ?? null;
      const nextMedia = (data.heroMedia || []).map((it) => ({
        ...it,
        url: addCacheBust(it.url),
      }));
      setHeroType(nextType);
      setItems(nextMedia);
      patchUserInStore({ heroType: nextType, heroMedia: data.heroMedia || [] });
    },
    [patchUserInStore]
  );

  const changeMode = useCallback(
    async (nextType) => {
      if (nextType === heroType) return;

      if (heroType && items.length > 0) {
        const ok = window.confirm(
          `При смене режима текущие файлы (${items.length}) будут безвозвратно удалены. Продолжить?`
        );
        if (!ok) return;
      }

      setBusy(true);
      try {
        const data = await apiSetHeroMode(nextType);
        applyServerData(data);
        refreshUser?.();
      } catch (err) {
        const code = err?.response?.data?.code;
        pushError(ERROR_MESSAGES[code] || 'Не удалось сменить режим');
      } finally {
        setBusy(false);
      }
    },
    [heroType, items.length, applyServerData, refreshUser, pushError]
  );

  const clearAll = useCallback(async () => {
    if (!heroType && items.length === 0) return;
    const ok = window.confirm('Очистить портфолио полностью?');
    if (!ok) return;

    setBusy(true);
    try {
      const data = await apiClearPortfolio();
      applyServerData(data);
      refreshUser?.();
    } catch (err) {
      pushError('Не удалось очистить портфолио');
    } finally {
      setBusy(false);
    }
  }, [heroType, items.length, applyServerData, refreshUser, pushError]);

  const updateUpload = useCallback((id, patch) => {
    setUploadQueue((q) => q.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  }, []);

  const startUpload = useCallback(
    async (uploadItem) => {
      updateUpload(uploadItem.id, { status: 'uploading', progress: 0 });

      const fd = new FormData();
      fd.append('files', uploadItem.file);

      try {
        const data = await uploadPortfolioFiles(fd, (p) =>
          updateUpload(uploadItem.id, { progress: p })
        );
        applyServerData(data);
        updateUpload(uploadItem.id, { status: 'done', progress: 100 });
        refreshUser?.();
      } catch (err) {
        const code = err?.response?.data?.code;
        updateUpload(uploadItem.id, { status: 'error' });
        pushError(
          ERROR_MESSAGES[code] ||
            `Ошибка загрузки ${uploadItem.file?.name ?? ''}`
        );
      } finally {
        setTimeout(
          () => setUploadQueue((q) => q.filter((u) => u.id !== uploadItem.id)),
          900
        );
      }
    },
    [applyServerData, refreshUser, updateUpload, pushError]
  );

  const detectKind = (file) => {
    if (file.type?.startsWith('image')) return 'photo';
    if (file.type?.startsWith('video')) return 'video';
    return 'unknown';
  };

  const validateFile = useCallback((file, mode) => {
    const kind = detectKind(file);
    const limits = HERO_LIMITS[mode];

    if (kind !== limits.kind) {
      return {
        ok: false,
        message: `${file.name} — для режима «${limits.label}» нужен ${
          limits.kind === 'video' ? 'видеофайл' : 'фото'
        }`,
      };
    }
    if (kind === 'photo' && file.size > MAX_IMAGE_BYTES) {
      return { ok: false, message: `${file.name} — фото больше 5 МБ` };
    }
    if (kind === 'video' && file.size > MAX_VIDEO_BYTES) {
      return { ok: false, message: `${file.name} — видео больше 100 МБ` };
    }
    return { ok: true, kind };
  }, []);

  const onFilesSelected = useCallback(
    (filesList) => {
      if (!heroType) {
        pushError(ERROR_MESSAGES.hero_mode_not_set);
        return;
      }
      const limits = HERO_LIMITS[heroType];
      const remaining = limits.count - items.length;
      if (remaining <= 0) {
        pushError(`Лимит достигнут: ${limits.count} файл(ов) в этом режиме`);
        return;
      }

      const files = Array.from(filesList || []);
      if (!files.length) return;

      const validFiles = [];
      let taken = 0;

      for (const file of files) {
        if (taken >= remaining) {
          pushError(`Можно добавить ещё только ${remaining} файл(ов)`);
          break;
        }
        const v = validateFile(file, heroType);
        if (!v.ok) {
          pushError(v.message);
          continue;
        }
        validFiles.push(file);
        taken += 1;
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
    [heroType, items.length, validateFile, startUpload, pushError]
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
      const ok = window.confirm('Удалить элемент портфолио?');
      if (!ok) return;

      const prev = items;
      setItems((it) => it.filter((x) => String(x._id) !== String(id)));

      try {
        const data = await deletePortfolioItem(id);
        applyServerData(data);
        refreshUser?.();
      } catch (err) {
        setItems(prev);
        pushError('Ошибка удаления. Попробуйте ещё раз.');
      }
    },
    [items, applyServerData, refreshUser, pushError]
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
    heroType,
    items,
    uploadQueue,
    dragOver,
    errors,
    busy,
    inputRef,
    changeMode,
    clearAll,
    handleInputChange,
    handleDelete,
    onDrop,
    onDragOver,
    onDragLeave,
    openFileDialog,
    limits: heroType ? HERO_LIMITS[heroType] : null,
    remaining: heroType ? HERO_LIMITS[heroType].count - items.length : 0,
  };
}
