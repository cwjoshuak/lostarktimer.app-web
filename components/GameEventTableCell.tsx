import React, { useEffect, useState } from 'react'
import { GameEvent } from '../common'

import Image from 'next/image'
import { DateTime, Duration, Zone } from 'luxon'
import classNames from 'classnames'
import useLocalStorage from '@olerichter00/use-localstorage'
import { generateTimestampStrings } from '../util/createTableData'
type CellProps = {
  gameEvent: GameEvent
  serverTime: DateTime
  localizedTZ: Zone
  view24HrTime: boolean | undefined
}

const GameEventTableCell = (props: CellProps): React.ReactElement => {
  const { gameEvent, serverTime, localizedTZ, view24HrTime } = props
  // const [st, setServerTime] = useState(DateTime.now().setZone(serverTime.zone))
  const [disabledAlarms, setDisabledAlarms] = useLocalStorage<{
    [key: string]: number
  }>('disabledAlarms', {})
  const [hideGrandPrix, setHideGrandPrix] = useLocalStorage<boolean>(
    'hideGrandPrix',
    false
  )
  const [timeUntil, setTimeUntil] = useState(
    Duration.fromMillis(
      gameEvent.latest(serverTime)?.start.diff(serverTime).toMillis()
    )
  )
  useEffect(() => {
    if (!gameEvent.disabled) {
      const timer = setInterval(() => {
        // setServerTime()
        setTimeUntil(
          Duration.fromMillis(
            gameEvent
              .latest(serverTime)
              ?.start.diff(DateTime.now().setZone(serverTime.zone))
              .toMillis()
          )
        )
      }, 1000)

      return () => {
        clearInterval(timer) // Return a funtion to clear the timer so that it will stop being called on unmount
      }
    }
  }, [])

  if (gameEvent === null) {
    return (
      <td className="m-2 flex basis-1/2 items-center space-x-4 border-0 bg-stone-100 bg-stone-200/80 p-2 dark:bg-base-100"></td>
    )
  }
  return (
    <td
      key={`${gameEvent.uuid} td`}
      className="dropdown m-2 flex basis-1/2 border-0 bg-stone-200/80 p-2 shadow-md hover:cursor-pointer  dark:bg-base-100 dark:hover:bg-base-100/70"
      tabIndex={0}
    >
      <div
        className={classNames('flex basis-full items-center space-x-4', {
          'opacity-20': gameEvent.disabled,
        })}
      >
        <div className=" m-1 flex justify-center">
          <Image
            src={`https://lostarkcodex.com/icons/${gameEvent.gameEvent.iconUrl}`}
            width={38}
            height={38}
          />
        </div>
        <div className="basis-11/12 items-center font-sans text-xs font-semibold">
          <div className="ml-2 mr-4">
            <span className="block uppercase ">
              [{gameEvent.gameEvent.minItemLevel}]{' '}
              {hideGrandPrix && Number(gameEvent.gameEvent.id) === 945
                ? gameEvent.gameEvent.name.split(' ').slice(0, -1).join(' ')
                : gameEvent.gameEvent.name}
              <span className="float-right text-amber-500 dark:text-amber-200">
                {gameEvent.disabled
                  ? null
                  : `-${timeUntil.toFormat('hh:mm:ss')}`}
              </span>
            </span>
            <span className="inline whitespace-normal text-justify">
              {gameEvent.times.map((t, idx) =>
                generateTimestampStrings(
                  gameEvent,
                  t,
                  serverTime,
                  localizedTZ,
                  view24HrTime || false,
                  idx
                )
              )}
            </span>
          </div>
        </div>
      </div>
      <ul
        tabIndex={0}
        className="min-w-52 dropdown-content menu rounded-box top-0 right-0 bg-base-300 p-2 text-sm shadow"
      >
        {[945, 946, 947, 948, 949, 950, 951].includes(
          Number(gameEvent.gameEvent.id)
        ) ? (
          hideGrandPrix ? (
            <>
              <li className="border-l-4 border-transparent">
                <a
                  onClick={(e) => {
                    setHideGrandPrix(false)
                    ;(document.activeElement as HTMLElement).blur()
                  }}
                >
                  Show Repeated Events
                </a>
              </li>
              {gameEvent.disabled ? (
                <>
                  {' '}
                  <li className="border-l-4 border-transparent">
                    <a
                      onClick={(e) => {
                        if (disabledAlarms) {
                          delete disabledAlarms[gameEvent.gameEvent.id]
                          gameEvent.disabled = null
                          setDisabledAlarms({
                            ...disabledAlarms,
                          })
                        }
                        ;(document.activeElement as HTMLElement).blur()
                      }}
                    >
                      Enable Alarm
                    </a>
                  </li>
                </>
              ) : (
                <>
                  <li className="border-l-4 border-transparent">
                    <a
                      onClick={(e) => {
                        let disabledUntil = gameEvent.latest(serverTime).end
                        setDisabledAlarms({
                          ...disabledAlarms,
                          [gameEvent.gameEvent.id]: disabledUntil.toMillis(),
                        })
                        gameEvent.disabled = disabledUntil
                        ;(document.activeElement as HTMLElement).blur()
                      }}
                    >
                      Disable Once
                    </a>
                  </li>
                  <li className="border-l-4 border-transparent">
                    <a
                      onClick={(e) => {
                        let disabledUntil = gameEvent
                          .latest(serverTime)
                          .end.plus({ hours: 12 })
                        setDisabledAlarms({
                          ...disabledAlarms,
                          [gameEvent.gameEvent.id]: disabledUntil.toMillis(),
                        })
                        gameEvent.disabled = disabledUntil
                        ;(document.activeElement as HTMLElement).blur()
                      }}
                    >
                      Disable Alarm for 12 Hours
                    </a>
                  </li>
                  <li>
                    <a
                      className="border-l-4 border-transparent hover:border-red-500"
                      onClick={(e) => {
                        let disabledUntil = gameEvent
                          .latest(serverTime)
                          .end.plus({ hours: 336 })
                        setDisabledAlarms({
                          ...disabledAlarms,
                          [gameEvent.gameEvent.id]: disabledUntil.toMillis(),
                        })
                        gameEvent.disabled = disabledUntil
                        ;(document.activeElement as HTMLElement).blur()
                      }}
                    >
                      Disable All Future Alarms
                    </a>
                  </li>
                </>
              )}
            </>
          ) : (
            <>
              <li className="border-l-4 border-transparent">
                <a
                  onClick={(e) => {
                    setHideGrandPrix(true)
                    ;(document.activeElement as HTMLElement).blur()
                  }}
                >
                  Hide Repeated Events
                </a>
              </li>
            </>
          )
        ) : gameEvent.disabled ? (
          <>
            <li className="border-l-4 border-transparent">
              <a
                onClick={(e) => {
                  if (disabledAlarms) {
                    delete disabledAlarms[gameEvent.gameEvent.id]
                    gameEvent.disabled = null
                    setDisabledAlarms({
                      ...disabledAlarms,
                    })
                  }
                  ;(document.activeElement as HTMLElement).blur()
                }}
              >
                Enable Alarm
              </a>
            </li>
          </>
        ) : (
          <>
            <li className="border-l-4 border-transparent">
              <a
                onClick={(e) => {
                  let disabledUntil = gameEvent.latest(serverTime).end
                  setDisabledAlarms({
                    ...disabledAlarms,
                    [gameEvent.gameEvent.id]: disabledUntil.toMillis(),
                  })
                  gameEvent.disabled = disabledUntil
                  ;(document.activeElement as HTMLElement).blur()
                }}
              >
                Disable Once
              </a>
            </li>
            <li className="border-l-4 border-transparent">
              <a
                onClick={(e) => {
                  let disabledUntil = gameEvent
                    .latest(serverTime)
                    .end.plus({ hours: 12 })
                  setDisabledAlarms({
                    ...disabledAlarms,
                    [gameEvent.gameEvent.id]: disabledUntil.toMillis(),
                  })
                  gameEvent.disabled = disabledUntil
                  ;(document.activeElement as HTMLElement).blur()
                }}
              >
                Disable Alarm for 12 Hours
              </a>
            </li>
            <li>
              <a
                className="border-l-4 border-transparent hover:border-red-500"
                onClick={(e) => {
                  let disabledUntil = gameEvent
                    .latest(serverTime)
                    .end.plus({ hours: 336 })
                  setDisabledAlarms({
                    ...disabledAlarms,
                    [gameEvent.gameEvent.id]: disabledUntil.toMillis(),
                  })
                  gameEvent.disabled = disabledUntil
                  ;(document.activeElement as HTMLElement).blur()
                }}
              >
                Disable All Future Alarms
              </a>
            </li>
          </>
        )}
      </ul>
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
