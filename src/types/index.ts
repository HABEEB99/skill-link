export interface Profile {
  id: string;
  name: string | null;
  location: string | null;
  bio: string | null;
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
  profiles?: { name: string };
}

export interface AuthFormData {
  email: string;
  password: string;
}

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
