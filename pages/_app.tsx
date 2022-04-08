import '../styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import Script from 'next/script'
import { ChangeLogModal, GitHubModal, SideBar } from '../components'
import { appWithTranslation } from 'next-i18next'
import { IconBrandTwitch } from '@tabler/icons'
import { SWRConfig } from 'swr'
import NavBar from '../components/NavBar'

function MyApp({ Component, pageProps, ...AppProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Lost Ark Timer</title>
        <link rel="icon" href="/favicon.ico" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=0.35"
        />
        <meta property="og:title" content="Lost Ark Timer" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.lostarktimer.app/" />
        <meta
          property="og:image"
          content="https://www.lostarktimer.app/images/LA_Mokko_seed.png"
        />
        <meta
          name="og:description"
          content="Lost Ark Timer - Alarms for Lost Ark bosses, islands, events and more."
        />
        <meta
          name="description"
          content="Lost Ark Timer - Alarms for Lost Ark bosses, islands, events and more."
        />
      </Head>

      <NavBar />
      <ChangeLogModal />
      <GitHubModal />
      <SideBar />

      <SWRConfig
        value={{
          refreshInterval: 30000,
          dedupingInterval: 20000,
          focusThrottleInterval: 20000,
          fetcher: (resource, init) =>
            fetch(resource, init).then((res) => res.json()),
        }}
      >
        <Component className="z-0" {...pageProps} />
      </SWRConfig>
      <footer className="relative bottom-0 z-50 flex h-12 w-full items-center justify-center border-t bg-base-300">
        I might start streaming myself coding the website, just for fun.
        Starting Monday. Follow ={'>'}
        <a
          className="ml-1"
          href="https://www.twitch.tv/delay3d"
          style={{ color: '#6441a5' }}
        >
          <IconBrandTwitch className="inline" /> https://www.twitch.tv/delay3d
        </a>
      </footer>
      <div className="relative w-screen"></div>
      {process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? (
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token": "a4240e015e2044669726099a04d1e7a7"}'
          strategy="afterInteractive"
          onError={(e) => {
            console.error('Script failed to load', e)
          }}
        />
      ) : null}
      {process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? (
        <>
          <Script
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon='{"token": "a4240e015e2044669726099a04d1e7a7"}'
            strategy="afterInteractive"
            onError={(e) => {
              console.error('Script failed to load', e)
            }}
          />
          <Script
            src="https://www.googletagmanager.com/gtag/js?id=G-Z2D1S06JHH"
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-Z2D1S06JHH');`}
          </Script>{' '}
        </>
      ) : null}
    </>
  )
}
export default appWithTranslation(MyApp)
