import { computed, Ref } from '@nuxtjs/composition-api'

export const getDateOffset = (date: number) => {
  return new Date(date).getTimezoneOffset() * 60 * 1000
}

export const firstDayOfWeek = (date: Date): number => {
  const dateAtMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  // sunday is 0 -> convert such that monday is 0
  const currentDay = (dateAtMidnight.getDay() + 6) % 7

  return new Date(dateAtMidnight.getTime() - currentDay * 24 * 3600 * 1000).getTime()
}

export const weekForDate = (date: Date) => {
  const from = firstDayOfWeek(date)
  return {
    from,
    to: from + 24 * 7 * 3600 * 1000 - 1,
  }
}

export const useDate = (date: Ref<number>) => {
  return {
    firstAndLastDayOfWeek: computed(() => weekForDate(new Date(date.value))),
  }
}
