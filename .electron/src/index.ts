import child_process from 'child_process'
import { app, BrowserWindow } from 'electron'
import path from 'path'
import { DbV1, initDb } from './db'
import { Messages } from './messages'
import { createTimeEvent, Interval, timeAggregator, TimeEvent } from './timeAggregator'

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    darkTheme: true,
    webPreferences: {
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
    }
  })

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, '../../../../dist/index.html'))
  } else {
    win.loadFile(path.join(__dirname, '../../dist/index.html'))
    win.webContents.toggleDevTools()
  }

  return win
}

type MaybePromise<T = void> = Promise<T> | T

interface LockedMonitorArgs {
  locked?: () => MaybePromise
  unlocked?: () => MaybePromise
}

const lockedMonitor = ({ locked, unlocked }: LockedMonitorArgs) => {
  const ps = child_process.exec('gdbus monitor -y -d org.freedesktop.login1')

  ps.stdout?.on('data', async (data: string) => {
    if (data.includes(`'LockedHint': <true>`)) {
      if (locked) {
        await locked()
      }
    } else if (data.includes(`'LockedHint': <false>`)) {
      if (unlocked) {
        await unlocked()
      }
    }
  })
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

app.whenReady().then(async () => {
  const win = createWindow()

  const db = initDb()
  await db.read()

  const getOrCreateDbData = async (): Promise<DbV1> => {
    if (!db.data) {
      db.data = defaultDatabase()
      await db.write()
    }

    return db.data
  }

  const addEvent = async (newEvent: TimeEvent) => {
    if (newEvent.name === '') {
      return
    }

    const data = await getOrCreateDbData()
    const { currentEvent, events, trackingNames } = data

    if (currentEvent && newEvent.name === currentEvent.name && newEvent.track === currentEvent.track) {
      // unnecessary update -> ignore it
      return
    }

    events.push(newEvent)
    data.currentEvent = newEvent

    trackingNames.push(newEvent.name)

    data.trackingNames = [...new Set(trackingNames).add(newEvent.name)]
    data.events = events
    data.currentEvent = newEvent
    await db.write()

    sendUpdatedTrackingNames()
  }

  const sendUpdatedTrackingNames = () => {
    win.webContents.send(Messages.TrackingNamesUpdates, [...(db.data?.trackingNames ?? [])])
  }

  lockedMonitor({
    locked: async () => {
      const { currentEvent } = await getOrCreateDbData()

      addEvent(createTimeEvent({
        name: currentEvent.name,
        track: false,
      }))
    },
    unlocked: async () => {
      const { currentEvent } = await getOrCreateDbData()

      addEvent(createTimeEvent({
        name: currentEvent.name,
        track: true,
      }))
    },
  })

  win.webContents.on('ipc-message', async (_, channel, arg) => {
    if (channel === Messages.NewEvent) {
      if (typeof arg === 'string') {
        addEvent(createTimeEvent({
          name: arg,
          track: true,
        }))
      }
    } else if (channel === Messages.GenerateReport) {
      const isInterval = (arg: any): arg is Interval => {
        return arg && arg.from && arg.to
      }

      if (isInterval(arg)) {
        const { events } = await getOrCreateDbData()

        const msg = timeAggregator({
          events: [...events, createTimeEvent({ name: 'Current', track: false })],
          from: arg.from,
          to: arg.to,
        })

        win.webContents.send(Messages.NewReport, msg)
      }
    } else if (channel === Messages.GetCurrentEvent) {
      const { currentEvent } = await getOrCreateDbData()
      console.log(`Sending current event: ${JSON.stringify(currentEvent)}`)
      win.webContents.send(Messages.CurrentEvent, currentEvent)
    } else if (channel === Messages.GetTrackingNames) {
      console.log('Sending track name update')
      sendUpdatedTrackingNames()
    } else if (channel === Messages.ClearDatabase) {
      console.log('Clearing database')
      db.data = defaultDatabase()
      await db.write()
    }
  })

  // setInterval(() => {
  //   console.log(powerMonitor.getSystemIdleState(1))
  //   console.log(powerMonitor.getSystemIdleTime())
  // }, 1000)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
