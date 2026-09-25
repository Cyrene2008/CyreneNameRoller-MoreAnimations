import fs from 'node:fs/promises'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { readIdentity, cliPath, root } from './plugin-cli.mjs'
import { stagePlugin } from './stage-plugin.mjs'

await import('./generate-animations.mjs')
await import('./verify-animations.mjs')

const { identity } = await readIdentity()
const output = path.join(root, 'dist', `more-animations-${identity.version}.cnrp`)
await fs.mkdir(path.dirname(output), { recursive: true })
const { stage, cleanup } = await stagePlugin()

try {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cliPath, 'pack', stage, '--out', output], { stdio: 'inherit', shell: false })
    child.on('error', reject)
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`cnrp pack exited with ${code}`)))
  })
} finally {
  await cleanup()
}
