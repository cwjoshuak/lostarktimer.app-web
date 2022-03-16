import React from 'react'

const ChangeLogModal = () => {
  return (
    <>
      <input type="checkbox" id="changelog-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box">
          <h3 className="text-center text-lg font-bold uppercase">Changelog</h3>
          <p className="py-4">3/15/2022: Release v1.0!</p>
          Planned:
          <ol>
            <li key={1}>1. Add actual alarms and alerts.</li>
            <li key={2}>2. Add more trackers.</li>
            <li key={3}>3. Fix bugs introduced in 1 and 2.</li>
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
