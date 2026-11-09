import { createHash } from 'node:crypto'

// These receipts captured files written with a CRLF at the last line break.
// Two files have additional documented CRLF positions (one-based).
const finalCRLF = new Set([
  'scripts/prepare-catalog-187.mjs',
  'scripts/validate-catalog-187-preparation.mjs',
  'tests/helpers/population-fixtures.mjs',
  'data/.gitattributes',
  ...['check.mjs','format.mjs','prepare.py','report.py','validate.mjs'].map(name => 'data/research/population-184-bulk/' + name),
  ...['.gitattributes','report.py','verify.mjs'].map(name => 'data/research/population-publication/' + name),
])
const originalCRLF = new Map([
  ['tests/catalog-166-publication.test.mjs', [[22], [23]]],
])
const originalLF = new Map([
  ['tests/catalog-150-publication.test.mjs', [1]],
  ['tests/data.test.mjs', [1, 259, 260, 261]],
])
const additionalCRLF = new Map([
  ['data/.gitattributes', 3],
  ['data/research/population-184-bulk/prepare.py', 78],
])
const checkoutText = new Set([
  'MURAS-UI-100-INSTALL.txt', 'public/robots.txt', 'public/favicon.svg',
  'public/images/placeholder.svg', 'scripts/requirements.txt',
])
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')

// Older receipts recorded the Windows checkout. Reconstruct only line endings
// of known Git text files and require the original digest. Binary assets,
// licence notices and raw backups keep their byte-exact contract.
export function checkoutBytesMatching(path, bytes, expected) {
  if (sha256(bytes) === expected) return bytes
  if (!checkoutText.has(path) && (/^(assets\/|public\/(images|licenses)\/|data\/backups\/)/.test(path) ||
      !/(?:\.(?:[cm]?js|json|vue|py|md|css|html|yml|yaml)|(?:^|\/)\.git(?:attributes|ignore))$/.test(path))) return null
  const text = bytes.toString('utf8')
  const lf = text.replace(/\r\n/g, '\n')
  if (!Buffer.from(text).equals(bytes) || /[\0\r]/.test(lf)) return null
  const crlf = lf.replace(/\n/g, '\r\n')
  if (text !== lf && text !== crlf) return null
  const alternate = Buffer.from(text === lf ? crlf : lf)
  if (sha256(alternate) === expected) return alternate
  if (!lf.endsWith('\n')) return null
  const lines = lf.split('\n')
  const variants = finalCRLF.has(path) ? [[lines.length - 1, additionalCRLF.get(path)]] : originalCRLF.get(path) || []
  for (const positions of variants) {
    const recorded = Buffer.from(lines.map((line,index) => positions.includes(index + 1) ? line + '\r' : line).join('\n'))
    if (sha256(recorded) === expected) return recorded
  }
  // The 28.3 receipt captured these tests in CRLF with a few LF edits.
  const lfLines = originalLF.get(path)
  if (lfLines) {
    const recorded = Buffer.from(lines.map((line,index) =>
      index === lines.length - 1 || lfLines.includes(index + 1) ? line : line + '\r'
    ).join('\n'))
    if (sha256(recorded) === expected) return recorded
  }
  return null
}
