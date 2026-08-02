import { defineVisualSurface, PluginEvents } from '@cyrene2008/cyrene-name-roller/plugin-sdk'
import { createVisualLoopController } from './visual-loop-controller.js'

const DEFAULTS = Object.freeze({
  visualEnabled: true,
  visualMode: 'hybrid',
  intensity: 0.55,
  speed: 0.75
})

let canvas
let context2d
let request
let settings = { ...DEFAULTS }
let width = 1
let height = 1
let dpr = 1
let startedAt = performance.now()
let lastFrame = startedAt
let accent = '#e65cae'
let dark = false
let perfAnimations = true
let reducedMotion = false
let particles = []
let bursts = []
let routeEnergy = 0
let loop
let settingsLoadId = 0

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
const random = (min, max) => min + Math.random() * (max - min)

function hexToRgb(hex) {
  const normalized = String(hex || '').trim().replace('#', '')
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return { r: 230, g: 92, b: 174 }
  return {
    r: parseInt(normalized.slice(0, 2), 16),
    g: parseInt(normalized.slice(2, 4), 16),
    b: parseInt(normalized.slice(4, 6), 16)
  }
}

function rgba(color, alpha) {
  const { r, g, b } = hexToRgb(color)
  return `rgba(${r},${g},${b},${alpha})`
}

async function loadSettings() {
  if (!request) return
  const loadId = ++settingsLoadId
  const saved = await request('storage.read', { key: 'settings' })
  if (!request || loadId !== settingsLoadId) return
  settings = {
    ...DEFAULTS,
    ...(saved || {}),
    intensity: clamp(Number(saved?.intensity ?? DEFAULTS.intensity), 0.2, 1),
    speed: clamp(Number(saved?.speed ?? DEFAULTS.speed), 0.35, 1.5)
  }
  syncParticles()
  reconcileLoop()
}

function makeParticle(seed = Math.random()) {
  return {
    x: random(0, width),
    y: random(0, height),
    radius: random(.65, 2.2),
    alpha: random(.08, .34),
    drift: random(-.18, .18),
    lift: random(.05, .28),
    phase: seed * Math.PI * 2,
    depth: random(.45, 1)
  }
}

function syncParticles() {
  const target = Math.round((18 + Math.sqrt(width * height) / 22) * settings.intensity)
  while (particles.length < target) particles.push(makeParticle(particles.length / Math.max(1, target)))
  if (particles.length > target) particles.length = target
}

function clear() {
  if (context2d && canvas) context2d.clearRect(0, 0, canvas.width, canvas.height)
}

function drawAurora(time) {
  if (!['aurora', 'hybrid'].includes(settings.visualMode)) return
  const intensity = settings.intensity * (dark ? 1 : .72)
  const drift = time * .00008 * settings.speed
  const points = [
    { x: width * (.22 + Math.sin(drift * 7) * .08), y: height * (.28 + Math.cos(drift * 5) * .09), radius: Math.max(width, height) * .5, color: accent },
    { x: width * (.78 + Math.cos(drift * 6) * .07), y: height * (.68 + Math.sin(drift * 4) * .1), radius: Math.max(width, height) * .46, color: dark ? '#628cff' : '#6da7ff' },
    { x: width * (.5 + Math.sin(drift * 3) * .12), y: height * (.5 + Math.cos(drift * 8) * .06), radius: Math.max(width, height) * .34, color: dark ? '#b977ff' : '#c58ae8' }
  ]
  context2d.save()
  context2d.globalCompositeOperation = 'lighter'
  for (const point of points) {
    const gradient = context2d.createRadialGradient(point.x, point.y, 0, point.x, point.y, point.radius)
    gradient.addColorStop(0, rgba(point.color, .052 * intensity + routeEnergy * .025))
    gradient.addColorStop(.45, rgba(point.color, .026 * intensity))
    gradient.addColorStop(1, rgba(point.color, 0))
    context2d.fillStyle = gradient
    context2d.fillRect(0, 0, width, height)
  }
  context2d.restore()
}

function drawParticles(delta, time) {
  if (!['particles', 'hybrid'].includes(settings.visualMode)) return
  const speed = settings.speed * delta * .055
  context2d.save()
  context2d.globalCompositeOperation = 'lighter'
  for (const particle of particles) {
    particle.y -= particle.lift * speed
    particle.x += (particle.drift + Math.sin(time * .00045 + particle.phase) * .08) * speed
    if (particle.y < -8) { particle.y = height + 8; particle.x = random(0, width) }
    if (particle.x < -8) particle.x = width + 8
    if (particle.x > width + 8) particle.x = -8
    const pulse = .72 + Math.sin(time * .0014 + particle.phase) * .28
    const glow = context2d.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.radius * 5)
    glow.addColorStop(0, rgba(accent, particle.alpha * pulse * settings.intensity))
    glow.addColorStop(.25, rgba(accent, particle.alpha * .42 * pulse))
    glow.addColorStop(1, rgba(accent, 0))
    context2d.fillStyle = glow
    context2d.beginPath()
    context2d.arc(particle.x, particle.y, particle.radius * 5, 0, Math.PI * 2)
    context2d.fill()
  }
  context2d.restore()
}

function drawRibbons(time) {
  if (!['ribbons', 'hybrid'].includes(settings.visualMode)) return
  const t = time * .00012 * settings.speed
  context2d.save()
  context2d.globalCompositeOperation = 'lighter'
  context2d.lineCap = 'round'
  for (let index = 0; index < 3; index += 1) {
    const phase = t * (1 + index * .12) + index * 2.1
    const baseY = height * (.24 + index * .27)
    const amplitude = height * (.035 + settings.intensity * .035)
    const gradient = context2d.createLinearGradient(0, baseY, width, baseY)
    gradient.addColorStop(0, rgba(accent, 0))
    gradient.addColorStop(.28, rgba(accent, .035 * settings.intensity))
    gradient.addColorStop(.55, rgba(index === 1 ? '#75a8ff' : accent, .105 * settings.intensity + routeEnergy * .025))
    gradient.addColorStop(1, rgba(accent, 0))
    context2d.strokeStyle = gradient
    context2d.lineWidth = 1.1 + index * .55 + routeEnergy * 1.2
    context2d.beginPath()
    context2d.moveTo(-30, baseY + Math.sin(phase) * amplitude)
    context2d.bezierCurveTo(
      width * .28, baseY + Math.sin(phase + 1.4) * amplitude,
      width * .7, baseY + Math.sin(phase + 3.1) * amplitude,
      width + 30, baseY + Math.sin(phase + 4.6) * amplitude
    )
    context2d.stroke()
  }
  context2d.restore()
}

function drawBursts(delta) {
  if (!bursts.length) return
  context2d.save()
  context2d.globalCompositeOperation = 'lighter'
  for (const burst of bursts) {
    burst.life -= delta
    burst.radius += delta * burst.velocity
    const progress = clamp(burst.life / burst.duration, 0, 1)
    const gradient = context2d.createRadialGradient(burst.x, burst.y, burst.radius * .72, burst.x, burst.y, burst.radius)
    gradient.addColorStop(0, rgba(burst.color, 0))
    gradient.addColorStop(.72, rgba(burst.color, .16 * progress * settings.intensity))
    gradient.addColorStop(1, rgba(burst.color, 0))
    context2d.fillStyle = gradient
    context2d.beginPath()
    context2d.arc(burst.x, burst.y, Math.max(1, burst.radius), 0, Math.PI * 2)
    context2d.fill()
  }
  context2d.restore()
  bursts = bursts.filter(burst => burst.life > 0)
}

function renderFrame(now) {
  const delta = Math.min(50, Math.max(1, now - lastFrame))
  lastFrame = now
  clear()
  routeEnergy = Math.max(0, routeEnergy - delta * .0014)
  drawAurora(now - startedAt)
  drawRibbons(now - startedAt)
  drawParticles(delta, now - startedAt)
  drawBursts(delta)
}

function shouldRun() {
  return !!context2d && settings.visualEnabled !== false && perfAnimations !== false && reducedMotion !== true
}

function reconcileLoop() {
  if (!loop) return
  if (shouldRun()) loop.start()
  else loop.stop()
}

function addBurst(kind = 'draw') {
  if (!shouldRun()) return
  const palette = kind === 'lottery' ? '#ffd078' : kind === 'card' ? '#7bb7ff' : accent
  bursts.push({
    x: width * random(.38, .62),
    y: height * random(.38, .58),
    radius: Math.max(12, Math.min(width, height) * .04),
    velocity: Math.max(width, height) * random(.00018, .00028),
    duration: random(850, 1250),
    life: 1100,
    color: palette
  })
  routeEnergy = Math.max(routeEnergy, .9)
}

defineVisualSurface({
  async activate(surfaceContext) {
    canvas = surfaceContext.canvas
    context2d = canvas.getContext('2d', { alpha: true, desynchronized: true })
    request = surfaceContext.request
    context2d.setTransform(dpr, 0, 0, dpr, 0, 0)
    loop = createVisualLoopController({
      onStart(now) {
        startedAt = now
        lastFrame = now
      },
      onFrame: renderFrame,
      onStop() {
        bursts = []
        routeEnergy = 0
        clear()
      }
    })
    await loadSettings()
    reconcileLoop()
  },

  onResize(viewport) {
    dpr = viewport.dpr || 1
    width = Math.max(1, viewport.width || viewport.pixelWidth / dpr || 1)
    height = Math.max(1, viewport.height || viewport.pixelHeight / dpr || 1)
    if (context2d) context2d.setTransform(dpr, 0, 0, dpr, 0, 0)
    syncParticles()
  },

  async onEvent(event, payload) {
    if (event === 'plugin:storage-changed') return loadSettings()
    if (event === PluginEvents.APP_THEME_CHANGED) {
      accent = payload?.accent || accent
      dark = !!payload?.dark
      if (typeof payload?.perfAnimations === 'boolean') perfAnimations = payload.perfAnimations
      if (typeof payload?.reducedMotion === 'boolean') reducedMotion = payload.reducedMotion
      reconcileLoop()
      return
    }
    if (event === PluginEvents.APP_ROUTE_CHANGED) {
      routeEnergy = Math.max(routeEnergy, .45)
      return
    }
    if (event === PluginEvents.ROLLER_RESULT || event === PluginEvents.DRAW_RESULT) addBurst('roller')
    else if (event === PluginEvents.CARD_RESULT) addBurst('card')
    else if (event === PluginEvents.LOTTERY_RESULT || event === PluginEvents.LOTTERY_ASSIGN_RESULT) addBurst('lottery')
  },

  deactivate() {
    loop?.stop()
    loop = null
    settingsLoadId += 1
    particles = []
    bursts = []
    request = null
    context2d = null
    canvas = null
  }
})
