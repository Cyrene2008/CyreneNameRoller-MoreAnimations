import fs from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const manifest = JSON.parse(await fs.readFile(path.join(root, 'manifest.json'), 'utf8'))
const expected = `v${manifest.version}`
const actual = String(process.env.GITHUB_REF_NAME || process.argv[2] || '')

if (actual !== expected) {
  throw new Error(`Release tag ${actual || '(missing)'} does not match manifest version ${expected}`)
}

console.log(`Verified release tag ${actual}`)

