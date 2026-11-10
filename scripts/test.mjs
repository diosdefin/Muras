import { spawnSync } from 'node:child_process'

const result = spawnSync(process.execPath, ['--test', ...process.argv.slice(2), 'tests/*.test.mjs'], {
  stdio: 'inherit',
  windowsHide: true,
})
if (result.error) throw result.error
process.exitCode = result.status ?? 1
