import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, readlinkSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync, gzipSync } from 'node:zlib'

const projectRoot = fileURLToPath(new URL('../../', import.meta.url))
const fixtures = resolve(projectRoot, 'tests/fixtures/history')
const splitNul = bytes => bytes.toString('utf8').split('\0').filter(Boolean)
const digest = bytes => createHash('sha256').update(bytes).digest('hex')
const trees = new Map()
const compressionThreshold = 256 * 1024

function git(root, args, options = {}) {
  return execFileSync('git', args, {
    cwd: root, windowsHide: true, maxBuffer: 32 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe'], ...options,
  })
}

function fixturePath(sha, path) {
  if (!/^[a-f0-9]{40}$/.test(sha) || /[\\:\0]/.test(path) ||
      path.split('/').some(part => !part || part === '.' || part === '..')) {
    throw new Error('Expected a full Git commit SHA and a repository-relative path')
  }
  return resolve(fixtures, sha, path)
}

function readFixture(path) {
  try {
    return readFileSync(path)
  } catch (error) {
    if (error.code !== 'ENOENT' && error.code !== 'ENOTDIR') throw error
    return null
  }
}

const compressedPath = (sha, path) => fixturePath(sha, '.gzip/' + path + '.gz')

function readBlob(sha, path) {
  const plain = readFixture(fixturePath(sha, path))
  if (plain !== null) return plain
  const compressed = readFixture(compressedPath(sha, path))
  return compressed === null ? null : gunzipSync(compressed)
}

function record(path, bytes) {
  if (process.env.MURAS_RECORD_HISTORY !== '1') return
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, bytes)
}

function readHistory(root, sha, args) {
  try {
    return git(root, args)
  } catch (error) {
    throw new Error(
      'Cannot read history for ' + sha + '. Use a full checkout to record any missing fixtures.\n' +
      (error.stderr?.toString().trim() || error.message),
      { cause: error },
    )
  }
}

export function gitShow(sha, path, { root = projectRoot } = {}) {
  const recorded = readBlob(sha, path)
  if (recorded !== null) return recorded
  const bytes = readHistory(root, sha, ['show', sha + ':' + path])
  if (process.env.MURAS_RECORD_HISTORY === '1' && (bytes.length >= compressionThreshold || /(?:^|\/)\.git(?:attributes|ignore)$/.test(path))) {
    record(compressedPath(sha, path), gzipSync(bytes))
  } else {
    record(fixturePath(sha, path), bytes)
  }
  return bytes
}

// Hash-only comparisons do not need another checked-in copy of a photo.
export function gitSha256(sha, path, { root = projectRoot } = {}) {
  const recorded = readBlob(sha, path)
  if (recorded !== null) return digest(recorded)
  const receipt = fixturePath(sha, '.sha256/' + path + '.sha256')
  const savedHash = readFixture(receipt)
  if (savedHash !== null) {
    const value = savedHash.toString('ascii').trim()
    if (!/^[a-f0-9]{64}$/.test(value)) throw new Error('Invalid history receipt: ' + receipt)
    return value
  }
  const value = digest(readHistory(root, sha, ['show', sha + ':' + path]))
  record(receipt, value + '\n')
  return value
}

function historicalTree(sha, root) {
  const fixture = fixturePath(sha, '.tree.json')
  const key = root + '\0' + sha
  if (trees.has(key)) return trees.get(key)
  const recorded = readFixture(fixture)
  const lines = recorded === null
    ? splitNul(readHistory(root, sha, ['ls-tree', '-rtz', '--full-tree', sha]))
    : JSON.parse(recorded)
  if (recorded === null && process.env.MURAS_RECORD_HISTORY === '1') {
    record(fixture, JSON.stringify(lines, null, 2) + '\n')
  }
  const tree = new Map(lines.map(line => {
    const tab = line.indexOf('\t')
    const [mode, type, oid] = line.slice(0, tab).split(' ')
    return [line.slice(tab + 1), { mode, type, oid }]
  }))
  trees.set(key, tree)
  return tree
}

export function gitExists(sha, path, { root = projectRoot } = {}) {
  try {
    if (readBlob(sha, path) !== null) return true
  } catch (error) {
    if (error.code !== 'EISDIR') throw error
  }
  return historicalTree(sha, root).has(path)
}

// Without a commit, inspect the current index. Read-only audit tests must cover
// files newly staged since the last commit, just as with git ls-files.
export function gitListFiles(sha, { root = projectRoot } = {}) {
  if (sha === undefined) return splitNul(git(root, ['ls-files', '-z']))
  return [...historicalTree(sha, root)].filter(([, entry]) => entry.type !== 'tree').map(([path]) => path)
}

// Compare the recorded tree to today's tracked worktree, including staged and
// unstaged changes, and ignore untracked files like git diff <base> does.
export function gitChangesSince(sha, paths = [], { root = projectRoot } = {}) {
  const baseline = historicalTree(sha, root)
  const index = new Map(splitNul(git(root, ['ls-files', '--stage', '-z', '--', ...paths])).map(line => {
    const tab = line.indexOf('\t')
    const [mode, oid, stage] = line.slice(0, tab).split(' ')
    return [line.slice(tab + 1), { mode, oid, stage }]
  }))
  const raw = splitNul(git(root, ['diff-files', '--raw', '--no-renames', '-z', '--', ...paths]))
  const unstaged = new Map()
  for (let i = 0; i < raw.length; i += 2) {
    const [, mode, , , status] = raw[i].split(' ')
    unstaged.set(raw[i + 1], { mode, status })
  }

  const scope = path => paths.length === 0 || paths.some(prefix => path === prefix || path.startsWith(prefix + '/'))
  const candidates = new Set(index.keys())
  for (const [path, entry] of baseline) {
    if (entry.type !== 'tree' && scope(path)) candidates.add(path)
  }
  const changes = []
  for (const path of [...candidates].sort()) {
    const entry = baseline.get(path)
    const before = entry?.type === 'tree' ? undefined : entry
    const staged = index.get(path)
    const worktree = unstaged.get(path)
    if (staged && staged.stage !== '0') {
      changes.push({ path, status: 'U' })
      continue
    }
    if (!staged || worktree?.mode === '000000') {
      if (before) changes.push({ path, status: 'D' })
      continue
    }
    const mode = worktree?.mode ?? staged.mode
    if (!before) {
      changes.push({ path, status: 'A' })
    } else if (mode.slice(0, 2) !== before.mode.slice(0, 2)) {
      changes.push({ path, status: 'T' })
    } else {
      let oid = staged.oid
      if (worktree && mode.startsWith('100')) {
        oid = git(root, ['hash-object', '--path=' + path, '--', path]).toString().trim()
      } else if (worktree && mode === '120000') {
        oid = git(root, ['hash-object', '--stdin'], {
          input: readlinkSync(resolve(root, path), { encoding: 'buffer' }),
        }).toString().trim()
      }
      if (mode !== before.mode || oid !== before.oid || (worktree && mode === '160000')) {
        changes.push({ path, status: 'M' })
      }
    }
  }
  return changes
}

// The Python maintenance scripts use the same fixtures and Git fallback.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [command, sha, path] = process.argv.slice(2)
  if (command === 'show') process.stdout.write(gitShow(sha, path))
  else if (command === 'exists') process.stdout.write(JSON.stringify(gitExists(sha, path)))
  else if (command === 'list') process.stdout.write(JSON.stringify(gitListFiles(sha)))
  else if (command === 'changes') process.stdout.write(JSON.stringify(gitChangesSince(sha)))
  else throw new Error('Expected show, exists, list or changes')
}
