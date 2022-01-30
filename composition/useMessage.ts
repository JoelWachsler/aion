import { win } from './useWindow'
import { Messages } from '~/electron/src/messages'

export const sendMessage = <T = any>(message: Messages, arg: T) => {
  win.ipcRenderer?.send(message, arg)
}
