import child_process from 'child_process'
import { LockedMonitorArgs } from '../lockHandler'

export const lockedMonitor = ({ locked, unlocked }: LockedMonitorArgs) => {
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
