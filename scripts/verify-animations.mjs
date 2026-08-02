import fs from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const manifest = JSON.parse(await fs.readFile(path.join(root, 'manifest.json'), 'utf8'))
const pack = JSON.parse(await fs.readFile(path.join(root, 'animations', 'signature.json'), 'utf8'))
const expectedTargets = Object.freeze([
  'page.transition',
  'roller.finish',
  'card.deal',
  'card.flip',
  'lottery.finish',
  'global.transition'
])

if (manifest.id !== 'cn.cyrene2008.more-animations' || !/^1\.1\.\d+$/.test(manifest.version)) {
  throw new Error('Unexpected plugin identity or release version')
}
if (manifest.engine?.min !== '1.2.0' || manifest.engine?.max !== '1.2.0') {
  throw new Error('More Animations must target plugin API 1.2.0')
}
if (!Array.isArray(pack.presets) || pack.presets.length < 54) {
  throw new Error('The animation pack must contain at least 54 presets')
}

const ids = new Set()
const counts = Object.fromEntries(expectedTargets.map(target => [target, 0]))
const engines = { gsap: 0, waapi: 0 }
for (const preset of pack.presets) {
  if (ids.has(preset.id)) throw new Error(`Duplicate animation preset id: ${preset.id}`)
  ids.add(preset.id)
  if (!(preset.target in counts)) throw new Error(`Unknown animation target: ${preset.target}`)
  counts[preset.target] += 1

  const definitions = preset.animation ? [preset.animation] : Object.values(preset.variants || {})
  if (!definitions.length) throw new Error(`Preset ${preset.id} has no animation definition`)
  for (const definition of definitions) {
    if (definition.gsap) engines.gsap += 1
    else if (definition.keyframes) engines.waapi += 1
    else throw new Error(`Preset ${preset.id} has an unknown animation engine`)
    if (definition.options?.easing === 'linear') {
      throw new Error(`Preset ${preset.id} uses a linear easing`)
    }
    if (definition.gsap?.options?.ease === 'linear') throw new Error(`Preset ${preset.id} uses a linear GSAP ease`)
  }
}

for (const [target, count] of Object.entries(counts)) {
  if (count < 9) throw new Error(`Animation target ${target} has only ${count} presets`)
}
if (engines.gsap < 18 || engines.waapi < 30) throw new Error(`Expected a substantial mixed-engine pack, got GSAP=${engines.gsap}, WAAPI=${engines.waapi}`)

const selectors = manifest.contributes?.pages
  ?.flatMap(page => page.native?.controls || [])
  .filter(control => control.type === 'animation-select') || []
const selectorTargets = new Set(selectors.map(control => control.target))
for (const target of expectedTargets) {
  if (!selectorTargets.has(target)) throw new Error(`Missing native animation selector for ${target}`)
}

console.log(`Verified ${pack.presets.length} presets (GSAP=${engines.gsap}, WAAPI=${engines.waapi}): ${expectedTargets.map(target => `${target}=${counts[target]}`).join(', ')}`)
