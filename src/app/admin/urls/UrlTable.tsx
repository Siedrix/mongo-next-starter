'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Define types based on what's used in the component
interface UrlItem {
  _id: string
  uuid: string
  url: string
  status: 'new' | 'hasError' | 'ready'
  title: string
  content: string
  createdAt: string | Date
  updatedAt: string | Date
}

type PaginationType = {
  page: number
  limit: number
  totalCount: number
  totalPages: number
}

export default function UrlTable({
  urls,
  pagination
}: {
  urls: any[] // Accept any type to avoid issues with mongoose types
  pagination: PaginationType
}) {
  const router = useRouter()

  const handleRowClick = (uuid: string) => {
    router.push(`/admin/urls/${uuid}`)
  }

  return (
    <>
      <div className="rounded-md border">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">URL</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Created At</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-border">
            {urls.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                  No URLs found
                </td>
              </tr>
            ) : (
              urls.map((url) => (
                <tr
                  key={url.uuid}
                  className="hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleRowClick(url.uuid)}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <div className="max-w-[300px] truncate">
                      <span className="text-blue-400 truncate">{url.url}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <StatusBadge status={url.status} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <div className="max-w-[200px] truncate">{url.title || "-"}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {new Date(url.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRowClick(url.uuid)
                      }}
                    >
                      View Details
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-6">
          <PaginationControls
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
          />
        </div>
      )}
    </>
  )
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