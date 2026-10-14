import { readFile, writeFile, mkdir, rename, open, unlink, realpath } from 'node:fs/promises'
import { resolve, dirname, relative } from 'node:path'
import { pathToFileURL } from 'node:url'
import { execFileSync } from 'node:child_process'
import { performance } from 'node:perf_hooks'
import { PROJECT_ROOT } from './build-data.mjs'
import { importBatchFile, canApplyOnBranch } from './import-species-batch.mjs'
import { createRegistry, parseCsv, validateRegistry, checkRegistry, createTaxonIndex, createQueueConflicts, validDate, validApproval, digest } from './lib/research-pipeline.mjs'
import { createLocalAdapter, confined, readLocal, parseJson, decodeUtf8, inspectPipelineAssets } from './lib/local-research-adapter.mjs'

const help = `Локальный конвейер MURAS (без сетевых запросов):
  init --input список.json|csv --registry data/research/queue.json [--id queue] [--batch-size 25]
  check|report --registry data/research/queue.json [--batch 1] [--report .generated/report.json]
  resume --registry data/research/queue.json
  approve --registry data/research/queue.json --candidate ID --reviewer Имя --date YYYY-MM-DD --reason Причина
  reject --registry data/research/queue.json --candidate ID --reason Причина
  apply --registry data/research/queue.json [--batch 1]
check/report — dry-run; resume — сохранение диагностики и черновиков; apply — только одобренные записи.`

function options(args) {
  const command = args[0], opts = {}
  const allowed = ['input', 'registry', 'id', 'batch-size', 'batch', 'report', 'candidate', 'reviewer', 'date', 'reason']
  for (let i = 1; i < args.length; i += 2) {
    const name = args[i]?.replace(/^--/, '')
    if (!args[i]?.startsWith('--') || !allowed.includes(name) || !args[i + 1] || args[i + 1].startsWith('--') || opts[name] !== undefined) throw new Error('Некорректный/повторяющийся аргумент CLI')
    opts[name] = args[i + 1]
  }
  return { command, opts }
}
function registryPath(root, path) {
  const target = confined(root, path), rel = relative(root, target).replaceAll('\\', '/')
  if (!/^data\/research\/[a-zA-Z0-9_/-]+\.json$/.test(rel)) throw new Error('Реестр должен находиться в data/research/*.json')
  return target
}
function generatedPath(root, path) {
  const target = confined(root, path)
  if (!relative(root, target).replaceAll('\\', '/').startsWith('.generated/')) throw new Error('Результаты конвейера сохраняются только в .generated/')
  return target
}
async function ensureParent(root, target) {
  // Validate existing ancestors before mkdir to prevent symlink/junction writes.
  const actualRoot = await realpath(root)
  const checkParent = (parent, actual) => {
    const normalize = value => process.platform === 'win32' ? value.toLowerCase() : value
    if (normalize(relative(root, parent)) !== normalize(relative(actualRoot, actual))) throw new Error('Запись через symlink/junction запрещена')
    if (resolve(parent) !== resolve(root)) confined(actualRoot, actual)
  }
  let parent = dirname(target)
  while (true) {
    try { checkParent(parent, await realpath(parent)); break }
    catch (error) { if (error.code !== 'ENOENT') throw error; parent = dirname(parent) }
  }
  await mkdir(dirname(target), { recursive: true })
  checkParent(dirname(target), await realpath(dirname(target)))
  try { confined(await realpath(root), await realpath(target)) } catch (error) { if (error.code !== 'ENOENT') throw error }
}
async function atomicJson(root, path, value, { expected, exclusive = false } = {}) {
  const target = confined(root, path)
  await ensureParent(root, target)
  if (exclusive) { await writeFile(target, JSON.stringify(value, null, 2) + '\n', { flag: 'wx' }); return }
  const temp = `${target}.pipeline-pending`
  let owned = false
  try {
    await writeFile(temp, JSON.stringify(value, null, 2) + '\n', { flag: 'wx' }); owned = true
    if (expected !== undefined && digest(await readFile(target)) !== expected) throw new Error('Реестр изменился во время обработки; сохранение отменено')
    await rename(temp, target); owned = false
  } finally { if (owned) await unlink(temp) }
}

export async function runPipeline(root, args) {
  const { command, opts } = options(args)
  if (!command || command === '--help' || command === 'help') return { help }
  if (!['init', 'check', 'report', 'resume', 'approve', 'reject', 'apply'].includes(command)) throw new Error(help)
  const commandOptions = { init: ['input', 'registry', 'id', 'batch-size'], check: ['registry', 'batch', 'report'],
    report: ['registry', 'batch', 'report'], resume: ['registry', 'report'],
    approve: ['registry', 'candidate', 'reviewer', 'date', 'reason'], reject: ['registry', 'candidate', 'reason'], apply: ['registry', 'batch', 'report'] }
  for (const name of Object.keys(opts)) if (!commandOptions[command].includes(name)) throw new Error(`--${name} не поддерживается командой ${command}`)
  registryPath(root, opts.registry)
  if (opts.report) generatedPath(root, opts.report)
  // Branch guard precedes all catalog writes, even when an approved subset is empty.
  if (command === 'apply' && !canApplyOnBranch(execFileSync('git', ['branch', '--show-current'], { cwd: root, encoding: 'utf8' }).trim())) throw new Error('Запись каталога запрещена на этой ветке (включая main)')
  const mutates = ['init', 'resume', 'approve', 'reject', 'apply'].includes(command)
  let lock, expected
  const lockPath = `${registryPath(root, opts.registry)}.pipeline.lock`
  try {
    if (mutates) { await ensureParent(root, lockPath); lock = await open(lockPath, 'wx') }
    if (command === 'init') {
      const bytes = await readLocal(root, opts.input)
      let rows
      if (/\.csv$/i.test(opts.input)) {
        rows = parseCsv(decodeUtf8(bytes)).map(row => {
          for (const key of ['nationalRedBook', 'countryOccurrence', 'taxonomyEvidence', 'taxonomySourceIds', 'sources', 'contradictions', 'missingData', 'materials', 'draft']) {
            if (row[key] !== undefined) row[key] = row[key] ? JSON.parse(row[key]) : undefined
            if (row[key] === undefined) delete row[key]
          }
          return row
        })
      } else { const input = parseJson(bytes); rows = Array.isArray(input) ? input : input.candidates }
      const registry = createRegistry(rows, { registryId: opts.id || 'research-queue', batchSize: opts['batch-size'] === undefined ? 25 : Number(opts['batch-size']) })
      await atomicJson(root, opts.registry, registry, { exclusive: true })
      return { registryId: registry.registryId, candidates: registry.candidates.length, batches: Math.ceil(registry.candidates.length / registry.batchSize), catalogChanged: false }
    }
    const bytes = await readLocal(root, opts.registry), registry = parseJson(bytes)
    expected = digest(bytes); validateRegistry(registry)
    const save = async value => { await atomicJson(root, opts.registry, value, { expected }); expected = digest(await readFile(registryPath(root, opts.registry))) }
    const source = parseJson(await readLocal(root, 'data/species.source.json'))
    const catalogIndex = createTaxonIndex(source), queueConflicts = createQueueConflicts(registry)
    const adapter = createLocalAdapter(root), start = performance.now(), cpu = process.cpuUsage()
    const check = (value, currentSource = source, batchNumber) => checkRegistry(value, currentSource, { adapter,
      validateAssets: s => inspectPipelineAssets(root, s), batchNumber, queueConflicts,
      catalogIndex: currentSource === source ? catalogIndex : undefined })
    if (command === 'reject') {
      const c = registry.candidates.find(c => c.id === opts.candidate)
      if (!c || !opts.reason?.trim()) throw new Error('Нужны существующий --candidate и --reason')
      c.state = 'rejected'; c.rejectionReason = opts.reason; c.approval = null
      c.diagnostics = { ...c.diagnostics, candidateId: c.id, state: c.state, errors: [opts.reason] }; await save(registry)
      return { candidateId: c.id, state: c.state, reason: c.rejectionReason, catalogChanged: false }
    }
    if (command === 'approve') {
      if (!opts.reviewer?.trim() || !opts.reason?.trim() || !validDate(opts.date)) throw new Error('Явное одобрение требует --reviewer, --date YYYY-MM-DD, --reason')
      const checked = await check(registry), c = checked.registry.candidates.find(c => c.id === opts.candidate)
      if (!c || !['ready_for_review', 'approved_for_import'].includes(c.state)) throw new Error(`Кандидат не готов к одобрению: ${c?.diagnostics?.errors.join('; ') || opts.candidate}`)
      c.approval = { decision: 'approve', reviewer: opts.reviewer, reviewedAt: opts.date, reason: opts.reason, fingerprint: c.checkedFingerprint }
      c.state = 'approved_for_import'; c.diagnostics.state = c.state; await save(checked.registry)
      return { candidateId: c.id, state: c.state, verified: false, catalogChanged: false }
    }
    let checked
    const applications = []
    if (command === 'resume') {
      // Each batch is a checkpoint. Re-run is idempotent; stale diagnostics never skip final checks.
      let current = registry
      for (let number = 1; number <= Math.ceil(registry.candidates.length / registry.batchSize); number++) {
        const part = await check(current, source, number)
        for (const b of part.batches) await atomicJson(root, `.generated/bulk-pipeline/${registry.registryId}/batch-${b.number}.json`, b.drafts)
        await save(part.registry); current = part.registry
      }
      checked = await check(current)
    } else checked = await check(registry, source, opts.batch === undefined ? undefined : Number(opts.batch))
    if (command === 'apply') {
      for (const b of checked.batches) {
        if (!b.approved.records.length) continue
        const path = `.generated/bulk-pipeline/${registry.registryId}/approved-${b.number}.json`
        await atomicJson(root, path, b.approved)
        const applied = await importBatchFile(root, path, { apply: true, expectedBatchSha256: digest(JSON.stringify(b.approved, null, 2) + '\n') })
        applications.push(applied)
        for (const result of applied.results) {
          const c = checked.registry.candidates.find(c => c.id === result.candidateId)
          if (['added', 'unchanged'].includes(result.status)) { c.state = 'imported'; c.importedFingerprint = c.checkedFingerprint }
          else { c.state = 'rejected'; c.diagnostics.errors.push(...result.errors) }
        }
        await save(checked.registry)
      }
      // Recover an interruption between catalog rename and registry checkpoint only
      // when the prior reviewed record is byte-logically identical, using importer validation.
      const latest = parseJson(await readLocal(root, 'data/species.source.json'))
      for (const c of checked.registry.candidates.filter(c => c.state === 'rejected' && c.approval)) {
        const existing = latest.catalog.find(s => s.id === c.id)
        if (!existing) continue
        const recovery = structuredClone(checked.registry)
        const recovering = recovery.candidates.find(r => r.id === c.id)
        recovering.importedFingerprint = c.approval.fingerprint
        const verified = await check(recovery, latest)
        const r = verified.report.results.find(r => r.candidateId === c.id)
        if (r?.state === 'imported' && validApproval(c, r.fingerprint)) {
          c.importedFingerprint = r.fingerprint; c.state = 'imported'; c.diagnostics = r
        }
      }
      await save(checked.registry)
      checked = await check(checked.registry, latest, opts.batch === undefined ? undefined : Number(opts.batch))
      await save(checked.registry)
    }
    checked.report.metrics = { durationMs: Number((performance.now() - start).toFixed(2)), cpu: process.cpuUsage(cpu),
      memory: process.memoryUsage(), localMaterialReads: adapter.reads }
    if (applications.length) checked.report.applications = applications
    if (opts.report) await atomicJson(root, opts.report, checked.report)
    else if (mutates) await atomicJson(root, `.generated/bulk-pipeline/${registry.registryId}/report.json`, checked.report)
    return checked.report
  } finally { if (lock) { await lock.close(); await unlink(lockPath) } }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const result = await runPipeline(PROJECT_ROOT, process.argv.slice(2))
    console.log(result.help || JSON.stringify(result, null, 2))
    if (result.counts?.rejected || result.applications?.some(r => r.counts.rejected)) process.exitCode = 2
  } catch (error) { console.error(`Конвейер: ${error.message}`); process.exitCode = 1 }
}
