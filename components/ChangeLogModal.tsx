import React from 'react'

const ChangeLogModal = () => {
  return (
    <>
      <input type="checkbox" id="changelog-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box">
          <h3 className="text-center text-lg font-bold uppercase">Changelog</h3>
          <div className="text-violet-500">
            Planned:
            <ul className="list-disc pl-6">
              <li>Add actual alarm reminders, alerts + sounds.</li>
              <li>Wandering Merchants Feature ETA {'<'} 4.5 days?</li>
            </ul>
          </div>
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
          <div className="modal-action">
            <label htmlFor="changelog-modal" className="btn">
              Yay!
            </label>
          </div>
        </div>
      </div>
    </>
  )
}

export default ChangeLogModal
