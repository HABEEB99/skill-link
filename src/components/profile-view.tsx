import { Link } from "react-router-dom";
import { usePosts } from "../hooks/use-posts";
import { useProfile } from "../hooks/use-profile";

interface ProfileViewProps {
  userId: string;
}

const ProfileView = ({ userId }: ProfileViewProps) => {
  const { profile, isLoading: isProfileLoading } = useProfile(userId);
  const { posts, isLoading: isPostsLoading } = usePosts(userId);

  if (isProfileLoading || isPostsLoading)
    return <div className="text-center">Loading...</div>;

  if (!profile) return <div className="text-center">Profile not found.</div>;

  return (
    <div>
      <div className="flex items-center mb-6 bg-white p-6 rounded-lg shadow">
        {profile.photo_url && (
          <img
            src={profile.photo_url}
            alt={profile.name || "Profile"}
            className="w-24 h-24 rounded-full mr-4"
          />
        )}
        <div>
          <h2 className="text-2xl font-bold">{profile.name || "Anonymous"}</h2>
          {profile.location && (
            <p className="text-gray-600">{profile.location}</p>
          )}
          {profile.bio && <p className="text-gray-700">{profile.bio}</p>}
        </div>
      </div>
      <h3 className="text-xl font-bold mb-4">Posts</h3>
      {posts.length === 0 ? (
        <p className="text-gray-500">No posts yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
              <Link to={`/profile/${post.user_id}`}>
                <h3 className="text-xl font-bold text-blue-600 hover:underline">
                  {post.title}
                </h3>
                <p className="text-gray-600">
                  by {post.profiles?.name || "Anonymous"}
                </p>
              </Link>
              <p className="mt-2 text-gray-700">{post.description}</p>
              <p className="mt-1 text-sm text-gray-500">
                Category: {post.category}
              </p>
              {post.image_url && (
                <img
                  src={post.image_url}
                  alt={post.title}
                  className="mt-2 w-full h-48 object-cover rounded"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileView;
