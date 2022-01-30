import { Environment } from '../../environment/environment'
import { Messages } from '../../messages'
import { calculateSecondsTrackedForDay, createTimeEvent } from '../../timeAggregator'

export const secondsTrackedForDay = async(env: Environment, args: any) => {
  const { events } = await env.getOrCreateDbData()

  const secondsTracked = calculateSecondsTrackedForDay({
    events: [...events, createTimeEvent({
      name: 'Current',
      track: false,
    })],
    day: args as number,
  })

  env.sendMessage(Messages.SecondsTrackedForDay, secondsTracked)
}
