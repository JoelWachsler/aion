import { Environment } from '../../environment/environment'
import { TimeEvent } from '../../timeAggregator'

export interface UpdateEventArgs {
  eventId: string
  fieldsToUpdate: Partial<TimeEvent>
}

export const updateEvent = async(env: Environment, args: any) => {
  env.logger.info(`Recieved an update event request: ${JSON.stringify(args)}`)
  const updateArgs = args as UpdateEventArgs
  const { events } = await env.getOrCreateDbData()
  const eventIndex = events.findIndex(event => event.id === updateArgs.eventId)
  console.log(`Event with id: ${updateArgs.eventId} was found at index: ${eventIndex}`)
  if (eventIndex !== -1) {
    const eventToUpdate = events[eventIndex]

    const updatedEvent = {
      ...eventToUpdate,
      ...updateArgs.fieldsToUpdate,
    }

    events[eventIndex] = updatedEvent
    await env.saveDb()

    env.logger.info(`${JSON.stringify(eventToUpdate)} has been updated to ${JSON.stringify(updatedEvent)}`)
  }
}
