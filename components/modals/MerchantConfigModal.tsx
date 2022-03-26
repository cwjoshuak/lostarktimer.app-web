import React from 'react'
type ConfigModalProps = {
  view24HrTime: boolean | undefined
  setView24HrTime: React.Dispatch<boolean>
  viewLocalizedTime: boolean | undefined
  setViewLocalizedTime: React.Dispatch<boolean>
}
import useLocalStorage from '@olerichter00/use-localstorage'

const MerchantConfigModal = (props: ConfigModalProps) => {
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
              Settings
            </h3>
          </div>
          <div className="flex flex-row space-x-4 p-4">
            <div className="w-full">
              <label className="label mr-2 cursor-pointer">
                <span className="label-text w-4/5 text-right font-semibold">
                  Hide Merchant Items
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
                  Hide Merchant Potential Spawns
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
            <div className="w-full"></div>
          </div>
          <div className="modal-action mb-5 justify-center">
            <label
              htmlFor="merchant-config-modal"
              className="btn btn-block w-4/5"
            >
              All Done!
            </label>
          </div>
        </div>
      </div>
    </>
  )
}

export default MerchantConfigModal
