import { computed, Ref } from '@nuxtjs/composition-api'

export const firstDayOfWeek = (date: Date): number => {
  const dateAtMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  // sunday is 0 -> convert such that monday is 0
  const currentDay = (dateAtMidnight.getDay() + 6) % 7

  return new Date(dateAtMidnight.getTime() - currentDay * 24 * 3600 * 1000).getTime()
}

/**
 * Returns the first and last day (inclusive) of the week of the provided date.
 */
export const firstAndLastDayOfWeek = (date: Date) => {
  const from = firstDayOfWeek(date)
  return {
    from,
    to: from + 24 * 6 * 3600 * 1000,
  }
}

export const useDate = (date: Ref<number>) => {
  return {
    firstAndLastDayOfWeek: computed(() => firstAndLastDayOfWeek(new Date(date.value))),
  }
}
