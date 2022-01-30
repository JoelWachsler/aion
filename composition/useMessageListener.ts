import { onBeforeUnmount } from '@nuxtjs/composition-api'
import { IpcRendererEvent } from 'electron'
import { win } from './useWindow'

export const useMessageListener = <T = any>(name: string, listener: (event: IpcRendererEvent, message: T) => void) => {
  win.ipcRenderer?.on(name, listener)

  onBeforeUnmount(() => {
    win.ipcRenderer?.off(name, listener)
  })
}
