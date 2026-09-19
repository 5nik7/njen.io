import fontData from './inter450.json'
import { wordmarkConfig } from './config'

export interface Glyph {
  d: string
  advance: number
  bounds: { x: number; y: number; width: number; height: number }
}

interface Font {
  cap: number
  glyphs: Record<string, Glyph>
}

const { ' ': space, ...drawnGlyphs } = fontData.weights['450'].glyphs
export const font: Font = { cap: fontData.weights['450'].cap, glyphs: drawnGlyphs }
const kern: Record<string, number> = fontData.kern

export function glyphFor(letter: string): Glyph {
  const glyph = font.glyphs[letter]
  if (!glyph) throw new Error(`Missing wordmark glyph: ${letter}`)
  return glyph
}

export const clamp = (value: number) => Math.min(1, Math.max(0, value))
export const mix = (start: number, end: number, progress: number) => start + (end - start) * progress
export function ease(value: number) {
  const p = clamp(value)
  return p * p * (3 - 2 * p)
}

function measureWord(text: string) {
  let cursor = 0
  const chars = [...text].map((letter, index) => {
    if (index) cursor += kern[text[index - 1]! + letter] ?? 0
    const glyph = glyphFor(letter)
    const x = cursor
    cursor += glyph.advance + wordmarkConfig.tracking
    return { x, letter, bounds: glyph.bounds }
  })
  const min = Math.min(...chars.map(char => char.x + char.bounds.x))
  const max = Math.max(...chars.map(char => char.x + char.bounds.x + char.bounds.width))
  return { chars, min, inkWidth: max - min }
}

export const words = {
  short: measureWord('NJEN'),
  first: measureWord('NICK'),
  last: measureWord('JENSEN'),
}

const k = glyphFor('K')
const j = glyphFor('J')
export const wordGap = k.advance - k.bounds.x - k.bounds.width
  + space.advance + j.bounds.x + 2 * wordmarkConfig.tracking
  + (kern['K '] ?? 0) + (kern[' J'] ?? 0)

/** Same radius and visible thickness as the sun; both tips taper at the upper right. */
export function taperedMoon(symbolScale: number) {
  const radius = 10
  const halfWidth = 0.6 / symbolScale
  const start = -31
  const end = 301
  const taper = 36
  const steps = 18
  const bodyStart = start + taper
  const bodyEnd = end - taper
  const point = (angle: number, r: number) => {
    const radians = angle * Math.PI / 180
    return `${(30 + r * Math.cos(radians)).toFixed(4)} ${(16 + r * Math.sin(radians)).toFixed(4)}`
  }
  const outer = (radius + halfWidth).toFixed(5)
  const inner = (radius - halfWidth).toFixed(5)
  let path = `M${point(start, radius)}`
  for (let i = 1; i <= steps; i++) path += `L${point(start + taper * i / steps, radius + halfWidth * ease(i / steps))}`
  path += `A${outer} ${outer} 0 1 1 ${point(bodyEnd, radius + halfWidth)}`
  for (let i = 1; i <= steps; i++) path += `L${point(bodyEnd + taper * i / steps, radius + halfWidth * (1 - ease(i / steps)))}`
  for (let i = 1; i <= steps; i++) path += `L${point(end - taper * i / steps, radius - halfWidth * ease(i / steps))}`
  path += `A${inner} ${inner} 0 1 0 ${point(bodyStart, radius - halfWidth)}`
  for (let i = 1; i <= steps; i++) path += `L${point(bodyStart - taper * i / steps, radius - halfWidth * (1 - ease(i / steps)))}`
  return path + 'Z'
}
