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

const App = () => {
  const { session, signOut } = useStore();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <header className="bg-blue-600 text-white p-4">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold">
              SkillLink
            </Link>
            <nav>
              {session ? (
                <>
                  <Link
                    to={`/profile/${session.user.id}`}
                    className="mr-4 hover:underline"
                  >
                    Profile
                  </Link>
                  <Link to="/create-post" className="mr-4 hover:underline">
                    Create Post
                  </Link>
                  <Button
                    onClick={signOut}
                    variant="danger"
                    className="cursor-pointer"
                  >
                    Logout
                  </Button>
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
            <Route path="/create-post" element={<CreatePostPage />} />
            <Route path="/profile/:userId" element={<ViewProfilePage />} />
            <Route path="/edit-post/:id" element={<EditPostPage />} />
            <Route path="/post/:id" element={<PostPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
};

export default App;
