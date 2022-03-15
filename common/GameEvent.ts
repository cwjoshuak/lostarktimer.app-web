import { DateTime, Interval } from 'luxon'
import { APIEventType, APIGameEvent } from './api'

class GameEvent {
  eventType: APIEventType
  gameEvent: APIGameEvent
  times: Array<Interval> = []
  constructor(et: APIEventType, ge: APIGameEvent) {
    this.eventType = et
    this.gameEvent = ge
  }
  addTime(t: Interval) {
    this.times.push(t)
  }
  latest(t: DateTime) {
    return this.times.filter((ti) => ti.start.diff(t).valueOf() > 0)[0]
  }
}

export default GameEvent
