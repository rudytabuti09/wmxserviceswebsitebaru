import { defineConfig } from 'prisma/config'

export default defineConfig({
  datasource: {
    db: {
      provider: 'postgresql',
      url: process.env.DATABASE_URL
    }
  },
  generator: {
    client: {
      provider: 'prisma-client-js'
    }
  }
})
