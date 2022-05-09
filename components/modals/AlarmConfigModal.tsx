import React from 'react'
import { Howl, Howler } from 'howler'
import { alert1, alert2, alert3, alert4, alert5, alert6 } from '../../sounds'
import useLocalStorage from '@olerichter00/use-localstorage'
import { IconVolume2, IconVolume3 } from '@tabler/icons'
import { useTranslation } from 'next-i18next'

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
const AlarmConfigModal = () => {
  const { t } = useTranslation('alarmConfig')

  const [viewLocalizedTime, setViewLocalizedTime] = useLocalStorage<boolean>(
    'viewLocalizedTime',
    true
  )
  const [desktopNotifications, setDesktopNotifications] =
    useLocalStorage<boolean>('desktopNotifications', false)
  const [view24HrTime, setView24HrTime] = useLocalStorage<boolean>(
    'view24HrTime',
    false
  )
  const [darkMode, setDarkMode] = useLocalStorage<boolean>(
    'darkMode',
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
              {t('alarm-settings')}
            </h3>
          </div>
          <div className="flex flex-row space-x-4 p-4">
            <div className="w-full">
              <label className="label mr-2 cursor-pointer">
                <span className="label-text w-4/5 text-right font-semibold">
                  {t('move-disabled-events-to-bottom')}
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
                  {t('hide-disabled-events')}
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
                  {t('group-repeat-events')}{' '}
                  <span title="Combine all instances of Grand Prix, Field Bosses, Chaos Gates, and Ghost Ships into single events">
                    [?]
                  </span>
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
                  {t('reset-disabled-events')}
                </button>
              </div>
            </div>
            <div className="w-full">
              <label className="label mr-2 cursor-pointer">
                <span className="label-text w-4/5 text-right font-semibold">
                  {t('enable-desktop-notifications')}
                </span>
                <input
                  type="checkbox"
                  onClick={(e) => {
                    if (!('Notification' in window)) {
                      alert(
                        'This browser does not support desktop notification'
                      )
                      return
                    } else if (Notification.permission === 'granted') {
                      setDesktopNotifications(
                        (e.target as HTMLInputElement).checked
                      )
                    } else if (Notification.permission !== 'denied') {
                      ;(e.target as HTMLInputElement).checked = false
                      Notification.requestPermission(function (permission) {
                        if (permission === 'granted') {
                          setDesktopNotifications(
                            (e.target as HTMLInputElement).checked
                          )
                        }
                      })
                    }
                  }}
                  defaultChecked={desktopNotifications}
                  className="checkbox checkbox-sm"
                />
              </label>
              <label className="label mr-2 cursor-pointer">
                <span className="label-text w-4/5 text-right font-semibold">
                  {t('common:dark-mode')}
                </span>
                <input
                  type="checkbox"
                  onClick={(e) =>
                    setDarkMode((e.target as HTMLInputElement).checked)
                  }
                  defaultChecked={darkMode}
                  className="checkbox checkbox-sm"
                />
              </label>
              <label className="label mr-2 cursor-pointer">
                <span className="label-text w-4/5 text-right font-semibold">
                  {t('common:view-in-24-hr')}
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
                  {t('common:view-in-current-time')}
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
                  {t('alert-sound')}
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
                  <option value="muted">{t('muted')} 🔇</option>
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
                  disabled={alertSound === 'muted'}
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
              {t('common:all-done')}!
            </label>
          </div>
        </div>
      </div>
    </>
  )
}

export default AlarmConfigModal
