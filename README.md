# SkillLink

SkillLink is a social platform where users can share posts, engage through likes and comments, and connect via user profiles. Built with a modern tech stack, it emphasizes a seamless user experience, real-time interactions, and type-safe development.

## Table of Contents

- [SkillLink](#skilllink)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Technologies](#technologies)
  - [Prerequisites](#prerequisites)
  - [Setup](#setup)
  - [Project Structure](#project-structure)
  - [Usage](#usage)
  - [Supabase Configuration](#supabase-configuration)
    - [Database Schema:](#database-schema)
      - [Posts:](#posts)
      - [Profiles:](#profiles)
      - [Likes:](#likes)
      - [Comments:](#comments)
    - [Row-Level Security (RLS):](#row-level-security-rls)
    - [Storage:](#storage)
    - [Authentication:](#authentication)

## Features

- **Post Creation & Management**: Users can create, edit, and delete posts with titles, descriptions, categories, and images.
- **Engagement**: Like and unlike posts, add comments, and delete own comments with optimistic updates for instant feedback.
- **User Profiles**: View user profiles with names, photos, and optional bio/location details.
- **Single Post View**: Dedicated page for each post, accessible via /post/:id.
- **Responsive Design**: Clean, modern UI with Tailwind CSS, optimized for mobile and desktop.
- **Real-Time Data**: Powered by Supabase for authentication, database, and storage.
- **Type Safety**: Fully typed with TypeScript for robust development.

## Technologies

- **Frontend**: React 18, TypeScript
- **Routing**: React Router DOM 6
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Authentication, Database, Storage)
- **State Management**: Custom hooks (useStore, usePosts)
- **Notifications**: React Hot Toast
- **Build Tool**: Vite

## Prerequisites

- **Node.js**: v16 or higher
- **npm**: v8 or higher
- **Supabase Account**: For backend services
- **Git**: For cloning the repository

## Setup

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/HABEEB99/skill-link
   cd skill-link
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory and add your Supabase credentials:

   ```env
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

   Replace `your-supabase-url` and `your-supabase-anon-key` with values from your Supabase project settings.

4. **Run the Development Server**:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production**:
   ```bash
   npm run build
   ```

## Project Structure

```plaintext
skilllink/
├── src/
│   ├── components/
│   │   ├── PostList.tsx        # List of posts
│   │   ├── PostCard.tsx        # Individual post card
│   │   ├── PostPage.tsx        # Single post page
│   │   ├── EditPost.tsx        # Edit post form (assumed)
│   │   ├── ProfilePage.tsx     # User profile page (assumed)
│   │   ├── ui/
│   │   │   ├── Button.tsx      # Reusable button component
│   │   │   ├── Input.tsx       # Reusable input component
│   ├── hooks/
│   │   ├── use-posts.ts        # Custom hook for fetching posts
│   │   ├── use-store.ts        # Custom hook for session management
│   ├── types/
│   │   ├── index.ts            # TypeScript interfaces (Post, Profile, Session)
│   ├── supabase-client.ts      # Supabase client initialization
│   ├── App.tsx                 # Main app with routing
│   ├── main.tsx                # Entry point
│   ├── index.css               # Global styles
├── .env                        # Environment variables
├── package.json                # Dependencies and scripts
├── vite.config.ts              # Vite configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── README.md                   # Project documentation
```

## Usage

- **Home Page (/)**: View a list of posts, like or comment on them, and navigate to user profiles or single post pages.
- **Single Post Page (/post/:id)**: View a specific post with its comments and interact (like, comment, edit, delete).
- **Profile Page (/profile/:userId)**: View a user’s profile and their posts (assumed functionality).
- **Edit Post (/edit-post/:id)**: Edit a post if you’re the owner (assumed functionality).
- **Authentication**: Sign in via Supabase Auth to enable post creation, liking, and commenting.

## Supabase Configuration

### Database Schema:

#### Posts:

- `id`: integer (primary key)
- `user_id`: uuid (foreign key to profiles.id)
- `title`: text
- `description`: text
- `category`: text
- `image_url`: text (nullable)
- `created_at`: timestamp

#### Profiles:

- `id`: uuid (primary key)
- `name`: text
- `location`: text
- `bio`: text
- `photo_url`: text (nullable)

#### Likes:

- `id`: integer (primary key)
- `user_id`: uuid (foreign key to profiles.id)
- `post_id`: integer (foreign key to posts.id)
- `created_at`: timestamp

#### Comments:

- `id`: integer (primary key)
- `user_id`: uuid (foreign key to profiles.id)
- `post_id`: integer (foreign key to posts.id)
- `content`: text
- `created_at`: timestamp

### Row-Level Security (RLS):

Run the following SQL in Supabase to set up policies:

```sql
-- Posts
CREATE POLICY "Allow authenticated users to read posts" ON public.posts
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow users to create posts" ON public.posts
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update own posts" ON public.posts
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete own posts" ON public.posts
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Comments
CREATE POLICY "Allow authenticated users to read comments" ON public.comments
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow users to create comments" ON public.comments
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete own comments" ON public.comments
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Profiles
CREATE POLICY "Allow authenticated users to read profiles" ON public.profiles
FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow users to update own profile" ON public.profiles
FOR UPDATE TO authenticated USING (auth.uid() = id);
```

### Storage:

Create a bucket (e.g., post-images) for post images.
Set public access for reading images:

```sql
CREATE POLICY "Allow public read access to post images" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'post-images');
```

### Authentication:

Enable email authentication in Supabase.
Sync user profiles with the profiles table using a trigger:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (new.id, 'User_' || left(new.id::text, 8));
  RETURN new;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```
