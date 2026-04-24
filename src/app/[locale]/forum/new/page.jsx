'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/services/store/useAuth';
import TopicForm from '@/modules/Forum/TopicForm/TopicForm';
import Container from '@/shared/container/Container';
import { createTopic } from '@/services/api/forum/api';

export default function NewTopicPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user === null) router.replace('/login');
  }, [user, router]);

  const handleCreate = async (values) => {
    const created = await createTopic(values);
    router.push(`/forum/${created._id}`);
  };

  return (
    <section>
      <Container>
        <h1>Новая тема</h1>
        <TopicForm onSubmit={handleCreate} submitLabel="Создать" />
      </Container>
    </section>
  );
}
