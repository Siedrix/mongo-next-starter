import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { User } from "@/models";
import type { UserDocument, UserRole } from "@/models/User";

export async function getSessionUser(): Promise<UserDocument | null> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const user = await User.findById(session.user.id);

  if (!user) {
    return null;
  }

  return user;
}

export async function is(role: UserRole): Promise<boolean> {
  const user = await getSessionUser();
  return user?.role === role;
}
