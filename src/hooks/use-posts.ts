import { useState, useEffect } from "react";

import toast from "react-hot-toast";
import type { Post } from "../types";
import { supabase } from "../supabase-client";

export const usePosts = (userId?: string) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);

      let query = supabase
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
        .order("created_at", { ascending: false });

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const transformedData: Post[] = (data || []).map((post: any) => ({
        id: post.id,
        user_id: post.user_id,
        title: post.title,
        description: post.description,
        category: post.category,
        image_url: post.image_url,
        created_at: post.created_at,
        likes: post.likes || [],
        profiles: Array.isArray(post.profiles)
          ? post.profiles[0]
          : post.profiles || {
              id: "",
              name: "Unknown",
              location: "",
              bio: "",
              photo_url: null,
            },
        comments: (post.comments || []).map((comment: any) => ({
          ...comment,
          profiles: Array.isArray(comment.profiles)
            ? comment.profiles[0]
            : comment.profiles || {
                id: "",
                name: "Unknown",
                location: "",
                bio: "",
                photo_url: null,
              },
        })),
      }));

      setPosts(transformedData);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch posts");
      console.error("Fetch posts error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [userId]);

  return { posts, setPosts, isLoading, fetchPosts };
};
