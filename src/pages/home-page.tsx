import { PostList } from "../components";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-4xl mx-auto p-6">
        <PostList />
      </main>
    </div>
  );
}
