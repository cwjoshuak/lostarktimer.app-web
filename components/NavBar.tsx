import classNames from 'classnames'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useTranslation } from 'next-i18next'
import { IconLanguage } from '@tabler/icons'
const NavBar = () => {
  const { t } = useTranslation('common')

  const router = useRouter()
  return (
    <>
      <div className="relative bg-sky-800 py-2 text-center lg:px-4">
        <div
          className="flex items-center bg-sky-900/50 p-2 leading-none text-sky-100 lg:inline-flex lg:rounded-full"
          role="alert"
        >
          <span className="sm:text-md mx-4 flex-auto text-center text-sm font-semibold">
            <label className="cursor-pointer text-teal-300">
              <a href="https://discord.gg/beFb23WgNC">
                Suggestions {'&'} Feedback: https://discord.gg/beFb23WgNC
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
            <Link href="/merchants">
              <span className="cursor-pointer text-teal-600 hover:text-teal-400">
                Wandering Merchants
              </span>
            </Link>{' '}
            update is here! So is the{' '}
            <a
              className="text-teal-600 hover:text-teal-400"
              href="https://github.com/cwjoshuak/lostarktimer.app-web"
            >
              code
            </a>
            .
          </div>
        </div>
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
      </div>
    </>
  )
}

export default NavBar
