import { init } from '@instantdb/core'

export const db = init({
  appId: 'cd908c99-cc03-49d5-9d0c-f59734623e36'
})

export type DB = typeof db