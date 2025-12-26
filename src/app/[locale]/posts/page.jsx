import PostsPage from '@/modules/PostsPage/PostsPage';
import s from './offers.module.scss';

export default function posts() {
  return (
    <div className={s.container}>
      <PostsPage />
    </div>
  );
}
