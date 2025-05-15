import { Url } from '@/models'
import { notFound } from 'next/navigation'

export default async function UrlPage({
  params,
}: {
  params: { uuid: string }
}) {
  const url = await Url.findOne({ uuid: params.uuid })

  if (!url) {
    notFound()
  }

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">URL Details</h1>
      <div className="space-y-4">
        <p><strong>URL:</strong> {url.url}</p>
        <p><strong>UUID:</strong> {url.uuid}</p>
      </div>
    </main>
  )
}