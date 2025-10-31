"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateUser } from "@/actions/update-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserDocument, UserRole } from "@/models/User";

type EditUserFormProps = {
  user: UserDocument;
};

export function EditUserForm({ user }: EditUserFormProps) {
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError(undefined);

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as UserRole;

    const result = await updateUser(user._id, {
      name,
      email,
      role,
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push("/admin/users");
    router.refresh();
  };

  return (
    <form
      className="p-6 w-full max-w-[400px] flex flex-col justify-between items-center gap-2 border border-border rounded-lg bg-card"
      action={handleSubmit}
    >
      {error && <div className="text-destructive w-full">{error}</div>}

      <div className="w-full space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Name"
          name="name"
          defaultValue={user.name}
          required
        />
      </div>

      <div className="w-full space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Email"
          name="email"
          defaultValue={user.email}
          required
        />
      </div>

      <div className="w-full space-y-2">
        <Label htmlFor="role">Role</Label>
        <select
          id="role"
          name="role"
          defaultValue={user.role}
          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          required
        >
          <option value="regular">Regular</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <Button type="submit" className="w-full mt-6" disabled={loading}>
        {loading ? "Updating..." : "Update User"}
      </Button>
    </form>
  );
}
