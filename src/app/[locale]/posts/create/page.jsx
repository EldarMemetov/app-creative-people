import CreatePostForm from '@/modules/PostForm/CreatePostForm/CreatePostForm';
import RequireAuth from '@/shared/RequireAuth/RequireAuth';

export default function CreatePost() {
  return (
    <div>
      <RequireAuth>
        <CreatePostForm />
      </RequireAuth>
    </div>
  );
}
