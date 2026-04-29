export type DockSide = 'left' | 'right'

export interface DockBounds {
  screenW: number
  screenH: number
  safeTop: number
  safeBottom: number
}

export interface SnapDockPositionOptions extends DockBounds {
  x: number
  y: number
  width: number
}

export interface ResolveDragPositionOptions extends DockBounds {
  startLeft: number
  startTop: number
  deltaX: number
  deltaY: number
  width: number
}

export function getStickyX(side: DockSide, width: number, screenW: number) {
  return side === 'left' ? 0 : Math.max(0, screenW - width)
}

export function clampDockX(x: number, width: number, screenW: number) {
  return Math.min(Math.max(x, 0), Math.max(0, screenW - width))
}

export function clampDockY(y: number, bounds: DockBounds) {
  const minY = bounds.safeTop
  const maxY = bounds.screenH - bounds.safeBottom
  return Math.min(Math.max(y, minY), Math.max(minY, maxY))
}

export function resolveDragPosition(options: ResolveDragPositionOptions) {
  return {
    x: clampDockX(options.startLeft + options.deltaX, options.width, options.screenW),
    y: clampDockY(options.startTop + options.deltaY, options)
  }
}

export function snapDockPosition(options: SnapDockPositionOptions) {
  const side: DockSide = options.x + options.width / 2 < options.screenW / 2 ? 'left' : 'right'

  return {
    side,
    x: getStickyX(side, options.width, options.screenW),
    y: clampDockY(options.y, options)
  }
}
