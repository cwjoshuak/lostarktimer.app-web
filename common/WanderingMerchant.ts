import { DateTime, Interval } from 'luxon'
import { v4 as uuidv4 } from 'uuid'
import Item from './Item'

type MerchantItems = { rapport: number[]; cards: number[]; cooking: number[] }
class WanderingMerchant {
  name: string
  continent: string
  items: MerchantItems
  spawned: boolean = false
  scheduleId: 1 | 2 | 3
  schedule: Interval[]
  locationImages: { [key: string]: string }

  location: string | null = null
  goodItem: string | null = null
  spawnTime: number | null = null

  uuid: string

  constructor(
    name: string,
    items: MerchantItems,
    continent: string,
    scheduleId: number,
    locationImages: { [key: string]: string },
    schedule: Interval[]
  ) {
    this.name = name
    this.items = items
    this.continent = continent
    this.scheduleId = scheduleId as 1 | 2 | 3
    this.locationImages = locationImages
    this.schedule = schedule
    this.uuid = uuidv4()
    // this.expectedSpawnTime = expectedSpawnTime
  }

  setSpawn(
    // continent: String | null,
    location: string | null,
    goodItem: string | null,
    spawnTime: number | null
  ) {
    // this.continent = continent
    this.location = location
    this.goodItem = goodItem
    this.spawnTime = spawnTime
    this.spawned = true
  }
  inProgress(serverTime: DateTime) {
    if (this.spawnTime != null) return true
    for (const interval of this.schedule) {
      if (
        interval.start.diff(serverTime).toMillis() < 0 &&
        interval.end.diff(serverTime).toMillis() > 0
      )
        return interval
    }
    return null
  }
  nextSpawnTime(serverTime: DateTime) {
    for (let idx = 0; idx < this.schedule.length; idx++) {
      let interval = this.schedule[idx]
      let startDiff = interval.start.diff(serverTime).toMillis()
      let endDiff = interval.end.diff(serverTime).toMillis()

      // case: time before first event of day
      if (startDiff > 0) return interval
      // case: in progress
      if (startDiff < 0 && endDiff > 0)
        return idx + 1 < this.schedule.length
          ? this.schedule[idx + 1]
          : this.schedule[0]
    }
    // case: time is after last event of day
    return this.schedule[0]
  }
  unsetSpawn() {
    this.spawned = false
    this.location = null
    this.goodItem = null
    this.spawnTime = null
  }
}

export default WanderingMerchant
