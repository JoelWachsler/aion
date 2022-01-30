import { Notification } from 'electron'
import { Environment } from '../../environment/environment'

export const sendNotification = async(_: Environment, { title, body }: { title: string, body?: string }) => {
  console.log(`Sending notification: ${title}`)
  new Notification({ title, body }).show()
}
