import classNames from 'classnames'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'
import { IconSun, IconMoon } from '@tabler/icons'
import useLocalStorage from '@olerichter00/use-localstorage'
import { useTranslation } from 'next-i18next'
import { IconLanguage, IconChevronDown } from '@tabler/icons'

const NavBar = () => {
  const { t } = useTranslation('common')

  const router = useRouter()

  const isMounted = useRef(false)
  const defaultTheme = () => {
    return (localStorage.getItem('darkMode') || window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
  }
  const [darkMode, setDarkMode] = useLocalStorage<boolean>('darkMode', defaultTheme)

  useEffect(() => {
    //Prevents FoUC (Flash of Unstylized Content) by not refreshing on first mount
    if (!isMounted.current) { isMounted.current = true; return }

    //Toggle Daisy UI colors (e.g. bg-base-###)
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light')

    //Toggle standard Tailwind colors (e.g. bg-sky-800)
    darkMode
      ? document.documentElement.classList.add('dark')
      : document.documentElement.classList.remove('dark')
  }, [darkMode])

  return (
    <>
      <div className="relative bg-sky-800 py-2 text-center lg:px-4">
        <div
          className="flex items-center bg-sky-900/50 p-2 leading-none text-sky-100 lg:inline-flex lg:rounded-full"
          role="alert"
        >
          <span className="sm:text-md mx-4 flex-auto text-center text-sm font-semibold">
            <label
              className="cursor-pointer text-teal-300"
            // htmlFor="changelog-modal"
            >
              <a
                href="https://discord.gg/qhnqxtphSg"
                target="_blank"
                rel="noopener noreferrer"
              >
                Discord Bot now available. Click here to join!
              </a>
            </label>
          </span>
        </div>
      </div>
      <div className="navbar w-full bg-base-300 px-4 py-4 dark:bg-base-300 lg:px-20">
        <div className="navbar-start text-lg font-semibold uppercase">
          <div className="tabs">
            <span
              className={classNames('tab', 'hover:text-sky-600', {
                'tab-active': router.pathname == '/alarms',
              })}
            >
              <Link href="/alarms">
                <span>{t('alarm-link-text')}</span>
              </Link>
            </span>

            <span
              className={classNames('tab', 'hover:text-sky-600', {
                'tab-active': router.pathname == '/merchants',
              })}
            >
              <Link href="/merchants">
                <span>{t('merchant-link-text')}</span>
              </Link>
            </span>
          </div>
        </div>
        <div className="navbar-center hidden flex-col sm:flex">
          <a className="btn btn-ghost text-xl normal-case">Lost Ark Timer</a>

          <div className="font-mono text-sm uppercase">
            <a
              className="text-teal-600 hover:text-teal-400"
              href="https://discord.gg/beFb23WgNC"
              target="_blank"
              rel="noopener noreferrer"
            >
              Discord
            </a>
            <span className="mx-4"></span>
            <a
              className="text-teal-600 hover:text-teal-400"
              href="https://github.com/cwjoshuak/lostarktimer.app-web"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <span className="mx-4"></span>
            <a
              className="text-teal-600 hover:text-teal-400"
              href="https://www.buymeacoffee.com/lostarktimer"
              target="_blank"
              rel="noopener noreferrer"
            >
              Support
            </a>
          </div>
        </div>
        {/* The previous language selector
        <div className="navbar-end text-right text-lg font-semibold uppercase">
          <IconLanguage />
          <select
            defaultValue={router.locale ?? 'en'}
            className="select select-sm ml-2"
            onChange={(e) => {
              const { pathname, asPath, query } = router
              router.replace({ pathname, query }, asPath, {
                locale: e.target.value,
              })
            }}
          >
            <option value="en">EN</option>
            <option value="zh">ZH</option>
          </select>
        </div>
      */}
        <div className="navbar-end uppercase">
          <div className='dropdown dropdown-end'>
            <label tabIndex={0} className="btn btn-ghost btn-sm"><IconLanguage /><IconChevronDown /></label>
            <ul tabIndex={1} className={'dropdown-content menu shadow bg-base-100 border border-white'}>
              {router.locales?.map((locale, idx, arr) => {
                return (
                  <li
                    role="option"
                    className={
                      classNames('px-4 rounded-none select-none active:bg-base-dropdown active:text-white hover:bg-base-dropdown hover:text-white',
                        { 'bg-sky-600 text-white font-semibold': router.locale === locale },
                      )}
                    onClick={() => {
                      const { pathname, asPath, query } = router
                      router.replace({ pathname, query }, asPath, {
                        locale: arr[idx],
                      })
                    }}>
                    {locale}
                  </li>
                )
              })
              }
            </ul>
          </div>
          <div id="darkModeToggle">
            <button
              className="btn btn-ghost btn-sm ml-2 mr-auto cursor-pointer"
              onClick={() =>
                setDarkMode(!darkMode)
              }
            >
              {darkMode ? <IconMoon /> : <IconSun />}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}


export default NavBar
