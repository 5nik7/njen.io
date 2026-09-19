import { useId, useLayoutEffect, useRef, useState } from 'react'
import type { Theme } from '../../hooks/useTheme'
import { ThemeSwitch } from '../ThemeSwitch/ThemeSwitch'
import { createWordmarkController } from './animation'
import type { WordmarkController } from './animation'
import './wordmark.css'

interface Props {
  theme: Theme
  onToggleTheme: () => void
}

export function Wordmark({ theme, onToggleTheme }: Props) {
  const brandRef = useRef<HTMLDivElement>(null)
  const drawingRef = useRef<SVGSVGElement>(null)
  const nameRef = useRef<HTMLButtonElement>(null)
  const modeRef = useRef<HTMLButtonElement>(null)
  const controller = useRef<WordmarkController | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const prefix = `wordmark-${useId().replace(/:/g, '')}`

  useLayoutEffect(() => {
    if (!brandRef.current || !drawingRef.current || !nameRef.current || !modeRef.current) return
    // A parent's ref may not be attached yet during a child's layout effect.
    // The committed DOM ancestry is already available at this point.
    const scene = brandRef.current.closest<HTMLElement>('[data-wordmark-scene]')
    if (!scene) throw new Error('Wordmark requires a data-wordmark-scene container')
    const instance = createWordmarkController({
      scene,
      brand: brandRef.current,
      svg: drawingRef.current,
      nameButton: nameRef.current,
      modeButton: modeRef.current,
      prefix,
      onExpandedChange: setExpanded,
      onAnnouncement: setAnnouncement,
    })
    controller.current = instance
    return () => { instance.destroy(); controller.current = null }
  }, [prefix])

  return (
    <div ref={brandRef} className="wordmark" role="group" aria-label="Name and appearance">
      <svg ref={drawingRef} className="wordmark-drawing" aria-hidden="true" />
      <button ref={nameRef} className="wordmark-toggle" type="button" aria-label="NJEN. Expand to Nick Jensen" aria-pressed="false" />
      <ThemeSwitch
        ref={modeRef}
        theme={theme}
        expanded={expanded}
        onToggle={() => {
          controller.current?.settleIntro()
          onToggleTheme()
          setAnnouncement(theme === 'dark' ? 'Light mode' : 'Dark mode')
        }}
      />
      <span className="sr-only" role="status">{announcement}</span>
    </div>
  )
}
