'use server'

import { Url } from '@/models'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createUrl(prevState: any, formData: FormData) {
  const url = formData.get('url') as string

  if (!url) {
    throw new Error('URL is required')
  }

  const newUrl = await Url.create({ url })
  revalidatePath('/dashboard')

  redirect(`/url/${newUrl.uuid}`)
}

export async function getUrls(page = 1, limit = 10) {
  const skip = (page - 1) * limit

  const [urls, totalCount] = await Promise.all([
    Url.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Url.countDocuments({})
  ])

  return {
    urls,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit)
    }
  }
}