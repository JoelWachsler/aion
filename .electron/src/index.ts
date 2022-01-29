import child_process from 'child_process'
import { app, BrowserWindow } from 'electron'
import path from 'path'
import { initDb } from './db'
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

  ps.stdout?.on('data', (data: string) => {
    if (data.includes(`'LockedHint': <true>`)) {
      if (locked) {
        locked()
      }
    } else if (data.includes(`'LockedHint': <false>`)) {
      if (unlocked) {
        unlocked()
      }
    }
  })
}

app.whenReady().then(async () => {
  const win = createWindow()

  const db = initDb()
  await db.read()

  if (!db.data) {
    db.data = {
      meta: {
        version: 1,
      },
      events: [],
      trackingNames: [],
      currentEvent: undefined
    }

    await db.write()
  }

  const events: TimeEvent[] = db.data?.events ?? []
  const trackingNames = new Set<string>(db.data.trackingNames ?? [])
  let currentEvent: TimeEvent | undefined

  if (db.data?.currentEvent) {
    currentEvent = db.data.currentEvent
  }

  const addEvent = async (newEvent: TimeEvent) => {
    if (currentEvent && newEvent.name === currentEvent.name && newEvent.track === currentEvent.track) {
      // unnecessary update -> ignore it
      return
    }

    events.push(newEvent)
    currentEvent = newEvent

    trackingNames.add(newEvent.name)
    sendUpdatedTrackingNames()

    db.data!.events = events
    db.data!.trackingNames = [...trackingNames]
    db.data!.currentEvent = currentEvent
    await db.write()
  }

  const sendUpdatedTrackingNames = () => {
    win.webContents.send('tracking-names-updated', [...trackingNames])
  }

  if (!currentEvent) {
    addEvent(createTimeEvent({
      name: 'First',
      track: true,
    }))
  }

  lockedMonitor({
    locked: () => {
      // win.webContents.send('locked-state', true)
      if (currentEvent) {
        addEvent(createTimeEvent({
          name: currentEvent.name,
          track: false,
        }))
      }
    },
    unlocked: () => {
      // win.webContents.send('locked-state', false)
      if (currentEvent) {
        addEvent(createTimeEvent({
          name: currentEvent.name,
          track: true,
        }))
      }
    },
  })

  win.webContents.on('ipc-message', (_, channel, arg) => {
    if (channel === 'new-event') {
      if (typeof arg === 'string') {
        addEvent(createTimeEvent({
          name: arg,
          track: true,
        }))
      }
    } else if (channel === 'generate-report') {
      const isInterval = (arg: any): arg is Interval => {
        return arg && arg.from && arg.to
      }

      if (isInterval(arg)) {
        const msg = timeAggregator({
          events: [...events, createTimeEvent({ name: 'Current', track: false })],
          from: arg.from,
          to: arg.to,
        })

        win.webContents.send('new-report', msg)
      }
    } else if (channel === 'get-current-event') {
      win.webContents.send('current-event', currentEvent)
    } else if (channel === 'get-tracking-names') {
      sendUpdatedTrackingNames()
    }
  })

  // setInterval(() => {
  //   console.log(powerMonitor.getSystemIdleState(1))
  //   console.log(powerMonitor.getSystemIdleTime())
  // }, 1000)
})

app.on('window-all-closed', () => {
  console.log('all windows closed')
  if (process.platform !== 'darwin') app.quit()
})
