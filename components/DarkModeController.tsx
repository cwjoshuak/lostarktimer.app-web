import { useEffect, useRef } from 'react'
import { IconSun, IconMoon } from '@tabler/icons'
import useLocalStorage from '@olerichter00/use-localstorage'

// Dark Mode Button
const DMButton = () => {
  const isMounted = useRef(false)
  const defaultTheme = () => {
    // Defaults to system theme if unconfigured
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
    <div>
      <button
        className="btn btn-ghost btn-sm ml-2 mr-auto cursor-pointer"
        onClick={() =>
          setDarkMode(!darkMode)
        }
      >
        {darkMode ? <IconMoon /> : <IconSun />}
      </button>
    </div>
  )
}

const DarkModeController = () => {
  return (
    <DMButton />
  )
}

export default DarkModeController 
