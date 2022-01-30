import path from 'path'
import { app, BrowserWindow, powerMonitor } from 'electron'
import { factory as envFactory } from './environment/environment'
import { factory as lockHandlerFactory } from './lockHandler/lockHandler'
import { addEvent, init as messageListenerInit } from './messageListener/messageListener'
import { Messages } from './messages'
import { createTimeEvent } from './timeAggregator'

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    darkTheme: true,
    webPreferences: {
      contextIsolation: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, '../../../../dist/index.html'))
  } else {
    win.loadFile(path.join(__dirname, '../../dist/index.html'))
    win.webContents.toggleDevTools()
  }

  return win
}

app.whenReady().then(async() => {
  const win = createWindow()
  const env = await envFactory(win)

  let locked = false

  lockHandlerFactory({
    locked: async() => {
      locked = true

      const { currentEvent } = await env.getOrCreateDbData()

      await addEvent(env, createTimeEvent({
        name: currentEvent.name,
        track: false,
      }))
    },
    unlocked: async() => {
      locked = false

      const { currentEvent } = await env.getOrCreateDbData()
      env.sendMessage(Messages.ManualEventHandling, currentEvent)
    },
  })

  messageListenerInit(env)

  let idleCounter = 0

  setInterval(async() => {
    // ignore this when locked
    if (locked) {
      idleCounter = 0
      return
    }

    const idleTimer = powerMonitor.getSystemIdleTime()

    if (idleTimer === 0) {
      const counter = idleCounter
      idleCounter = 0

      // 15 minutes
      if (counter > 15) {
        {
          const { currentEvent } = await env.getOrCreateDbData()
          await addEvent(env, createTimeEvent({
            name: currentEvent.name,
            timestamp: Date.now() - counter * 1000,
            track: true,
          }))
        }

        const { currentEvent } = await env.getOrCreateDbData()
        env.sendMessage(Messages.ManualEventHandling, currentEvent)
      }
    } else {
      idleCounter = idleTimer
    }
  }, 1000)

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
})
