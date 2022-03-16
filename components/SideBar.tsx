import React from 'react'
import { IconBrandGithub, IconCoffee, IconFileCode } from '@tabler/icons'

const SideBar = () => {
  return (
    <nav className="invisible fixed bottom-0 left-5 flex h-2/6 w-10 justify-center md:visible">
      <div className="flex flex-grow flex-col items-center gap-2">
        <label
          htmlFor="gh-modal"
          className="transform cursor-pointer p-2 transition hover:-translate-y-px hover:text-sky-400"
        >
          <IconBrandGithub />
        </label>
        <a
          href="https://www.paypal.com/paypalme/cwjoshuak"
          className="transform p-2 transition hover:-translate-y-px hover:text-orange-400"
        >
          <IconCoffee />
        </a>
        <label
          htmlFor="changelog-modal"
          className="transform cursor-pointer p-2 transition hover:-translate-y-px hover:text-sky-400"
        >
          <IconFileCode />
        </label>
        <span className="mx-auto mt-3 h-full w-px bg-white " />
      </div>
    </nav>
  )
}

export default SideBar
