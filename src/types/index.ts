export interface ProfileFormData {
  name: string;
  location: string;
  bio: string;
  photo?: FileList;
}

export interface PostFormData {
  title: string;
  description: string;
  category: string;
  image?: FileList;
}

export interface AuthFormData {
  email: string;
  password: string;
}

export interface Profile {
  id: string;
  name: string;
  location: string;
  bio: string;
  photo_url: string | null;
}

export interface Post {
  id: number;
  user_id: string;
  title: string;
  description: string;
  category: string;
  image_url: string | null;
  created_at: string;
  profiles: Profile; // Joined user profile
  likes: Like[]; // Associated likes
  comments: Comment[]; // Associated comments
}

export interface Like {
  id: number;
  user_id: string;
  post_id: number;
  created_at: string;
}

export interface Comment {
  id: number;
  user_id: string;
  post_id: number;
  content: string;
  created_at: string;
  profiles: Profile; // Joined user profile
}
