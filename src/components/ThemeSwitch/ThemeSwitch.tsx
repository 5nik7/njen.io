import { useId } from 'react'
import type { Ref } from 'react'
import type { Theme } from '../../hooks/useTheme'
import './theme-switch.css'

interface Props {
  ref: Ref<HTMLButtonElement>
  theme: Theme
  expanded: boolean
  onToggle: () => void
}

export function ThemeSwitch({ ref, theme, expanded, onToggle }: Props) {
  const gradient = `theme-${useId().replace(/:/g, '')}`
  const nextTheme = theme === 'dark' ? 'light' : 'dark'

  return (
    <button
      ref={ref}
      className="theme-switch"
      type="button"
      onClick={onToggle}
      aria-label={`${expanded ? '' : 'IO: '}Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
    >
      <svg className="theme-symbol" viewBox="0 0 48 32" stroke={`url(#${gradient})`} aria-hidden="true">
        <defs>
          <linearGradient id={gradient} gradientUnits="userSpaceOnUse" x1="0" y1="2" x2="0" y2="30">
            {[0, 38, 68, 100].map((offset, index) => (
              <stop key={offset} offset={`${offset}%`} stopColor={`var(--accent-${index + 1})`} />
            ))}
          </linearGradient>
        </defs>
        <path className="theme-i" d="M4 6V26" />
        <g className="theme-o">
          <g className="theme-sun">
            <circle cx="30" cy="16" r="10" />
            <path d="M30 1.5V3.5M30 28.5V30.5M15.5 16H17.5M42.5 16H44.5M19.747 5.747L21.161 7.161M38.839 7.161L40.253 5.747M19.747 26.253L21.161 24.839M38.839 24.839L40.253 26.253" />
          </g>
          <path className="theme-moon" fill={`url(#${gradient})`} />
        </g>
      </svg>
    </button>
  )
}
