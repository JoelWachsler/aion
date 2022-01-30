import { Environment } from '../environment/environment'
import { Messages } from '../messages'
import { TimeEvent } from '../timeAggregator'
import { clearDatabase } from './impl/clearDatabase'
import { generateReport } from './impl/generateReport'
import { getCurrentEvent } from './impl/getCurrentEvent'
import { getTrackingNames } from './impl/getTrackingNames'
import { newEvent } from './impl/newEvent'
import { updateEvent } from './impl/updateEvent'

type EventHandler = (env: Environment, args: any) => Promise<void>

const initHandlers = (): Map<Messages, EventHandler> => {
  return new Map([
    [Messages.NewEvent, newEvent],
    [Messages.GenerateReport, generateReport],
    [Messages.GetCurrentEvent, getCurrentEvent],
    [Messages.GetTrackingNames, getTrackingNames],
    [Messages.ClearDatabase, clearDatabase],
    [Messages.UpdateEvent, updateEvent],
  ])
}

export const init = (env: Environment) => {
  const handlers = initHandlers()

  env.handleMessages(async(channel, args) => {
    const handler = handlers.get(channel)
    if (!handler) {
      env.logger.error(`Failed to find message handler for channel: ${channel}`)
      return
    }

    await handler(env, args)
  })
}

export const addEvent = async(env: Environment, newEvent: TimeEvent) => {
  if (newEvent.name === '') {
    return
  }

  const data = await env.getOrCreateDbData()
  const { currentEvent, events, trackingNames } = data

  if (currentEvent && newEvent.name === currentEvent.name && newEvent.track === currentEvent.track) {
    // unnecessary update -> ignore it
    return
  }

  events.push(newEvent)
  data.currentEvent = newEvent

  trackingNames.push(newEvent.name)

  data.trackingNames = [...new Set(trackingNames).add(newEvent.name)]
  data.events = events
  data.currentEvent = newEvent
  await env.saveDb()

  await sendUpdatedTrackingNames(env)
}

export const sendUpdatedTrackingNames = async(env: Environment) => {
  env.logger.info('Sending track name update')
  const { trackingNames } = await env.getOrCreateDbData()
  env.sendMessage(Messages.TrackingNamesUpdates, [...trackingNames])
}
