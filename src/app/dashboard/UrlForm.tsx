'use client'

import { useFormState } from 'react-dom'
import { createUrl } from '@/actions/url'

export default function UrlForm() {
  const [state, formAction] = useFormState(createUrl, null)

  return (
    <form action={formAction} className="w-full max-w-xl">
      <div className="flex flex-col gap-4">
        <input
          type="url"
          name="url"
          placeholder="Add webpage to your Personal Knowledge management system"
          className="w-full px-4 py-2 border rounded-md"
          required
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Add URL
        </button>
      </div>
    </form>
  )
}