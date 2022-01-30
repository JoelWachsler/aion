import { BrowserWindow } from 'electron'
import { Messages } from '../messages'
import { createTimeEvent } from '../timeAggregator'
import { DbV1, initDb } from './db'

interface Logger {
  info(msg: string): void
  error(msg: string): void
}

export interface Environment {
  sendMessage<T = any>(channel: Messages, args: T): void
  handleMessages(handle: (channel: Messages, args: any) => Promise<void>): void
  getOrCreateDbData(): Promise<DbV1>
  logger: Logger
  clearDatabase(): Promise<void>
  saveDb(): Promise<void>
}

export const factory = async (win: BrowserWindow): Promise<Environment> => {
  const db = initDb()
  await db.read()

  const getOrCreateDbData = async (): Promise<DbV1> => {
    if (!db.data) {
      db.data = defaultDatabase()
      await db.write()
    }

    return db.data
  }

  const logger: Logger = {
    info(msg: string) {
      console.log(msg)
    },
    error(msg: string) {
      console.error(msg)
    },
  }

  return {
    sendMessage<T = any>(channel: Messages, args: T) {
      win.webContents.send(channel, args)
    },
    getOrCreateDbData,
    handleMessages(handle) {
      win.webContents.on('ipc-message', async (_, channel, args) => {
        await handle(channel as Messages, args)
      })
    },
    logger,
    async clearDatabase() {
      db.data = defaultDatabase()
      await db.write()
    },
    async saveDb() {
      await db.write()
    },
  }
}

const defaultDatabase = (): DbV1 => {
  const initialEvent = createInitialEvent()

  return {
    meta: {
      version: 1,
    },
    events: [initialEvent],
    trackingNames: [initialEvent.name],
    currentEvent: initialEvent,
  }
}

const createInitialEvent = () => {
  return createTimeEvent({
    name: 'Initial event',
    track: true,
  })
}
