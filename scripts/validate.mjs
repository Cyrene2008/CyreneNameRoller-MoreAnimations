import path from 'node:path'
import { spawn } from 'node:child_process'
import { stagePlugin } from './stage-plugin.mjs'

const { root, stage, cleanup } = await stagePlugin()
const cli = path.join(root, 'node_modules', '@cyrene2008', 'cyrene-name-roller', 'bin', 'cnrp.mjs')

try {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cli, 'validate', stage], { stdio: 'inherit', shell: false })
    child.on('error', reject)
    child.on('exit', code => code === 0 ? resolve() : reject(new Error(`cnrp validate exited with ${code}`)))
  })
} finally {
  await cleanup()
}

