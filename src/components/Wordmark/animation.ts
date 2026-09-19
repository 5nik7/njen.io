import { introTiming as timing, wordmarkConfig as config } from './config'
import { clamp, ease, font, glyphFor, mix, taperedMoon, wordGap, words } from './geometry'
import type { Glyph } from './geometry'

type Position = readonly [keyof typeof words, number]
type Attributes = Record<string, string | number>

interface Options {
  scene: HTMLElement
  brand: HTMLDivElement
  svg: SVGSVGElement
  nameButton: HTMLButtonElement
  modeButton: HTMLButtonElement
  prefix: string
  onExpandedChange: (expanded: boolean) => void
  onAnnouncement: (message: string) => void
}

export interface WordmarkController {
  settleIntro: () => void
  destroy: () => void
}

function attributes(element: Element, values: Attributes) {
  for (const [key, value] of Object.entries(values)) element.setAttribute(key, String(value))
}

function svgElement<K extends keyof SVGElementTagNameMap>(tag: K, values: Attributes, parent: Element) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', tag)
  attributes(element, values)
  parent.append(element)
  return element
}

function boxStyle(element: HTMLElement, values: Record<string, number>) {
  for (const [key, value] of Object.entries(values)) element.style.setProperty(key, `${value}px`)
}

function required<T extends Element>(parent: Element, selector: string): T {
  const node = parent.querySelector<T>(selector)
  if (!node) throw new Error(`Missing wordmark element: ${selector}`)
  return node
}

/**
 * React owns the controls and lifecycle; this renderer owns only the animated
 * SVG subtree and button positions. No React renders are needed per frame.
 */
export function createWordmarkController(options: Options): WordmarkController {
  const { scene, brand, svg, nameButton, modeButton, prefix, onExpandedChange, onAnnouncement } = options
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  const symbol = required<SVGSVGElement>(modeButton, '.theme-symbol')
  const symbolI = required<SVGPathElement>(symbol, '.theme-i')
  const symbolO = required<SVGGElement>(symbol, '.theme-o')
  const moon = required<SVGPathElement>(symbol, '.theme-moon')
  const defs = svgElement('defs', {}, svg)

  function letteringGradient(name: string, a: string, b: string) {
    const id = `${prefix}-${name}`
    const gradient = svgElement('linearGradient', {
      id, gradientUnits: 'userSpaceOnUse', x1: 0, y1: -font.cap, x2: 0, y2: 0,
    }, defs)
    svgElement('stop', { offset: '0%', 'stop-color': `var(${a})` }, gradient)
    svgElement('stop', { offset: '100%', 'stop-color': `var(${b})` }, gradient)
    return `url(#${id})`
  }

  const sharedGradient = letteringGradient('shared', '--shared-a', '--shared-b')
  const extraGradient = letteringGradient('extra', '--extra-a', '--extra-b')
  const accentId = `${prefix}-accent`
  const frameGradient = svgElement('linearGradient', { id: accentId, gradientUnits: 'userSpaceOnUse' }, defs)
  ;[0, 38, 68, 100].forEach((offset, index) =>
    svgElement('stop', { offset: `${offset}%`, 'stop-color': `var(--accent-${index + 1})` }, frameGradient),
  )
  const accent = `url(#${accentId})`
  const panel = svgElement('rect', { class: 'wordmark-panel' }, svg)
  const frame = svgElement('rect', {
    class: 'wordmark-frame', 'stroke-width': config.frameWidth, pathLength: 1, 'data-outer-frame': '',
  }, svg)
  const divider = svgElement('path', {
    class: 'wordmark-frame', 'stroke-width': config.frameWidth, pathLength: 1, 'stroke-dasharray': 1,
  }, svg)
  const trace = svgElement('path', {
    class: 'wordmark-trace', pathLength: 1, 'stroke-dasharray': 1, stroke: accent, opacity: 0,
  }, svg)
  const point = svgElement('circle', { class: 'wordmark-point', r: 1.6, fill: accent, opacity: 0 }, svg)
  const layer = svgElement('g', { 'data-letters': '' }, svg)

  interface AnimatedGlyph {
    holder: SVGGElement
    reveal: SVGRectElement
    info: Glyph
    source: Position
    destination: Position
    kind: 'shared' | 'new'
    order: number
  }
  const glyphs: AnimatedGlyph[] = []

  function add(letter: string, source: Position, destination: Position, kind: 'shared' | 'new', order: number) {
    const holder = svgElement('g', {}, layer)
    const clipId = `${prefix}-reveal-${glyphs.length}`
    const clip = svgElement('clipPath', { id: clipId, clipPathUnits: 'userSpaceOnUse' }, defs)
    const reveal = svgElement('rect', {}, clip)
    const info = glyphFor(letter)
    svgElement('path', {
      class: 'wordmark-glyph', d: info.d, fill: kind === 'shared' ? sharedGradient : extraGradient,
      'clip-path': `url(#${clipId})`, 'data-kind': kind, 'data-letter': letter,
    }, holder)
    glyphs.push({ holder, reveal, info, source, destination, kind, order })
  }

  add('N', ['short', 0], ['first', 0], 'shared', 0)
  add('J', ['short', 1], ['last', 0], 'shared', 1)
  add('E', ['short', 2], ['last', 1], 'shared', 2)
  add('N', ['short', 3], ['last', 2], 'shared', 3)
  add('I', ['first', 1], ['first', 1], 'new', 0)
  add('C', ['first', 2], ['first', 2], 'new', 1)
  add('K', ['first', 3], ['first', 3], 'new', 2)
  add('S', ['last', 3], ['last', 3], 'new', 3)
  add('E', ['last', 4], ['last', 4], 'new', 4)
  add('N', ['last', 5], ['last', 5], 'new', 5)

  const paddingX = config.paddingX / (config.fontSize / 40)
  const paddingY = config.paddingY / (config.fontSize / 40)
  const suffixWidth = config.symbolWidth + paddingX * 2
  const shortWidth = words.short.inkWidth + config.symbolWidth + paddingX * 4
  const fullWidth = words.first.inkWidth + wordGap + words.last.inkWidth + paddingX * 2
  let width = 1
  let scale = 1
  let svgHeight = 105
  let progress = 0
  let target = 0
  let cornerX = 0
  let cornerY = 0
  let animationFrame = 0
  let introFrame = 0
  let lastMoonScale = 0
  let introActive = !motion.matches
  let introElapsed = 0
  let introStage = introActive ? 'draw' : 'complete'

  function updateControls() {
    nameButton.setAttribute('aria-pressed', String(Boolean(target)))
    nameButton.setAttribute('aria-label', target ? 'Nick Jensen. Collapse to NJEN' : 'NJEN. Expand to Nick Jensen')
    onExpandedChange(Boolean(target))
  }

  function paint() {
    const travel = ease((progress - 0.1) / 0.6)
    const frameDraw = introActive ? ease((introElapsed - timing.frameAt) / timing.frameDuration) : 1
    const dividerDraw = introActive ? ease((introElapsed - timing.frameAt - 270) / 160) : 1
    const modeReveal = introActive ? ease((introElapsed - timing.ioAt) / timing.ioDuration) : 1
    const bareShift = introActive ? (1 - frameDraw) * suffixWidth * scale / 2 : 0
    const baseline = svgHeight / 2 + font.cap * scale / 2
    const frameWidth = mix(shortWidth, fullWidth, travel) * scale
    const left = (width - frameWidth) / 2
    const top = baseline - (font.cap + paddingY) * scale
    const height = (font.cap + 2 * paddingY) * scale
    const bottom = top + height
    const right = left + frameWidth
    const slide = ease((progress - 0.07) / 0.55)
    const lift = ease((progress - 0.02) / 0.52)
    const compact = ease((progress - 0.04) / 0.58)
    const startX = (width - shortWidth * scale) / 2 + (shortWidth - suffixWidth / 2) * scale
    const modeWidth = mix(suffixWidth * scale, config.cornerButtonSize, compact)
    const modeHeight = mix(Math.max(config.cornerButtonSize, height), config.cornerButtonSize, compact)
    const nameWidth = frameWidth - suffixWidth * scale * (1 - travel)
    const nameHeight = Math.max(44, height)
    boxStyle(nameButton, {
      left: left + bareShift * (1 - travel), top: (svgHeight - nameHeight) / 2, width: nameWidth, height: nameHeight,
    })
    boxStyle(modeButton, {
      left: mix(startX, cornerX, slide) - modeWidth / 2,
      top: mix(svgHeight / 2, cornerY, lift) - modeHeight / 2,
      width: modeWidth, height: modeHeight,
    })

    const symbolScale = mix(scale, 0.72, compact)
    symbol.style.width = `${config.symbolWidth * symbolScale}px`
    symbol.style.height = `${config.symbolHeight * symbolScale}px`
    if (Math.abs(symbolScale - lastMoonScale) > 0.000001) {
      moon.setAttribute('d', taperedMoon(symbolScale))
      lastMoonScale = symbolScale
    }
    const iVisible = 1 - ease(progress / 0.25)
    symbolI.style.opacity = String(iVisible)
    symbolI.setAttribute('transform', `translate(${mix(-2, 0, iVisible)} 0)`)
    symbolO.setAttribute('transform', `translate(${-6 * ease(progress / 0.35)} 0)`)
    symbol.style.transform = `translateY(${mix(4, 0, modeReveal)}px)`
    modeButton.style.opacity = String(modeReveal)
    modeButton.style.visibility = modeReveal > 0 ? 'visible' : 'hidden'
    modeButton.dataset.location = progress === 0 ? 'inline' : progress === 1 ? 'corner' : 'moving'

    for (const rect of [frame, panel]) attributes(rect, { x: left, y: top, width: frameWidth, height })
    frame.style.opacity = panel.style.opacity = frameDraw > 0 ? '1' : '0'
    frame.style.strokeDasharray = frameDraw >= 0.99999 ? 'none' : '1'
    frame.style.strokeDashoffset = String(1 - frameDraw)
    const split = left + (words.short.inkWidth + paddingX * 2) * scale
    const dividerVisible = (1 - ease(progress / 0.24)) * dividerDraw
    divider.setAttribute('d', `M${split} ${top}V${bottom}`)
    divider.style.strokeDashoffset = String(1 - dividerVisible)
    divider.style.opacity = String(dividerVisible)
    trace.setAttribute('d', `M${left} ${top}H${right}V${bottom}H${left}Z`)
    attributes(frameGradient, { x1: left, y1: top, x2: right, y2: bottom })
    const traceProgress = introActive ? frameDraw : ease(progress)
    const alpha = introActive
      ? (frameDraw > 0 && frameDraw < 1 ? 0.9 * Math.sin(Math.PI * frameDraw) : 0)
      : 0.95 * ease(progress / 0.12) * (1 - ease((progress - 0.82) / 0.18))
    trace.style.strokeDashoffset = String(1 - traceProgress)
    trace.style.opacity = String(alpha)
    const distance = traceProgress * 2 * (frameWidth + height)
    let px = left
    let py = top
    if (distance <= frameWidth) px = left + distance
    else if (distance <= frameWidth + height) { px = right; py = top + distance - frameWidth }
    else if (distance <= frameWidth * 2 + height) { px = right - (distance - frameWidth - height); py = bottom }
    else py = bottom - (distance - frameWidth * 2 - height)
    attributes(point, { cx: px, cy: py })
    point.style.opacity = String(alpha > 0 && traceProgress < 1 ? Math.min(1, alpha * 1.5) : 0)

    const shortLeft = (width - shortWidth * scale) / 2
    const fullLeft = (width - fullWidth * scale) / 2
    const origins = {
      short: shortLeft + (paddingX - words.short.min) * scale + bareShift,
      first: fullLeft + (paddingX - words.first.min) * scale,
      last: fullLeft + (paddingX + words.first.inkWidth + wordGap - words.last.min) * scale,
    }
    const position = ([key, index]: Position) => origins[key] + words[key].chars[index]!.x * scale
    for (const glyph of glyphs) {
      const x = mix(position(glyph.source), position(glyph.destination), travel)
      glyph.holder.setAttribute('transform', `translate(${x} ${baseline}) scale(${scale})`)
      let drawn = 1
      if (introActive && glyph.kind === 'shared') drawn = ease((introElapsed - glyph.order * 55) / 420)
      if (glyph.kind === 'new') drawn = ease((progress - 0.38 - glyph.order * 0.04) / 0.42)
      const bounds = glyph.info.bounds
      attributes(glyph.reveal, {
        x: bounds.x - 0.02, y: bounds.y - 0.5, width: (bounds.width + 0.04) * drawn, height: bounds.height + 1,
      })
      glyph.holder.style.opacity = String(drawn > 0 ? 1 : 0)
    }
    brand.dataset.progress = progress.toFixed(4)
    brand.dataset.introPhase = introStage
  }

  function layout() {
    width = Math.max(1, brand.getBoundingClientRect().width)
    scale = Math.min(config.fontSize / 40, (width - 18) / Math.max(shortWidth, fullWidth))
    svgHeight = (font.cap + paddingY * 2) * scale + 16
    brand.style.height = svg.style.height = `${svgHeight}px`
    svg.setAttribute('viewBox', `0 0 ${width} ${svgHeight}`)
    const bounds = brand.getBoundingClientRect()
    const surface = scene.getBoundingClientRect()
    const inset = parseFloat(getComputedStyle(scene).getPropertyValue('--mode-inset'))
    cornerX = surface.right - inset - config.cornerButtonSize / 2 - bounds.left
    cornerY = surface.top + inset + config.cornerButtonSize / 2 - bounds.top
    paint()
  }

  function endIntro(keepProgress = false) {
    if (!introActive) return
    cancelAnimationFrame(introFrame)
    introFrame = 0
    introActive = false
    introStage = 'complete'
    if (!keepProgress) progress = 0
    target = progress >= 0.5 ? 1 : 0
    updateControls()
    paint()
  }

  function finish() {
    progress = target
    animationFrame = 0
    paint()
    onAnnouncement(target ? 'Nick Jensen. Appearance switch is in the top right.' : 'NJEN. IO appearance switch is back in the box.')
  }

  function animate(next: number) {
    cancelAnimationFrame(animationFrame)
    target = next
    updateControls()
    if (motion.matches) { finish(); return }
    const from = progress
    const start = performance.now()
    const duration = Math.max(90, Math.abs(next - from) * (next ? config.expandDuration : config.collapseDuration))
    const tick = (now: number) => {
      const t = clamp((now - start) / duration)
      progress = mix(from, next, t)
      paint()
      if (t < 1) animationFrame = requestAnimationFrame(tick)
      else finish()
    }
    animationFrame = requestAnimationFrame(tick)
  }

  const onNameClick = () => {
    const next = target ? 0 : 1
    endIntro(true)
    animate(next)
  }
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && (target || introActive)) {
      endIntro(true)
      animate(0)
    }
  }
  const onMotionChange = () => {
    if (!motion.matches) return
    if (introActive) endIntro()
    else { cancelAnimationFrame(animationFrame); finish() }
  }
  nameButton.addEventListener('click', onNameClick)
  brand.addEventListener('keydown', onKeyDown)
  motion.addEventListener('change', onMotionChange)
  const resize = new ResizeObserver(layout)
  resize.observe(brand)
  resize.observe(scene)
  updateControls()
  layout()

  if (introActive) {
    const start = performance.now()
    const tick = (now: number) => {
      if (!introActive) return
      introElapsed = Math.min(timing.endAt, now - start)
      let nextTarget = 0
      if (introElapsed < timing.expandAt) {
        progress = 0
        introStage = introElapsed < timing.draw ? 'draw' : 'short-hold'
      } else if (introElapsed < timing.openAt) {
        progress = (introElapsed - timing.expandAt) / config.expandDuration
        nextTarget = 1
        introStage = 'expand'
      } else if (introElapsed < timing.returnAt) {
        progress = 1
        nextTarget = 1
        introStage = 'name-hold'
      } else if (introElapsed < timing.frameAt) {
        progress = 1 - (introElapsed - timing.returnAt) / config.collapseDuration
        introStage = 'return'
      } else {
        progress = 0
        introStage = introElapsed < timing.ioAt ? 'frame' : 'symbols'
      }
      if (target !== nextTarget) { target = nextTarget; updateControls() }
      paint()
      if (introElapsed < timing.endAt) introFrame = requestAnimationFrame(tick)
      else endIntro()
    }
    introFrame = requestAnimationFrame(tick)
  }

  return {
    settleIntro() {
      if (introActive) { endIntro(true); animate(target) }
    },
    destroy() {
      introActive = false
      cancelAnimationFrame(animationFrame)
      cancelAnimationFrame(introFrame)
      resize.disconnect()
      motion.removeEventListener('change', onMotionChange)
      nameButton.removeEventListener('click', onNameClick)
      brand.removeEventListener('keydown', onKeyDown)
      svg.replaceChildren()
    },
  }
}
