import { IconBrandDiscord } from '@tabler/icons'
import React from 'react'

const GitHubModal = () => {
  return (
    <>
      <input type="checkbox" id="gh-modal" className="modal-toggle" />
      <label htmlFor="gh-modal" className="modal overflow-x-hidden">
        <div className="modal-box">
          <h3 className="text-center text-lg font-bold uppercase">GitHub</h3>
          <p className="py-4 text-center">
            <a
              className="text-blue-400 hover:text-blue-300"
              href="https://github.com/cwjoshuak/lostarktimer.app-web"
            >
              Looking to contribute?
            </a>
          </p>
          <span>
            Feel free to send me a{' '}
            <a
              href="https://discord.com/users/120909965547405312"
              className="text-blue-400"
            >
              DM here
            </a>{' '}
            (@josh.8746) if you want to report a bug or suggest something new!
          </span>
        </div>
      </label>
    </>
  )
}

export default GitHubModal
