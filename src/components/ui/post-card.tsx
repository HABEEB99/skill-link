import { Link } from "react-router-dom";
import type { Post, Session } from "../../types";
import Input from "./input";
import Button from "./button";

// interface PostCardProps {
//   post: Post;
// }

// const PostCard = ({ post }: PostCardProps) => {
//   return (
//     <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
//       <Link to={`/profile/${post.user_id}`}>
//         <h3 className="text-xl font-bold text-blue-600 hover:underline">
//           {post.title}
//         </h3>
//         <p className="text-gray-600">by {post.profiles?.name || "Anonymous"}</p>
//       </Link>
//       <p className="mt-2 text-gray-700">{post.description}</p>
//       <p className="mt-1 text-sm text-gray-500">Category: {post.category}</p>
//       {post.image_url && (
//         <img
//           src={post.image_url}
//           alt={post.title}
//           className="mt-2 w-full h-48 object-cover rounded"
//         />
//       )}
//     </div>
//   );
// };

interface PostCardProps {
  post: Post;
  session: Session | null;
  onLike: (postId: number, event: React.MouseEvent) => void;
  onComment: (postId: number, event: React.FormEvent) => void;
  onDeleteComment: (
    commentId: number,
    postId: number,
    event: React.MouseEvent
  ) => void;
  onEdit: (post: Post) => void;
  onDelete: (postId: number) => void;
  onViewProfile: (userId: string) => void;
  commentContent: string;
  setCommentContent: (postId: number, value: string) => void;
}

const PostCard = ({
  post,
  session,
  onLike,
  onComment,
  onDeleteComment,
  onEdit,
  onDelete,
  onViewProfile,
  commentContent,
  setCommentContent,
}: PostCardProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
      <div className="flex items-center space-x-4">
        <button
          onClick={() => onViewProfile(post.user_id)}
          className="flex items-center space-x-4 focus:outline-none"
          aria-label={`View ${post.profiles.name}'s profile`}
        >
          <img
            src={post.profiles.photo_url || "https://via.placeholder.com/48"}
            alt={post.profiles.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div>
            <h3 className="text-lg font-semibold hover:underline cursor-pointer">
              {post.profiles.name}
            </h3>
            {post.profiles.name.startsWith("User_") && (
              <p className="text-xs text-gray-500">Profile incomplete</p>
            )}
            <p className="text-sm text-gray-500">
              {new Date(post.created_at).toLocaleString()}
            </p>
          </div>
        </button>
      </div>
      <Link to={`/post/${post.id}`}>
        <h2 className="text-xl font-bold mt-4 text-blue-600 hover:underline">
          {post.title}
        </h2>
      </Link>
      <p className="text-gray-700 mt-2">{post.description}</p>
      {post.image_url && (
        <img
          src={post.image_url}
          alt={post.title}
          className="mt-4 w-full h-64 object-cover rounded"
        />
      )}
      <p className="text-sm text-gray-500 mt-2">Category: {post.category}</p>
      <div className="flex items-center space-x-4 mt-4">
        <button
          onClick={(e) => onLike(post.id, e)}
          className={`flex items-center space-x-1 ${
            post.likes.some((like) => like.user_id === session?.user.id)
              ? "text-red-500"
              : "text-gray-500"
          }`}
        >
          <svg
            className="w-5 h-5 cursor-pointer"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
          </svg>
          <span>{post.likes.length} Likes</span>
        </button>
        {session?.user.id === post.user_id && (
          <>
            <Button
              onClick={() => onEdit(post)}
              className="bg-blue-500 text-white cursor-pointer"
            >
              Edit
            </Button>
            <Button
              onClick={() => onDelete(post.id)}
              className="bg-red-500 hover:bg-red-700 text-white cursor-pointer"
            >
              Delete
            </Button>
          </>
        )}
      </div>
      <div className="mt-4">
        <h4 className="text-lg font-semibold">Comments</h4>
        {post.comments.length === 0 ? (
          <p className="text-gray-500">No comments yet.</p>
        ) : (
          post.comments.map((comment) => (
            <div key={comment.id} className="mt-2 flex items-start space-x-4">
              <img
                src={
                  comment.profiles.photo_url || "https://via.placeholder.com/32"
                }
                alt={comment.profiles.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold">{comment.profiles.name}</p>
                {comment.profiles.name.startsWith("User_") && (
                  <p className="text-xs text-gray-500">Profile incomplete</p>
                )}
                <p className="text-gray-700">{comment.content}</p>
                <p className="text-xs text-gray-500">
                  {new Date(comment.created_at).toLocaleString()}
                </p>
                {session?.user.id === comment.user_id && (
                  <button
                    onClick={(e) => onDeleteComment(comment.id, post.id, e)}
                    className="text-red-500 text-sm mt-1 cursor-pointer"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
        <form
          onSubmit={(e) => onComment(post.id, e)}
          className="mt-4 flex space-x-2"
        >
          <Input
            value={commentContent}
            onChange={(e) => setCommentContent(post.id, e.target.value)}
            placeholder="Add a comment..."
            className="flex-1"
          />
          <Button
            type="submit"
            className="bg-green-500 hover:bg-green-700 text-white cursor-pointer"
          >
            Comment
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PostCard;
