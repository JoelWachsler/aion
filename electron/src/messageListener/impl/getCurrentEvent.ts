import { Environment } from '../../environment/environment'
import { Messages } from '../../messages'

export const getCurrentEvent = async(env: Environment) => {
  const { currentEvent } = await env.getOrCreateDbData()
  env.logger.info(`Sending current event: ${JSON.stringify(currentEvent)}`)
  env.sendMessage(Messages.CurrentEvent, currentEvent)
}
