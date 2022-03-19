import { Interval } from 'luxon'
import Item from './Item'

class WanderingMerchant {
  name: String
  continent: String | null = null
  zone: String | null = null
  items: Item[]
  goodItem: Item | null = null
  spawnTime: number | null = null
  expectedSpawnTime: Interval

  constructor(name: String, items: Item[], expectedSpawnTime: Interval) {
    this.name = name
    this.items = items
    this.expectedSpawnTime = expectedSpawnTime
  }

  setSpawn(
    continent: String | null,
    zone: String | null,
    goodItem: Item | null,
    spawnTime: number | null
  ) {
    this.continent = continent
    this.zone = zone
    this.goodItem = goodItem
    this.spawnTime = spawnTime
  }
}

export default WanderingMerchant
