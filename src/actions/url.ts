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