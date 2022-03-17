import type { GetServerSideProps, NextPage } from 'next'
import Head from 'next/head'
import Script from 'next/script'
import React, { useState, useEffect, useRef, ReactElement } from 'react'
import { APIGameEvent, APIEventType } from '../common/api'
import { GameEvent } from '../common'
import {
  ChangeLogModal,
  GameEventTableCell,
  GitHubModal,
  SideBar,
} from '../components'
import { DateTime, Duration, Interval } from 'luxon'
import useLocalStorage from '@olerichter00/use-localstorage'
import 'core-js/features/array/at'

var classNames = require('classnames')

type eventType = string
type eventName = string
type iconUrl = string
type iLvlInt = number
type month = string
type day = string
type iLvl = string
type eventId = string
type time = string

type EventIdMapping = [
  id: eventId,
  mapping: [name: eventName, icon: iconUrl, iLvl: iLvlInt]
]
type EventTypeIconMapping = [eventType: string, eventIconUrl: string]

const eventIDNameMapping: Array<APIGameEvent> = Object.entries(
  require('../data/events.json')
).map((e) => {
  const [id, [name, url, iLvl]] = e as EventIdMapping
  return new APIGameEvent(id, name, url, iLvl)
})
const eventTypeIconMapping: Array<APIEventType> =
  require('../data/msgs.json')[0].map(
    (e: EventTypeIconMapping, idx: number) => {
      const [name, url] = e
      return new APIEventType(idx, name, url)
    }
  )

type HomeProps = {
  isDown: boolean
  endTime: string
}
const Home: NextPage = (props) => {
  // const { isDown, endTime } = props as HomeProps

  const [currDate, setCurrDate] = useState<DateTime>(DateTime.now())
  const [regionTZ, setRegionTZ] = useLocalStorage<string>('regionTZ', 'UTC-7')
  const [serverTime, setServerTime] = useState<DateTime>(
    currDate.setZone(regionTZ)
  )
  const [selectedDate, setSelectedDate] = useState(serverTime)
  const [gameEvents, setGameEvents] = useState<Array<GameEvent> | undefined>(
    undefined
  )
  const [todayEvents, setTodayEvents] = useState<Array<GameEvent> | undefined>(
    undefined
  )
  const [fullEventsTable, setFullEventsTable] = useState<JSX.Element>()
  const [currentEventsTable, setCurrentEventsTable] = useState<
    Array<JSX.Element>
  >([])
  const [selectedEventType, setSelectedEventType] = useState(-1)
  const [viewLocalizedTime, setViewLocalizedTime] = useLocalStorage<boolean>(
    'viewLocalizedTime',
    true
  )
  const [view24HrTime, setView24HrTime] = useLocalStorage<boolean>(
    'view24HrTime',
    false
  )
  const [notifyInMins, setNotifyInMins] = useLocalStorage<number>(
    'notifyInMins',
    15
  )

  const buttons = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ]
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let pls = localStorage.getItem('purgedLocalStorage')
      if (!pls) {
        localStorage.clear()
        localStorage.setItem(
          'purgedLocalStorage',
          String(DateTime.now().toMillis())
        )
      }

      let rTZ = localStorage.getItem('regionTZ')
      if (!rTZ) setRegionTZ('UTC-7')

      let v24T = localStorage.getItem('view24HrTime')
      if (!v24T) setView24HrTime(Boolean(v24T))

      let vLT = localStorage.getItem('viewLocalizedTime')
      if (!vLT) setViewLocalizedTime(true)

      let nim = localStorage.getItem('notifyInMins')
      if (!nim) setNotifyInMins(15)
    }
  }, [])
  useEffect(() => {
    const timer = setInterval(() => {
      let now = DateTime.now()
      setCurrDate(now)
      setServerTime(now.setZone(regionTZ))
    }, 1000)
    return () => {
      clearInterval(timer) // Return a funtion to clear the timer so that it will stop being called on unmount
    }
  }, [regionTZ, view24HrTime, viewLocalizedTime])
  useEffect(() => {
    setServerTime(DateTime.now().setZone(regionTZ))
    let gameEvents: Array<GameEvent> = []

    Object.entries(require('../data/data.json')).forEach((eventType) => {
      const [type, monthDayMap] = eventType as [string, any]
      let et = eventTypeIconMapping.find((et) => et.id.toString() === type)!
      for (const [month, days] of Object.entries(monthDayMap) as [
        string,
        any
      ]) {
        for (const [day, events] of Object.entries(days) as [string, any]) {
          for (const [iLvl, event] of Object.entries(events) as [string, any]) {
            for (const [eventId, eventTime] of Object.entries(event) as [
              string,
              any
            ]) {
              let gt = eventIDNameMapping.find((gt) => gt.id === eventId)!

              let gameEvent = new GameEvent(et, gt)
              eventTime.forEach((time: string, idx: number) => {
                const [startTime, endTime] = time.split('-')
                const [startHr, startMin] = startTime.split(':')
                const [endHr, endMin] = endTime?.split(':') ?? ['', '']
                let start = DateTime.fromObject(
                  {
                    day: Number(day),
                    hour: Number(startHr),
                    minute: Number(startMin),
                  },
                  { zone: regionTZ }
                )
                let id = Number(gt.id)
                if (
                  (7000 <= id && id < 8000 && id != 7013) ||
                  [
                    1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 5002,
                    5003, 5004, 6007, 6008, 6009, 6010, 6011,
                  ].includes(id)
                ) {
                  start = start.plus({ minutes: 10 })
                }
                let end = DateTime.fromObject(
                  {
                    day: Number(start.day > day ? start.day : day),
                    hour: Number(endHr != '' ? endHr : start.hour),
                    minute: Number(endMin != '' ? endMin : start.minute),
                  },
                  { zone: regionTZ }
                )

                gameEvent.addTime(Interval.fromDateTimes(start, end))
              })
              gameEvents.push(gameEvent)
            }
          }
        }
      }
    })

    const todayEvents = gameEvents.filter(
      (ge) =>
        ge.times.find((t) => {
          return t.start && t.start.day === selectedDate.day
        }) !== undefined &&
        ge.times.length &&
        ge.times.at(0)?.start.day === selectedDate.day &&
        (ge.times.at(-1)?.start.day === selectedDate.plus({ days: 1 }).day ||
          ge.times.at(-1)?.start.day === selectedDate.day)
    )

    setGameEvents(gameEvents)
    setTodayEvents(todayEvents)
  }, [regionTZ, selectedDate, viewLocalizedTime, view24HrTime])
  useEffect(() => {
    generateFullEventsTable(-1)
  }, [todayEvents])
  useEffect(() => {
    generateFullEventsTable(selectedEventType)
    generateCurrentEventsTable()
  }, [serverTime.minute, notifyInMins])
  const buttonClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    id: number
  ) => {
    buttons.forEach((b) =>
      (b.current as unknown as Element).classList.remove('btn-active')
    )
    let button = event.target as Element
    button.classList.add('btn-active')
    setSelectedEventType(id)
    generateFullEventsTable(id)
  }
  const generateCurrentEventsTable = () => {
    let events: Array<GameEvent> = []
    let ms = Duration.fromObject({ minutes: notifyInMins }).toMillis()
    events =
      todayEvents
        ?.filter((e) => {
          let latest = e.latest(serverTime)
          if (latest) {
            let value = latest.start.diff(serverTime).valueOf()
            return 0 <= value && value <= ms
          }
          return false
        })
        .sort(
          (a, b) =>
            a.latest(serverTime).start.valueOf() -
            b.latest(serverTime).start.valueOf()
        ) ?? []

    let arr: React.ReactElement[] = []
    for (let i = 0; i < events.length; i += 2) {
      let children: ReactElement[] = []
      for (
        let j = 0;
        i + j < (i + 2 < events.length ? i + 2 : events.length);
        j++
      ) {
        let evt = events[i + j]
        children.push(
          <GameEventTableCell
            key={evt.uuid}
            gameEvent={evt}
            serverTime={serverTime}
            localizedTZ={viewLocalizedTime ? currDate.zone : serverTime.zone}
            view24HrTime={view24HrTime}
          />
        )
      }
      if (children.length == 1) {
        children.push(
          <td
            key={-1}
            className="invisible m-2 flex basis-1/2 items-center space-x-4 p-2"
          ></td>
        )
      }
      arr.push(
        <tr key={i} className="flex flex-row">
          {children}
        </tr>
      )
    }
    setCurrentEventsTable(arr)
  }
  const generateFullEventsTable = (eventType: number) => {
    let events: Array<GameEvent> = []
    let ms = Duration.fromObject({ minutes: notifyInMins }).toMillis()
    events =
      todayEvents
        ?.filter((e) => {
          let correctEventType =
            eventType === -1 || e.eventType.id === eventType
          if (e.latest(serverTime)) {
            return (
              correctEventType &&
              e.latest(serverTime).start.diff(serverTime).valueOf() >= ms
            )
          }
          return correctEventType
        })
        .sort((a, b) => {
          let finalCmp = 0
          let aTime = a.latest(serverTime)
          let bTime = b.latest(serverTime)
          if (aTime && bTime) {
            let aTime = a.latest(serverTime).start.diff(serverTime).valueOf()
            let bTime = b.latest(serverTime).start.diff(serverTime).valueOf()

            if (aTime < bTime) {
              finalCmp = -1
            } else if (aTime - bTime < 1000) {
              finalCmp = a.gameEvent.minItemLevel - b.gameEvent.minItemLevel
            } else {
              finalCmp = 1
            }
          } else if (aTime) {
            finalCmp = -1
          } else if (bTime) {
            finalCmp = 1
          } else {
            finalCmp = a.gameEvent.minItemLevel - b.gameEvent.minItemLevel
          }
          return finalCmp
        }) ?? []

    let arr: React.ReactElement[] = []
    for (let i = 0; i < events.length; i += 2) {
      let children: ReactElement[] = []
      for (
        let j = 0;
        i + j < (i + 2 < events.length ? i + 2 : events.length);
        j++
      ) {
        let evt = events[i + j]
        children.push(
          <GameEventTableCell
            key={evt.uuid}
            gameEvent={evt}
            serverTime={serverTime}
            localizedTZ={viewLocalizedTime ? currDate.zone : serverTime.zone}
            view24HrTime={view24HrTime}
          />
        )
      }
      if (children.length == 1) {
        children.push(
          <td className="invisible m-2 flex basis-1/2 items-center space-x-4 p-2"></td>
        )
      }
      arr.push(
        <tr key={`${serverTime} ${i}`} className="flex flex-row">
          {children}
        </tr>
      )
    }

    setFullEventsTable(<>{arr}</>)
    generateCurrentEventsTable()
  }
  const eventsInSection = (eventId: number) => {
    if (eventId === -1)
      return todayEvents?.filter((te) => te.eventType.id >= 0).length
    else return todayEvents?.filter((te) => te.eventType.id === eventId).length
  }
  return (
    <>
      <Head>
        <title>Lost Ark Timer</title>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=0.35"
        ></meta>
      </Head>
      {/* {isDown && (
        <div className="relative bg-red-700/80 py-2 text-center lg:px-4">
          <div
            className="flex items-center bg-red-900/50 p-2 leading-none text-sky-100 lg:inline-flex lg:rounded-full"
            role="alert"
          >
            <a href="https://www.playlostark.com/en-us/support/server-status">
              <span className="sm:text-md mx-4 flex-auto text-center text-sm font-semibold">
                🛠️ Lost Ark Server Maintenance. Estimated Downtime:{' '}
                {DateTime.fromMillis(Number(endTime))
                  .diffNow()
                  .toFormat('hh:mm:ss')}
              </span>
            </a>
          </div>
        </div>
      )} */}
      <div className="relative bg-sky-800 py-2 text-center lg:px-4">
        <div
          className="flex items-center bg-sky-900/50 p-2 leading-none text-sky-100 lg:inline-flex lg:rounded-full"
          role="alert"
        >
          <span className="sm:text-md mx-4 flex-auto text-center text-sm font-semibold">
            ❗ Please ensure you re-select your region to reset the timezone to
            the new one post patch. ❗ <br /> Server hours are currently 1 hour
            ahead of real world time (with DST).
          </span>
        </div>
      </div>
      <ChangeLogModal />
      <GitHubModal />

      <div className="navbar mt-4 w-full bg-base-300 px-4 dark:bg-base-100 lg:px-20">
        <div className="navbar-start">
          <div className="flex items-center gap-2 ">
            <button
              className="btn border-none text-center text-xl text-stone-400 dark:bg-base-200"
              onClick={(e) => {
                let newDate = selectedDate.minus({ days: 1 })
                if (
                  gameEvents?.filter(
                    (ge) =>
                      ge.times.find(
                        (t) =>
                          t.start.day === newDate.day &&
                          t.start.month === newDate.month
                      ) !== undefined
                  ).length
                )
                  setSelectedDate(newDate)
              }}
            >
              {'<<'}
            </button>
            <button
              className="btn text-2xl text-stone-200"
              onClick={(e) => setSelectedDate(serverTime)}
            >
              <span>
                {selectedDate.monthLong} {selectedDate.day}
              </span>
            </button>
            <button
              className="btn border-none text-center text-xl text-stone-400 dark:bg-base-200"
              onClick={(e) => {
                let newDate = selectedDate.plus({ days: 1 })
                if (
                  gameEvents?.filter(
                    (ge) =>
                      ge.times.find(
                        (t) =>
                          t.start.day === newDate.day &&
                          t.start.month === newDate.month
                      ) !== undefined
                  ).length
                )
                  setSelectedDate(newDate)
              }}
            >
              {'>>'}
            </button>
          </div>
        </div>

        <a className="btn navbar-center btn-ghost text-xl normal-case">
          Lost Ark Timer
        </a>
        <div className="navbar-end text-right">
          <table>
            <tbody>
              <tr>
                <td>
                  <div>
                    <label className="label mr-2 cursor-pointer">
                      <span className="label-text w-4/5 text-right font-bold">
                        View in 24HR
                      </span>
                      <input
                        type="checkbox"
                        onClick={(e) =>
                          setView24HrTime(
                            (e.target as HTMLInputElement).checked
                          )
                        }
                        defaultChecked={view24HrTime}
                        className="checkbox checkbox-sm"
                      />
                    </label>
                    <label className="label mr-2 cursor-pointer">
                      <span className="label-text w-4/5 text-right font-bold">
                        View in Current Time
                      </span>
                      <input
                        type="checkbox"
                        onClick={(e) =>
                          setViewLocalizedTime(
                            (e.target as HTMLInputElement).checked
                          )
                        }
                        defaultChecked={viewLocalizedTime}
                        className="checkbox checkbox-sm"
                      />
                    </label>
                  </div>
                </td>

                <td
                  className={classNames('text-left', {
                    'text-green-700 dark:text-success': viewLocalizedTime,
                  })}
                >
                  Current Time:
                </td>
                <td
                  className={classNames({
                    'text-green-700 dark:text-success': viewLocalizedTime,
                  })}
                >
                  {currDate.toLocaleString(
                    view24HrTime
                      ? DateTime.TIME_24_WITH_SHORT_OFFSET
                      : DateTime.TIME_WITH_SHORT_OFFSET
                  )}
                </td>
              </tr>

              <tr>
                <td>
                  <select
                    className="focus-visible: select mr-2 max-w-fit bg-base-200 outline-none"
                    onChange={(e) => setRegionTZ(e.target.value)}
                    value={regionTZ}
                  >
                    <option value="UTC-7">US West (UTC-7)</option>
                    <option value="UTC-4">US East (UTC-4)</option>
                    <option value="UTC+1">EU Central (UTC+1)</option>
                    <option value="UTC+0">EU West (UTC+0)</option>
                    <option value="UTC-3">South America (UTC-5)</option>
                  </select>
                </td>
                <td
                  className={classNames('text-left', {
                    'text-green-700 dark:text-success': !viewLocalizedTime,
                  })}
                >
                  Server Clock:
                </td>
                <td
                  className={classNames({
                    'text-green-700 dark:text-success': !viewLocalizedTime,
                  })}
                >
                  {serverTime
                    .plus({ hours: 1 })
                    .toLocaleString(
                      view24HrTime
                        ? DateTime.TIME_24_WITH_SHORT_OFFSET
                        : DateTime.TIME_WITH_SHORT_OFFSET
                    )}
                </td>
              </tr>
            </tbody>
          </table>

          <br />
        </div>
      </div>

      <div className="relative flex min-h-screen flex-col items-center bg-base-300 py-2 dark:bg-base-100">
        <SideBar />
        <main className="mb-14 h-full w-full px-4 lg:px-20">
          <table className="table w-full">
            <thead>
              <tr className="justify-center">
                <td
                  colSpan={2}
                  className="relative bg-stone-200 text-center dark:bg-base-200"
                >
                  Alarms
                  <select
                    className="select select-sm absolute right-6"
                    onChange={(e) => setNotifyInMins(Number(e.target.value))}
                    value={notifyInMins}
                  >
                    <option value={5}>5 min before</option>
                    <option value={10}>10 min before</option>
                    <option value={15}>15 min before</option>
                    <option value={20}>20 min before</option>
                    <option value={30}>30 min before</option>
                  </select>
                </td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border-stone-200 bg-stone-200 dark:border-base-200 dark:bg-base-200"></td>
              </tr>
              <tr className="flex">
                <td className="w-1/4 min-w-fit bg-stone-200 dark:bg-base-200">
                  <table className="table w-full ">
                    <thead></thead>
                    <tbody>
                      <tr>
                        <td className="p-0">
                          <button
                            className="btn btn-active btn-wide relative w-full justify-start pl-16"
                            onClick={(event) => {
                              buttonClick(event, -1)
                            }}
                            ref={buttons[0]}
                          >
                            <img
                              // src="https://lostarkcodex.com/images/icon_calendar_event_0.webp"
                              className="absolute left-4"
                            />
                            <span className="">All</span>
                            <div className="absolute right-8">
                              {eventsInSection(-1)}
                            </div>
                          </button>
                        </td>
                      </tr>
                      {eventTypeIconMapping.map((e: APIEventType, idx) => (
                        <tr key={idx}>
                          <td className="p-0">
                            <button
                              key={e.id}
                              className="btn btn-wide relative w-full justify-start pl-16 pr-16"
                              onClick={(event) => {
                                buttonClick(event, e.id)
                              }}
                              ref={buttons[e.id + 1]}
                            >
                              <img
                                src={`https://lostarkcodex.com/images/${e.iconUrl}`}
                                className="absolute left-4"
                              />
                              {e.name}
                              <div className="absolute right-8">
                                {eventsInSection(e.id)}
                              </div>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
                <td className="top-0 w-full overflow-y-auto bg-stone-200 dark:bg-base-200">
                  {currentEventsTable.length > 0 ? (
                    <table className="table w-full ">
                      <tbody className="block ring-2 ring-orange-300">
                        {currentEventsTable}
                      </tbody>
                    </table>
                  ) : null}
                  <table className="table w-full">
                    <tbody>{fullEventsTable}</tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </main>
        <footer className="absolute bottom-0 flex h-12 w-full items-center justify-center border-t bg-base-300">
          Thanks for visiting!
        </footer>
      </div>

      {process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? (
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "a4240e015e2044669726099a04d1e7a7"}'
          strategy="afterInteractive"
          onError={(e) => {
            console.error('Script failed to load', e)
          }}
        />
      ) : null}
    </>
  )
}
// export const getServerSideProps: GetServerSideProps = async (context) => {
//   const res = await fetch(
//     `${
//       process.env.NEXT_PUBLIC_VERCEL_ENV
//         ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
//         : 'http://localhost:3000'
//     }/api/server-maintenance`
//   )
//   const data = await res.json()
//   return { props: data }
// }
export default Home
