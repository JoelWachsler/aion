import { computed, Ref } from '@nuxtjs/composition-api'

export const firstDayOfWeek = (date: Date) => {
  const dateAtMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const currentDay = dateAtMidnight.getDay()

  return new Date(dateAtMidnight.getTime() - (currentDay - 1) * 24 * 3600 * 1000)
}

/**
 * Returns the first and last day (non inclusive) of the week of the provided date.
 */
export const firstAndLastDayOfWeek = (date: Date) => {
  const first = firstDayOfWeek(date)
  return {
    first,
    last: new Date(first.getTime() + 24 * 7 * 3600 * 1000),
  }
}

export const useDate = (date: Ref<number>) => {
  return {
    firstAndLastDayOfWeek: computed(() => firstAndLastDayOfWeek(new Date(date.value))),
  }
}
