import React, { createContext, useContext, useState, useEffect } from 'react'

interface ThemeContextType {
  theme: 'dark' | 'light'
  toggleTheme: () => void
  accentColor: string
  setAccentColor: (color: string) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const PRESET_ACCENTS = [
  '#10B981', // Emerald (default)
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#06B6D4'  // Cyan
]

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('cr_theme') as 'dark' | 'light') || 'dark'
  })

  const [accentColor, setAccent] = useState<string>(() => {
    return localStorage.getItem('cr_accent') || '#10B981'
  })

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }
    localStorage.setItem('cr_theme', theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor)
    localStorage.setItem('cr_accent', accentColor)
  }, [accentColor])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  const setAccentColor = (color: string) => {
    setAccent(color)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}
