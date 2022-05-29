import { useEffect, useRef } from "react"
import { IconSun, IconMoon } from "@tabler/icons"
import useLocalStorage from "@olerichter00/use-localstorage"
import { useTranslation } from "next-i18next"

// Dark Mode Button
const DMButton = () => {
  const { t } = useTranslation('common')

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
      ? document.documentElement.classList.add("dark")
      : document.documentElement.classList.remove("dark")
  }, [darkMode])

  return (
    <div>
      <button
        className="btn btn-ghost btn-sm ml-2 mr-auto cursor-pointer"
        onClick={(e) =>
          setDarkMode(!darkMode)
        }
        defaultChecked={darkMode}
      >
        {darkMode ? <IconMoon /> : <IconSun />}
      </button>
    </div>
  )
}

// Dark Mode Toggle
const DMToggle = () => {
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
      ? document.documentElement.classList.add("dark")
      : document.documentElement.classList.remove("dark")
  }, [darkMode])
  return (
    <>
      <label>
        <span className="label bg-base-300">
          {darkMode ? <IconMoon /> : <IconSun />}
          <input
            type="checkbox"
            onClick={(e) =>
              setDarkMode((e.target as HTMLInputElement).checked)
            }
            defaultChecked={darkMode}
            className="toggle rotate-180"
          />
        </span>
      </label>
    </>
  )
}

const DarkModeController = () => {
  return (
    <>
      <DMButton />
    </>
  )
}

export default DarkModeController 
