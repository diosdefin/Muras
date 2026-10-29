// Research-only formatting. This module is never imported by src/ or public data.
const labels = {
 ru: { unknown: 'Численность неизвестна', range: 'Оценочный диапазон', ci: 'ДИ', uncertainty: 'Диапазон неопределённости', status: 'Источник опубликован; независимая проверка MURAS ожидается' },
 ky: { unknown: 'Саны белгисиз', range: 'Болжолдуу сан аралыгы', ci: 'ишеним аралыгы', uncertainty: 'Белгисиздик аралыгы', status: 'Булак жарыяланган; MURAS көз карандысыз текшерүүсү күтүлүүдө' },
 uz: { unknown: 'Soni nomaʼlum', range: 'Taxminiy son oraligʻi', ci: 'ishonch oraligʻi', uncertainty: 'Noaniqlik oraligʻi', status: 'Manba eʼlon qilingan; MURAS mustaqil tekshiruvi kutilmoqda' },
 en: { unknown: 'Population unknown', range: 'Estimated range', ci: 'CI', uncertainty: 'Uncertainty range', status: 'Source published; independent MURAS review pending' }
}
export function formatDocumentedEstimate(e, language = 'ru') {
 const l = labels[language] || labels.ru, number = n => new Intl.NumberFormat(language, {maximumFractionDigits:10}).format(n)
 const valid = n => typeof n === 'number' && Number.isFinite(n) && n >= 0
 if (!e || !['exact','approximate','range'].includes(e.type)) return {label:l.unknown,kind:'unknown',intervalLabel:null}
 if (e.type==='exact' && (!Number.isSafeInteger(e.value) || e.value<=0 || e.method!=='complete-count')) throw Error('Exact requires documented complete-count')
 if (e.type==='range' && (!valid(e.min) || !valid(e.max) || e.min>e.max || e.value!==null)) throw Error('Invalid range; no midpoint substitution')
 if (e.type!=='range' && (!valid(e.value) || e.min!==null || e.max!==null)) throw Error('Point estimate cannot absorb range bounds')
 const label=(e.type==='range'?`${number(e.min)}–${number(e.max)}`:`${e.type==='approximate'?'≈ ':''}${number(e.value)}`)+` ${e.unit}`
 const interval=e.confidenceInterval||e.uncertaintyInterval
 let intervalLabel=null
 if(interval){
  if(!valid(interval.min)||!valid(interval.max)||interval.min>interval.max)throw Error('Invalid uncertainty interval')
  intervalLabel=e.confidenceInterval?`${number(interval.level*100)}% ${l.ci}: ${number(interval.min)}–${number(interval.max)}`:`${l.uncertainty}: ${number(interval.min)}–${number(interval.max)}`
 }
 return {label,kind:e.type,accuracy:e.type==='range'?l.range:e.type,intervalLabel,status:l.status,territory:e.territory,year:e.year,observationPeriod:e.observationPeriod,publicationYear:e.publicationYear,sourceUrl:e.sourceUrl}
}
export const documentationStatus = e => e.sourceReadiness==='READY_SOURCE_DOCUMENTED' ? 'documented' : 'withheld'
