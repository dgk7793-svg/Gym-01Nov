import { useTheme } from '../context/ThemeContext'

// Recharts draws SVG attributes, which can't read CSS variables, so resolve colors per theme here.
export default function useChartTheme() {
  const { theme } = useTheme()
  const dark = theme === 'dark'
  return {
    dark,
    grid: dark ? 'rgba(255,255,255,0.06)' : 'rgba(13,16,21,0.07)',
    axis: dark ? '#8A94A0' : '#5C6470',
    cursor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(13,16,21,0.04)',
  }
}
