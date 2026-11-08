import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'
import yaml from 'js-yaml'
import Ajv from 'ajv'
import addFormats from 'ajv-formats'

const ajv = new Ajv({ allErrors: true })
addFormats(ajv)
const compiled = new Map()
function validatorFor(site) {
  const own = `schema/${site}.schema.json`
  const path = existsSync(own) ? own : 'schema/content.schema.json'
  if (!compiled.has(path)) compiled.set(path, ajv.compile(JSON.parse(readFileSync(path, 'utf8'))))
  return compiled.get(path)
}

const MAX_BYTES = { image: 600 * 1024, video: 15 * 1024 * 1024 }
const isVideo = (p) => /\.(mp4|webm)$/.test(p)

function mediaPaths(node, out = []) {
  if (typeof node === 'string' && /^[a-z0-9_\-/]+\.(jpg|jpeg|png|webp|avif|svg|mp4|webm)$/.test(node) && node.includes('/')) out.push(node)
  else if (Array.isArray(node)) node.forEach((n) => mediaPaths(n, out))
  else if (node && typeof node === 'object') Object.values(node).forEach((n) => mediaPaths(n, out))
  return out
}

let failed = false
const fail = (msg) => { console.error('✗', msg); failed = true }

for (const site of readdirSync('sites')) {
  const file = join('sites', site, 'content.yml')
  if (!existsSync(file)) continue
  const data = yaml.load(readFileSync(file, 'utf8'))
  const validate = validatorFor(site)
  if (!validate(data)) {
    for (const e of validate.errors) fail(`${file} ${e.instancePath || '/'} ${e.message}`)
    continue
  }
  if (data.site !== site) fail(`${file}: "site" (${data.site}) debe coincidir con la carpeta (${site})`)
  for (const p of new Set(mediaPaths(data))) {
    const abs = join('media', p)
    if (!existsSync(abs)) { fail(`${file}: falta el archivo media/${p}`); continue }
    const limit = isVideo(p) ? MAX_BYTES.video : MAX_BYTES.image
    if (statSync(abs).size > limit) fail(`media/${p} pesa más de ${Math.round(limit / 1024)} KB`)
  }
  if (!failed) console.log(`✓ ${file}`)
}

process.exit(failed ? 1 : 0)
