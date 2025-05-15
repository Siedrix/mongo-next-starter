// TASK: extract
// Run this task with:
// forge task:run cloudflare:extract --uuid <uuid>
// forge task:run cloudflare:extract --uuid f7eaa4e7-79f9-42c7-9a08-65989ccb8dec

import axios from 'axios';
import { createTask } from '@forgehive/task'
import { Schema } from '@forgehive/schema'

import { Url } from '@/models'

const description = 'Extract markdown content from a URL using Cloudflare browser rendering'

const schema = new Schema({
  uuid: Schema.string()
})

const boundaries = {
  findByUuid: async (uuid: string) => {
    return await Url.findOne({ uuid })
  },
  getMarkdown: async (url: string) => {
    console.log('========================================')
    console.log('Fetching markdown for', url)
    console.log('========================================')

    const apiToken = process.env.CLOUDFLARE_API_TOKEN
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID

    if (!apiToken || !accountId) {
      throw new Error('Missing Cloudflare credentials')
    }

    const response = await axios.post(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/browser-rendering/markdown`,
      { url },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiToken}`
        }
      }
    )

    return response.data
  }
}

export const extract = createTask(
  schema,
  boundaries,
  async function (argv, { findByUuid, getMarkdown }) {
    console.log('========================================')
    console.log('extract', argv)
    console.log('========================================')

    const { uuid } = argv

    console.log('========================================')
    console.log('findByUuid', findByUuid.getMode())
    console.log('findByUuid', findByUuid.getTape())
    console.log('========================================')

    const uri = await findByUuid(uuid)


    if (!uri) {
      throw new Error(`URL not found for uuid: ${uuid}`)
    }
    console.log('========================================')
    console.log('Data uri', uri)
    console.log('========================================')

    const markdown = await getMarkdown(uri.url)

    console.log('========================================')
    console.log('markdown', markdown)
    console.log('========================================')

    return { markdown }
  }
)

extract.setDescription(description)
