import { useLocation } from "react-router-dom";

import type { Post } from "../types";
import { PostForm } from "../components";

export default function EditPostPage() {
  const location = useLocation();
  const post = location.state?.post as Post;

  if (!post) {
    return <div className="text-center p-6">Post not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <PostForm post={post} />
    </div>
  );
}
