import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-4xl font-bold">Next.js MongoDB Starter Kit</h1>
        <p className="text-xl text-muted-foreground">
          A starter kit with Next.js, MongoDB, Mongoose, NextAuth.js, Tailwind CSS and Shadcn UI.
          Ready to help you build your next application.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
          <a
            href="https://github.com/Siedrix/mongo-next-starter"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            View on GitHub
          </a>
        </div>
        <div className="mt-12 space-y-4">
          <p className="text-lg text-muted-foreground">
            Ready to start building? Login or create a new account to get started.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/login"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Login
            </a>
            <a
              href="/register"
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              Sign Up
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
