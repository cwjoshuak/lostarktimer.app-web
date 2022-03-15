import type { NextPage } from 'next'
import Head from 'next/head'
import React, { useState, useEffect, useRef, ReactElement } from 'react'
import { APIGameEvent, APIEventType } from '../common/api'
import { GameEvent } from '../common'
import { GameEventTableCell } from '../components'
import { DateTime, Interval } from 'luxon'

type EventTimingData = [
  key: eventType,
  mapping: {
    [key: month]: { [key: day]: { [key: iLvl]: { [key: eventId]: [time] } } }
  }
]

interface Events {
  [key: string]: { [key: iLvl]: [] }
}

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

// const eventTimings: EventTimingData = require('../data/data.json')

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
  const [selectedDate, setSelectedDate] = useState(currDate)
  const [regionTZ, setRegionTZ] = useState<string>('UTC-7')
  const [serverTime, setServerTime] = useState<DateTime>(
    DateTime.now().setZone(regionTZ)
  )
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
  }, [regionTZ])
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

                let end = DateTime.fromObject(
                  {
                    day: Number(day),
                    hour: Number(endHr ? endHr : startHr),
                    minute: Number(endMin ? endMin : startMin),
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
        ge.times.find((t) => t.start.day === selectedDate.day) !== undefined
    )

    setGameEvents(gameEvents)
    setTodayEvents(todayEvents)
  }, [regionTZ, selectedDate])
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
            key={
              i +
              j +
              Number(
                evt.gameEvent.minItemLevel +
                  (evt.latest(serverTime)
                    ? evt.latest(serverTime).start.hour
                    : 0)
              )
            }
            gameEvent={events[i + j]}
            serverTime={serverTime}
          />
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
            key={
              i +
              j +
              Number(
                evt.gameEvent.minItemLevel +
                  (evt.latest(serverTime)
                    ? evt.latest(serverTime).start.hour
                    : 0)
              )
            }
            gameEvent={evt}
            serverTime={serverTime}
          />
        )
      }

      arr.push(
        <tr key={i} className="flex flex-row">
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
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Lost Ark Timers</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="navbar w-11/12 bg-base-100">
        <div className="navbar-start">
          <div className="flex items-center gap-2 ">
            <button
              className="btn border-none bg-base-200 text-center text-xl"
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
              className="btn text-2xl"
              onClick={(e) => setSelectedDate(DateTime.now())}
            >
              <span>
                {selectedDate.monthLong} {selectedDate.day}
              </span>
            </button>
            <button
              className="btn border-none bg-base-200 text-center text-xl"
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
          Lost Ark Timers
        </a>
        <div className="navbar-end text-right">
          <table>
            <tbody>
              <tr>
                <td rowSpan={2}>
                  <select
                    className="focus-visible: select mr-2 w-4/5 bg-base-200 outline-none"
                    onChange={(e) => setRegionTZ(e.target.value)}
                  >
                    <option value="UTC-7">US West</option>
                    <option value="UTC-4">US East</option>
                    <option value="UTC+1">EU Central</option>
                    <option value="UTC+0">EU West</option>
                    <option value="UTC-3">South America</option>
                  </select>
                </td>
                <td className="text-left">Current Time:</td>
                <td>
                  {currDate.toLocaleString(DateTime.TIME_24_WITH_SHORT_OFFSET)}
                </td>
              </tr>

              <tr>
                <td className="text-left">Server Time:</td>
                <td>
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
      <main className="w-full px-20 ">
        <table className="table w-full">
          <thead>
            <tr className="justify-center">
              <td colSpan={2} className="text-center">
                Alarms
              </td>
            </tr>
          </thead>
          <tbody>
            <tr className="flex">
              <td className="w-1/4 min-w-fit bg-base-200">
                <table className="table w-full">
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
              <td className="top-0 w-full overflow-y-auto bg-base-200">
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
      {/* <footer className="flex h-24 w-full items-center justify-center border-t">
        <a
          className="flex items-center justify-center gap-2"
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
        </a>
      </footer> */}
    </div>
  )
}

export default Home
