import React, { useEffect, useState } from 'react'
import GameEvent from './GameEvent'

import Image from 'next/image'
import { DateTime, Duration } from 'luxon'
type CellProps = {
  id: number
  gameEvent: GameEvent
  serverTime: DateTime
}

const GameEventTableCell = (props: CellProps): React.ReactElement => {
  const { id, gameEvent, serverTime } = props
  const [st, setServerTime] = useState(DateTime.now().setZone(serverTime.zone))
  const [timeUntil, setTimeUntil] = useState(
    Duration.fromMillis(gameEvent.latest(st)?.start.diff(st).toMillis())
  )
  useEffect(() => {
    const timer = setInterval(() => {
      // setServerTime()
      setTimeUntil(
        Duration.fromMillis(
          gameEvent
            .latest(st)
            ?.start.diff(DateTime.now().setZone(serverTime.zone))
            .toMillis()
        )
      )
    }, 1000)

    return () => {
      clearInterval(timer) // Return a funtion to clear the timer so that it will stop being called on unmount
    }
  }, [])

  return (
    <td
      key={st.valueOf()}
      className="m-2 flex basis-1/2 items-center space-x-4 rounded-none p-2"
    >
      <div className="m-1 flex justify-center">
        <Image
          src={`https://lostarkcodex.com/icons/${gameEvent.gameEvent.iconUrl}`}
          width={38}
          height={38}
        />
      </div>
      <div className="basis-11/12 items-center font-sans text-xs font-bold">
        <div className="ml-2 mr-4">
          <span className="block uppercase">
            [{gameEvent.gameEvent.minItemLevel}] {gameEvent.gameEvent.name}
            <span className="float-right text-amber-200">
              -{timeUntil.toFormat('hh:mm:ss')}
            </span>
          </span>
          <span className="inline whitespace-normal text-justify">
            {gameEvent.times.map((t, idx) => {
              let diff = t.start.diff(st).valueOf()
              let dt = t.start.toLocaleString(DateTime.TIME_24_SIMPLE)

              return (
                <>
                  <span
                    key={idx}
                    className={`${
                      diff < 0
                        ? 'text-slate-500'
                        : diff < 900000
                        ? 'text-amber-200'
                        : 'text-success'
                    }`}
                  >
                    {dt}
                  </span>
                  {idx < gameEvent.times.length - 1 ? ' / ' : ''}
                </>
              )
            })}
          </span>
        </div>
      </div>
    </td>
  )
}
/**return (
                <>
                  <span
                    key={idx}>
<span className={t.start.diff(serverTime).valueOf() < 0 ? "text-amber-500" : ""}></span>


                    </span>
                    className={`${
                      t.start.diff(serverTime).valueOf() > 0
                        ? 'text-success'
                        : 'text-slate-500'
                    }`}
                  >{`${t.start.toLocaleString(DateTime.TIME_24_SIMPLE)}${
                    !t.isEmpty()
                      ? ` - ${t.end.toLocaleString(DateTime.TIME_24_SIMPLE)}`
                      : ''
                  } `}</span>{' '}
                  {idx < gameEvent.times.length - 1 ? ' / ' : ''}
                </> */
export default GameEventTableCell
