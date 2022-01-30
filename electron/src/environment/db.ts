import { Low, JSONFile } from 'lowdb'
import { TimeEvent } from '../timeAggregator'

export interface DbV1 {
  meta: {
    version: 1,
  },
  events: TimeEvent[],
  trackingNames: string[],
  currentEvent: TimeEvent,
}

export const initDb = () => {
  return new Low<DbV1>(new JSONFile('./aion.json'))
}
