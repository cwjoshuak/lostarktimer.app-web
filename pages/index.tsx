import type { NextPage } from 'next'
import Head from 'next/head'
import React, { useState, useEffect, useRef, ReactElement } from 'react'
import { APIGameEvent, APIEventType } from '../common/api'
import { GameEvent } from '../common'
import {
  ChangeLogModal,
  GameEventTableCell,
  GitHubModal,
  SideBar,
} from '../components'
import { DateTime, Interval } from 'luxon'
import useLocalStorage from '@olerichter00/use-localstorage'
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

const Home: NextPage = () => {
  const [currDate, setCurrDate] = useState<DateTime>(DateTime.now())
  const [regionTZ, setRegionTZ] = useState<string>('UTC-8')
  const [serverTime, setServerTime] = useState<DateTime>(
    DateTime.now().setZone(regionTZ)
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
    false
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
    const timer = setInterval(() => {
      setCurrDate(DateTime.now())
      setServerTime(DateTime.now().setZone(regionTZ))
    }, 1000)
    return () => {
      clearInterval(timer) // Return a funtion to clear the timer so that it will stop being called on unmount
    }
  }, [regionTZ, viewLocalizedTime])
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
                  [5002, 5003, 5004, 6007, 6008, 6009, 6010, 6011].includes(id)
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
        }) !== undefined
    )

    setGameEvents(gameEvents)
    setTodayEvents(todayEvents)
  }, [regionTZ, selectedDate, viewLocalizedTime])
  useEffect(() => {
    generateFullEventsTable(-1)
  }, [todayEvents])
  useEffect(() => {
    generateFullEventsTable(selectedEventType)
    generateCurrentEventsTable()
  }, [serverTime.minute])
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

    events =
      todayEvents
        ?.filter((e) => {
          let latest = e.latest(serverTime)
          if (latest) {
            let value = latest.start.diff(serverTime).valueOf()
            return 0 <= value && value <= 900000
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

    events =
      todayEvents
        ?.filter((e) => {
          let correctEventType =
            eventType === -1 || e.eventType.id === eventType
          if (e.latest(serverTime)) {
            return (
              correctEventType &&
              e.latest(serverTime).start.diff(serverTime).valueOf() >= 900000
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
      </Head>
      <div className="bg-sky-800 py-2 text-center lg:px-4">
        <div
          className="flex items-center bg-sky-900/50 p-2 leading-none text-sky-100 lg:inline-flex lg:rounded-full"
          role="alert"
        >
          <span className="mx-4 flex-auto text-left font-semibold">
            Events that start today and end on the next day (Ghost Ships /
            Shangra) might have some weird UI issues when you switch to the next
            day.
          </span>
        </div>
      </div>
      <ChangeLogModal />
      <GitHubModal />
      <div className="navbar mt-4 w-full bg-base-300 px-20 dark:bg-base-100">
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
                  <label className="label mr-2 cursor-pointer">
                    <span className="label-text w-4/5 text-right font-bold">
                      Localize Time
                    </span>
                    <input
                      type="checkbox"
                      onChange={(e) => setViewLocalizedTime(e.target.checked)}
                      defaultChecked={viewLocalizedTime}
                      className="checkbox checkbox-sm"
                    />
                  </label>
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
                  {currDate.toLocaleString(DateTime.TIME_24_WITH_SHORT_OFFSET)}
                </td>
              </tr>

              <tr>
                <td>
                  <select
                    className="focus-visible: select mr-2 w-4/5 bg-base-200 outline-none"
                    onChange={(e) => setRegionTZ(e.target.value)}
                  >
                    <option value="UTC-8">US West (UTC-8)</option>
                    <option value="UTC-5">US East (UTC-5)</option>
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
                  Server Time:
                </td>
                <td
                  className={classNames({
                    'text-green-700 dark:text-success': !viewLocalizedTime,
                  })}
                >
                  {serverTime.toLocaleString(
                    DateTime.TIME_24_WITH_SHORT_OFFSET
                  )}
                </td>
              </tr>
            </tbody>
          </table>

          <br />
        </div>
      </div>
      <SideBar />
      <div className="flex min-h-screen flex-col items-center bg-base-300 py-2 dark:bg-base-100">
        <main className="w-full px-20 ">
          <table className="table w-full">
            <thead>
              <tr className="justify-center">
                <td
                  colSpan={2}
                  className="bg-stone-200 text-center dark:bg-base-200"
                >
                  Alarms
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
                            All
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
                      <tbody className="ring-2 ring-orange-300">
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
        <footer className="flex h-12 w-full items-center justify-center border-t">
          Thanks for visiting!
        </footer>
      </div>
    </>
  )
}

export default Home
