import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import {
  AuthPage,
  Button,
  CreatePostPage,
  ExplorePage,
  ProfilePage,
  ViewProfilePage,
} from "./components";
import { useStore } from "./hooks/use-store";

const App = () => {
  const { session, signOut, isLoading } = useStore();

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-blue-600 p-4 text-white">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold">
              SkillLink
            </Link>
            <div className="space-x-4">
              {session ? (
                <>
                  <Link to="/profile" className="hover:underline">
                    Profile
                  </Link>
                  <Link to="/create-post" className="hover:underline">
                    Create Post
                  </Link>
                  <Button onClick={signOut} variant="danger">
                    Logout
                  </Button>
                </>
              ) : (
                <Link to="/auth" className="hover:underline">
                  Login
                </Link>
              )}
            </div>
          </div>
        </nav>
        <main className="container mx-auto p-4">
          <Routes>
            <Route path="/" element={<ExplorePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/create-post" element={<CreatePostPage />} />
            <Route path="/profile/:userId" element={<ViewProfilePage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
