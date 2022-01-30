import { firstAndLastDayOfWeek, firstDayOfWeek } from './useDate'

it('should find first day of week', () => {
  // friday
  const date = new Date(2022, 0, 28)

  expect(firstDayOfWeek(date)).toEqual(new Date(2022, 0, 24).getTime())
})

it('should ignore hours, minutes and seconds', () => {
  // friday
  const date = new Date(2022, 0, 28, 1, 1, 1)

  expect(firstDayOfWeek(date)).toEqual(new Date(2022, 0, 24).getTime())
})

it('should find first and last day of week', () => {
  // friday
  const date = new Date(2022, 0, 28)

  expect(firstAndLastDayOfWeek(date)).toEqual({
    from: new Date(2022, 0, 24).getTime(),
    to: new Date(2022, 0, 30).getTime(),
  })
})

it('should find first and last day of week on sunday', () => {
  // sunday
  const date = new Date(2022, 0, 30)

  expect(firstAndLastDayOfWeek(date)).toEqual({
    from: new Date(2022, 0, 24).getTime(),
    to: new Date(2022, 0, 30).getTime(),
  })
})
