import { DateTime, Interval } from 'luxon'
import { APIEventType, APIGameEvent } from './api'
import { v4 as uuidv4 } from 'uuid'
class GameEvent {
  eventType: APIEventType
  gameEvent: APIGameEvent
  uuid: string
  times: Array<Interval> = []
  disabled: DateTime | null = null
  groupName: string | null = null
  constructor(et: APIEventType, ge: APIGameEvent) {
    this.eventType = et
    this.gameEvent = ge
    this.uuid = uuidv4()
  }
  addTime(t: Interval) {
    this.times.push(t)
  }
  latest(t: DateTime): Interval {
    return this.times.filter((ti) => ti.start.diff(t).valueOf() > 0)[0]
  }
}

export default GameEvent
