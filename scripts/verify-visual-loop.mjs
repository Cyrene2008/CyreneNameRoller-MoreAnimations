import assert from 'node:assert/strict'
import { createVisualLoopController } from '../src/visual-loop-controller.js'

let clock = 100
let nextTimerId = 1
let frames = 0
let starts = 0
let clears = 0
const timers = new Map()

const controller = createVisualLoopController({
  now: () => clock,
  setTimer(callback, delay) {
    const id = nextTimerId++
    timers.set(id, { callback, delay })
    return id
  },
  clearTimer(id) {
    timers.delete(id)
  },
  onStart() {
    starts += 1
  },
  onFrame() {
    frames += 1
  },
  onStop() {
    clears += 1
  }
})

function takeTimer() {
  const entry = timers.entries().next().value
  assert.ok(entry, 'expected one scheduled frame')
  timers.delete(entry[0])
  return entry[1]
}

assert.equal(controller.start(), true)
assert.equal(controller.start(), false, 'a running loop must not start twice')
assert.equal(starts, 1)
assert.equal(frames, 1, 'start renders one immediate frame')
assert.equal(timers.size, 1, 'only one frame may be scheduled')
const normalFrame = takeTimer()
assert.equal(normalFrame.delay, 16)
clock += 16
normalFrame.callback()
assert.equal(frames, 2, 'a scheduled frame renders and schedules its successor')
assert.equal(timers.size, 1)
assert.equal(controller.start(), false, 'start remains a no-op while the loop is active')
assert.equal(timers.size, 1)

const pendingBeforeStop = takeTimer().callback
controller.stop()
assert.equal(controller.isRunning(), false)
assert.equal(timers.size, 0)
assert.equal(clears, 1)
pendingBeforeStop()
assert.equal(frames, 2, 'a stale callback must not render after stop')
assert.equal(timers.size, 0, 'a stale callback must not revive a stopped loop')

assert.equal(controller.start(), true, 'preferences restoring should restart the loop')
assert.equal(starts, 2)
assert.equal(timers.size, 1)
const staleFrame = takeTimer().callback
controller.stop()
staleFrame()
assert.equal(timers.size, 0, 'a stale callback must not revive a stopped loop')

assert.equal(controller.start(), true)
assert.equal(controller.start(), false)
assert.equal(timers.size, 1, 'repeated enable signals still produce one timer')
controller.stop()
assert.equal(timers.size, 0)
assert.equal(clears, 3)

console.log('Verified visual loop stop, restart, stale callback, and single-timer behavior')
