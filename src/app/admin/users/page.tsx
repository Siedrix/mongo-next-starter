import { redirect } from "next/navigation";
import { is } from "@/lib/session";
import { User } from "@/models";
import Link from "next/link";

export default async function AdminUsersPage() {
  const isAdmin = await is("admin");

  if (!isAdmin) {
    redirect("/dashboard");
  }

  const users = await User.find().select("-password").sort({ createdAt: -1 });

  return (
    <main className="container mx-auto p-4">
      <div className="mb-4">
        <Link
          href="/admin"
          className="text-muted-foreground hover:text-foreground"
        >
          ← Back to Admin Dashboard
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-4">Users</h1>

      <div className="rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left p-4 font-semibold">Name</th>
                <th className="text-left p-4 font-semibold">Email</th>
                <th className="text-left p-4 font-semibold">Role</th>
                <th className="text-left p-4 font-semibold">Created At</th>
                <th className="text-left p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id.toString()} className="border-b border-border last:border-b-0">
                  <td className="p-4">{user.name}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.role === "admin"
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-4 text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/admin/users/${user._id}`}
                      className="text-primary hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
