import { Interval } from 'luxon'
import regions from '../../data/regions.json'
export interface MerchantData {
  name: string
  continent: string
  schedule: number
  items: { rapport: number[]; cards: number[]; cooking: number[] }
  uuid: string
  times: Interval[]
}

export interface MerchantAPIData {
  _id: string
  region: string
  server: string
  location: string
  item: string
  name: string
}

export type RegionKey =
  | keyof typeof regions
  | 'US West'
  | 'US East'
  | 'EU West'
  | 'EU Central'
  | 'South America'

export type ServerKey =
  | 'Mari'
  | 'Valtan'
  | 'Enviska'
  | 'Akkan'
  | 'Bergstrom'
  | 'Shandi'
  | 'Rohendel'
  | 'Azena'
  | 'Una'
  | 'Regulus'
  | 'Avesta'
  | 'Galatur'
  | 'Karta'
  | 'Ladon'
  | 'Kharmine'
  | 'Elzowin'
  | 'Sasha'
  | 'Adrinne'
  | 'Aldebaran'
  | 'Zosma'
  | 'Vykas'
  | 'Danube'
  | 'Neria'
  | 'Kadan'
  | 'Trixion'
  | 'Calvasus'
  | 'Thirain'
  | 'Zinnervale'
  | 'Asta'
  | 'Wei'
  | 'Slen'
  | 'Sceptrum'
  | 'Procyon'
  | 'Beatrice'
  | 'Inanna'
  | 'Thaemine'
  | 'Sirius'
  | 'Antares'
  | 'Brelshaza'
  | 'Nineveh'
  | 'Mokoko'
  | 'Rethramis'
  | 'Tortoyk'
  | 'Moonkeep'
  | 'Stonehearth'
  | 'Shadespire'
  | 'Tragon'
  | 'Petrania'
  | 'Punika'
  | 'Kazeros'
  | 'Agaton'
  | 'Gienah'
  | 'Arcturus'
  | 'Yorn'
  | 'Feiton'
  | 'Vern'
  | 'Kurzan'
  | 'Prideholme'
