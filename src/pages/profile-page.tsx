import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import toast from "react-hot-toast";
import type { Profile } from "../types";
import { useStore } from "../hooks/use-store";
import { usePosts } from "../hooks/use-posts";
import { supabase } from "../supabase-client";
import { ProfileForm } from "../components";

export default function ProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const { session } = useStore();
  const { posts, isLoading: postsLoading } = usePosts(userId);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        toast.error("Invalid user ID");
        navigate("/");
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("id, name, location, bio, photo_url")
          .eq("id", userId)
          .single();
        if (error) throw error;
        if (!data) {
          toast.error("Profile not found");
          navigate("/");
          return;
        }
        setProfile(data);
      } catch (error: any) {
        toast.error(error.message || "Failed to fetch profile");
        console.error("Fetch profile error:", error);
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId, navigate]);

  if (isLoading || postsLoading) {
    return <div className="text-center p-6">Loading profile...</div>;
  }

  if (!profile) {
    return <div className="text-center p-6">Profile not found</div>;
  }

  const isOwnProfile = session?.user.id === userId;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex items-center space-x-6">
            {profile.photo_url && (
              <img
                src={profile.photo_url}
                alt={profile.name}
                className="w-24 h-24 rounded-full"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold">{profile.name}</h2>
              <p className="text-gray-600">
                {profile.location || "No location provided"}
              </p>
              <p className="text-gray-700 mt-2">
                {profile.bio || "No bio provided"}
              </p>
            </div>
          </div>
          {isOwnProfile && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-4">Edit Profile</h3>
              <ProfileForm />
            </div>
          )}
        </div>
        <div>
          <h3 className="text-xl font-semibold mb-4">
            {isOwnProfile ? "Your Posts" : `${profile.name}'s Posts`}
          </h3>
          {posts.length === 0 ? (
            <p className="text-gray-500">No posts yet.</p>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="bg-white p-6 rounded-lg shadow">
                  <h4 className="text-lg font-bold">{post.title}</h4>
                  <p className="text-gray-700 mt-2">{post.description}</p>
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="mt-4 w-full h-64 object-cover rounded"
                    />
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    Category: {post.category}
                  </p>
                  <p className="text-sm text-gray-500">
                    Posted: {new Date(post.created_at).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Likes: {post.likes.length}
                  </p>
                  <p className="text-sm text-gray-500">
                    Comments: {post.comments.length}
                  </p>
                  {isOwnProfile && (
                    <div className="flex space-x-4 mt-4">
                      <button
                        onClick={() =>
                          navigate(`/edit-post/${post.id}`, { state: { post } })
                        }
                        className="bg-blue-500 text-white px-4 py-2 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const { error } = await supabase
                              .from("posts")
                              .delete()
                              .eq("id", post.id)
                              .eq("user_id", session!.user.id);
                            if (error) throw error;
                            toast.success("Post deleted");
                            usePosts(userId).fetchPosts();
                          } catch (error: any) {
                            toast.error(
                              error.message || "Failed to delete post"
                            );
                          }
                        }}
                        className="bg-red-500 text-white px-4 py-2 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
