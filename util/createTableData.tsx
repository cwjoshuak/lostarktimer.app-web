import React, { ReactElement } from 'react'
import { GameEvent } from '../common'
import { GameEventTableCell } from '../components'
import { v4 as uuidv4 } from 'uuid'
import { DateTime, Interval, Zone } from 'luxon'
import useLocalStorage from '@olerichter00/use-localstorage'
import { MerchantData } from './types/types'
import MerchantTableCell from '../components/MerchantTableCell'
import classNames from 'classnames'
import WanderingMerchant from '../common/WanderingMerchant'
interface TableProps {
  serverTime: DateTime
  currDate: DateTime
  viewLocalizedTime: boolean
  view24HrTime: boolean
}
interface CreateGameEventTableProps extends TableProps {
  events: Array<GameEvent>
  isGameEvent: true
}
interface CreateMerchantTableProps extends TableProps {
  events: Array<WanderingMerchant>
  isGameEvent: false
}
function isGameEventData(object: any): object is CreateGameEventTableProps {
  return object.isGameEvent || object instanceof GameEvent
}
export const createTableData = (
  props: CreateGameEventTableProps | CreateMerchantTableProps
) => {
  const { events, serverTime, currDate, viewLocalizedTime, view24HrTime } =
    props
  let arr: React.ReactElement[] = []
  for (let i = 0; i < events.length; i += 2) {
    let children: ReactElement[] = []
    for (
      let j = 0;
      i + j < (i + 2 < events.length ? i + 2 : events.length);
      j++
    ) {
      if (props.isGameEvent) {
        let evt = events[i + j] as GameEvent
        children.push(
          <GameEventTableCell
            key={evt.uuid}
            gameEvent={evt}
            serverTime={serverTime}
            localizedTZ={viewLocalizedTime ? currDate.zone : serverTime.zone}
            view24HrTime={view24HrTime}
          />
        )
      } else {
        let evt = events[i + j] as WanderingMerchant
        children.push(
          <MerchantTableCell
            key={evt.uuid}
            merchant={evt}
            serverTime={serverTime}
            localizedTZ={viewLocalizedTime ? currDate.zone : serverTime.zone}
            view24HrTime={view24HrTime}
          />
        )
      }
    }
    if (children.length == 1) {
      children.push(
        <td
          key={uuidv4()}
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
  return arr
}

export const generateTimestampStrings = (
  event: GameEvent | WanderingMerchant,
  // eventTimes: Interval[],
  interval: Interval,
  serverTime: DateTime,
  localizedTZ: Zone,
  view24HrTime: boolean,
  // timeDiff: number,
  idx: number
) => {
  let eventTimes =
    (event as WanderingMerchant).schedule || (event as GameEvent).times
  let diff = interval.start.diff(serverTime).valueOf()
  let inProgress =
    interval.start.diff(serverTime).toMillis() < 0 &&
    interval.end.diff(serverTime).toMillis() > 0
  let startTime = interval.start
    .setZone(localizedTZ)
    .toLocaleString(
      view24HrTime ? DateTime.TIME_24_SIMPLE : DateTime.TIME_SIMPLE
    )
  let endTime = interval.end
    .setZone(localizedTZ)
    .toLocaleString(
      view24HrTime ? DateTime.TIME_24_SIMPLE : DateTime.TIME_SIMPLE
    )
  return (
    <span key={`${event.uuid} ${idx}`}>
      <span
        className={classNames({
          'text-slate-400/25': diff < 0,
          'text-amber-500 dark:text-amber-200':
            inProgress || (diff >= 0 && diff < 900000),
          'text-green-700 dark:text-success': diff >= 900000,
        })}
      >
        {startTime}
        {!interval.isEmpty() ? ` - ${endTime}` : ''}
      </span>
      <span
        className={classNames({
          'text-slate-400/30': diff < 0,
        })}
      >
        {idx < eventTimes.length - 1 ? ' / ' : ''}
      </span>
    </span>
  )
}
