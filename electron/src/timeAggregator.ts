import { v4 as uuidv4 } from 'uuid'

export interface TimeEvent {
  id: string
  timestamp: number
  name: string
  track: boolean
}

export interface Interval {
  from: number
  to: number
}

interface TimeAggregatorArgs extends Interval {
  events: TimeEvent[]
}

export interface TimeAggregatorResult {
  date: number
  name: string
  seconds: number
}

export const createTimeEvent = (
  args: Omit<TimeEvent, 'id' | 'timestamp'> & { id?: TimeEvent['id'],
  timestamp?: TimeEvent['timestamp'] },
): TimeEvent => {
  return {
    id: uuidv4(),
    timestamp: new Date().getTime(),
    ...args,
  }
}

const incrementDateBySeconds = (date: Date, seconds: number) => {
  return new Date(date.getTime() + seconds * 1000)
}

const findEventByDate = (events: TimeEvent[], date: Date): TimeEvent | undefined => {
  return events.find(event => event.timestamp <= date.getTime())
}

const toDay = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export const timeAggregator = ({ events, from, to }: TimeAggregatorArgs): TimeAggregatorResult[] => {
  let currentTime = new Date(from)
  const sortedEvents = events.sort((a, b) => a.timestamp - b.timestamp)
  const reverseEvents = sortedEvents.reverse()

  const lastEvent = reverseEvents[0]
  if (!lastEvent) {
    throw new Error('No events defined!')
  }

  let lastEventTime = lastEvent.timestamp
  if (lastEventTime > to) {
    lastEventTime = to
  }

  const timeAggr = new Map<number, Map<string, TimeAggregatorResult>>()

  while (currentTime.getTime() < lastEventTime) {
    const event = findEventByDate(reverseEvents, currentTime)
    if (event && event.track) {
      const currentDay = toDay(currentTime)

      let resultForDay = timeAggr.get(currentDay.getTime())
      if (!resultForDay) {
        resultForDay = new Map()
        timeAggr.set(currentDay.getTime(), resultForDay)
      }

      let eventForDayAndName = resultForDay.get(event.name)
      if (!eventForDayAndName) {
        eventForDayAndName = {
          date: currentDay.getTime(),
          name: event.name,
          seconds: 0,
        }
        resultForDay.set(event.name, eventForDayAndName)
      }

      eventForDayAndName.seconds++
    }
    currentTime = incrementDateBySeconds(currentTime, 1)
  }

  return [...timeAggr]
    .flatMap(m => [m[1]])
    .flatMap(m => [...m].map(mm => mm[1]))
}
