import Server from './Server'

class Region {
  name: String
  servers: Server[]

  constructor(name: String, servers: Server[]) {
    this.name = name
    this.servers = servers
  }
}

export default Region
