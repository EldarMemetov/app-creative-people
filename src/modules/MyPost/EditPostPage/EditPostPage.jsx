'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getPostById } from '@/services/api/post/api';
import CreatePostForm from '@/modules/PostForm/CreatePostForm/CreatePostForm'; // поправь путь если у тебя другой
import Loader from '@/shared/Loader/Loader';
import s from './EditPostPage.module.scss'; // опционально: стили

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (!id) {
        setError('Id поста не указан');
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await getPostById(id);
        if (!mounted) return;
        setPost(data);
      } catch (err) {
        console.error('Failed to load post for edit', err);
        if (!mounted) return;
        setError('Не удалось загрузить пост');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) return <Loader />;

  if (error) {
    return (
      <div className={s.errorWrap || ''}>
        <h2>Ошибка</h2>
        <p>{error}</p>
        <button onClick={() => router.push('/posts')}>
          Назад к моим постам
        </button>
      </div>
    );
  }

  if (!post) {
    return (
      <div>
        <p>Пост не найден</p>
        <button onClick={() => router.push('/posts')}>Назад</button>
      </div>
    );
  }

  return (
    <div className={s.editPage || ''}>
      <CreatePostForm initial={post} />
    </div>
  );
}
