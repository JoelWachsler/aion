import { firstAndLastDayOfWeek, firstDayOfWeek } from './useDate'

it('should find first day of week', () => {
  // friday
  const date = new Date(2022, 0, 28)

  expect(firstDayOfWeek(date)).toEqual(new Date(2022, 0, 24))
})

it('should ignore hours, minutes and seconds', () => {
  // friday
  const date = new Date(2022, 0, 28, 1, 1, 1)

  expect(firstDayOfWeek(date)).toEqual(new Date(2022, 0, 24))
})

it('should find first and last day of week', () => {
  // friday
  const date = new Date(2022, 0, 28)

  expect(firstAndLastDayOfWeek(date)).toEqual({ first: new Date(2022, 0, 24), last: new Date(2022, 0, 31) })
})
