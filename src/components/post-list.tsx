import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { PostCard } from "../components";
import type { Post, Profile } from "../types";
import { useStore } from "../hooks/use-store";
import { supabase } from "../supabase-client";
import { usePosts } from "../hooks/use-posts";

export default function PostList() {
  const { session } = useStore();
  const { posts, setPosts, isLoading } = usePosts();
  const [commentContent, setCommentContent] = useState<{
    [key: number]: string;
  }>({});
  const navigate = useNavigate();

  const handleEdit = useCallback(
    (post: Post) => {
      navigate(`/edit-post/${post.id}`, { state: { post } });
    },
    [navigate]
  );

  const handleDelete = useCallback(
    async (postId: number) => {
      if (!session) {
        toast.error("Please log in to delete a post");
        return;
      }
      try {
        const { error } = await supabase
          .from("posts")
          .delete()
          .eq("id", postId)
          .eq("user_id", session.user.id);
        if (error) throw error;
        setPosts((prev) => prev.filter((post) => post.id !== postId));
        toast.success("Post deleted successfully");
      } catch (error: any) {
        toast.error(error.message || "Failed to delete post");
        console.error("Delete post error:", error);
      }
    },
    [session, setPosts]
  );

  const handleLike = useCallback(
    async (postId: number, event: React.MouseEvent) => {
      event.preventDefault();
      if (!session) {
        toast.error("Please log in to like a post");
        return;
      }
      try {
        const post = posts.find((p) => p.id === postId);
        if (!post) return;

        const existingLike = post.likes.find(
          (like) => like.user_id === session.user.id
        );

        if (existingLike) {
          const { error } = await supabase
            .from("likes")
            .delete()
            .eq("id", existingLike.id)
            .eq("user_id", session.user.id);
          if (error) throw error;

          setPosts((prev) =>
            prev.map((p) =>
              p.id === postId
                ? {
                    ...p,
                    likes: p.likes.filter(
                      (like) => like.id !== existingLike.id
                    ),
                  }
                : p
            )
          );
          toast.success("Post unliked");
        } else {
          const { data, error } = await supabase
            .from("likes")
            .insert({ user_id: session.user.id, post_id: postId })
            .select()
            .single();
          if (error) throw error;

          setPosts((prev) =>
            prev.map((p) =>
              p.id === postId ? { ...p, likes: [...p.likes, data] } : p
            )
          );
          toast.success("Post liked");
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to like/unlike post");
        console.error("Like error:", error);
      }
    },
    [session, posts, setPosts]
  );

  const handleComment = useCallback(
    async (postId: number, event: React.FormEvent) => {
      event.preventDefault();
      if (!session) {
        toast.error("Please log in to comment");
        return;
      }
      const content = commentContent[postId]?.trim();
      if (!content) {
        toast.error("Comment cannot be empty");
        return;
      }
      try {
        interface CommentResponse {
          id: number;
          user_id: string;
          post_id: number;
          content: string;
          created_at: string;
          profiles: Profile | Profile[] | null;
        }

        const { data, error } = (await supabase
          .from("comments")
          .insert({ user_id: session.user.id, post_id: postId, content })
          .select(
            `
              id,
              user_id,
              post_id,
              content,
              created_at,
              profiles (id, name, location, bio, photo_url)
            `
          )
          .single()) as { data: CommentResponse; error: any };
        if (error) throw error;

        setCommentContent((prev) => ({ ...prev, [postId]: "" }));

        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? {
                  ...p,
                  comments: [
                    ...p.comments,
                    {
                      id: data.id,
                      user_id: data.user_id,
                      post_id: data.post_id,
                      content: data.content,
                      created_at: data.created_at,
                      profiles: Array.isArray(data.profiles)
                        ? data.profiles[0]
                        : data.profiles || {
                            id: session.user.id,
                            name: "User_" + session.user.id.slice(0, 8),
                            location: "",
                            bio: "",
                            photo_url: null,
                          },
                    },
                  ],
                }
              : p
          )
        );

        toast.success("Comment added");
      } catch (error: any) {
        toast.error(error.message || "Failed to add comment");
        console.error("Comment error:", error);
      }
    },
    [session, commentContent, setPosts]
  );

  const handleDeleteComment = useCallback(
    async (commentId: number, postId: number, event: React.MouseEvent) => {
      event.preventDefault();
      if (!session) {
        toast.error("Please log in to delete a comment");
        return;
      }
      try {
        const { error } = await supabase
          .from("comments")
          .delete()
          .eq("id", commentId)
          .eq("user_id", session.user.id);
        if (error) throw error;

        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, comments: p.comments.filter((c) => c.id !== commentId) }
              : p
          )
        );
        toast.success("Comment deleted");
      } catch (error: any) {
        toast.error(error.message || "Failed to delete comment");
        console.error("Delete comment error:", error);
      }
    },
    [session, setPosts]
  );

  const handleViewProfile = useCallback(
    (userId: string) => {
      navigate(`/profile/${userId}`);
    },
    [navigate]
  );

  const handleSetCommentContent = useCallback(
    (postId: number, value: string) => {
      setCommentContent((prev) => ({ ...prev, [postId]: value }));
    },
    []
  );

  if (isLoading) {
    return <div className="text-center p-6">Loading posts...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          session={session}
          onLike={handleLike}
          onComment={handleComment}
          onDeleteComment={handleDeleteComment}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onViewProfile={handleViewProfile}
          commentContent={commentContent[post.id] || ""}
          setCommentContent={handleSetCommentContent}
        />
      ))}
    </div>
  );
}
