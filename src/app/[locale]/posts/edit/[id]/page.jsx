import EditPostPage from '@/modules/MyPost/EditPostPage/EditPostPage';
import RequireAuth from '@/shared/RequireAuth/RequireAuth';
export default function editPost() {
  return (
    <div>
      <RequireAuth>
        <EditPostPage />
      </RequireAuth>
    </div>
  );
}
