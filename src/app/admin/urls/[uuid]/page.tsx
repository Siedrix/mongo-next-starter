import { Url } from '@/models'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function AdminUrlDetailPage({
  params,
}: {
  params: { uuid: string }
}) {
  const url = await Url.findOne({ uuid: params.uuid })

  if (!url) {
    notFound()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">URL Details</h2>
        <Link href="/admin/urls">
          <Button variant="outline" size="sm">Back to URLs</Button>
        </Link>
      </div>

      <div className="grid gap-6">
        <div className="rounded-lg border bg-card p-6">
          <dl className="grid gap-6 md:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">URL</dt>
              <dd className="mt-1 break-all">
                <a
                  href={url.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  {url.url}
                </a>
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-muted-foreground">Status</dt>
              <dd className="mt-1">
                <StatusBadge status={url.status} />
              </dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-muted-foreground">UUID</dt>
              <dd className="mt-1 font-mono text-sm">{url.uuid}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-muted-foreground">Created At</dt>
              <dd className="mt-1">{new Date(url.createdAt).toLocaleString()}</dd>
            </div>

            <div>
              <dt className="text-sm font-medium text-muted-foreground">Updated At</dt>
              <dd className="mt-1">{new Date(url.updatedAt).toLocaleString()}</dd>
            </div>
          </dl>
        </div>

        {url.title && (
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-medium mb-3">Title</h3>
            <p>{url.title}</p>
          </div>
        )}

        {url.content && (
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-medium mb-3">Content</h3>
            <div className="prose prose-invert max-w-none">
              <pre className="whitespace-pre-wrap break-all">{url.content}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
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