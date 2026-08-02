export function createVisualLoopController({
  now = () => performance.now(),
  setTimer = (callback, delay) => setTimeout(callback, delay),
  clearTimer = handle => clearTimeout(handle),
  onStart = () => {},
  onFrame,
  onStop = () => {},
  frameDelay = 16
}) {
  if (typeof onFrame !== 'function') throw new TypeError('onFrame is required')

  let running = false
  let timer = null
  let generation = 0

  function schedule(activeGeneration) {
    if (!running || activeGeneration !== generation || timer !== null) return
    timer = setTimer(() => {
      timer = null
      tick(activeGeneration)
    }, frameDelay)
  }

  function tick(activeGeneration) {
    if (!running || activeGeneration !== generation) return
    onFrame(now())
    schedule(activeGeneration)
  }

  function start() {
    if (running) return false
    running = true
    generation += 1
    const activeGeneration = generation
    onStart(now())
    tick(activeGeneration)
    return true
  }

  function stop() {
    const changed = running || timer !== null
    running = false
    generation += 1
    if (timer !== null) clearTimer(timer)
    timer = null
    onStop()
    return changed
  }

  return Object.freeze({
    start,
    stop,
    isRunning: () => running,
    hasScheduledFrame: () => timer !== null
  })
}

