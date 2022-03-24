import React from 'react'
import merchantSchedules from '../data/merchantSchedules.json'
import itemMapping from '../data/itemMapping.json'
import itemRarity from '../data/itemRarity.json'
import { DateTime, Interval, Zone } from 'luxon'
import Image from 'next/image'
import classNames from 'classnames'
import { generateTimestampStrings } from '../util/createTableData'
import WanderingMerchant from '../common/WanderingMerchant'

type ItemMappingKey = keyof typeof itemMapping

interface CellProps {
  merchant: WanderingMerchant
  serverTime: DateTime
  localizedTZ: Zone
  view24HrTime: boolean
}
let mSchedules: { [key: number]: Interval[] } = {}

const MerchantTableCell = (props: CellProps): React.ReactElement => {
  const { merchant, serverTime, localizedTZ, view24HrTime } = props
  Object.entries(merchantSchedules).forEach(
    ([key, schedule]) =>
      (mSchedules[Number(key)] = schedule.map(({ h, m }) => {
        let start = DateTime.fromObject(
          { hour: h, minute: m }
          // { zone: serverZone }
        )
        return Interval.fromDateTimes(start, start.plus({ minutes: 25 }))
      }))
  )
  let imageUrl = ''
  if (merchant.location) {
    imageUrl =
      merchant.locationImages[
        Object.keys(merchant.locationImages).find(
          (k) => k.toLowerCase() === merchant.location?.toLowerCase()
        ) || ''
      ]
  }
  const gradientColor = (id: 0 | 1 | 2 | 3) => {
    if (id === 0) return 'bg-gradient-to-br from-[#1e2f08] to-[#4c8204]'
    if (id === 1) return 'bg-gradient-to-br from-[#082c3b] to-[#0479a9]'
    if (id === 2) return 'bg-gradient-to-br from-[#2e083b] to-[#8004a9]'
    if (id === 3) return 'bg-gradient-to-br from-[#392509] to-[#a16305]'
  }
  const textColor = (id: 0 | 1 | 2 | 3) => {
    if (id === 0) return 'text-[#6fc300]'
    if (id === 1) return 'text-[#00b5ff]'
    if (id === 2) return 'text-[#bf00fe]'
    if (id === 3) return 'text-[#f39303]'
  }
  const rarity = (id: number): 0 | 1 | 2 | 3 => {
    let ir = itemRarity as { [key: string]: 0 | 1 | 2 | 3 }
    return ir[String(id)]
  }
  const iconURL = (item: number) => {
    let iconName = itemMapping[String(item) as ItemMappingKey].fileName
    return `https://lostarkcodex.com/icons/${iconName}`
  }
  //class="dropdown m-2 flex basis-1/2 bg-stone-100 p-2 hover:cursor-pointer dark:bg-base-100 dark:hover:bg-base-100/70"
  return (
    <td
      key={`${merchant.name}`}
      className="m-2 flex basis-1/2 flex-col whitespace-normal border-b-0 bg-stone-200 dark:bg-base-100"
    >
      <div className="flex h-full flex-col bg-stone-200 p-2 dark:bg-base-100">
        <div className="basis-11/12 items-center font-sans text-xs font-semibold">
          <div className="ml-2 mr-4 uppercase">
            <span
            // className={}
            >
              <span
                className={classNames('block text-lg uppercase', {
                  'text-green-700 dark:text-success':
                    merchant.inProgress(serverTime),
                })}
              >
                {merchant.name} ({merchant.continent}){' '}
                {merchant.inProgress(serverTime) ? (
                  <span className="text-xs text-amber-500 dark:text-amber-300">
                    {' '}
                    {serverTime
                      .set({
                        minute: 30,
                      })
                      .toLocaleString(DateTime.TIME_SIMPLE)}{' '}
                    -{' '}
                    {serverTime
                      .set({ minute: 55 })
                      .toLocaleString(DateTime.TIME_SIMPLE)}
                  </span>
                ) : null}
              </span>
              {merchant.inProgress(serverTime) ? (
                <div className="mb-1">
                  <span className="uppercase">
                    Location:{' '}
                    <span
                      className={classNames({
                        'text-blue-500 hover:underline': merchant.spawned,
                      })}
                    >
                      {merchant.spawned ? (
                        <a
                          href={`/images/merchantLocations/${imageUrl}`}
                        >{`${merchant.location}`}</a>
                      ) : (
                        'Unknown'
                      )}
                    </span>
                  </span>
                  <br />
                  Item:{' '}
                  <span
                    className={classNames({
                      'text-green-700 dark:text-success': merchant.spawned,
                    })}
                  >
                    {merchant.goodItem ? merchant.goodItem : 'Unknown'}
                  </span>
                </div>
              ) : null}
            </span>
            <span className=" text-xs uppercase">
              Next Spawn:{'  '}
              {merchant
                .nextSpawnTime(serverTime)
                ?.start.toLocaleString(
                  view24HrTime ? DateTime.TIME_24_SIMPLE : DateTime.TIME_SIMPLE
                )}
            </span>
            <span className="block uppercase">{merchant.spawned}</span>{' '}
            <div className="space-between mt-4 flex flex-col gap-6 self-end uppercase xl:flex-row xl:flex-wrap">
              {[
                { title: 'Rapport', items: merchant.items.rapport },
                { title: 'Cards', items: merchant.items.cards },
                { title: 'Cooking', items: merchant.items.cooking },
              ].map(({ title, items }, idx) => {
                return items.length ? (
                  <div
                    key={`${merchant.name}-${title}`}
                    className={classNames({
                      'basis-1/3': idx % 2 == 0,
                      'basis-1/4': idx % 2 != 0,
                    })}
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold">{title}</span>
                      {items.map((item) => (
                        <div
                          key={`${merchant.name}-${title}-${item}`}
                          className={classNames(
                            'flex flex-row text-sm',
                            textColor(rarity(item))
                          )}
                        >
                          <Image
                            src={iconURL(item)}
                            className={gradientColor(rarity(item))}
                            width={20}
                            height={20}
                            layout="fixed"
                          />
                          <span className="ml-2 break-words capitalize">
                            {itemMapping[String(item) as ItemMappingKey].name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null
              })}
            </div>
          </div>
        </div>
      </div>
    </td>
  )
}

export default MerchantTableCell
