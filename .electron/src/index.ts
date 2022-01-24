import child_process from 'child_process'
import { app, BrowserWindow } from 'electron'
import path from 'path'

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1920,
    height: 1080,
    darkTheme: true,
  })

  const file = path.join(__dirname, '../../dist/index.html')
  win.loadFile(file)
  // const filePath = `file://${file}`
  // win.loadURL(filePath).catch(e => {
  //   console.error(e)
  // })
}

// const exec = (cmd: string): Promise<string> => {
//   return new Promise((res, err) => {
//     child_process.exec(cmd, (error, stdout, stderr) => {
//       if (error) {
//         err(error)
//       } else if (stderr) {
//         err(stderr)
//       } else {
//         res(stdout)
//       }
//     })
//   })
// }

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

class Snapshot {
  constructor(private prevSnapshot: Snapshot | undefined, private date: Date, private snapshotName: string) {}

  toString() {
    return `from: ${this.prevSnapshot?.date}, to: ${this.date}, name: ${this.snapshotName}`
  }
}

class SnapshotManager {

  private snapshots: Snapshot[] = []
  private lastSnapshot: Snapshot | undefined = undefined

  createSnapshot(name: string) {
    if (this.lastSnapshot) {
      this.snapshots.push(this.lastSnapshot)
    }

    this.lastSnapshot = new Snapshot(this.lastSnapshot, new Date(), name)
  }

  printSnapshots() {
    this.snapshots.forEach(snapshot => {
      console.log(snapshot.toString())
    })
  }
}

app.whenReady().then(async () => {
  createWindow()

  const manager = new SnapshotManager()
  manager.createSnapshot('init')

  lockedMonitor({
    locked: () => {
      manager.createSnapshot('locked')
    },
    unlocked: () => {
      manager.createSnapshot('unlocked')
      manager.printSnapshots()
    }
  })

  // const { stdout } = child_process.spawn('gdbus monitor -y -d org.freedesktop.login1')
  // stdout.on('data', (data) => {
  //   console.log(`New data: ${data}`)
  // })

  // const rs = await exec('gdbus monitor -y -d org.freedesktop.login1')
  // console.log(`Result: ${rs}`)

  // setInterval(() => {
  //   console.log(powerMonitor.getSystemIdleState(1))
  //   console.log(powerMonitor.getSystemIdleTime())
  // }, 1000)
})

app.on('window-all-closed', () => {
  console.log('all windows closed')
  if (process.platform !== 'darwin') app.quit()
})

// app.on('browser-window-blur', () => {
//   // const n = new Notification({
//   //   body: 'Hello'
//   // })

//   // n.show()
// })

// app.on('activate', () => {
//   console.log('activate')
// })

// app.on('did-become-active', () => {
//   console.log('did-become-active')
// })
