import fs from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const publishFiles = Object.freeze([
  'manifest.json',
  'README.md',
  'LICENSE',
  'assets/icon.svg',
  'animations/signature.json',
  'src/visual-surface.js'
])

export async function stagePlugin() {
  // Keep the staging tree beside the project. Some locked-down Windows
  // environments allow Node to create an OS temp directory but prevent
  // esbuild from traversing its parent while resolving a Worker entry.
  const stage = await fs.mkdtemp(path.join(root, '.cnrp-stage-'))
  for (const relativePath of publishFiles) {
    const source = path.join(root, relativePath)
    const target = path.join(stage, relativePath)
    await fs.mkdir(path.dirname(target), { recursive: true })
    await fs.copyFile(source, target)
  }
  return {
    root,
    stage,
    async cleanup() {
      await fs.rm(stage, { recursive: true, force: true })
    }
  }
}
