import { createTimeEvent, timeAggregator, TimeEvent } from './timeAggregator'

it('should aggregate a single timestamp event for a single day', () => {
  const events: TimeEvent[] = [
    createTimeEvent({
      name: 'First',
      timestamp: new Date(2000, 0, 1, 0, 0, 0).getTime(),
      track: true,
    }),
    createTimeEvent({
      name: 'Current',
      timestamp: new Date(2000, 0, 1, 1, 0, 0).getTime(),
      track: false,
    }),
  ]

  const result = timeAggregator({
    events,
    from: new Date(2000, 0, 1, 0, 0, 0),
    to: new Date(2000, 0, 2, 0, 0, 0),
  })
  expect(result).toEqual([
    {
      date: new Date(2000, 0, 1).getTime(),
      name: 'First',
      seconds: 3600,
    },
  ])
})

it('should aggregate two timestamp events for a single day', () => {
  const events: TimeEvent[] = [
    createTimeEvent({
      name: 'First',
      timestamp: new Date(2000, 0, 1, 0, 0, 0).getTime(),
      track: true,
    }),
    createTimeEvent({
      name: 'Second',
      timestamp: new Date(2000, 0, 1, 1, 0, 0).getTime(),
      track: true,
    }),
    createTimeEvent({
      name: 'Current',
      timestamp: new Date(2000, 0, 1, 2, 0, 0).getTime(),
      track: false,
    }),
  ]

  const result = timeAggregator({
    events,
    from: new Date(2000, 0, 1, 0, 0, 0),
    to: new Date(2000, 0, 2, 0, 0, 0),
  })
  expect(result).toEqual([
    {
      date: new Date(2000, 0, 1).getTime(),
      name: 'First',
      seconds: 3600,
    },
    {
      date: new Date(2000, 0, 1).getTime(),
      name: 'Second',
      seconds: 3600,
    },
  ])
})

it('should split if spanning over a multiple days', () => {
  const events: TimeEvent[] = [
    createTimeEvent({
      name: 'First',
      timestamp: new Date(2000, 0, 1, 0, 0, 0).getTime(),
      track: true,
    }),
    createTimeEvent({
      name: 'Current',
      timestamp: new Date(2000, 0, 3, 0, 0, 0).getTime(),
      track: false,
    }),
  ]

  const result = timeAggregator({
    events,
    from: new Date(2000, 0, 1, 0, 0, 0),
    to: new Date(2000, 0, 3, 0, 0, 0),
  })
  expect(result).toEqual([
    {
      date: new Date(2000, 0, 1).getTime(),
      name: 'First',
      seconds: 3600 * 24,
    },
    {
      date: new Date(2000, 0, 2).getTime(),
      name: 'First',
      seconds: 3600 * 24,
    },
  ])
})

it('should skip events where tracking is false', () => {
  const events: TimeEvent[] = [
    createTimeEvent({
      name: 'First',
      timestamp: new Date(2000, 0, 1, 0, 0, 0).getTime(),
      track: true,
    }),
    createTimeEvent({
      name: 'First',
      timestamp: new Date(2000, 0, 1, 1, 0, 0).getTime(),
      track: false,
    }),
    createTimeEvent({
      name: 'Current',
      timestamp: new Date(2000, 0, 1, 2, 0, 0).getTime(),
      track: false,
    }),
  ]

  const result = timeAggregator({
    events,
    from: new Date(2000, 0, 1, 0, 0, 0),
    to: new Date(2000, 0, 2, 0, 0, 0),
  })
  expect(result).toEqual([
    {
      date: new Date(2000, 0, 1).getTime(),
      name: 'First',
      seconds: 3600,
    },
  ])
})

it('should clip events if outside tracking dates', () => {
  const events: TimeEvent[] = [
    createTimeEvent({
      name: 'First',
      timestamp: new Date(2000, 0, 1, 0, 0, 0).getTime(),
      track: true,
    }),
    createTimeEvent({
      name: 'Current',
      timestamp: new Date(2000, 0, 1, 2, 0, 0).getTime(),
      track: false,
    }),
  ]

  const result = timeAggregator({
    events,
    from: new Date(2000, 0, 1, 1, 0, 0),
    to: new Date(2000, 0, 1, 1, 30, 0),
  })
  expect(result).toEqual([
    {
      date: new Date(2000, 0, 1).getTime(),
      name: 'First',
      seconds: 3600 / 2,
    },
  ])
})
