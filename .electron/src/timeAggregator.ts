import { v4 as uuidv4 } from 'uuid'

export interface TimeEvent {
  id: string
  timestamp: Date
  name: string
  track: boolean
}

interface TimeAggregatorArgs extends Interval {
  events: TimeEvent[]
}

export interface Interval {
  from: Date
  to: Date
}

export interface TimeAggregatorResult {
  date: number
  name: string
  seconds: number
}

export const createTimeEvent = (args: Omit<TimeEvent, 'id' | 'timestamp'> & { id?: TimeEvent['id'], timestamp?: TimeEvent['timestamp'] }): TimeEvent => {
  return {
    id: uuidv4(),
    timestamp: new Date(),
    ...args,
  }
}

const incrementDateBySeconds = (date: Date, seconds: number) => {
  return new Date(date.getTime() + seconds * 1000)
}

const findEventByDate = (events: TimeEvent[], date: Date): TimeEvent | undefined => {
  return events.find(event => event.timestamp.getTime() <= date.getTime())
}

const toDay = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

export const timeAggregator = ({ events, from, to }: TimeAggregatorArgs): TimeAggregatorResult[] => {
  let currentTime = new Date(from)
  const sortedEvents = events.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  const reverseEvents = sortedEvents.reverse()

  const lastEvent = reverseEvents[0]
  if (!lastEvent) {
    throw Error('No events defined!')
  }

  let lastEventTime = lastEvent.timestamp.getTime()
  if (lastEventTime > to.getTime()) {
    lastEventTime = to.getTime()
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
