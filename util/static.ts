import { RegionKey } from './types/types'

export const RegionTimeZoneMapping: { [K in RegionKey]: string } = {
  'US West': 'UTC-7',
  'US East': 'UTC-4',
  'EU Central': 'UTC+1',
  'EU West': 'UTC-0',
  'South America': 'UTC-4',
}
