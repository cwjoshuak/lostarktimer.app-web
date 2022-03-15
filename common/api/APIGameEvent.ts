class APIGameEvent {
  id: string
  name: string
  iconUrl: string
  minItemLevel: number
  constructor(id: string, name: string, iconUrl: string, minItemLevel: number) {
    this.id = id
    this.name = name
    this.iconUrl = iconUrl
    this.minItemLevel = minItemLevel
  }
}

export default APIGameEvent
