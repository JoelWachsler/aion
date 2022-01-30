import { Environment } from '../../environment/environment'
import { Messages } from '../../messages'
import { createTimeEvent } from '../../timeAggregator'
import { addEvent } from '../messageListener'

export const uiReady = async(env: Environment) => {
  const { heartbeat } = await env.getOrCreateDbData()
  // last time the app started was more than 30 seconds ago, ask
  // the user what to do with the time
  const awayFor = Date.now() - heartbeat
  console.log(`The user has been away for: ${awayFor}`)
  if (awayFor > 30 * 1000) {
    {
      const { currentEvent } = await env.getOrCreateDbData()

      await addEvent(env, createTimeEvent({
        name: currentEvent.name,
        timestamp: heartbeat,
        track: true,
      }))
    }

    const { currentEvent } = await env.getOrCreateDbData()
    env.sendMessage(Messages.ManualEventHandling, currentEvent)
  }

  setInterval(async() => {
    await env.sendHeartbeat()
  }, 10000)
}
