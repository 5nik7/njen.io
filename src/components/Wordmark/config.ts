/** Measurements use the 40-unit em of the bundled Inter glyphs. */
export const wordmarkConfig = {
  fontSize: 56,
  frameWidth: 0.5,
  paddingX: 32,
  paddingY: 24,
  // Live header: 24px Inter 450 with -1px tracking.
  tracking: -40 / 24,
  expandDuration: 1000,
  collapseDuration: 650,
  symbolWidth: 48,
  symbolHeight: 32,
  cornerButtonSize: 44,
} as const

const expandAt = 720
const openAt = expandAt + wordmarkConfig.expandDuration
const returnAt = openAt + 1000
const frameAt = returnAt + wordmarkConfig.collapseDuration
const ioAt = frameAt + 330

export const introTiming = {
  draw: 600,
  expandAt,
  openAt,
  returnAt,
  frameAt,
  frameDuration: 430,
  ioAt,
  ioDuration: 280,
  endAt: ioAt + 280,
} as const
