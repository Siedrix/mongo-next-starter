import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { RegisterForm } from "./register-form";

export default async function RegisterPage() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <section className="w-full h-screen flex items-center justify-center">
      <RegisterForm />
    </section>
  );
}
