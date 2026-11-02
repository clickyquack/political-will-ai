import { cpSync, existsSync, mkdirSync, rmSync } from 'fs'
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const siteRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const outputDir = join(siteRoot, 'public', 'congress-map')

function resolveCongressMapDir() {
  if (process.env.CONGRESS_MAP_DIR) {
    return resolve(process.env.CONGRESS_MAP_DIR)
  }
  const candidates = [
    join(siteRoot, 'congress-ai-map'),
    join(siteRoot, '..', 'Congress AI Map'),
    join(siteRoot, '..', 'Congress-AI-Map'),
  ]
  for (const dir of candidates) {
    if (existsSync(join(dir, 'package.json'))) return dir
  }
  throw new Error(
    'Congress AI Map not found. Set CONGRESS_MAP_DIR, or clone it next to this repo as "../Congress AI Map", or check out congress-ai-map/ (CI does this automatically).',
  )
}

const mapRoot = resolveCongressMapDir()
console.log(`Building Congress AI Map from ${mapRoot}`)

execSync('npm ci', { cwd: mapRoot, stdio: 'inherit' })
execSync('npm run build', { cwd: mapRoot, stdio: 'inherit' })

const distDir = join(mapRoot, 'dist')
if (!existsSync(join(distDir, 'index.html'))) {
  throw new Error(`Expected ${distDir}/index.html after build`)
}

cpSync(join(distDir, 'index.html'), join(distDir, '404.html'))

rmSync(outputDir, { recursive: true, force: true })
mkdirSync(outputDir, { recursive: true })
cpSync(distDir, outputDir, { recursive: true })

console.log(`Congress map → ${outputDir} (served at /congress-map/)`)
