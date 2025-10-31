import { redirect } from "next/navigation";
import { is } from "@/lib/session";
import { User } from "@/models";
import Link from "next/link";

export default async function AdminPage() {
  const isAdmin = await is("admin");

  if (!isAdmin) {
    redirect("/dashboard");
  }

  const totalUsers = await User.countDocuments();

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

      <Link
        href="/admin/users"
        className="block rounded-lg border border-border bg-card p-6 hover:bg-accent transition-colors"
      >
        <h2 className="text-lg font-semibold mb-2">Total Users</h2>
        <p className="text-3xl font-bold text-card-foreground">{totalUsers}</p>
      </Link>
    </main>
  );
}
