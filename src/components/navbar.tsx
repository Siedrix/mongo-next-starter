import Link from "next/link";
import { AuthButtons } from "./AuthButtons";

export function Navbar() {
  return (
    <header className="sticky px-4 py-2 top-0 z-50 w-full border-b border-border/40 bg-blue-950/95 backdrop-blur supports-[backdrop-filter]:bg-blue-950/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Personal Knowledge Management System</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-2">
            <AuthButtons />
          </nav>
        </div>
      </div>
    </header>
  );
}