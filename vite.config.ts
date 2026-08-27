import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { join, posix, relative, sep } from 'node:path'
import { defineConfig, type Plugin, type ResolvedConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** Every file the built site is made of, as URLs, deepest-first order irrelevant. */
function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

/**
 * Writes dist/sw.js from src/sw.js with the build's real file list injected.
 *
 * The list has to come from the finished bundle rather than from src, because
 * asset filenames carry content hashes — which is also what makes cache-first
 * safe for them, and what gives the worker a build id that changes exactly
 * when the site does.
 */
function offlinePrecache(): Plugin {
  let config: ResolvedConfig
  return {
    name: 'offline-precache',
    apply: 'build',
    configResolved(resolved) {
      config = resolved
    },
    closeBundle() {
      const outDir = join(config.root, config.build.outDir)
      const base = config.base
      const files = walk(outDir)
        .map((f) => relative(outDir, f).split(sep).join(posix.sep))
        .filter((f) => f !== 'sw.js')
        .sort()

      const bytes = files.reduce((sum, f) => sum + statSync(join(outDir, f)).size, 0)
      const url = (f: string) => `${base}${f}`
      // The page itself plus the code to run it: enough to boot with no signal.
      const shell = [base, ...files.filter((f) => f === 'index.html' || /\.(js|css)$/.test(f)).map(url)]
      const assets = [base, ...files.map(url)]
      const build = createHash('sha256').update(files.join('\n')).update(String(bytes)).digest('hex').slice(0, 12)

      const source = readFileSync(join(config.root, 'src/sw.js'), 'utf8')
        .replace('__BUILD__', build)
        .replace('__BASE__', base)
        .replace('__ASSETS__', JSON.stringify(assets))
        .replace('__SHELL__', JSON.stringify(shell))
        .replace('__BYTES__', String(bytes))
      writeFileSync(join(outDir, 'sw.js'), source)
      config.logger.info(
        `offline-precache: sw.js covers ${assets.length} files (${(bytes / 1048576).toFixed(1)} MB), build ${build}`,
      )
    },
  }
}

// base matches the GitHub Pages project path: https://<user>.github.io/times-tables/
export default defineConfig({
  plugins: [react(), offlinePrecache()],
  base: '/times-tables/',
})
