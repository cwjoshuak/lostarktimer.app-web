import React, { useState, useEffect } from 'react'
import merchantSchedules from '../data/merchantSchedules.json'
import itemMapping from '../data/itemMapping.json'
import itemRarity from '../data/itemRarity.json'
import { DateTime, Interval, Zone } from 'luxon'
import Image from 'next/image'
import classNames from 'classnames'
import { generateTimestampStrings } from '../util/createTableData'
import WanderingMerchant from '../common/WanderingMerchant'
import useLocalStorage from '@olerichter00/use-localstorage'

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
  const [nextSpawnCountdown, setNextSpawnCountdown] = useState(
    merchant
      .nextSpawnTime(serverTime)
      .start.setZone(serverTime.zone)
      .diff(DateTime.now())
  )
  useEffect(() => {
    const timer = setInterval(() => {
      setNextSpawnCountdown(
        merchant
          .nextSpawnTime(serverTime)
          .start.setZone(serverTime.zone)
          .diff(DateTime.now())
      )
    }, 1000)
    return () => {
      clearInterval(timer)
    }
  })
  const [hideMerchantItems, setHideMerchantItems] = useLocalStorage(
    'hideMerchantItems',
    false
  )
  const [hidePotentialSpawns, sethidePotentialSpawns] = useLocalStorage(
    'hidePotentialMerchantLocationSpawns',
    false
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
  const merchantGoodItemToRarity = (goodItem: string | null): string => {
    if (goodItem) {
      let first = goodItem.split(' ')[0]
      switch (first) {
        case 'No':
          return 'text-[#6fc300]'
        case 'Seria':
        case 'Sian':
          return 'text-[#00b5ff]'
        case 'Madnick':
        case 'Mokamoka':
        case 'Kaysarr':
          return 'text-[#bf00fe]'
        case 'Wei':
        case 'Legendary':
          return 'text-[#f39303]'
        default:
          return ''
      }
    }
    return ''
  }
  const onClickOpenWindow = (imageUrl: string, title: string) => {
    window.open(
      `https://cdn.discordapp.com/attachments/${imageUrl}`,
      title,
      'left=20,top=20,width=1000,height=600,toolbar=0,resizable=1'
    )
    return false
  }
  const iconURL = (item: number) => {
    let iconName = itemMapping[String(item) as ItemMappingKey].fileName
    return `https://lostarkcodex.com/icons/${iconName}`
  }
  //class="dropdown m-2 flex basis-1/2 bg-stone-100 p-2 hover:cursor-pointer dark:bg-base-100 dark:hover:bg-base-100/70"
  return (
    <td
      key={`${merchant.name}`}
      className={classNames(
        'm-2 flex basis-1/2 flex-col whitespace-normal border-b-0  font-sans text-xs font-semibold shadow-md ',
        {
          'bg-stone-200/90 dark:bg-amber-200/10': merchant.spawned,

          'bg-stone-400 brightness-75 dark:bg-base-100':
            !merchant.spawned && !merchant.inProgress(serverTime),
          'bg-stone-300/80 dark:bg-base-100': !merchant.spawned,
        }
      )}
    >
      {/* <div className="flex h-full flex-row bg-stone-200 p-2 dark:bg-base-100"> */}
      <div className="flex flex-row px-4">
        <div className="flex grow flex-col uppercase">
          <span>
            <span
              className={classNames('block text-lg uppercase', {
                'text-green-700 dark:text-success':
                  merchant.inProgress(serverTime),
              })}
            >
              {merchant.name} ({merchant.continent}){' '}
              {merchant.inProgress(serverTime) ? (
                <span className="whitespace-nowrap text-xs text-amber-500 dark:text-amber-300">
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
              <div className="mb-1 text-base">
                <span className="uppercase">
                  Location:{' '}
                  <span
                    className={classNames({
                      'text-blue-500 hover:underline': merchant.spawned,
                    })}
                  >
                    {merchant.spawned ? (
                      <span
                        className="cursor-pointer"
                        onClick={() =>
                          onClickOpenWindow(imageUrl, merchant.location || '')
                        }
                      >{`${merchant.location}`}</span>
                    ) : (
                      'Unknown'
                    )}
                  </span>
                </span>
                <br />
                Item:{' '}
                <span
                  className={classNames({
                    [`${merchantGoodItemToRarity(merchant.goodItem)}`]:
                      merchant.spawned,
                  })}
                >
                  {merchant.goodItem ? merchant.goodItem : 'Unknown'}
                </span>
              </div>
            ) : null}
          </span>
          <span
            className={classNames('uppercase', {
              'text-base': merchant.spawned,
              'text-sm': !merchant.spawned,
            })}
          >
            Next Spawn:{'  '}
            {merchant
              .nextSpawnTime(serverTime)
              ?.start.toLocaleString(
                view24HrTime ? DateTime.TIME_24_SIMPLE : DateTime.TIME_SIMPLE
              )}
            <span
              className={classNames(
                'ml-6 whitespace-nowrap text-amber-600 dark:text-amber-300',
                {
                  hidden: merchant.inProgress(serverTime),
                }
              )}
            >
              -{nextSpawnCountdown.toFormat('hh:mm:ss')}
            </span>
          </span>
          <span className="block uppercase">{merchant.spawned}</span>{' '}
        </div>
        <div
          className={classNames('flex basis-1/4 flex-col text-center', {
            hidden: merchant.spawned || hidePotentialSpawns,
          })}
        >
          <span>Potential Spawns</span>
          {Object.entries(merchant.locationImages).map(
            ([locationName, imgUrl], idx, arr) => (
              <span key={`${merchant}-${imgUrl}`}>
                <span
                  className="cursor-pointer text-blue-500 hover:underline"
                  onClick={() => onClickOpenWindow(imgUrl, locationName)}
                >
                  {locationName}
                </span>
                {idx + 1 < arr.length ? <br /> : ''}
              </span>
            )
          )}
          <br />
        </div>
      </div>
      <div
        className={classNames(
          'space-between mt-2 flex w-full flex-col gap-6 self-end px-4 uppercase xl:flex-row',
          { hidden: hideMerchantItems }
        )}
      >
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
      {/* </div> */}
    </td>
  )
}

export default MerchantTableCell
