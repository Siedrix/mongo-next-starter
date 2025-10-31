"use server";

import { User } from "@/models";
import { is } from "@/lib/session";
import type { UserRole } from "@/models/User";

export const updateUser = async (
  userId: string,
  values: { name: string; email: string; role: UserRole }
) => {
  const isAdmin = await is("admin");

  if (!isAdmin) {
    return {
      error: "Unauthorized",
    };
  }

  const { email, name, role } = values;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return {
        error: "User not found",
      };
    }

    // Check if email is already taken by another user
    const emailExists = await User.findOne({
      email,
      _id: { $ne: userId },
    });

    if (emailExists) {
      return {
        error: "Email already exists!",
      };
    }

    user.name = name;
    user.email = email;
    user.role = role;
    await user.save();

    return { success: true };
  } catch (e) {
    return { error: "An error occurred while updating the user" };
  }
};
