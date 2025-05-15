"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function AuthButtons() {
  const { status, data: session } = useSession();
  const isLoading = status === "loading";

  if (isLoading) {
    return null; // Show nothing while loading
  }

  if (status === "authenticated") {
    return (
      <>
        <Button variant="ghost" asChild>
          <Link href="/dashboard">Dashboard</Link>
        </Button>
        <Button variant="ghost" asChild>
          <Link href="/admin/urls">Admin</Link>
        </Button>
        <Button
          variant="ghost"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Sign Out
        </Button>
      </>
    );
  }

  return (
    <>
      <Button variant="ghost" asChild>
        <Link href="/login">Sign In</Link>
      </Button>
      <Button asChild>
        <Link href="/register">Sign Up</Link>
      </Button>
    </>
  );
}