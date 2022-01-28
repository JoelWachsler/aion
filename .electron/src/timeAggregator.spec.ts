import { TimeEvent, timeAggregator } from './timeAggregator'

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
