import { readFileSync } from 'node:fs'
import { checkoutBytesMatching } from '../../scripts/lib/historical-checksum.mjs'
import { gitShow } from '../../scripts/lib/git-history.mjs'

// These files are pinned by older publication receipts and changed by Step A.
// Require the exact migrated code before checking the original receipt against
// the historical bytes. No scientific or media path belongs in this table.
const approved = new Map([
  ['tests/map-activation.test.mjs', '5f34ef52d4edef592e034c215ede95365a36fa13b2c3ba85ca778a83bdfb09b0'],
  ['data/research/population-184/validate.py', '1ebf72a1e9219ad603013bf3f5b0c971bcb8c27f552e2748a356d3267eb5296b'],
  ['scripts/research-map-distribution.py', '73cabe0f519fa7a01fd463abf42bb9ac5cfd1619b92478c70c75eac29436b16d'],
  ['scripts/validate-catalog-181-preparation.mjs', 'd2092c4877a22159fdaaacea6b4da5bcbbc450c5aa89c915745af7f05388728d'],
  ['scripts/validate-catalog-200-conflicts.mjs', 'd3d369ef5abac73ea6bad4bc9890e9d80bb8d411ac91ea84c772f7edeeba5c46'],
  ['scripts/validate-catalog-200-inventory.mjs', '53b020e7fd9da850d8e4a33bdd21b92990e63d26d83014d37ff6320dc3341fb3'],
  ['tests/catalog-184-photo-batch-1.test.mjs', 'b4f6d0d5e7f2bc5cda0c53002b47c37abd91ecc628b6c4fd8a416a3e2abcf578'],
  ['tests/catalog-184-photo-batch-2.test.mjs', '9146b7aef7b3f0987a3cf805fa39169cfb31433009ac2fd782f36ae65fb56772'],
])

export function historyMigrationBytes(sha, path, live) {
  const fingerprint = approved.get(path)
  if (!fingerprint) return null
  const bytes = live ?? readFileSync(new URL('../../' + path, import.meta.url))
  return checkoutBytesMatching(path, bytes, fingerprint) ? gitShow(sha, path) : null
}
