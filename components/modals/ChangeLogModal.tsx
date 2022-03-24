import React from 'react'

const ChangeLogModal = () => {
  return (
    <>
      <input type="checkbox" id="changelog-modal" className="modal-toggle" />
      <label
        htmlFor="changelog-modal"
        className="modal w-full overflow-x-hidden"
      >
        <div className="modal-box w-full">
          <h3 className="text-center text-lg font-bold uppercase">Changelog</h3>
          <div className="text-violet-500">
            Planned:
            <ul className="list-disc pl-6">
              <li>Wandering Merchant Ships</li>
              <li>Daily Reset Timer</li>
              <li>Procyon Compass Checkboxes</li>
            </ul>
          </div>
          <p className="py-4">3/24/2022:</p>
          <ol className="list-disc pl-6">
            <li>Feature Release: Wandering Merchants!</li>
            <li>Added actual alarm reminders, alerts and sounds.</li>
            <li>Added hiding of events and customization of hidden events.</li>
            <li>Moved settings into config modal.</li>
          </ol>

          <p className="py-4">3/19/2022:</p>
          <ol className="list-disc pl-6">
            <li>Fix: alarms should now work after correct user interaction.</li>
            <li>Added actual alarm reminders, alerts and sounds.</li>
            <li>Added hiding of events and customization of hidden events.</li>
            <li>Moved settings into config modal.</li>
          </ol>

          <p className="py-4">3/18/2022:</p>
          <ol className="list-disc pl-6">
            <li>Fixed timers from morning's patch.</li>
          </ol>
          <div>
            <p className="py-4">3/17/2022:</p>
            <ol className="list-disc pl-6">
              <li>Fixed somewhat borked timers from last night's patch.</li>
              <li>Gesbroy and Chaos Gates now displays accurate times.</li>
              <li>
                Events should now automatically update when day passes 12AM.
              </li>
              <li>
                Added text to show when selected day was not same as current
                day.
              </li>
            </ol>
          </div>
          <div>
            <p className="py-4">3/16/2022:</p>
            <ol className="list-disc pl-6">
              <li>Added light mode colors.</li>
              <li>Site is now more mobile friendly!</li>
              <li>Added server timezone persistence.</li>
            </ol>
          </div>
          <p className="py-4">3/15/2022: Release v1.0!</p>
        </div>
      </label>
    </>
  )
}

export default ChangeLogModal
