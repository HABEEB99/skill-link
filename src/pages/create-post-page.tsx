import { PostForm } from "../components";
import { useStore } from "../hooks/use-store";

export default function CreatePostPage() {
  const { session } = useStore();

  if (!session) return <div>Please log in to create a post.</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <PostForm />
    </div>
  );
}
