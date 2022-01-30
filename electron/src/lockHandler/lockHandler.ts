import { lockedMonitor } from './impl/linux'

type MaybePromise<T = void> = Promise<T> | T

export interface LockedMonitorArgs {
  locked?: () => MaybePromise
  unlocked?: () => MaybePromise
}

export const factory = (args: LockedMonitorArgs) => {
  if (process.platform === 'linux') {
    return lockedMonitor(args)
  } else {
    throw new Error(`Unsupported platform: ${process.platform}`)
  }
}
