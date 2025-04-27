import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import {
  AuthPage,
  Button,
  CreatePostPage,
  EditPostPage,
  HomePage,
  PostPage,
  ProfilePage,
  ViewProfilePage,
} from "./components";
import { useStore } from "./hooks/use-store";
import { useEffect, useState } from "react";
import { supabase } from "./supabase-client";
import { Profile } from "./types";

const App = () => {
  const { session, signOut } = useStore();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user.id) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, name, location, bio, photo_url")
          .eq("id", session.user.id)
          .single();

        if (error) throw error;
        setProfile(
          data || {
            id: session.user.id,
            name: "User_" + session.user.id.slice(0, 8),
            location: "",
            bio: "",
            photo_url: null,
          }
        );
      } catch (error: any) {
        console.error("Fetch profile error:", error);
        setProfile({
          id: session.user.id,
          name: "User_" + session.user.id.slice(0, 8),
          location: "",
          bio: "",
          photo_url: null,
        });
      }
    };

    fetchProfile();
  }, [session]);

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut();
    setIsDropdownOpen(false);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-blue-600 text-white p-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold">
              SkillLink
            </Link>
            <nav className="flex items-center space-x-4">
              {session ? (
                <>
                  <Link
                    to={`/profile/${session.user.id}`}
                    className="hover:underline"
                  >
                    Profile
                  </Link>
                  <Link to="/create-post" className="hover:underline">
                    Create Post
                  </Link>
                  <div className="relative">
                    <img
                      src={
                        profile?.photo_url || "https://via.placeholder.com/40"
                      }
                      alt="User profile"
                      className="w-10 h-10 rounded-full cursor-pointer object-cover"
                      onClick={toggleDropdown}
                    />
                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-60 bg-white text-gray-800 rounded-md shadow-lg z-10">
                        <div className="p-4 border-b">
                          <p className="font-semibold">
                            {profile?.name || "User"}
                          </p>
                          <p className="text-sm text-gray-600 truncate">
                            {session.user.email || "No email"}
                          </p>
                        </div>
                        <div className="p-2">
                          <Button
                            onClick={handleLogout}
                            variant="danger"
                            className="w-full text-left px-4 py-2 hover:bg-gray-100"
                          >
                            Logout
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link to="/auth" className="hover:underline">
                  Login
                </Link>
              )}
            </nav>
          </div>
        </header>
        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/view-profile/:userId" element={<ViewProfilePage />} />
            <Route path="/create-post" element={<CreatePostPage />} />
            <Route path="/edit-post/:id" element={<EditPostPage />} />
            <Route path="/post/:id" element={<PostPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
