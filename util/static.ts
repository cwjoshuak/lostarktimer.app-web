import { RegionKey } from './types/types'
import { DateTime } from 'luxon'

/* IANA Codes relative to approximate AWS server locations, as per http://ec2-reachability.amazonaws.com/
  NA East: America/New_York (Herndon, VA, US)
  NA West: America/Los_Angeles (San Francisco, CA, US)
  EU West: Europe/Dublin (Dublin, Ireland)
  EU Central: Europe/Berlin (Frankfurt, Germany)
  South America: America/Sao_Paulo (São Paulo, Brazil)
*/

function DSTOffset(IANAString: string): string {
  const offset = DateTime.now().setZone(IANAString).get('offset') / 60 || 0
  return (`UTC${offset >= 0 ? "+" + offset : offset}`) // UTC+offset, UTC-offset
}

export const RegionTimeZoneMapping: { [K in RegionKey]: string } = {
  'US West': DSTOffset('America/Los_Angeles'),
  'US East': DSTOffset('America/New_York'),
  'EU Central': DSTOffset('Europe/Berlin'),
  'EU West': DSTOffset('Europe/Dublin'),
  'South America': DSTOffset('America/Sao_Paulo'),
}
