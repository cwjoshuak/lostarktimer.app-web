import type { NextPage } from 'next'
import Head from 'next/head'
import React, { useState, useRef, useEffect } from 'react'
import merchantSchedules from '../data/merchantSchedules.json'
import saintbotImage from '../public/images/saint-bot.png'
import { DateTime, Interval } from 'luxon'
import useLocalStorage from '@olerichter00/use-localstorage'
import regions from '../data/regions.json'
import merchantsData from '../data/merchants.json'
import { createTableData } from '../util/createTableData'
import WanderingMerchant from '../common/WanderingMerchant'
import io, { Socket } from 'socket.io-client'
import { MerchantAPIData, RegionKey, ServerKey } from '../util/types/types'
import Image from 'next/image'
import { RegionTimeZoneMapping } from '../util/static'
import { IconSettings } from '@tabler/icons'
import { MerchantConfigModal } from '../components'

interface Merchant {
  location: string
  item: string
  name: string
}

const Merchants: NextPage = (props) => {
  const { t } = useTranslation('merchants')
  const [regionTZName, setRegionTZName] = useLocalStorage<RegionKey>(
    'regionTZName',
    'US West'
  )
  const [selectedServer, setSelectedServer] = useLocalStorage<ServerKey>(
    'merchantServer',
    'Shandi'
  )
  const isMounted = useRef(false);
  const defaultTheme = () => {
    // Defaults to system theme if unconfigured
    return (localStorage.getItem('darkMode') || window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
  }
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('darkMode', defaultTheme)
  useEffect(()=> {
    //Prevents FoUC (Flash of Unstylized Content) by not refreshing on first mount
    if (!isMounted.current){ isMounted.current = true; return }

    //Toggle Daisy UI colors (e.g. bg-base-###)
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light') 
    
    //Toggle standard Tailwind colors (e.g. bg-sky-800)
    darkMode 
      ?  document.documentElement.classList.add("dark")
      :  document.documentElement.classList.remove("dark")
  }, [darkMode])

  const [currDate, setCurrDate] = useState<DateTime>(DateTime.now())
  const [regionTZ, setRegionTZ] = useLocalStorage<string>('regionTZ', 'UTC-7')

  const [serverTime, setServerTime] = useState<DateTime>(
    currDate.setZone(regionTZ)
  )
  const [viewLocalizedTime, setViewLocalizedTime] = useLocalStorage<boolean>(
    'viewLocalizedTime',
    true
  )
  const [view24HrTime, setView24HrTime] = useLocalStorage<boolean>(
    'view24HrTime',
    false
  )
  const [mSchedules, setMSchedules] = useState<{ [k: string]: Interval[] }>({})
  const [mActive, setMActive] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      let now = DateTime.now()
      setCurrDate(now)
      setServerTime(now.setZone(regionTZ))
    }, 1000)
    return () => {
      clearInterval(timer) // Return a function to clear the timer so that it will stop being called on unmount
    }
  }, [regionTZName, regionTZ])

  useEffect(() => {
    if (regionTZ) setServerTime(DateTime.now().setZone(regionTZ))
  }, [regionTZName, regionTZ])
  const [merchantAPIData, setMerchantAPIData] = useState<{
    [key: string]: MerchantAPIData
  }>({})
  const [socket, setSocket] = useState<Socket | null>(null)
  const [merchantTableData, setMerchantTableData] = useState<
    Array<JSX.Element>
  >([])

  const [wanderingMerchants, setWanderingMerchants] = useState<
    WanderingMerchant[]
  >([])
  const [apiData, setAPIData] = useState<{ [key: string]: MerchantAPIData }>({})
  const [dataLastRefreshed, setDataLastRefreshed] = useState(currDate)
  useEffect(() => {
    const newSocket = io(`wss://ws.lostarktimer.app`)

    if (process.env.NEXT_PUBLIC_VERCEL_ENV !== 'production') {
      newSocket.disconnect()
    }

    newSocket.on('merchants', (data) => {
      setAPIData(data)
    })

    setSocket(newSocket)
    return () => {
      newSocket.close()
    }
  }, [])

  useEffect(() => {
    setMerchantAPIData({ ...merchantAPIData, ...apiData })
    setDataLastRefreshed(DateTime.now())
  }, [apiData])

  useEffect(() => {
    if (regionTZName) {
      let servers = regions[regionTZName]
      if (!servers.includes(selectedServer || ''))
        setSelectedServer(servers[0] as ServerKey)
      let newMSchedules: { [key: string]: Interval[] } = {}
      Object.entries(merchantSchedules).forEach(([key, val]) => {
        newMSchedules[key] = val.map(({ h, m }) => {
          let start = DateTime.fromObject(
            { hour: h, minute: m },
            { zone: regionTZ }
          )
          return Interval.fromDateTimes(start, start.plus({ minutes: 25 }))
        })
        let dayPlusOne = DateTime.fromObject(
          { hour: val[0].h, minute: val[0].m },
          { zone: regionTZ }
        ).plus({ days: 1 })
        newMSchedules[key].push(
          Interval.fromDateTimes(dayPlusOne, dayPlusOne.plus({ minutes: 25 }))
        )
      })
      setMSchedules(newMSchedules)
      setWanderingMerchants(
        Object.values(merchantsData).map(
          (m) =>
            new WanderingMerchant(
              m.name,
              m.items,
              m.continent,
              m.schedule,
              m.locations as {},
              newMSchedules[String(m.schedule)]
            )
        )
      )
    }
  }, [regionTZName])
  useEffect(() => {
    if (socket?.connected && selectedServer) {
      socket.removeAllListeners()
      socket.emit('join', `${selectedServer.toLowerCase()}`)
      socket.on('merchants', (data) => {
        setAPIData(data)
      })
    }
  }, [socket?.connected, selectedServer])
  useEffect(() => {
    let data = Object.values(merchantAPIData).filter(
      (m) => m.server === selectedServer?.toLowerCase()
    )
    wanderingMerchants.forEach((wm) => {
      let fm = data.find((m) => wm.name === m.name)
      if (fm) wm.setSpawn(fm.location, fm.item, Number(fm._id))
      else wm.unsetSpawn()
    })

    wanderingMerchants.sort((a, b) => {
      let inProgA = a.inProgress(serverTime)
      let inProgB = b.inProgress(serverTime)

      if (inProgA && inProgB) return a.name.localeCompare(b.name)
      else if (inProgA) return -1
      else if (inProgB) return 1
      // return a.name.localeCompare(b.name)
      let aSpawn = a.nextSpawnTime(serverTime)?.start
      let bSpawn = b.nextSpawnTime(serverTime)?.start
      if (aSpawn && bSpawn) {
        if (aSpawn.hour == bSpawn.hour) return a.name.localeCompare(b.name)
        else return aSpawn.diff(bSpawn).toMillis()
      }
      return a.name.localeCompare(b.name)
    })

    setMerchantTableData(
      createTableData({
        events: wanderingMerchants,
        serverTime: serverTime,
        currDate: currDate,
        viewLocalizedTime: viewLocalizedTime || false,
        view24HrTime: view24HrTime || false,
        isGameEvent: false,
      })
    )
  }, [
    regionTZName,
    view24HrTime,
    viewLocalizedTime,
    selectedServer,
    wanderingMerchants,
    merchantAPIData,
    mSchedules,
    mActive
  ])
  useEffect(() => {
    // Changed to serverTime to prevent mActive from triggering early for time zones using 30 or 45 minute offsets
    if (serverTime.minute < 30 || serverTime.minute >= 55) {
      setMerchantAPIData({})
      setMActive(false)
    }
    else { setMActive(true) }
  }, [serverTime.minute])
  return (
    <>
      <Head>
        <title>Merchants - Lost Ark Timer</title>
      </Head>
      <MerchantConfigModal />
      <div className="flex min-h-screen flex-col items-center whitespace-normal bg-base-300 py-2 dark:bg-base-100">
        <div className="ml-auto flex w-full justify-end px-4 lg:px-20">
          <div className="hidden w-1/5 whitespace-normal text-center text-sm uppercase sm:inline lg:text-lg">
            <span
              dangerouslySetInnerHTML={{
                __html: t('server-note-text', {
                  timeType: viewLocalizedTime ? 'CURRENT TIME' : 'SERVER TIME',
                }),
              }}
            />
          </div>
          <label
            htmlFor="merchant-config-modal"
            className="btn btn-ghost ml-2 mr-auto cursor-pointer"
          >
            <IconSettings className="transition ease-in-out hover:-translate-y-px hover:rotate-45" />
          </label>

          <div className="mr-4 mb-2 w-40 flex-col">
            <select
              className="select select-bordered select-sm w-full"
              onChange={(e) => {
                let region = e.target.value as RegionKey
                setRegionTZName(region)
                setRegionTZ(RegionTimeZoneMapping[region])
              }}
              value={regionTZName}
            >
              {Object.keys(regions).map((reg) => {
                let region = reg.replace('-', ' ')
                return (
                  <option key={region} value={region}>
                    {region}
                  </option>
                )
              })}
            </select>
            {regionTZName && (
              <select
                className="select select-bordered select-sm w-full"
                onChange={(e) => setSelectedServer(e.target.value as ServerKey)}
                value={selectedServer}
              >
                {regions[regionTZName as RegionKey].map((server) => (
                  <option key={server} value={server}>
                    {server}
                  </option>
                ))}
              </select>
            )}
          </div>
          <table className="mb-2">
            <tbody>
              <tr
                className={classNames('text-left', {
                  'text-green-700 dark:text-success': viewLocalizedTime,
                })}
              >
                <td>{t('common:current-time')}:</td>
                <td className="text-right">
                  {currDate.toLocaleString(
                    view24HrTime
                      ? DateTime.TIME_24_WITH_SHORT_OFFSET
                      : DateTime.TIME_WITH_SHORT_OFFSET
                  )}
                </td>
              </tr>

              <tr
                className={classNames('text-left', {
                  'text-green-700 dark:text-success': !viewLocalizedTime,
                })}
              >
                <td>{t('common:server-time')}:</td>
                <td>
                  {serverTime.toLocaleString(
                    view24HrTime
                      ? DateTime.TIME_24_WITH_SHORT_OFFSET
                      : DateTime.TIME_WITH_SHORT_OFFSET
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mb-14 flex w-screen overflow-x-auto px-4 lg:px-20">
          <table className="table w-full">
            <thead>
              <tr className="relative justify-center text-center">
                <td colSpan={2} className="bg-stone-400 dark:bg-base-200">
                  <span>Wandering Merchants</span>
                  <a
                    href="https://discord.gg/HfXQpmpaD5"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline btn-warning btn-xs absolute right-48 top-4"
                  >
                    {t('vote')}
                  </a>
                  <a
                    href="https://saint-bot.webflow.io/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-4 top-2 flex items-center justify-center gap-2 text-indigo-500/90 hover:underline"
                  >
                    {t('data-by')} SaintBot{' '}
                    <Image
                      className="ml-2"
                      src={saintbotImage}
                      width={20}
                      height={20}
                    />
                  </a>
                  <div className="absolute right-5 top-7">
                    {t('last-updated')}:{' '}
                    {(viewLocalizedTime ? dataLastRefreshed : dataLastRefreshed.setZone(regionTZ)).toLocaleString(
                      view24HrTime
                        ? DateTime.TIME_24_WITH_SECONDS
                        : DateTime.TIME_WITH_SECONDS
                    )}
                  </div>
                </td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  className="flex flex-row justify-evenly border-b-0 bg-stone-400 px-8 py-0 text-center text-xs dark:bg-base-200"
                  colSpan={2}
                >
                  <div className="flex flex-col">
                    <span>Schedule 1</span>
                    <br />
                    <div className="flex flex-row">
                      <span className="w-24 whitespace-normal text-left">
                        <ul>
                          {mSchedules[1] !== undefined &&
                            mSchedules[1]
                              .slice(0, (mSchedules[1].length - 1) / 2)
                              .map((s) =>
                                s.start.setZone(
                                  viewLocalizedTime
                                    ? currDate.zone
                                    : serverTime.zone
                                )
                              )
                              .sort((a, b) => a.hour - b.hour)
                              .map((schedule) => (
                                <li
                                  className="mr-4 text-center"
                                  key={`merchant-schedule-1-${schedule.toISO()}`}
                                >
                                  {schedule
                                    .toLocaleString(DateTime.TIME_SIMPLE)
                                    .slice(0, -2)}
                                </li>
                              ))}
                        </ul>
                      </span>
                      <br />
                      <span className="text-left">
                        <ul>
                          <li>Lucas - {t('locations.Yudia')}</li>
                          <li>Morris - {t('locations.East Luterra')}</li>
                          <li>Mac - {t('locations.Anikka')}</li>
                          <li>Jeffrey - {t('locations.Shushire')}</li>
                          <li>Dorella - {t('locations.Feiton')}</li>
                        </ul>
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span>Schedule 2</span>
                    <br />
                    <div className="flex flex-row">
                      <span className="w-24 whitespace-normal text-left">
                        <ul>
                          {mSchedules[2] !== undefined &&
                            mSchedules[2]
                              .slice(0, (mSchedules[2].length - 1) / 2)
                              .map((s) =>
                                s.start.setZone(
                                  viewLocalizedTime
                                    ? currDate.zone
                                    : serverTime.zone
                                )
                              )
                              .sort((a, b) => a.hour - b.hour)
                              .map((schedule) => (
                                <li
                                  className="mr-4 text-center"
                                  key={`merchant-schedule-2-${schedule.toISO()}`}
                                >
                                  {schedule
                                    .toLocaleString(DateTime.TIME_SIMPLE)
                                    .slice(0, -2)}
                                </li>
                              ))}
                        </ul>
                      </span>
                      <span className="text-left">
                        <ul>
                          <li>Malone - {t('locations.West Luterra')}</li>
                          <li>Burt - {t('locations.East Luterra')}</li>
                          <li>Oliver - {t('locations.Tortoyk')}</li>
                          <li>Nox - {t('locations.Arthetine')}</li>
                          <li>Aricer - {t('locations.Rohendel')}</li>
                          <li>Rayni - {t('locations.Punika')}</li>
                        </ul>
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span>Schedule 3</span>
                    <br />
                    <div className="flex flex-row">
                      <span className="w-24 whitespace-normal text-left">
                        <ul>
                          {mSchedules[3] !== undefined &&
                            mSchedules[3]
                              .slice(0, (mSchedules[3].length - 1) / 2)
                              .map((s) =>
                                s.start.setZone(
                                  viewLocalizedTime
                                    ? currDate.zone
                                    : serverTime.zone
                                )
                              )
                              .sort((a, b) => a.hour - b.hour)
                              .map((schedule) => (
                                <li
                                  className="mr-4 text-center"
                                  key={`merchant-schedule-3-${schedule.toISO()}`}
                                >
                                  {schedule
                                    .toLocaleString(DateTime.TIME_SIMPLE)
                                    .slice(0, -2)}
                                </li>
                              ))}
                        </ul>
                      </span>
                      <span className="text-left">
                        <ul>
                          <li>Ben - {t('locations.Rethramis')}</li>
                          <li>Evan - {t('locations.South Vern')}</li>
                          <li>Peter - {t('locations.North Vern')}</li>
                          <li>Laitir - {t('locations.Yorn')}</li>
                        </ul>
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
              <tr className="flex flex-row">
                <td className="w-full bg-stone-400 dark:bg-base-200">
                  <table className="w-full">
                    <thead>
                      <tr></tr>
                    </thead>
                    <tbody>{merchantTableData}</tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import classNames from 'classnames'

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        'merchants',
        'common',
        'merchantConfig',
      ])),
      // Will be passed to the page component as props
    },
  }
}

export default Merchants
