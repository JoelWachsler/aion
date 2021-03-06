
import { computed, Ref } from '@nuxtjs/composition-api'
import { DataTableHeader } from 'vuetify'
import { Interval, TimeAggregatorResult } from '~/electron/src/timeAggregator'

type ReportValue = {[key: string]: number | string}

const zeroPadding = (num: number): string => {
  if (num < 10) {
    return `0${num}`
  } else {
    return `${num}`
  }
}

const dateToString = (timestamp: number) => {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${zeroPadding(date.getMonth() + 1)}-${zeroPadding(date.getDate())}`
}

const toHoursWithTwoDecimals = (seconds: number): number => {
  return Math.round(seconds / 3600 * 100) / 100
}

const incrementDateByOneDay = (date: number): number => {
  return date + 24 * 3600 * 1000
}

export const convertResultToReportPresentation = (
  result: TimeAggregatorResult[],
  interval: Interval,
): ReportValue[] => {
  // name -> dateString -> seconds
  const names = new Map<string, Map<string, number>>()

  for (const { name, date, seconds } of result) {
    let nameLookup = names.get(name)
    if (!nameLookup) {
      nameLookup = new Map()
      names.set(name, nameLookup)
    }

    const dateAsString = dateToString(date)
    nameLookup.set(dateAsString, seconds)
  }

  const report: ReportValue[] = []

  for (const [name, dateStringLookup] of names.entries()) {
    const nameReport: ReportValue = { name }
    let currentDate = interval.from

    while (currentDate <= interval.to) {
      const dateString = dateToString(currentDate)
      const seconds = dateStringLookup.get(dateString)
      nameReport[dateString] = toHoursWithTwoDecimals(seconds ?? 0)

      currentDate = incrementDateByOneDay(currentDate)
    }

    report.push(nameReport)
  }

  return report
}

interface UseReportArgs {
  result: Ref<TimeAggregatorResult[]>
  interval: Ref<Interval>
}

export const useReport = ({ result, interval }: UseReportArgs) => {
  const report = computed(() => convertResultToReportPresentation(result.value, interval.value))

  return {
    report,
    headers: computed<DataTableHeader[]>(() => {
      const [firstReportValue] = report.value

      if (!firstReportValue) {
        return []
      }

      const dates = Object.keys(firstReportValue)
        .filter(res => res !== 'name')
        .map(res => ({
          text: res,
          value: res,
        }))

      return [{ text: 'Name', value: 'name' }, ...dates]
    }),
  }
}
