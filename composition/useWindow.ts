import { ipcRenderer } from 'electron'

type WindowWithIpc = typeof window & { ipcRenderer?: typeof ipcRenderer }

export const win = window as WindowWithIpc
