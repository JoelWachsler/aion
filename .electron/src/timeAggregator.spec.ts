interface TimeEvent {
  timestamp: Date
  name: string
  track: boolean
}

interface TimeAggregatorArgs {
  events: TimeEvent[]
  from: Date
  to: Date
}

interface TimeAggregatorResult {
  date: Date
  name: string
  seconds: number
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

const timeAggregator = ({ events, from, to }: TimeAggregatorArgs): TimeAggregatorResult[] => {
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
          date: currentDay,
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

it('should aggregate a single timestamp event for a single day', () => {
  const events: TimeEvent[] = [
    {
      name: 'First',
      timestamp: new Date(2000, 0, 1, 0, 0, 0),
      track: true,
    },
    {
      name: 'Current',
      timestamp: new Date(2000, 0, 1, 1, 0, 0),
      track: false,
    },
  ]

  const result = timeAggregator({
    events,
    from: new Date(2000, 0, 1, 0, 0, 0),
    to: new Date(2000, 0, 2, 0, 0, 0),
  })
  expect(result).toEqual([
    {
      date: new Date(2000, 0, 1),
      name: 'First',
      seconds: 3600,
    },
  ])
})

it('should aggregate two timestamp events for a single day', () => {
  const events: TimeEvent[] = [
    {
      name: 'First',
      timestamp: new Date(2000, 0, 1, 0, 0, 0),
      track: true,
    },
    {
      name: 'Second',
      timestamp: new Date(2000, 0, 1, 1, 0, 0),
      track: true,
    },
    {
      name: 'Current',
      timestamp: new Date(2000, 0, 1, 2, 0, 0),
      track: false,
    },
  ]

  const result = timeAggregator({
    events,
    from: new Date(2000, 0, 1, 0, 0, 0),
    to: new Date(2000, 0, 2, 0, 0, 0),
  })
  expect(result).toEqual([
    {
      date: new Date(2000, 0, 1),
      name: 'First',
      seconds: 3600,
    },
    {
      date: new Date(2000, 0, 1),
      name: 'Second',
      seconds: 3600,
    },
  ])
})

it('should split if spanning over a multiple days', () => {
  const events: TimeEvent[] = [
    {
      name: 'First',
      timestamp: new Date(2000, 0, 1, 0, 0, 0),
      track: true,
    },
    {
      name: 'Current',
      timestamp: new Date(2000, 0, 3, 0, 0, 0),
      track: false,
    },
  ]

  const result = timeAggregator({
    events,
    from: new Date(2000, 0, 1, 0, 0, 0),
    to: new Date(2000, 0, 3, 0, 0, 0),
  })
  expect(result).toEqual([
    {
      date: new Date(2000, 0, 1),
      name: 'First',
      seconds: 3600 * 24,
    },
    {
      date: new Date(2000, 0, 2),
      name: 'First',
      seconds: 3600 * 24,
    },
  ])
})

it('should skip events where tracking is false', () => {
  const events: TimeEvent[] = [
    {
      name: 'First',
      timestamp: new Date(2000, 0, 1, 0, 0, 0),
      track: true,
    },
    {
      name: 'First',
      timestamp: new Date(2000, 0, 1, 1, 0, 0),
      track: false,
    },
    {
      name: 'Current',
      timestamp: new Date(2000, 0, 1, 2, 0, 0),
      track: false,
    },
  ]

  const result = timeAggregator({
    events,
    from: new Date(2000, 0, 1, 0, 0, 0),
    to: new Date(2000, 0, 2, 0, 0, 0),
  })
  expect(result).toEqual([
    {
      date: new Date(2000, 0, 1),
      name: 'First',
      seconds: 3600,
    },
  ])
})

it('should clip events if outside tracking dates', () => {
  const events: TimeEvent[] = [
    {
      name: 'First',
      timestamp: new Date(2000, 0, 1, 0, 0, 0),
      track: true,
    },
    {
      name: 'Current',
      timestamp: new Date(2000, 0, 1, 2, 0, 0),
      track: false,
    },
  ]

  const result = timeAggregator({
    events,
    from: new Date(2000, 0, 1, 1, 0, 0),
    to: new Date(2000, 0, 1, 1, 30, 0),
  })
  expect(result).toEqual([
    {
      date: new Date(2000, 0, 1),
      name: 'First',
      seconds: 3600 / 2,
    },
  ])
})
