import type { NextPage } from 'next'
import Head from 'next/head'
import React, { useState, useEffect, useRef } from 'react'
import { APIGameEvent, APIEventType } from '../common/api'
import { GameEvent } from '../common'
import { AlarmConfigModal } from '../components'
import { DateTime, Duration, Interval } from 'luxon'
import useLocalStorage from '@olerichter00/use-localstorage'
import { Howl, Howler } from 'howler'
import { alert1, alert2, alert3, alert4, alert5, alert6 } from '../sounds'
import 'core-js/features/array/at'
import { IconSettings } from '@tabler/icons'
import usePrevious from '../util/usePrevious'
import { createTableData } from '../util/createTableData'
import { RegionKey } from '../util/types/types'
import { RegionTimeZoneMapping } from '../util/static'

var classNames = require('classnames')

type AlertSoundKeys =
  | 'Alert 1'
  | 'Alert 2'
  | 'Alert 3'
  | 'Alert 4'
  | 'Alert 5'
  | 'Alert 6'
type eventName = string
type iconUrl = string
type iLvlInt = number
type eventId = string

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
const allEventData = require('../data/data.json')
const sounds = {
  'Alert 1': alert1,
  'Alert 2': alert2,
  'Alert 3': alert3,
  'Alert 4': alert4,
  'Alert 5': alert5,
  'Alert 6': alert6,
}

const Alarms: NextPage = () => {
  const [currDate, setCurrDate] = useState<DateTime>(DateTime.now())
  const [regionTZ, setRegionTZ] = useLocalStorage<string>(
    'regionTZ',
    RegionTimeZoneMapping['US West']
  )
  const [regionTZName, setRegionTZName] = useLocalStorage<RegionKey>(
    'regionTZName',
    'US West'
  )
  const [serverTime, setServerTime] = useState<DateTime>(
    currDate.setZone(regionTZ)
  )
  const [selectedDate, setSelectedDate] = useState(currDate.setZone(regionTZ))

  const [gameEvents, setGameEvents] = useState<Array<GameEvent> | undefined>(
    undefined
  )
  const [todayEvents, setTodayEvents] = useState<Array<GameEvent>>([])
  const [fullEventsTable, setFullEventsTable] = useState<Array<JSX.Element>>([])
  const [currentEventsTable, setCurrentEventsTable] = useState<
    Array<JSX.Element>
  >([])

  const [currentEventsIds, setCurrentEventsIds] = useState<Array<number>>([])
  const previousEventIds = usePrevious(currentEventsIds)

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
  const [alertSound, setAlertSound] = useLocalStorage<string>(
    'alertSound',
    'muted'
  )
  const [disabledAlarms, setDisabledAlarms] = useLocalStorage<{
    [key: string]: number
  }>('disabledAlarms', {})
  const [hideGrandPrix, setHideGrandPrix] = useLocalStorage<boolean>(
    'hideGrandPrix',
    false
  )
  const [unlockedAudio, setUnlockedAudio] = useState(false)
  const [moveDisabledEventsBottom, setMoveDisabledEventsBottom] =
    useLocalStorage<boolean>('moveDisabledEventsBottom', false)
  const [hideDisabledEvents, setHideDisableEvents] = useLocalStorage<boolean>(
    'hideDisabledEvents',
    false
  )
  const [mounted, setMounted] = useState(false)
  const [volume, setVolume] = useLocalStorage<number>('volume', 0.4)
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
    if (regionTZ !== undefined) {
      setMounted(true)
      setServerTime(currDate.setZone(regionTZ))
      setSelectedDate(currDate.setZone(regionTZ))
    }
  }, [regionTZ])

  useEffect(() => {
    if (previousEventIds) {
      let difference = (previousEventIds || [])
        .filter((x) => !currentEventsIds.includes(x))
        .concat(currentEventsIds.filter((x) => !previousEventIds.includes(x)))
      if (difference.length === 0) return
    }
    if (alertSound && alertSound !== 'muted') {
      let s = new Howl({
        src: sounds[alertSound as AlertSoundKeys] as unknown as string,
      })
      s.play()
    }
  }, [currentEventsIds])
  useEffect(() => {
    if (volume !== undefined) Howler.volume(volume)
  }, [volume])

  useEffect(() => {
    setMounted(true)
    Howler.autoSuspend = false
  }, [])
  useEffect(() => {
    const timer = setInterval(() => {
      let now = DateTime.now()
      if (currDate.endOf('day').diffNow().toMillis() < 0) setSelectedDate(now)
      setCurrDate(now)
      setServerTime(now.setZone(regionTZ))
    }, 1000)
    return () => {
      clearInterval(timer) // Return a function to clear the timer so that it will stop being called on unmount
    }
  }, [regionTZ, view24HrTime, viewLocalizedTime, selectedDate])

  // read and populate all game events
  useEffect(() => {
    if (!mounted || regionTZ === undefined) return
    let gameEvents: Array<GameEvent> = []
    let disabledAlarmsKeys = Object.keys(disabledAlarms || {})
    Object.entries(allEventData).forEach((eventType) => {
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
                    month: Number(month),
                    day: Number(day),
                    hour: Number(startHr),
                    minute: Number(startMin),
                  },
                  { zone: regionTZ }
                )
                let id = Number(gt.id)
                if (
                  (7000 <= id && id < 8000 && ![7013, 7035].includes(id)) ||
                  [
                    1001, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1009, 5002,
                    5003, 5004, 6007, 6008, 6009, 6010, 6011,
                  ].includes(id)
                ) {
                  start = start.plus({ minutes: 10 })
                }
                let end = DateTime.fromObject(
                  {
                    month: start.month,
                    day: start.day,
                    hour: Number(endHr != '' ? endHr : start.hour),
                    minute: Number(endMin != '' ? endMin : start.minute),
                  },
                  { zone: regionTZ }
                )

                gameEvent.addTime(Interval.fromDateTimes(start, end))
                if (
                  disabledAlarmsKeys.includes(gameEvent.gameEvent.id) &&
                  disabledAlarms
                )
                  gameEvent.disabled =
                    DateTime.fromMillis(
                      disabledAlarms[gameEvent.gameEvent.id]
                    ) || null
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

  // (re)generate full events table and current events table on dependency array change (mostly config changes)
  useEffect(() => {
    if (mounted) {
      generateEventsTable(selectedEventType)
    }
  }, [
    serverTime.minute,
    notifyInMins,
    disabledAlarms,
    hideGrandPrix,
    moveDisabledEventsBottom,
    hideDisabledEvents,
    todayEvents,
    selectedEventType,
  ])
  // game event button click (filters events by type)
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
    // generateFullEventsTable(id)
  }

  const generateEventsTable = (eventType: number) => {
    // let allEvents: Array<GameEvent> = []
    let ms = Duration.fromObject({ minutes: notifyInMins }).toMillis()
    let grandPrixEvents = [946, 947, 948, 949, 950, 951]
    let disabledAlarmsKeys = Object.keys(disabledAlarms || {})

    let currEventsTable: Array<GameEvent> = []
    let allEventsTable: Array<GameEvent> = []

    for (let i = 0; i < todayEvents?.length; i++) {
      let event = todayEvents[i]
      if (eventType !== -1 && event.eventType.id !== eventType) continue
      if (disabledAlarmsKeys.includes(event.gameEvent.id) && disabledAlarms)
        event.disabled =
          DateTime.fromMillis(disabledAlarms[event.gameEvent.id]) || null
      else event.disabled = null

      if (event.disabled && hideDisabledEvents) continue
      else if (event.disabled && moveDisabledEventsBottom) {
        allEventsTable.push(event)
        continue
      }
      if (hideGrandPrix && grandPrixEvents.includes(Number(event.gameEvent.id)))
        continue

      let latest = event.latest(serverTime)
      if (latest) {
        let value = latest.start.diff(serverTime).valueOf()
        if (!event.disabled && 0 <= value && value <= ms)
          currEventsTable.push(event)
        else allEventsTable.push(event)
      }
    }

    allEventsTable = allEventsTable.sort((a, b) => {
      if (moveDisabledEventsBottom) {
        if (a.disabled) return Number.POSITIVE_INFINITY
        else if (b.disabled) return Number.NEGATIVE_INFINITY
      }

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
    })
    currEventsTable = currEventsTable.sort(
      (a, b) =>
        a.latest(serverTime).start.valueOf() -
        b.latest(serverTime).start.valueOf()
    )
    const currentEventsTableData = createTableData({
      events: currEventsTable,
      serverTime,
      currDate,
      viewLocalizedTime: viewLocalizedTime || true,
      view24HrTime: view24HrTime || false,
      isGameEvent: true,
    })

    if (
      currentEventsTableData.length > 0 &&
      currentEventsTableData.length > currentEventsTable.length
    ) {
      if (
        alertSound &&
        alertSound !== 'muted' &&
        (currentEventsTable.length !== 0 ||
          currentEventsTableData !== currentEventsTable)
      ) {
        let s = new Howl({
          src: sounds[alertSound as AlertSoundKeys] as unknown as string,
          onunlock: (id) => setUnlockedAudio(true),
        })
        s.play()
      }
    }

    setFullEventsTable(
      createTableData({
        events: allEventsTable,
        serverTime,
        currDate,
        viewLocalizedTime: viewLocalizedTime || true,
        view24HrTime: view24HrTime || false,
        isGameEvent: true,
      })
    )
    setCurrentEventsTable(currentEventsTableData)
  }

  // return react text node for game type buttons [disabled / all events]
  const eventsInSection = (eventId: number) => {
    let allEvents =
      todayEvents?.filter((te) =>
        eventId === -1 ? te.eventType.id >= 0 : te.eventType.id === eventId
      ) || []

    let remaining = allEvents?.filter((e) => !e.disabled) || []

    if (remaining.length != allEvents.length)
      return (
        <>
          {`${remaining.length}`} / {`${allEvents.length}`}
        </>
      )
    return <>{allEvents.length}</>
  }

  return (
    <>
      <Head>
        <title>Alarms - Lost Ark Timer</title>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=0.35"
        ></meta>
      </Head>
      <AlarmConfigModal
        view24HrTime={view24HrTime}
        setView24HrTime={setView24HrTime}
        viewLocalizedTime={viewLocalizedTime}
        setViewLocalizedTime={setViewLocalizedTime}
      />
      <div className="navbar flex w-full flex-col bg-base-300 px-4 pt-4 dark:bg-base-100 sm:flex-row lg:px-20">
        <div className="navbar-start mr-4">
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
              className="btn relative text-2xl text-stone-200"
              onClick={(e) => setSelectedDate(serverTime)}
            >
              <span>
                {selectedDate.monthLong} {selectedDate.day}
              </span>
              {serverTime.hasSame(selectedDate, 'day') ? null : (
                <span className="absolute -bottom-2 text-[0.6rem]">
                  ({selectedDate.toRelative()})
                </span>
              )}
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
            <label
              htmlFor="alarm-config-modal"
              className="btn btn-ghost cursor-pointer"
            >
              <IconSettings className="transition ease-in-out hover:-translate-y-px hover:rotate-45" />
            </label>
          </div>
        </div>
        <div className="navbar-end w-full text-right">
          <select
            className="focus-visible: select mr-2 max-w-fit bg-base-200 outline-none"
            onChange={(e) => {
              let region = e.target.value as RegionKey

              setRegionTZ(RegionTimeZoneMapping[region])
              setRegionTZName(region)
            }}
            value={regionTZName}
          >
            {Object.entries(RegionTimeZoneMapping).map(([name, tz]) => (
              <option key={name} value={name}>{`${name} (${tz})`}</option>
            ))}
          </select>
          <table>
            <tbody>
              <tr>
                <td></td>

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
                <td></td>
                <td
                  className={classNames('text-left', {
                    'text-green-700 dark:text-success': !viewLocalizedTime,
                  })}
                >
                  Server Time:
                </td>
                <td
                  className={classNames({
                    'text-green-700 dark:text-success': !viewLocalizedTime,
                  })}
                >
                  {serverTime.toLocaleString(
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

      <div className=" flex min-h-screen flex-col items-center bg-base-300 py-2 dark:bg-base-100">
        {alertSound !== 'muted' && !unlockedAudio && (
          <div
            className="alert alert-warning mb-4 w-fit justify-self-center shadow-lg duration-300 ease-out"
            onClick={() => {
              setUnlockedAudio(true)
              let s = new Howl({
                src: sounds[alertSound as AlertSoundKeys] as unknown as string,
              })
              s.play()
            }}
          >
            <div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 flex-shrink-0 stroke-current"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>Click on me to start receiving alert sounds!</span>
            </div>
          </div>
        )}
        <main className="mb-14 h-full w-full px-4 lg:px-20">
          <table className="table w-full">
            <thead>
              <tr className="justify-center">
                <td
                  colSpan={2}
                  className="relative bg-stone-400 text-center dark:bg-base-200"
                >
                  {selectedDate.hasSame(serverTime, 'day')
                    ? 'Alarms'
                    : `Viewing events ${selectedDate.toRelative()}`}

                  {` (Alerts ${alertSound === 'muted' ? 'muted' : 'on'})`}
                  <select
                    className="select select-sm absolute right-6"
                    onChange={(e) => {
                      if (notifyInMins !== Number(e.target.value))
                        setNotifyInMins(Number(e.target.value))
                    }}
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
                <td className="border-0 bg-stone-400 dark:bg-base-200"></td>
              </tr>
              <tr className="flex">
                <td className="w-1/4 min-w-fit bg-stone-400 dark:bg-base-200">
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
                <td className="top-0 w-full bg-stone-400 dark:bg-base-200">
                  {currentEventsTable.length > 0 ? (
                    <table key="currentEventsTable" className="table w-full ">
                      <tbody className="block ring-2 ring-orange-300">
                        {currentEventsTable}
                      </tbody>
                    </table>
                  ) : null}
                  <table key="fullEventsTable" className="table w-full">
                    <tbody>{fullEventsTable}</tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </main>
      </div>
    </>
  )
}

export default Alarms
