import React from 'react'
import useLocalStorage from '@olerichter00/use-localstorage'
import { useTranslation } from 'next-i18next'

const MerchantConfigModal = () => {
  const { t } = useTranslation('merchantConfig')
  const [viewLocalizedTime, setViewLocalizedTime] = useLocalStorage<boolean>(
    'viewLocalizedTime',
    true
  )
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

  const [hideMerchantItems, setHideMerchantItems] = useLocalStorage<boolean>(
    'hideMerchantItems',
    false
  )
  const [hidePotentialSpawns, sethidePotentialSpawns] = useLocalStorage(
    'hidePotentialMerchantLocationSpawns',
    false
  )
  const [disabledAlarms, setDisabledAlarms] = useLocalStorage<{
    [key: string]: number
  }>('disabledAlarms', {})
  const [volume, setVolume] = useLocalStorage('volume', 0.4)
  return (
    <>
      <input
        type="checkbox"
        id="merchant-config-modal"
        className="modal-toggle"
      />
      <div className="modal items-center overflow-x-hidden">
        <div className="modal-box p-0">
          <div className="w-full bg-base-200 p-2">
            <h3 className="text-center text-lg font-bold uppercase">
              {t('merchant-settings')}
            </h3>
          </div>
          <div className="flex flex-row space-x-4 p-4">
            <div className="w-full">
              <label className="label mr-2 cursor-pointer">
                <span className="label-text w-4/5 text-right font-semibold">
                  {t('hide-merchant-items')}
                </span>
                <input
                  type="checkbox"
                  onClick={(e) =>
                    setHideMerchantItems((e.target as HTMLInputElement).checked)
                  }
                  defaultChecked={hideMerchantItems}
                  className="checkbox checkbox-sm"
                />
              </label>
              <label className="label mr-2 cursor-pointer">
                <span className="label-text w-4/5 text-right font-semibold">
                  {t('hide-merchant-potential-spawns')}
                </span>
                <input
                  type="checkbox"
                  onClick={(e) =>
                    sethidePotentialSpawns(
                      (e.target as HTMLInputElement).checked
                    )
                  }
                  defaultChecked={hidePotentialSpawns}
                  className="checkbox checkbox-sm"
                />
              </label>
            </div>
            <div className="w-full">
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
            </div>
          </div>
          <div className="modal-action mb-5 justify-center">
            <label
              htmlFor="merchant-config-modal"
              className="btn btn-block w-4/5"
            >
              {t('common:all-done')}!
            </label>
          </div>
        </div>
      </div>
    </>
  )
}

export default MerchantConfigModal
