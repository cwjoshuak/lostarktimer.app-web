import { IconBrandDiscord } from '@tabler/icons'
import React from 'react'

const GitHubModal = () => {
  return (
    <>
      <input type="checkbox" id="gh-modal" className="modal-toggle" />
      <div className="modal">
        <div className="modal-box">
          <h3 className="text-center text-lg font-bold uppercase">GitHub</h3>
          <p className="py-4">
            The repo is almost ready! I refactored a ton of code and should
            probably release it along with the wandering merchant updates within
            a few more days! Stay tuned. Check out my{' '}
            <a className="text-blue-400" href="https://github.com/cwjoshuak">
              GitHub
            </a>{' '}
            while waiting though!
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
          <div className="modal-action">
            <label htmlFor="gh-modal" className="btn">
              Yay!
            </label>
          </div>
        </div>
      </div>
    </>
  )
}

export default GitHubModal
