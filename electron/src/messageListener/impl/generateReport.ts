import { Environment } from '../../environment/environment'
import { Messages } from '../../messages'
import { Interval, timeAggregator, createTimeEvent } from '../../timeAggregator'

export const generateReport = async(env: Environment, args: any) => {
  const isInterval = (arg: any): arg is Interval => {
    return arg && arg.from && arg.to
  }

  if (isInterval(args)) {
    const { events } = await env.getOrCreateDbData()

    const msg = timeAggregator({
      events: [...events, createTimeEvent({ name: 'Current', track: false })],
      from: args.from,
      to: args.to,
    })

    env.sendMessage(Messages.NewReport, msg)
  }
}
