import React from 'react'

const ChangeLogModal = () => {
  return (
    <>
      <input type="checkbox" id="changelog-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box">
          <h3 className="text-center text-lg font-bold uppercase">Changelog</h3>
          <p className="py-4">
            3/16/2022:
            <ol className="list-disc pl-6">
              <li>Added light mode colors.</li>
              <li>Site is now more mobile friendly!</li>
              <li>Added server timezone persistence.</li>
            </ol>
          </p>
          <p className="py-4">3/15/2022: Release v1.0!</p>
          Planned:
          <ol className="list-desc">
            <li>1. Add actual alarm reminders, alerts + sounds.</li>
            <li>2. Add more trackers.</li>
            <li>3. Fix bugs introduced in 1 and 2.</li>
          </ol>
          <p> </p>
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
