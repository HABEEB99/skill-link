import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "../supabase-client";
import { useStore } from "../hooks/use-store";

import type { Post, Profile } from "../types";
import { PostCard } from "../components";

const PostPage = () => {
  const { id } = useParams<{ id: string }>();
  const { session } = useStore();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentContent, setCommentContent] = useState("");
  const navigate = useNavigate();

  const fetchPost = async () => {
    if (!id) {
      toast.error("Invalid post ID");
      navigate("/");
      return;
    }

    try {
      setIsLoading(true);

      interface RawProfile {
        id: string;
        name: string;
        location: string;
        bio: string;
        photo_url: string | null;
      }

      interface RawComment {
        id: number;
        user_id: string;
        post_id: number;
        content: string;
        created_at: string;
        profiles: RawProfile | null;
      }

      interface RawPost {
        id: number;
        user_id: string;
        title: string;
        description: string;
        category: string;
        image_url: string | null;
        created_at: string;
        profiles: RawProfile | null;
        likes: {
          id: number;
          user_id: string;
          post_id: number;
          created_at: string;
        }[];
        comments: RawComment[];
      }

      const { data, error } = (await supabase
        .from("posts")
        .select(
          `
          id,
          user_id,
          title,
          description,
          category,
          image_url,
          created_at,
          profiles (id, name, location, bio, photo_url),
          likes (id, user_id, post_id, created_at),
          comments (
            id,
            user_id,
            post_id,
            content,
            created_at,
            profiles (id, name, location, bio, photo_url)
          )
        `
        )
        .eq("id", id)
        .single()) as { data: RawPost; error: any };

      if (error) throw error;

      const transformedPost: Post = {
        id: data.id,
        user_id: data.user_id,
        title: data.title,
        description: data.description,
        category: data.category,
        image_url: data.image_url,
        created_at: data.created_at,
        likes: data.likes || [],
        profiles: data.profiles || {
          id: data.user_id,
          name: "User_" + data.user_id.slice(0, 8),
          location: "",
          bio: "",
          photo_url: null,
        },
        comments: (data.comments || []).map((comment) => ({
          id: comment.id,
          user_id: comment.user_id,
          post_id: comment.post_id,
          content: comment.content,
          created_at: comment.created_at,
          profiles: comment.profiles || {
            id: comment.user_id,
            name: "User_" + comment.user_id.slice(0, 8),
            location: "",
            bio: "",
            photo_url: null,
          },
        })),
      };

      setPost(transformedPost);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch post");
      console.error("Fetch post error:", error);
      navigate("/");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, [id]);

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
        toast.success("Post deleted successfully");
        navigate("/");
      } catch (error: any) {
        toast.error(error.message || "Failed to delete post");
        console.error("Delete post error:", error);
      }
    },
    [session, navigate]
  );

  const handleLike = useCallback(
    async (postId: number, event: React.MouseEvent) => {
      event.preventDefault();
      if (!session) {
        toast.error("Please log in to like a post");
        return;
      }
      try {
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

          setPost((prev) =>
            prev
              ? {
                  ...prev,
                  likes: prev.likes.filter(
                    (like) => like.id !== existingLike.id
                  ),
                }
              : null
          );
          toast.success("Post unliked");
        } else {
          const { data, error } = await supabase
            .from("likes")
            .insert({ user_id: session.user.id, post_id: postId })
            .select()
            .single();
          if (error) throw error;

          setPost((prev) =>
            prev ? { ...prev, likes: [...prev.likes, data] } : null
          );
          toast.success("Post liked");
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to like/unlike post");
        console.error("Like error:", error);
      }
    },
    [session, post]
  );

  const handleComment = useCallback(
    async (postId: number, event: React.FormEvent) => {
      event.preventDefault();
      if (!session) {
        toast.error("Please log in to comment");
        return;
      }
      const content = commentContent.trim();
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
          profiles: Profile | null;
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

        setCommentContent("");

        setPost((prev) =>
          prev
            ? {
                ...prev,
                comments: [
                  ...prev.comments,
                  {
                    id: data.id,
                    user_id: data.user_id,
                    post_id: data.post_id,
                    content: data.content,
                    created_at: data.created_at,
                    profiles: data.profiles || {
                      id: session.user.id,
                      name: "User_" + session.user.id.slice(0, 8),
                      location: "",
                      bio: "",
                      photo_url: null,
                    },
                  },
                ],
              }
            : null
        );

        toast.success("Comment added");
      } catch (error: any) {
        toast.error(error.message || "Failed to add comment");
        console.error("Comment error:", error);
      }
    },
    [session, commentContent]
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

        setPost((prev) =>
          prev
            ? {
                ...prev,
                comments: prev.comments.filter((c) => c.id !== commentId),
              }
            : null
        );
        toast.success("Comment deleted");
      } catch (error: any) {
        toast.error(error.message || "Failed to delete comment");
        console.error(`Delete comment error: POSTID:${postId}`, error);
      }
    },
    [session]
  );

  const handleViewProfile = useCallback(
    (userId: string) => {
      navigate(`/profile/${userId}`);
    },
    [navigate]
  );

  const handleSetCommentContent = useCallback(
    (postId: number, value: string) => {
      setCommentContent(value);
      console.log(postId);
    },
    []
  );

  if (isLoading) {
    return <div className="text-center p-6">Loading post...</div>;
  }

  if (!post) {
    return <div className="text-center p-6">Post not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <PostCard
        post={post}
        session={session}
        onLike={handleLike}
        onComment={handleComment}
        onDeleteComment={handleDeleteComment}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewProfile={handleViewProfile}
        commentContent={commentContent}
        setCommentContent={handleSetCommentContent}
      />
    </div>
  );
};

export default PostPage;
