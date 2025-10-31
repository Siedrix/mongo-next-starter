import { redirect, notFound } from "next/navigation";
import { is } from "@/lib/session";
import { User } from "@/models";
import Link from "next/link";
import { EditUserForm } from "./edit-user-form";

export default async function AdminEditUserPage({
  params,
}: {
  params: { uuid: string };
}) {
  const isAdmin = await is("admin");

  if (!isAdmin) {
    redirect("/dashboard");
  }

  const user = await User.findById(params.uuid).select("-password");

  if (!user) {
    notFound();
  }

  return (
    <main className="container mx-auto p-4">
      <div className="mb-4">
        <Link
          href="/admin/users"
          className="text-muted-foreground hover:text-foreground"
        >
          ← Back to Users
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-4">Edit User</h1>

      <EditUserForm user={user} />
    </main>
  );
}
