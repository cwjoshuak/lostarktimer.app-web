import WanderingMerchant from './WanderingMerchant'

class Server {
  name: String
  merchants: WanderingMerchant[]
  constructor(name: String, merchants: WanderingMerchant[]) {
    this.name = name
    this.merchants = merchants
  }
}

export default Server
