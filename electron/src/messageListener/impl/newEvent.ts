import { Environment } from '../../environment/environment'
import { createTimeEvent } from '../../timeAggregator'
import { addEvent } from '../messageListener'

export const newEvent = async(env: Environment, args: any) => {
  if (typeof args === 'string') {
    await addEvent(env, createTimeEvent({
      name: args,
      track: true,
    }))
  }
}
