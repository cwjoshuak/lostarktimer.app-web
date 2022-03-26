import React from 'react'
type ConfigModalProps = {
  view24HrTime: boolean | undefined
  setView24HrTime: React.Dispatch<boolean>
  viewLocalizedTime: boolean | undefined
  setViewLocalizedTime: React.Dispatch<boolean>
}
import { Howl, Howler } from 'howler'
import { alert1, alert2, alert3, alert4, alert5, alert6 } from '../../sounds'
import useLocalStorage from '@olerichter00/use-localstorage'
import { IconVolume2, IconVolume3 } from '@tabler/icons'

const sounds = {
  'Alert 1': alert1,
  'Alert 2': alert2,
  'Alert 3': alert3,
  'Alert 4': alert4,
  'Alert 5': alert5,
  'Alert 6': alert6,
}
type AlertSoundKeys =
  | 'Alert 1'
  | 'Alert 2'
  | 'Alert 3'
  | 'Alert 4'
  | 'Alert 5'
  | 'Alert 6'
const AlarmConfigModal = (props: ConfigModalProps) => {
  const {
    // view24HrTime,
    // setView24HrTime,
    viewLocalizedTime,
    setViewLocalizedTime,
  } = props
  const [view24HrTime, setView24HrTime] = useLocalStorage<boolean>(
    'view24HrTime',
    false
  )
  const [alertSound, setAlertSound] = useLocalStorage<string>(
    'alertSound',
    'muted'
  )
  const [hideGrandPrix, setHideGrandPrix] = useLocalStorage<boolean>(
    'hideGrandPrix',
    false
  )
  const [moveDisabledEventsBottom, setMoveDisabledEventsBottom] =
    useLocalStorage<boolean>('moveDisabledEventsBottom', false)
  const [hideDisabledEvents, setHideDisableEvents] = useLocalStorage<boolean>(
    'hideDisabledEvents',
    false
  )
  const [disabledAlarms, setDisabledAlarms] = useLocalStorage<{
    [key: string]: number
  }>('disabledAlarms', {})
  const [volume, setVolume] = useLocalStorage('volume', 0.4)
  return (
    <>
      <input type="checkbox" id="alarm-config-modal" className="modal-toggle" />
      <div className="modal items-center overflow-x-hidden">
        <div className="modal-box p-0">
          <div className="w-full bg-base-200 p-2">
            <h3 className="text-center text-lg font-bold uppercase">
              Settings
            </h3>
          </div>
          <div className="flex flex-row space-x-4 p-4">
            <div className="w-full">
              <label className="label mr-2 cursor-pointer">
                <span className="label-text w-4/5 text-right font-semibold">
                  Move Disabled Events to Bottom
                </span>
                <input
                  type="checkbox"
                  onClick={(e) =>
                    setMoveDisabledEventsBottom(
                      (e.target as HTMLInputElement).checked
                    )
                  }
                  defaultChecked={moveDisabledEventsBottom}
                  className="checkbox checkbox-sm"
                />
              </label>
              <label className="label mr-2 cursor-pointer">
                <span className="label-text w-4/5 text-right font-semibold">
                  Hide Disabled Events
                </span>
                <input
                  type="checkbox"
                  onClick={(e) =>
                    setHideDisableEvents((e.target as HTMLInputElement).checked)
                  }
                  defaultChecked={hideDisabledEvents}
                  className="checkbox checkbox-sm"
                />
              </label>
              <label className="label mr-2 cursor-pointer">
                <span className="label-text w-4/5 text-right font-semibold">
                  Hide Repeat Events [Grand Prix]
                </span>
                <input
                  type="checkbox"
                  onClick={(e) =>
                    setHideGrandPrix((e.target as HTMLInputElement).checked)
                  }
                  defaultChecked={hideGrandPrix}
                  className="checkbox checkbox-sm"
                />
              </label>
              <div className="flex w-full items-center">
                <button
                  className="btn btn-warning btn-xs mx-auto"
                  onClick={(e) => setDisabledAlarms({})}
                >
                  Reset disabled events
                </button>
              </div>
            </div>
            <div className="w-full">
              <label className="label mr-2 cursor-pointer">
                <span className="label-text w-4/5 text-right font-semibold">
                  View in 24HR
                </span>
                <input
                  type="checkbox"
                  onClick={(e) =>
                    setView24HrTime((e.target as HTMLInputElement).checked)
                  }
                  defaultChecked={view24HrTime}
                  className="checkbox checkbox-sm"
                />
              </label>
              <label className="label mr-2 cursor-pointer">
                <span className="label-text w-4/5 text-right font-semibold">
                  View in Current Time
                </span>
                <input
                  type="checkbox"
                  onClick={(e) =>
                    setViewLocalizedTime((e.target as HTMLInputElement).checked)
                  }
                  defaultChecked={viewLocalizedTime}
                  className="checkbox checkbox-sm"
                />
              </label>
              <label className="label mr-2 cursor-pointer">
                <span className="label-text mr-2 w-4/5 text-right font-semibold">
                  Alert Sound
                </span>
                <select
                  className="select select-bordered select-sm focus:outline-0"
                  value={alertSound}
                  onChange={(e) => {
                    setAlertSound(e.target.value)
                    if (e.target.value === 'muted') return
                    let soundName = e.target.value

                    let s = new Howl({
                      src: sounds[
                        soundName as AlertSoundKeys
                      ] as unknown as string,
                    })
                    s.play()
                  }}
                >
                  <option value="muted">Muted 🔇</option>
                  {Object.entries(sounds).map(([soundName, sound]) => (
                    <option
                      key={soundName}
                      value={soundName}
                    >{`${soundName}`}</option>
                  ))}
                </select>
              </label>
              <div className="ml-auto flex w-3/4 justify-end gap-1">
                <IconVolume2 className="stroke-1" />
                <input
                  className="range range-accent range-xs self-center"
                  type="range"
                  min={0}
                  max={1}
                  step={0.02}
                  defaultValue={volume}
                  onChange={(event) => {
                    setVolume(event.target.valueAsNumber)
                  }}
                  onMouseUpCapture={(event) => {
                    let s = new Howl({
                      src: sounds[
                        alertSound as AlertSoundKeys
                      ] as unknown as string,
                    })
                    Howler.stop()
                    s.play()
                  }}
                />
                <IconVolume3 className="stroke-1" />
              </div>
            </div>
          </div>
          <div className="modal-action mb-5 justify-center">
            <label htmlFor="alarm-config-modal" className="btn btn-block w-4/5">
              All Done!
            </label>
          </div>
        </div>
      </div>
    </>
  )
}

export default AlarmConfigModal
