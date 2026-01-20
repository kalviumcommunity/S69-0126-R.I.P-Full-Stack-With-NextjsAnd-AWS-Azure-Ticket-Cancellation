// app/users/[id]/page.tsx
import Link from "next/link";
interface Props {
  params: { id: string };
}

export default async function UserProfile({ params }: Props) {
  const { id } = params;

  // Mocking a database delay/fetch
  const user = {
    id,
    name: `User ${id}`,
    role: id === "1" ? "Admin" : "Standard User",
    email: `user${id}@example.com`,
  };

  return (
    <main className="p-10 max-w-2xl mx-auto">
      <div className="mb-4 text-sm text-gray-400">
        <Link href="/">Home</Link> / <Link href="/users">Users</Link> / {id}
      </div>
      <h1 className="text-3xl font-bold border-b pb-4">Profile Details</h1>
      <div className="mt-6 space-y-2 bg-gray-50 p-6 rounded-lg">
        <p>
          <strong>Name:</strong> {user.name}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Role:</strong> {user.role}
        </p>
      </div>
    </main>
  );
}
