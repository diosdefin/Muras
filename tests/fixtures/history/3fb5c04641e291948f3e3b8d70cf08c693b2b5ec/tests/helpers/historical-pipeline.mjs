import { cp, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { PROJECT_ROOT } from '../../scripts/build-data.mjs'

// Replay historical publication decisions against their actual historical input.
// Later photo edits do not rewrite signed manifests or relax fingerprint checks.
export async function historicalPipeline(source, action) {
  const root = await mkdtemp(join(tmpdir(), 'muras-history-'))
  try {
    for (const path of ['data', 'assets', 'docs/evidence', 'public/licenses']) {
      await mkdir(join(root, path), { recursive: true })
      await cp(join(PROJECT_ROOT, path), join(root, path), { recursive: true })
    }
    await writeFile(join(root, 'data/species.source.json'), JSON.stringify(source, null, 2) + '\n')
    return await action(root)
  } finally {
    if (!root.startsWith(join(tmpdir(), 'muras-history-'))) throw new Error('Unexpected history fixture path')
    await rm(root, { recursive: true, force: true })
  }
}
