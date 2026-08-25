/**
 * dsh-vmic — host half.
 *
 * Voice input configuration + transcription proxy:
 *   GET  /vmic-config   read config (keys reported as set/unset only)
 *   POST /vmic-config   save provider config + optional api keys (credentials)
 *   GET  /vmic-key?id=  reveal one stored key (eye icon; loopback-only server)
 *   POST /vmic-test     probe one provider with a 0.5s test tone
 *   POST /vmic-asr      transcribe once via the SELECTED provider only
 *   POST /vmic-asr-live/start | /chunk | /stop   volcengine live streaming
 *
 * Provider types:
 *   openai-compatible   chat/completions + input_audio base64 data URL
 *   volcengine-doubao   Volcengine SAUC bigmodel WebSocket binary frames
 */
import { credentialRef } from '@deepseek-ai/dsh-credentials'
import { settingsNamespace } from '@deepseek-ai/dsh-settings'
import s from '@deepseek-ai/schemastery'
import { gzipSync, gunzipSync } from 'node:zlib'
import { randomUUID } from 'node:crypto'

const NS = settingsNamespace('vmic')

/** Preset providers: endpoints and models are built in; users only fill keys. */
const PRESETS = {
  'xiaomi-mimo': {
    type: 'openai-compatible',
    name: '小米 MiMo',
    baseUrl: 'https://api.xiaomimimo.com/v1/chat/completions',
    model: 'mimo-v2.5-asr',
  },
  'volcengine-doubao': {
    type: 'volcengine-doubao',
    name: '火山豆包',
    baseUrl: 'wss://openspeech.bytedance.com/api/v3/sauc/bigmodel',
    model: 'bigmodel',
    resourceId: 'volc.bigasr.sauc.duration',
  },
}

const providerSchema = s.object({
  id: s.string().required(),
  type: s.union(['openai-compatible', 'volcengine-doubao']).required(),
  name: s.string().required(),
  preset: s.boolean().default(true),
  enabled: s.boolean().default(true),
  baseUrl: s.string().default(''),
  model: s.string().default(''),
  live: s.boolean().default(false),
})

/** Default polish prompt; {text} is replaced with the transcribed text. */
const DEFAULT_POLISH_PROMPT = '请在不改变原意的前提下润色以下语音转写文本：修正口语化表达、错别字和标点，使语句通顺自然、简洁清晰。直接输出润色后的文本，不要任何解释。\n原文：{text}'

const polishSchema = s.object({
  enabled: s.boolean().default(false),
  useDeepseekKey: s.boolean().default(true),
  baseUrl: s.string().default('https://api.deepseek.com/v1/chat/completions'),
  model: s.string().default('deepseek-chat'),
  prompt: s.string().default(DEFAULT_POLISH_PROMPT),
  timeoutMs: s.number().min(1000).max(120000).default(30000),
})

const vmicSchema = s.object({
  selectedProvider: s.string().default('xiaomi-mimo'),
  providers: s.array(providerSchema).default([]),
  language: s.string().default('auto'),
  timeoutMs: s.number().min(1000).max(120000).default(30000),
  polish: polishSchema.default({}),
})

/** Credential ref for one provider's key. */
function keyRefOf(id) {
  return credentialRef('VMIC_' + String(id).toUpperCase().replace(/[^A-Za-z0-9]/g, '_') + '_API_KEY')
}

/** Credential refs for the polish feature. */
const POLISH_KEY_REF = credentialRef('VMIC_POLISH_API_KEY')
const DEEPSEEK_KEY_REF = credentialRef('DEEPSEEK_API_KEY')

/** Resolve the effective config for one provider id (preset values merged). */
function resolveProvider(cfg, id) {
  const entry = (cfg.providers ?? []).find((p) => p.id === id)
  const preset = PRESETS[id]
  if (!entry && !preset) return undefined
  if (preset && (!entry || entry.preset)) {
    return {
      id,
      type: preset.type,
      name: preset.name,
      enabled: entry?.enabled !== false,
      baseUrl: entry?.baseUrl || preset.baseUrl,
      model: entry?.model || preset.model,
      live: entry?.live === true,
      resourceId: preset.resourceId,
    }
  }
  return {
    id,
    type: entry.type,
    name: entry.name,
    enabled: entry.enabled !== false,
    baseUrl: entry.baseUrl || '',
    model: entry.model || '',
    live: entry.live === true,
  }
}

/** Read the whole request body as UTF-8 text. */
async function readBody(req) {
  let body = ''
  for await (const chunk of req) {
    body += typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString('utf8')
  }
  return body
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  })
  res.end(JSON.stringify(payload))
}

/** Extract text from openai-compatible responses. */
function extractText(resp) {
  if (!resp || typeof resp !== 'object') return undefined
  const choice = Array.isArray(resp.choices) ? resp.choices[0] : undefined
  if (choice && typeof choice === 'object') {
    const m = choice.message
    if (m && typeof m === 'object') {
      if (typeof m.content === 'string' && m.content) return m.content
      if (Array.isArray(m.content)) {
        const parts = m.content.map((p) => p && typeof p.text === 'string' ? p.text : '').filter(Boolean)
        if (parts.length) return parts.join('')
      }
    }
    if (typeof choice.text === 'string' && choice.text) return choice.text
  }
  for (const key of ['output_text', 'transcript', 'result', 'text']) {
    if (typeof resp[key] === 'string' && resp[key]) return resp[key]
  }
  return undefined
}

/** 0.5s 16kHz mono sine WAV for connectivity tests. */
function makeTestWav() {
  const rate = 16000
  const n = rate / 2
  const dataLen = n * 2
  const buf = Buffer.alloc(44 + dataLen)
  buf.write('RIFF', 0)
  buf.writeUInt32LE(36 + dataLen, 4)
  buf.write('WAVE', 8)
  buf.write('fmt ', 12)
  buf.writeUInt32LE(16, 16)
  buf.writeUInt16LE(1, 20)
  buf.writeUInt16LE(1, 22)
  buf.writeUInt32LE(rate, 24)
  buf.writeUInt32LE(rate * 2, 28)
  buf.writeUInt16LE(2, 32)
  buf.writeUInt16LE(16, 34)
  buf.write('data', 36)
  buf.writeUInt32LE(dataLen, 40)
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.sin((2 * Math.PI * 440 * i) / rate) * 4000), 44 + i * 2)
  }
  return buf
}

function wavToDataUrl(wav) {
  return 'data:audio/wav;base64,' + wav.toString('base64')
}

// ── openai-compatible adapter ─────────────────────────────────────────────

async function transcribeOpenaiCompatible(provider, apiKey, audioDataUrl, timeoutMs) {
  const payload = JSON.stringify({
    model: provider.model,
    messages: [
      { role: 'user', content: [{ type: 'input_audio', input_audio: { data: audioDataUrl } }] },
    ],
    asr_options: { language: 'auto' },
  })
  const upstream = await fetch(provider.baseUrl, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: payload,
    signal: AbortSignal.timeout(timeoutMs),
  })
  const text = await upstream.text()
  if (!upstream.ok) throw new Error(`上游 ${upstream.status}: ${text.slice(0, 300)}`)
  let parsed
  try { parsed = JSON.parse(text) } catch { throw new Error(`响应非 JSON: ${text.slice(0, 300)}`) }
  const recognized = extractText(parsed)
  if (typeof recognized === 'string' && recognized.trim()) return recognized.trim()
  throw new Error(`未识别到文本: ${text.slice(0, 300)}`)
}

// ── volcengine SAUC binary frame protocol ─────────────────────────────────

const MSG_FULL_CLIENT_REQUEST = 0b0001
const MSG_AUDIO_ONLY_REQUEST = 0b0010
const MSG_FULL_SERVER_RESPONSE = 0b1001
const MSG_ERROR = 0b1111
const SERIAL_JSON = 0b0001
const SERIAL_RAW = 0b0000
const COMPRESS_GZIP = 0b0001

function buildHeader(msgType, flags, serialization, compression) {
  return Buffer.from([
    (1 << 4) | 1,
    (msgType << 4) | (flags & 0x0f),
    (serialization << 4) | (compression & 0x0f),
    0x00,
  ])
}

function fullClientRequestFrame(payloadObj) {
  const json = Buffer.from(JSON.stringify(payloadObj), 'utf8')
  const payload = gzipSync(json)
  return Buffer.concat([
    buildHeader(MSG_FULL_CLIENT_REQUEST, 0b0000, SERIAL_JSON, COMPRESS_GZIP),
    uint32(payload.length),
    payload,
  ])
}

function audioOnlyFrame(pcm, final) {
  const flags = final ? 0b0011 : 0b0000
  return Buffer.concat([
    buildHeader(MSG_AUDIO_ONLY_REQUEST, flags, SERIAL_RAW, 0),
    uint32(pcm.length),
    pcm,
  ])
}

function uint32(n) {
  const b = Buffer.alloc(4)
  b.writeUInt32BE(n >>> 0, 0)
  return b
}

/** Parse server frames out of one WebSocket message (may concatenate frames). */
function parseServerFrames(data) {
  const frames = []
  let pos = 0
  while (pos + 4 <= data.length) {
    const msgType = (data[pos + 1] >> 4) & 0x0f
    const flags = data[pos + 1] & 0x0f
    const serialization = (data[pos + 2] >> 4) & 0x0f
    const compression = data[pos + 2] & 0x0f
    pos += 4
    if (msgType === MSG_ERROR) {
      if (pos + 4 > data.length) break
      const code = data.readUInt32BE(pos)
      pos += 4
      if (pos + 4 > data.length) break
      const msgLen = data.readUInt32BE(pos)
      pos += 4
      const message = data.slice(pos, pos + msgLen).toString('utf8')
      pos += msgLen
      frames.push({ msgType, error: `火山错误 ${code}: ${message}` })
      continue
    }
    let sequence
    if (msgType === MSG_FULL_SERVER_RESPONSE) {
      if (pos + 4 > data.length) break
      sequence = data.readInt32BE(pos)
      pos += 4
    }
    if (pos + 4 > data.length) break
    const payloadLen = data.readUInt32BE(pos)
    pos += 4
    if (pos + payloadLen > data.length) break
    let payload = data.slice(pos, pos + payloadLen)
    pos += payloadLen
    if (compression === COMPRESS_GZIP) payload = gunzipSync(payload)
    let payloadObj
    if (serialization === SERIAL_JSON) {
      try { payloadObj = JSON.parse(payload.toString('utf8')) } catch { /* noop */ }
    }
    frames.push({ msgType, flags, sequence, payload, payloadObj })
  }
  return frames
}

/** Volcengine live session: one upstream WebSocket with an open state. */
class VolcSession {
  constructor(provider, apiKey, language) {
    this.provider = provider
    this.apiKey = apiKey
    this.language = language
    this.ws = undefined
    this.final = false
    this.latestText = ''
    this.finalText = ''
    this.error = undefined
    this.done = new Promise((resolve) => { this._settle = resolve })
    this.ready = new Promise((resolve, reject) => { this._ready = resolve; this._fail = reject })
  }

  start() {
    const key = this.apiKey
    const headers = {
      'X-Api-Resource-Id': this.provider.resourceId || 'volc.bigasr.sauc.duration',
      'X-Api-Request-Id': randomUUID(),
      'X-Api-Connect-Id': randomUUID(),
    }
    if (key.includes(':') && key.split(':').length === 2) {
      const [appKey, accessKey] = key.split(':')
      headers['X-Api-App-Key'] = appKey
      headers['X-Api-Access-Key'] = accessKey
    } else {
      headers['X-Api-Key'] = key
    }
    const ws = new WebSocket(this.provider.baseUrl, { headers })
    this.ws = ws
    ws.binaryType = 'nodebuffer'
    ws.onopen = () => {
      try {
        const lang = this.language === 'auto' ? 'zh-CN' : this.language
        const req = {
          user: { uid: 'dsh-vmic' },
          audio: { format: 'pcm', rate: 16000, bits: 16, channel: 1, language: lang },
          request: {
            model_name: this.provider.model || 'bigmodel',
            enable_itn: true,
            enable_punc: true,
            result_type: 'single',
          },
        }
        ws.send(fullClientRequestFrame(req))
        this._ready()
      } catch (err) {
        this._fail(err)
      }
    }
    ws.onerror = (event) => {
      const err = new Error('火山 WebSocket 连接失败: ' + (event && event.message ? event.message : String(event)))
      this.error = err
      this._fail(err)
    }
    ws.onclose = () => {
      if (!this.final) {
        if (!this.error) this.error = new Error('火山连接提前关闭')
        this._settle()
      }
    }
    ws.onmessage = (event) => {
      try {
        const frames = parseServerFrames(Buffer.from(event.data))
        for (const frame of frames) {
          if (frame.error) {
            this.error = new Error(frame.error)
            continue
          }
          if (frame.msgType === MSG_FULL_SERVER_RESPONSE && frame.payloadObj) {
            const text = frame.payloadObj?.result?.text
            if (typeof text === 'string') {
              const isFinal = (frame.flags & 0b0011) === 0b0011 || (frame.flags & 0b0010) === 0b0010
              if (isFinal) this.finalText = text
              else this.latestText = text
              if (isFinal && this.final) this._settle()
            }
          }
        }
      } catch (err) {
        this.error = err
      }
    }
  }

  async sendPcm(pcm, final) {
    await this.ready
    if (this.ws.readyState !== 1) throw new Error('火山 WebSocket 未连接')
    this.ws.send(audioOnlyFrame(pcm, final))
    if (final) {
      this.final = true
      setTimeout(() => this._settle(), 2000).unref?.()
    }
  }

  close() {
    try { this.ws?.close() } catch { /* noop */ }
  }
}

// ── live session registry ─────────────────────────────────────────────────

const liveSessions = new Map()

// ── plugin ────────────────────────────────────────────────────────────────

export const inject = ['webServer', 'settings', 'credentials']

export function apply(ctx, config) {
  const scope = ctx.settings.register(NS, vmicSchema, { base: config ?? {} })
  const baseProviders = [
    { id: 'xiaomi-mimo', preset: true },
    { id: 'volcengine-doubao', preset: true, live: true },
  ]

  const effectiveConfig = () => {
    const cfg = scope.get() ?? {}
    const providers = (cfg.providers && cfg.providers.length > 0 ? cfg.providers : baseProviders)
    return { ...cfg, providers }
  }

  const keyOf = async (id) => {
    const resolved = await ctx.credentials.resolve(keyRefOf(id))
    return resolved?.value
  }

  const describeKey = async (id) => {
    const info = await ctx.credentials.describe(keyRefOf(id))
    return info.configured === true
  }

  const describeRef = async (ref) => {
    const info = await ctx.credentials.describe(ref)
    return info.configured === true
  }

  /** Resolve the API key for polish: reuse DEEPSEEK_API_KEY or a dedicated custom key. */
  const resolvePolishApiKey = async (polish) => {
    if (polish?.useDeepseekKey !== false) {
      if (!(await describeRef(DEEPSEEK_KEY_REF))) {
        throw new Error('未检测到 DeepSeek API Key（credentials 中的 DEEPSEEK_API_KEY）；可在配置面板切换为自定义 Key')
      }
      const resolved = await ctx.credentials.resolve(DEEPSEEK_KEY_REF)
      if (!resolved?.value) throw new Error('DeepSeek API Key 为空')
      return resolved.value
    }
    if (!(await describeRef(POLISH_KEY_REF))) throw new Error('未配置自定义润色 API Key')
    const resolved = await ctx.credentials.resolve(POLISH_KEY_REF)
    if (!resolved?.value) throw new Error('自定义润色 API Key 为空')
    return resolved.value
  }

  /** Run the polish model over one text; returns the polished text. */
  const polishText = async (cfg, text) => {
    const polish = cfg.polish ?? {}
    const apiKey = await resolvePolishApiKey(polish)
    const prompt = String(polish.prompt || DEFAULT_POLISH_PROMPT).replace(/\{text\}/g, text)
    const payload = JSON.stringify({
      model: polish.model || 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是一位专业的文本润色助手，只输出润色后的文本。' },
        { role: 'user', content: prompt },
      ],
    })
    const upstream = await fetch(polish.baseUrl || 'https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: payload,
      signal: AbortSignal.timeout(polish.timeoutMs || 30000),
    })
    const raw = await upstream.text()
    if (!upstream.ok) throw new Error(`润色上游 ${upstream.status}: ${raw.slice(0, 300)}`)
    let parsed
    try { parsed = JSON.parse(raw) } catch { throw new Error(`润色响应非 JSON: ${raw.slice(0, 300)}`) }
    const out = extractText(parsed)
    if (typeof out === 'string' && out.trim()) return out.trim()
    throw new Error(`润色模型未返回文本: ${raw.slice(0, 300)}`)
  }

  // /vmic-config  GET -> read config; POST -> update config/keys
  // The webserver keys its exact-route table by path alone, so both methods
  // must share one registration and dispatch on req.method.
  ctx.webServer.register({
    kind: 'exact',
    path: '/vmic-config',
    handler: async (req, res) => {
      if (req.method === 'GET') {
        const cfg = effectiveConfig()
        const providers = await Promise.all(cfg.providers.map(async (p) => {
          const resolved = resolveProvider(cfg, p.id)
          if (!resolved) return { ...p, keySet: false }
          return {
            id: resolved.id,
            type: resolved.type,
            name: resolved.name,
            preset: Boolean(PRESETS[p.id]),
            enabled: resolved.enabled,
            baseUrl: resolved.baseUrl,
            model: resolved.model,
            live: resolved.live,
            keySet: await describeKey(p.id),
          }
        }))
        const polish = cfg.polish ?? {}
        return sendJson(res, 200, {
          selectedProvider: cfg.selectedProvider,
          providers,
          language: cfg.language,
          timeoutMs: cfg.timeoutMs,
          polish: {
            enabled: polish.enabled === true,
            useDeepseekKey: polish.useDeepseekKey !== false,
            baseUrl: polish.baseUrl || 'https://api.deepseek.com/v1/chat/completions',
            model: polish.model || 'deepseek-chat',
            prompt: polish.prompt || DEFAULT_POLISH_PROMPT,
            timeoutMs: polish.timeoutMs || 30000,
            polishKeySet: await describeRef(POLISH_KEY_REF),
            deepseekKeySet: await describeRef(DEEPSEEK_KEY_REF),
          },
        })
      }
      if (req.method === 'POST') {
        let body
        try { body = JSON.parse(await readBody(req) || '{}') } catch (err) { return sendJson(res, 400, { error: String(err?.message ?? err) }) }
        try {
          const patch = {}
          if (typeof body.selectedProvider === 'string') patch.selectedProvider = body.selectedProvider
          if (Array.isArray(body.providers)) patch.providers = body.providers
          if (typeof body.language === 'string') patch.language = body.language
          if (typeof body.timeoutMs === 'number') patch.timeoutMs = body.timeoutMs
          if (body.polish && typeof body.polish === 'object') {
            const pp = {}
            if (typeof body.polish.enabled === 'boolean') pp.enabled = body.polish.enabled
            if (typeof body.polish.useDeepseekKey === 'boolean') pp.useDeepseekKey = body.polish.useDeepseekKey
            if (typeof body.polish.baseUrl === 'string') pp.baseUrl = body.polish.baseUrl
            if (typeof body.polish.model === 'string') pp.model = body.polish.model
            if (typeof body.polish.prompt === 'string') pp.prompt = body.polish.prompt
            if (typeof body.polish.timeoutMs === 'number') pp.timeoutMs = body.polish.timeoutMs
            if (Object.keys(pp).length > 0) patch.polish = pp
          }
          if (Object.keys(patch).length > 0) await ctx.settings.update(NS, patch)
          if (body.keys && typeof body.keys === 'object') {
            for (const [id, value] of Object.entries(body.keys)) {
              if (typeof value !== 'string') continue
              if (value === '') await ctx.credentials.unset(keyRefOf(id))
              else await ctx.credentials.set(keyRefOf(id), value)
            }
          }
          if (typeof body.polishKey === 'string') {
            if (body.polishKey === '') await ctx.credentials.unset(POLISH_KEY_REF)
            else await ctx.credentials.set(POLISH_KEY_REF, body.polishKey)
          }
          return sendJson(res, 200, { ok: true })
        } catch (err) {
          return sendJson(res, 400, { error: String(err?.message ?? err) })
        }
      }
      return sendJson(res, 405, { error: 'method not allowed' })
    },
  })

  // GET /vmic-key?id=
  ctx.webServer.register({
    kind: 'exact',
    path: '/vmic-key',
    handler: async (req, res) => {
      if (req.method !== 'GET') return sendJson(res, 405, { error: 'method not allowed' })
      const id = new URL(req.url ?? '/', 'http://x').searchParams.get('id')
      if (!id) return sendJson(res, 400, { error: 'missing id' })
      const ref = id === '__polish__' ? POLISH_KEY_REF : keyRefOf(id)
      const resolved = await ctx.credentials.resolve(ref)
      sendJson(res, 200, { key: resolved?.value ?? '' })
    },
  })

  // POST /vmic-test { id }
  ctx.webServer.register({
    kind: 'exact',
    path: '/vmic-test',
    handler: async (req, res) => {
      if (req.method !== 'POST') return sendJson(res, 405, { error: 'method not allowed' })
      let body
      try { body = JSON.parse(await readBody(req) || '{}') } catch { return sendJson(res, 400, { error: 'bad json' }) }
      const cfg = effectiveConfig()
      const provider = resolveProvider(cfg, String(body.id ?? ''))
      if (!provider) return sendJson(res, 400, { error: '未知供应商' })
      const apiKey = await keyOf(provider.id)
      if (!apiKey) return sendJson(res, 400, { error: '未配置 API Key' })
      const started = Date.now()
      try {
        if (provider.type === 'openai-compatible') {
          const text = await transcribeOpenaiCompatible(provider, apiKey, wavToDataUrl(makeTestWav()), cfg.timeoutMs)
          sendJson(res, 200, { ok: true, latencyMs: Date.now() - started, text })
        } else if (provider.type === 'volcengine-doubao') {
          const session = new VolcSession(provider, apiKey, cfg.language)
          session.start()
          await session.sendPcm(makeTestWav().subarray(44), true)
          await Promise.race([session.done, new Promise((_, rej) => setTimeout(() => rej(new Error('超时')), cfg.timeoutMs))])
          session.close()
          if (session.error) throw session.error
          const text = session.finalText || session.latestText
          if (!text) throw new Error('测试音频已送达但未识别出文本（连接与鉴权正常）')
          sendJson(res, 200, { ok: true, latencyMs: Date.now() - started, text })
        } else {
          sendJson(res, 400, { error: '不支持的供应商类型: ' + provider.type })
        }
      } catch (err) {
        sendJson(res, 200, { ok: false, latencyMs: Date.now() - started, error: String(err?.message ?? err) })
      }
    },
  })

  // POST /vmic-asr { audioDataUrl } — selected provider only, no failover.
  ctx.webServer.register({
    kind: 'exact',
    path: '/vmic-asr',
    handler: async (req, res) => {
      if (req.method !== 'POST') return sendJson(res, 405, { error: 'method not allowed' })
      let body
      try { body = JSON.parse(await readBody(req) || '{}') } catch { return sendJson(res, 400, { error: 'bad json' }) }
      const audioDataUrl = typeof body.audioDataUrl === 'string' ? body.audioDataUrl : ''
      if (!audioDataUrl) return sendJson(res, 400, { error: '缺少音频数据' })
      const cfg = effectiveConfig()
      const provider = resolveProvider(cfg, cfg.selectedProvider)
      if (!provider) return sendJson(res, 400, { error: '未选择供应商' })
      if (!provider.enabled) return sendJson(res, 400, { error: `供应商 ${provider.name} 已停用` })
      const apiKey = await keyOf(provider.id)
      if (!apiKey) return sendJson(res, 400, { error: `供应商 ${provider.name} 未配置 API Key（右键麦克风按钮进行配置）` })
      try {
        let text
        if (provider.type === 'openai-compatible') {
          text = await transcribeOpenaiCompatible(provider, apiKey, audioDataUrl, cfg.timeoutMs)
        } else if (provider.type === 'volcengine-doubao') {
          const base64 = audioDataUrl.includes(',') ? audioDataUrl.slice(audioDataUrl.indexOf(',') + 1) : audioDataUrl
          const wav = Buffer.from(base64, 'base64')
          const session = new VolcSession(provider, apiKey, cfg.language)
          session.start()
          await session.sendPcm(wav.subarray(44), true)
          await Promise.race([session.done, new Promise((_, rej) => setTimeout(() => rej(new Error('超时')), cfg.timeoutMs))])
          session.close()
          if (session.error) throw session.error
          text = session.finalText || session.latestText
          if (!text) throw new Error('未识别到文本')
        } else {
          return sendJson(res, 400, { error: '不支持的供应商类型: ' + provider.type })
        }
        sendJson(res, 200, { text: text.trim() })
      } catch (err) {
        sendJson(res, 502, { error: String(err?.message ?? err) })
      }
    },
  })

  // POST /vmic-polish { text } → { text } — polish one transcribed text.
  ctx.webServer.register({
    kind: 'exact',
    path: '/vmic-polish',
    handler: async (req, res) => {
      if (req.method !== 'POST') return sendJson(res, 405, { error: 'method not allowed' })
      let body
      try { body = JSON.parse(await readBody(req) || '{}') } catch { return sendJson(res, 400, { error: 'bad json' }) }
      const text = typeof body.text === 'string' ? body.text.trim() : ''
      if (!text) return sendJson(res, 400, { error: '缺少文本' })
      const cfg = effectiveConfig()
      if (cfg.polish?.enabled !== true) return sendJson(res, 400, { error: '润色功能未开启' })
      try {
        const out = await polishText(cfg, text)
        sendJson(res, 200, { text: out })
      } catch (err) {
        sendJson(res, 502, { error: String(err?.message ?? err) })
      }
    },
  })

  // POST /vmic-polish-test → probe the polish model with a sample sentence.
  const POLISH_SAMPLE = '今天天气不错，我想去公园散步'
  ctx.webServer.register({
    kind: 'exact',
    path: '/vmic-polish-test',
    handler: async (req, res) => {
      if (req.method !== 'POST') return sendJson(res, 405, { error: 'method not allowed' })
      const cfg = effectiveConfig()
      const started = Date.now()
      try {
        const out = await polishText(cfg, POLISH_SAMPLE)
        sendJson(res, 200, { ok: true, latencyMs: Date.now() - started, text: out })
      } catch (err) {
        sendJson(res, 200, { ok: false, latencyMs: Date.now() - started, error: String(err?.message ?? err) })
      }
    },
  })

  // Live streaming (volcengine-doubao only):
  //   POST /vmic-asr-live/start { pcmBase64 } → { sessionId, text }
  //   POST /vmic-asr-live/chunk { sessionId, pcmBase64 } → { text }
  //   POST /vmic-asr-live/stop  { sessionId, pcmBase64 } → { text }
  const liveRoutes = [
    { path: '/vmic-asr-live/start', verb: 'start' },
    { path: '/vmic-asr-live/chunk', verb: 'chunk' },
    { path: '/vmic-asr-live/stop', verb: 'stop' },
  ]
  for (const route of liveRoutes) {
    ctx.webServer.register({
      kind: 'exact',
      path: route.path,
      handler: async (req, res) => {
        if (req.method !== 'POST') return sendJson(res, 405, { error: 'method not allowed' })
        let body
        try { body = JSON.parse(await readBody(req) || '{}') } catch { return sendJson(res, 400, { error: 'bad json' }) }
        const cfg = effectiveConfig()
        const provider = resolveProvider(cfg, cfg.selectedProvider)
        if (!provider || provider.type !== 'volcengine-doubao') return sendJson(res, 400, { error: '当前供应商不支持流式转写' })
        const apiKey = await keyOf(provider.id)
        if (!apiKey) return sendJson(res, 400, { error: '未配置 API Key' })
        try {
          if (route.verb === 'start') {
            const pcm = Buffer.from(String(body.pcmBase64 ?? ''), 'base64')
            const session = new VolcSession(provider, apiKey, cfg.language)
            session.start()
            const sessionId = randomUUID()
            liveSessions.set(sessionId, session)
            await session.sendPcm(pcm, false)
            sendJson(res, 200, { sessionId, text: '' })
          } else if (route.verb === 'chunk') {
            const session = liveSessions.get(String(body.sessionId ?? ''))
            if (!session) return sendJson(res, 400, { error: '会话不存在或已结束' })
            const pcm = Buffer.from(String(body.pcmBase64 ?? ''), 'base64')
            await session.sendPcm(pcm, false)
            sendJson(res, 200, { text: session.latestText })
          } else {
            const session = liveSessions.get(String(body.sessionId ?? ''))
            if (!session) return sendJson(res, 400, { error: '会话不存在或已结束' })
            const pcm = Buffer.from(String(body.pcmBase64 ?? ''), 'base64')
            await session.sendPcm(pcm, true)
            await Promise.race([session.done, new Promise((_, rej) => setTimeout(() => rej(new Error('超时')), cfg.timeoutMs))])
            session.close()
            liveSessions.delete(String(body.sessionId))
            if (session.error) throw session.error
            sendJson(res, 200, { text: session.finalText || session.latestText || '' })
          }
        } catch (err) {
          sendJson(res, 502, { error: String(err?.message ?? err) })
        }
      },
    })
  }
}
