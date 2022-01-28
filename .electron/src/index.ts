import child_process from 'child_process'
import { app, BrowserWindow, ipcRenderer } from 'electron'
import path from 'path'
import { createTimeEvent, timeAggregator, TimeEvent } from './timeAggregator'

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

  win.webContents.toggleDevTools()

  win.loadFile(path.join(__dirname, '../../dist/index.html'))

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

  const events: TimeEvent[] = []
  let currentEvent: TimeEvent
  const addEvent = (newEvent: TimeEvent) => {
    events.push(newEvent)
    currentEvent = newEvent
  }

  addEvent(createTimeEvent({
    name: 'First',
    track: true,
  }))

  lockedMonitor({
    locked: () => {
      // win.webContents.send('locked-state', true)
      addEvent(createTimeEvent({
        name: currentEvent.name,
        track: false,
      }))
    },
    unlocked: () => {
      // win.webContents.send('locked-state', false)
      addEvent(createTimeEvent({
        name: currentEvent.name,
        track: true,
      }))
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
    } else if (channel == 'generate-report') {
      interface Interval {
        from: Date
        to: Date
      }

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
