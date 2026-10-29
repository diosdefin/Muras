import test from 'node:test'
import assert from 'node:assert/strict'
import { UI_V3_FILES, assertUiV3File } from './helpers/ui-v3-preservation.mjs'

test('UI v3 changes exactly the approved presentation sources and preserves original Git blobs', () => {
  assert.equal(UI_V3_FILES.size, 17)
  for (const path of UI_V3_FILES) assert.equal(assertUiV3File(path), true, path)
})
