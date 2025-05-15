import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUrls } from "@/actions/url";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import UrlTable from "./UrlTable";

export default async function AdminUrlsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const currentPage = searchParams.page ? parseInt(searchParams.page) : 1;
  const { urls, pagination } = await getUrls(currentPage, 10);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">URLs Management</h2>
        <Link href="/dashboard">
          <Button variant="outline" size="sm">Back to Dashboard</Button>
        </Link>
      </div>

      <UrlTable urls={urls} pagination={pagination} />
    </div>
  );
}

function StatusBadge({ status }: { status: 'new' | 'hasError' | 'ready' }) {
  const variants = {
    new: "bg-blue-500/20 text-blue-500 border-blue-500/20",
    hasError: "bg-red-500/20 text-red-500 border-red-500/20",
    ready: "bg-green-500/20 text-green-500 border-green-500/20",
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[status]}`}>
      {status}
    </span>
  );
}

function PaginationControls({
  currentPage,
  totalPages
}: {
  currentPage: number;
  totalPages: number;
}) {
  return (
    <div className="flex space-x-2">
      {currentPage > 1 && (
        <Link href={`/admin/urls?page=${currentPage - 1}`}>
          <Button variant="outline" size="sm">Previous</Button>
        </Link>
      )}

      <span className="flex items-center px-3 py-1 text-sm">
        Page {currentPage} of {totalPages}
      </span>

      {currentPage < totalPages && (
        <Link href={`/admin/urls?page=${currentPage + 1}`}>
          <Button variant="outline" size="sm">Next</Button>
        </Link>
      )}
    </div>
  );
}