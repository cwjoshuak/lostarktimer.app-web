import type { NextPage } from 'next'
import Head from 'next/head'
import React, { useState, useEffect, useRef, ReactElement } from 'react'
import { APIGameEvent, APIEventType } from '../common/api'
import { GameEvent } from '../common'
import { GameEventTableCell } from './components'
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
  const [serverTime, setServerTime] = useState<DateTime>(
    DateTime.now().setZone('UTC-8')
  )
  const [gameEvents, setGameEvents] = useState<Array<GameEvent> | undefined>(
    undefined
  )
  const [todayEvents, setTodayEvents] = useState<Array<GameEvent> | undefined>(
    undefined
  )

  const [eventTable, setEventTable] = useState<JSX.Element>()
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
      setServerTime(DateTime.now().setZone('UTC-7'))
    }, 1000)
    return () => {
      clearInterval(timer) // Return a funtion to clear the timer so that it will stop being called on unmount
    }
  }, [])
  useEffect(() => {
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
                  { zone: 'UTC-8' }
                )

                let end = DateTime.fromObject(
                  {
                    day: Number(day),
                    hour: Number(endHr ? endHr : startHr),
                    minute: Number(endMin ? endMin : startMin),
                  },
                  { zone: 'UTC-8' }
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
  }, [selectedDate])
  useEffect(() => {
    generateEventTable(-1)
  }, [todayEvents])
  const buttonClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    id: number
  ) => {
    buttons.forEach((b) =>
      (b.current as unknown as Element).classList.remove('btn-active')
    )
    let button = event.target as Element
    button.classList.add('btn-active')

    generateEventTable(id)
  }
  const generateEventTable = (eventType: number) => {
    let events: Array<GameEvent> = []

    events =
      todayEvents?.filter((e) =>
        eventType === -1 ? true : e.eventType.id === eventType
      ) ?? []

    let arr: React.ReactElement[] = []
    for (let i = 0; i < events.length; i += 2) {
      let children: ReactElement[] = []
      for (
        let j = 0;
        i + j < (i + 2 < events.length ? i + 2 : events.length);
        j++
      ) {
        children.push(
          <GameEventTableCell
            id={serverTime.valueOf() + i + j}
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

    setEventTable(<>{arr}</>)
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
              onClick={(e) => setSelectedDate(selectedDate.minus({ days: 1 }))}
            >
              {'<<'}
            </button>
            <span className="text-4xl">
              {selectedDate.monthLong} {selectedDate.day}
            </span>

            <button
              className="btn border-none bg-base-200 text-center text-xl"
              onClick={(e) => setSelectedDate(selectedDate.plus({ days: 1 }))}
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
                <div>
                  <table className="table w-full">
                    <tbody className="">{eventTable}</tbody>
                  </table>
                </div>
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
