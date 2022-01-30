import { convertResultToReportPresentation } from './useReport'
import { TimeAggregatorResult } from '~/electron/src/timeAggregator'

it('should convert result to report', () => {
  const result: TimeAggregatorResult[] = [
    {
      date: new Date(2000, 0, 1).getTime(),
      name: 'First',
      seconds: 3600,
    },
    {
      date: new Date(2000, 0, 1).getTime(),
      name: 'Second',
      seconds: 5400,
    },
    {
      date: new Date(2000, 0, 2).getTime(),
      name: 'Second',
      seconds: 1800,
    },
  ]

  const report = convertResultToReportPresentation(
    result,
    {
      from: new Date(2000, 0, 1).getTime(),
      to: new Date(2000, 0, 3).getTime(),
    },
  )

  expect(report).toEqual([
    {
      name: 'First',
      '2000-01-01': 1,
      '2000-01-02': 0,
      '2000-01-03': 0,
    },
    {
      name: 'Second',
      '2000-01-01': 1.5,
      '2000-01-02': 0.5,
      '2000-01-03': 0,
    },
  ])
})
