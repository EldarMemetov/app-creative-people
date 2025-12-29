// PostCard.jsx
import Link from 'next/link';
import PostFavoriteButton from '@/shared/components/PostFavoriteButton/PostFavoriteButton';

export default function PostCard({ post, onRemove }) {
  return (
    <article>
      <h2>
        <Link href={`/posts/${post._id}`}>{post.title}</Link>
      </h2>
      <PostFavoriteButton
        postId={post._id}
        initialFavorited={post.isFavorited}
        onUnfavorite={onRemove}
      />

      <p>
        {post.description?.slice(0, 160)}
        {post.description?.length > 160 ? '...' : ''}
      </p>
      <div>Город: {post.city}</div>
      <div>
        Автор: {post.author?.name} {post.author?.surname}
      </div>
    </article>
  );
}
