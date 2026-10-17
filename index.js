/**
 * Host half of the Bilibili live bundle.
 *
 * The browser cannot call the Bilibili APIs directly: `api.live.bilibili.com`
 * rejects foreign origins, and the account cookie must never be handed to the
 * page. This plugin therefore exposes a tiny same-origin JSON facade under
 * `/bilibili-multiview` and keeps the cookie in the DSH data directory.
 *
 * Routes:
 *   GET    /bilibili-multiview/vendor/mpegts.js  vendored FLV player runtime
 *   GET    /bilibili-multiview/api/image         same-origin cover/keyframe relay
 *   GET    /bilibili-multiview/api/session       current account summary
 *   POST   /bilibili-multiview/api/session       save/validate a cookie
 *   DELETE /bilibili-multiview/api/session       forget the cookie
 *   POST   /bilibili-multiview/api/room          resolve one room + anchor
 *   POST   /bilibili-multiview/api/rooms         refresh several rooms
 *   POST   /bilibili-multiview/api/play          resolve playable FLV URLs
 *   POST   /bilibili-multiview/api/danmu         resolve danmaku WS hosts + token
 */
import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import path from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { fileURLToPath } from 'node:url'
import { brotliDecompressSync, inflateSync } from 'node:zlib'
import WebSocket from './vendor/ws/wrapper.mjs'

export const inject = ['webServer']

const HERE = path.dirname(fileURLToPath(import.meta.url))
const VENDOR_FILE = path.join(HERE, 'vendor', 'mpegts.min.js')
const ROUTE_PREFIX = '/bilibili-multiview'
const API_MAIN = 'https://api.bilibili.com'
const API_LIVE = 'https://api.live.bilibili.com'
const LIVE_REFERER = 'https://live.bilibili.com/'
const MAIN_REFERER = 'https://www.bilibili.com/'
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'
const COOKIE_LIMIT = 64 * 1024
const BODY_LIMIT = 128 * 1024

/** Bilibili WBI mixin table. */
const MIXIN_KEY = [
  46, 47, 18, 2, 53, 8, 23, 32, 15, 50, 10, 31, 58, 3, 45, 35, 27, 43, 5, 49,
  33, 9, 42, 19, 29, 28, 14, 39, 12, 38, 41, 13, 37, 48, 7, 16, 24, 55, 40,
  61, 26, 17, 0, 1, 60, 51, 30, 4, 22, 25, 54, 21, 56, 59, 6, 63, 57, 62, 11,
  36, 20, 34, 44, 52,
]

const DSH_HOME = process.env.DSH_HOME || path.join(homedir(), '.dsh')
const COOKIE_STORE = path.join(DSH_HOME, 'bili', 'cookies.json')
const DEBUG = process.env.DSH_BILIBILI_LIVE_DEBUG === '1'

function debug(...args) {
  if (DEBUG) console.error('[bilibili-multiview]', ...args)
}

class BiliError extends Error {
  constructor(message, code) {
    super(message)
    this.name = 'BiliError'
    this.code = code
  }
}

/** @type {string | null | undefined} */
let cookieCache
let wbiCache = { raw: '', at: 0 }
let authCache = { cookie: null, uid: 0, at: 0 }

function decodeEntities(value) {
  return String(value)
}

function normalizeRoomId(input) {
  if (typeof input === 'number' && Number.isFinite(input)) input = String(input)
  if (typeof input !== 'string') return ''
  let text = input.trim()
  if (!text) return ''
  if (/^https?:\/\//i.test(text) || /live\.bilibili\.com/i.test(text)) {
    try {
      const url = new URL(text.startsWith('http') ? text : `https://${text}`)
      const queryRoom = url.searchParams.get('room_id')
      if (queryRoom && /^\d+$/.test(queryRoom)) return queryRoom
      const parts = url.pathname.split('/').filter(Boolean)
      const last = parts[parts.length - 1] || ''
      if (/^\d+$/.test(last)) return last
    } catch {
      /* fall through to the numeric parse */
    }
  }
  if (/^\d{1,12}$/.test(text)) return text
  return ''
}

function cookieUid(cookie) {
  if (!cookie) return 0
  const match = /(?:^|;\s*)DedeUserID=(\d+)/.exec(cookie)
  return match ? Number(match[1]) || 0 : 0
}

async function readStoredCookie() {
  if (cookieCache !== undefined) return cookieCache
  try {
    const raw = await readFile(COOKIE_STORE, 'utf8')
    const parsed = JSON.parse(raw)
    const cookie = typeof parsed === 'string' ? parsed : parsed?.cookie
    const trimmed = typeof cookie === 'string' ? cookie.trim() : ''
    cookieCache = trimmed || null
  } catch {
    cookieCache = null
  }
  return cookieCache
}

async function writeStoredCookie(cookie) {
  const trimmed = typeof cookie === 'string' ? cookie.trim() : ''
  if (!trimmed) {
    await rm(COOKIE_STORE, { force: true }).catch(() => {})
    cookieCache = null
    return null
  }
  if (trimmed.length > COOKIE_LIMIT) throw new BiliError('Cookie 太长，请检查是否粘贴完整')
  if (!/[;=]/.test(trimmed)) throw new BiliError('Cookie 格式不正确：应包含 key=value 形式的字段')
  await mkdir(path.dirname(COOKIE_STORE), { recursive: true, mode: 0o700 })
  const temporary = `${COOKIE_STORE}.tmp-${process.pid}-${Date.now()}`
  const body = JSON.stringify({ cookie: trimmed, savedAt: Date.now() }, null, 2)
  await writeFile(temporary, body, { mode: 0o600 })
  await rename(temporary, COOKIE_STORE)
  cookieCache = trimmed
  return trimmed
}

async function biliJson(url, { cookie, referer = LIVE_REFERER } = {}) {
  const headers = {
    'User-Agent': USER_AGENT,
    Accept: 'application/json, text/plain, */*',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.6',
    Referer: referer,
  }
  if (cookie) headers.Cookie = cookie
  let response
  try {
    response = await fetch(url, { headers, signal: AbortSignal.timeout(15000) })
  } catch (error) {
    const message = error?.name === 'TimeoutError' ? '连接 Bilibili 超时' : '无法连接 Bilibili'
    throw new BiliError(message)
  }
  if (response.status === 412) throw new BiliError('被 Bilibili 风控拦截（HTTP 412），请稍后重试')
  if (!response.ok) throw new BiliError(`Bilibili 返回 HTTP ${response.status}`)
  const text = await response.text()
  if (!text) throw new BiliError('Bilibili 返回了空响应')
  try {
    return JSON.parse(text)
  } catch {
    throw new BiliError('Bilibili 返回了非 JSON 响应')
  }
}

function apiError(payload, fallback) {
  const code = Number(payload?.code)
  const message =
    decodeEntities(payload?.message || payload?.msg || '') || fallback || 'Bilibili 接口返回错误'
  if (code === 60004) return new BiliError('直播间不存在或已关闭', code)
  if (code === -101) return new BiliError('账号未登录或 Cookie 已过期', code)
  if (code === -352) return new BiliError('被 Bilibili 风控校验拦截，请稍后重试', code)
  return new BiliError(message, Number.isFinite(code) ? code : undefined)
}

async function getWbiRaw(cookie) {
  if (wbiCache.raw && Date.now() - wbiCache.at < 30 * 60 * 1000) return wbiCache.raw
  const nav = await biliJson(`${API_MAIN}/x/web-interface/nav`, { cookie, referer: MAIN_REFERER })
  const img = nav?.data?.wbi_img?.img_url
  const sub = nav?.data?.wbi_img?.sub_url
  if (typeof img !== 'string' || typeof sub !== 'string') {
    throw new BiliError('无法获取 Bilibili WBI 签名密钥')
  }
  const imgKey = img.split('/').pop()?.replace(/\.png.*$/i, '') || ''
  const subKey = sub.split('/').pop()?.replace(/\.png.*$/i, '') || ''
  const raw = `${imgKey}${subKey}`
  if (raw.length < 32) throw new BiliError('Bilibili WBI 签名密钥异常')
  wbiCache = { raw, at: Date.now() }
  return raw
}

function signWbi(parameters, rawKey) {
  const mixin = MIXIN_KEY.map((index) => rawKey[index] || '').join('').slice(0, 32)
  const wts = Math.floor(Date.now() / 1000)
  const all = { ...parameters, wts }
  const query = Object.keys(all)
    .sort()
    .map((key) => {
      const value = String(all[key] ?? '').replace(/[!'()*]/g, '')
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    })
    .join('&')
  const wRid = createHash('md5').update(query + mixin).digest('hex')
  return `${query}&w_rid=${wRid}`
}

async function resolveRoomId(roomId, cookie) {
  const normalized = normalizeRoomId(roomId)
  if (!normalized) throw new BiliError('请输入正确的直播间号或直播间链接')
  // Signed room_init resolves short ids to the real room id. If WBI signing is
  // unavailable, a numeric id still works for the following get_info call.
  try {
    const raw = await getWbiRaw(cookie)
    const query = signWbi({ id: normalized, from: 'room' }, raw)
    const init = await biliJson(`${API_LIVE}/room/v1/Room/room_init?${query}`, { cookie })
    if (init?.code === 0 && init?.data?.room_id) return String(init.data.room_id)
    if (init?.code === 60004) throw apiError(init)
  } catch (error) {
    if (error instanceof BiliError && error.code === 60004) throw error
    // Fall through: get_info below reports the definitive error for numeric ids.
  }
  return normalized
}

async function fetchAnchor(roomId, cookie) {
  try {
    const payload = await biliJson(
      `${API_LIVE}/live_user/v1/UserInfo/get_anchor_in_room?roomid=${encodeURIComponent(roomId)}`,
      { cookie },
    )
    if (payload?.code === 0 && payload?.data?.info) {
      return {
        uname: String(payload.data.info.uname || ''),
        face: String(payload.data.info.face || ''),
        uid: Number(payload.data.info.uid) || 0,
      }
    }
  } catch {
    /* the anchor card is optional */
  }
  return { uname: '', face: '', uid: 0 }
}

function normalizeRoom(roomId, data, anchor = null) {
  return {
    id: String(data.room_id ?? roomId),
    shortId: Number(data.short_id) || 0,
    uid: Number(data.uid) || anchor?.uid || 0,
    title: String(data.title || ''),
    uname: anchor?.uname || '',
    face: anchor?.face || '',
    cover: String(data.user_cover || ''),
    keyframe: String(data.keyframe || ''),
    liveStatus: Number(data.live_status) || 0,
    online: Number(data.online) || 0,
    attention: Number(data.attention) || 0,
    area: String(data.area_name || ''),
    parentArea: String(data.parent_area_name || ''),
    liveTime: String(data.live_time || ''),
    description: String(data.description || ''),
  }
}

async function fetchRoom(roomIdInput) {
  const cookie = await readStoredCookie()
  const realId = await resolveRoomId(roomIdInput, cookie)
  const payload = await biliJson(`${API_LIVE}/room/v1/Room/get_info?room_id=${encodeURIComponent(realId)}`, {
    cookie,
  })
  if (payload?.code !== 0) throw apiError(payload, '无法获取直播间信息')
  const anchor = await fetchAnchor(realId, cookie)
  return normalizeRoom(realId, payload.data, anchor)
}

async function fetchRooms(ids) {
  const cookie = await readStoredCookie()
  const unique = [...new Set(ids.map((id) => normalizeRoomId(id)).filter(Boolean))].slice(0, 32)
  const results = await Promise.allSettled(
    unique.map(async (id) => {
      const payload = await biliJson(`${API_LIVE}/room/v1/Room/get_info?room_id=${encodeURIComponent(id)}`, {
        cookie,
      })
      if (payload?.code !== 0) throw apiError(payload, '无法获取直播间信息')
      return normalizeRoom(id, payload.data)
    }),
  )
  return results.map((result, index) =>
    result.status === 'fulfilled'
      ? { ok: true, room: result.value }
      : { ok: false, id: unique[index], error: String(result.reason?.message || '刷新失败') },
  )
}

function qualityLabel(descriptions, qn) {  const item = descriptions.find((entry) => Number(entry.qn) === Number(qn))
  if (item?.desc) return String(item.desc)
  const table = { 30000: '杜比', 20000: '4K', 15000: '2K', 10000: '原画', 400: '蓝光', 250: '超清', 150: '高清' }
  return table[qn] || `qn ${qn}`
}

function pickFlvStream(playurl) {
  const streams = Array.isArray(playurl?.stream) ? playurl.stream : []
  const formats = []
  for (const stream of streams) {
    if (stream?.protocol_name !== 'http_stream') continue
    for (const format of Array.isArray(stream.format) ? stream.format : []) {
      if (format?.format_name === 'flv') formats.push(format)
    }
  }
  for (const format of formats) {
    const codecs = Array.isArray(format.codec) ? format.codec : []
    const avc = codecs.find((codec) => codec?.codec_name === 'avc' && !codec?.drm)
    if (avc) return avc
  }
  for (const format of formats) {
    const codecs = Array.isArray(format.codec) ? format.codec : []
    const first = codecs.find((codec) => !codec?.drm)
    if (first) return first
  }
  return null
}

function secureUrl(url) {
  return String(url).replace(/^http:\/\//i, 'https://')
}

async function fetchPlayInfo(roomIdInput, qnInput) {
  const cookie = await readStoredCookie()
  const realId = await resolveRoomId(roomIdInput, cookie)
  const allowed = [150, 250, 400, 10000, 15000, 20000, 30000]
  const qn = allowed.includes(Number(qnInput)) ? Number(qnInput) : 10000
  const payload = await biliJson(
    `${API_LIVE}/xlive/web-room/v2/index/getRoomPlayInfo?room_id=${encodeURIComponent(realId)}` +
      `&protocol=0,1&format=0,1&codec=0,1&qn=${qn}&platform=web`,
    { cookie },
  )
  if (payload?.code !== 0) throw apiError(payload, '无法获取直播流')
  const data = payload.data || {}
  if (Number(data.live_status) !== 1 || !data.playurl_info?.playurl) {
    return { live: false, roomId: String(data.room_id ?? realId), qn }
  }
  const playurl = data.playurl_info.playurl
  const codec = pickFlvStream(playurl)
  if (!codec) {
    return {
      live: true,
      roomId: String(data.room_id ?? realId),
      unsupported: true,
      error: '该直播间没有可用的 FLV 流',
    }
  }
  const descriptions = Array.isArray(playurl.g_qn_desc) ? playurl.g_qn_desc : []
  const accept = Array.isArray(codec.accept_qn) ? codec.accept_qn : [codec.current_qn].filter(Boolean)
  const qualities = accept
    .map((entry) => Number(entry))
    .filter((entry) => Number.isFinite(entry))
    .sort((a, b) => b - a)
    .map((entry) => ({ qn: entry, label: qualityLabel(descriptions, entry) }))
  const urls = []
  for (const info of Array.isArray(codec.url_info) ? codec.url_info : []) {
    if (!info?.host || !codec.base_url) continue
    const url = secureUrl(`${info.host}${codec.base_url}${info.extra || ''}`)
    if (!urls.includes(url)) urls.push(url)
  }
  if (!urls.length) {
    return {
      live: true,
      roomId: String(data.room_id ?? realId),
      unsupported: true,
      error: '直播流地址为空',
    }
  }
  return {
    live: true,
    roomId: String(data.room_id ?? realId),
    qn: Number(codec.current_qn) || qn,
    qualities,
    urls,
    format: 'flv',
    codec: String(codec.codec_name || 'avc'),
  }
}

async function fetchDanmuInfo(roomIdInput) {
  const cookie = await readStoredCookie()
  const realId = await resolveRoomId(roomIdInput, cookie)
  const raw = await getWbiRaw(cookie)
  const query = signWbi({ id: realId, type: 0 }, raw)
  const payload = await biliJson(`${API_LIVE}/xlive/web-room/v1/index/getDanmuInfo?${query}`, {
    cookie,
  })
  if (payload?.code !== 0) throw apiError(payload, '无法获取弹幕服务器')
  const data = payload.data || {}
  const hosts = (Array.isArray(data.host_list) ? data.host_list : [])
    .filter((host) => host?.host)
    .map((host) => ({
      host: String(host.host),
      wssPort: Number(host.wss_port) || 443,
      wsPort: Number(host.ws_port) || 2244,
    }))
  return {
    roomId: realId,
    uid: await resolveAccountUid(cookie),
    token: String(data.token || ''),
    hosts,
  }
}

/**
 * A danmaku auth packet may only carry a real uid when the cookie is still
 * logged in. Sending the uid of an expired cookie makes the comet server close
 * the socket with 1006, so fall back to anonymous uid 0 in that case.
 */
async function resolveAccountUid(cookie) {
  if (!cookie) return 0
  if (authCache.cookie === cookie && Date.now() - authCache.at < 5 * 60 * 1000) {
    return authCache.uid
  }
  let uid = 0
  try {
    const nav = await biliJson(`${API_MAIN}/x/web-interface/nav`, {
      cookie,
      referer: MAIN_REFERER,
    })
    if (nav?.code === 0 && nav?.data?.isLogin) uid = Number(nav.data.mid) || cookieUid(cookie)
  } catch {
    uid = 0
  }
  authCache = { cookie, uid, at: Date.now() }
  return uid
}

function encodeDanmuPacket(operation, payload) {
  const body = Buffer.from(payload || '', 'utf8')
  const header = Buffer.alloc(16)
  header.writeUInt32BE(16 + body.length, 0)
  header.writeUInt16BE(16, 4)
  header.writeUInt16BE(1, 6)
  header.writeUInt32BE(operation, 8)
  header.writeUInt32BE(1, 12)
  return Buffer.concat([header, body])
}

function decodeDanmuFrame(buffer, depth = 0) {
  const messages = []
  if (depth > 4 || buffer.length < 16) return messages
  const visit = (payload, level) => {
    if (level > 4 || payload.length < 16) return
    let offset = 0
    while (offset + 16 <= payload.length) {
      const length = payload.readUInt32BE(offset)
      if (length < 16 || offset + length > payload.length) break
      const headerLength = payload.readUInt16BE(offset + 4)
      const version = payload.readUInt16BE(offset + 6)
      const operation = payload.readUInt32BE(offset + 8)
      const body = payload.subarray(offset + headerLength, offset + length)
      offset += length
      if (version === 2) {
        try {
          visit(inflateSync(body), level + 1)
        } catch {
          /* skip a corrupt compressed frame */
        }
      } else if (version === 3) {
        try {
          visit(brotliDecompressSync(body), level + 1)
        } catch {
          /* skip a corrupt compressed frame */
        }
      } else if ((version === 0 || version === 1) && operation === 5) {
        try {
          messages.push(JSON.parse(body.toString('utf8')))
        } catch {
          /* skip malformed JSON */
        }
      }
    }
  }
  visit(buffer, depth)
  return messages
}

function cleanDanmu(kind, user, text) {
  const clean = String(text || '')
    .replace(/[\r\n]+/g, ' ')
    .trim()
  if (!clean) return null
  return {
    kind,
    user: String(user || '').slice(0, 24),
    text: clean.slice(0, 140),
  }
}

function normalizeDanmuMessage(payload) {
  const command = String(payload?.cmd || '')
  if (command.startsWith('DANMU_MSG')) {
    const info = payload.info
    if (!Array.isArray(info)) return null
    const text = typeof info[1] === 'string' ? info[1] : ''
    const user = Array.isArray(info[2]) ? info[2][1] : ''
    return cleanDanmu('danmu', user, text)
  }
  if (command === 'SEND_GIFT' || command === 'SEND_GIFT_V2' || command === 'COMBO_SEND' || command === 'COMBO_SEND_V2') {
    const data = payload.data || {}
    const gift = data.giftName || data.gift_name || '礼物'
    const count = Number(data.num || data.combo_num || 1)
    return cleanDanmu('gift', data.uname || data.username || data.user_info?.uname || '', `${gift} ×${count}`)
  }
  if (command.startsWith('SUPER_CHAT_MESSAGE')) {
    const data = payload.data || {}
    return cleanDanmu(
      'super',
      data?.user_info?.uname || data?.uname || '',
      `${data.message || ''}（¥${data.price || 0}）`,
    )
  }
  if (command.startsWith('GUARD_BUY')) {
    const data = payload.data || {}
    return cleanDanmu('gift', data.username || '', `开通 ${data.gift_name || '大航海'}`)
  }
  return null
}

/**
 * Relays one room's danmaku to the browser over Server-Sent Events.
 *
 * Bilibili's comet server validates the WebSocket Origin and closes sockets
 * opened from `http://127.0.0.1`, so the browser cannot connect directly. The
 * Host owns the upstream socket (with the live.bilibili.com origin) and the
 * page only reads same-origin JSON events.
 */
async function streamDanmaku(request, response, roomIdInput) {
  const room = normalizeRoomId(roomIdInput)
  if (!room) throw new BiliError('弹幕房间号无效')
  response.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  })
  response.write(': connected\n\n')

  let closed = false
  let upstream = null
  let heartbeat = null
  let retryTimer = null
  let info = null
  let attempt = 0
  let hostIndex = 0
  const keepAlive = setInterval(() => {
    if (closed || response.writableEnded) return
    try {
      response.write(': ping\n\n')
    } catch {
      stop()
    }
  }, 15000)

  const stop = () => {
    if (closed) return
    closed = true
    clearInterval(keepAlive)
    clearInterval(heartbeat)
    clearTimeout(retryTimer)
    heartbeat = null
    try {
      upstream?.terminate()
    } catch {
      /* ignore */
    }
    upstream = null
    if (!response.writableEnded) response.end()
  }

  request.on('aborted', stop)
  response.on('close', stop)
  response.on('error', stop)

  const write = (value) => {
    if (closed || response.writableEnded) return
    debug('sse write', value?.type || value?.kind || 'message')
    try {
      response.write(`data: ${JSON.stringify(value)}\n\n`)
    } catch {
      stop()
    }
  }

  const schedule = () => {
    if (closed) return
    attempt += 1
    if (attempt > 4) info = null
    retryTimer = setTimeout(connect, Math.min(30000, 1500 * Math.pow(1.9, Math.min(attempt, 6))))
  }

  async function connect() {
    if (closed) return
    try {
      if (!info || Date.now() - info.at > 5 * 60 * 1000) {
        info = { ...(await fetchDanmuInfo(room)), at: Date.now() }
      }
    } catch (error) {
      write({ type: 'error', message: String(error?.message || '弹幕连接失败') })
      schedule()
      return
    }
    if (closed) return
    const host = info.hosts[hostIndex % info.hosts.length]
    hostIndex += 1
    if (!host) {
      schedule()
      return
    }
    let socket
    try {
      socket = new WebSocket(`wss://${host.host}/sub`, {
        origin: LIVE_REFERER,
        headers: { 'User-Agent': USER_AGENT },
        handshakeTimeout: 12000,
      })
    } catch {
      schedule()
      return
    }
    debug('danmu connecting', room, host.host, 'uid', info.uid, 'hosts', info.hosts.length)
    upstream = socket
    socket.on('open', () => {
      if (closed) {
        socket.close()
        return
      }
      debug('danmu upstream open', room)
      attempt = 0
      const auth = {
        uid: Number(info.uid) || 0,
        roomid: Number(info.roomId) || Number(room),
        protover: 2,
        platform: 'web',
        type: 2,
        key: info.token || '',
      }
      try {
        socket.send(encodeDanmuPacket(7, JSON.stringify(auth)))
      } catch {
        /* close handler retries */
      }
      heartbeat = setInterval(() => {
        if (socket.readyState !== WebSocket.OPEN) return
        try {
          socket.send(encodeDanmuPacket(2, ''))
        } catch {
          /* ignore */
        }
      }, 30000)
    })
    socket.on('message', (data, isBinary) => {
      if (closed || !isBinary) return
      const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data)
      const decoded = decodeDanmuFrame(buffer)
      debug('danmu frame', room, buffer.length, 'messages', decoded.length)
      for (const payload of decoded) {
        const message = normalizeDanmuMessage(payload)
        if (message) write(message)
      }
    })
    socket.on('error', () => {})
    socket.on('close', () => {
      debug('danmu upstream close', room)
      clearInterval(heartbeat)
      heartbeat = null
      if (upstream === socket) upstream = null
      if (!closed) schedule()
    })
  }

  connect()
}

async function sessionSummary() {
  const cookie = await readStoredCookie()
  if (!cookie) {
    return {
      ok: true,
      account: { authenticated: false, anonymous: true, uid: 0, uname: '', face: '', level: 0 },
      hasCookie: false,
      cookiePath: COOKIE_STORE,
    }
  }
  const nav = await biliJson(`${API_MAIN}/x/web-interface/nav`, { cookie, referer: MAIN_REFERER })
  if (nav?.code === 0 && nav?.data?.isLogin) {
    return {
      ok: true,
      account: {
        authenticated: true,
        uid: Number(nav.data.mid) || cookieUid(cookie),
        uname: String(nav.data.uname || ''),
        face: String(nav.data.face || ''),
        level: Number(nav.data.level_info?.current_level) || 0,
      },
      hasCookie: true,
      cookiePath: COOKIE_STORE,
    }
  }
  return {
    ok: true,
    account: {
      authenticated: false,
      anonymous: false,
      stale: true,
      uid: cookieUid(cookie),
      uname: '',
      face: '',
      level: 0,
      error: nav?.code === -101 ? 'Cookie 已失效，请重新设置' : String(nav?.message || '未登录'),
    },
    hasCookie: true,
    cookiePath: COOKIE_STORE,
  }
}

async function readJsonBody(request) {
  const chunks = []
  let size = 0
  for await (const chunk of request) {
    size += chunk.length
    if (size > BODY_LIMIT) throw new BiliError('请求内容过大')
    chunks.push(chunk)
  }
  if (!chunks.length) return {}
  const text = Buffer.concat(chunks).toString('utf8')
  try {
    const parsed = JSON.parse(text)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('shape')
    return parsed
  } catch {
    throw new BiliError('请求 JSON 格式不正确')
  }
}

function sendJson(response, status, value) {
  const body = JSON.stringify(value)
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(body),
  })
  response.end(body)
}

async function serveVendor(response) {
  const info = await stat(VENDOR_FILE)
  response.writeHead(200, {
    'Content-Type': 'application/javascript; charset=utf-8',
    'Content-Length': info.size,
    'Cache-Control': 'public, max-age=86400',
  })
  createReadStream(VENDOR_FILE).pipe(response)
}

const STREAM_HOST_SUFFIXES = ['bilivideo.com', 'bilivideo.cn', 'bilibili.com']
const IMAGE_HOST_SUFFIXES = ['hdslb.com', 'bilibili.com']

/**
 * Same-origin image relay for Bilibili covers/keyframes/avatars.
 *
 * The image CDN rejects browser hotlink requests (the browser sends
 * Sec-Fetch-Site) while a plain Host fetch succeeds. Images are small, so
 * buffering one response is simpler than streaming it.
 */
async function proxyImage(response, target) {
  let parsed
  try {
    parsed = new URL(target)
  } catch {
    throw new BiliError('图片地址无效')
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new BiliError('图片地址协议无效')
  }
  const hostname = parsed.hostname.toLowerCase()
  if (!IMAGE_HOST_SUFFIXES.some((suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`))) {
    throw new BiliError('不支持的图片主机')
  }
  const upstream = await fetch(parsed, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'image/avif,image/webp,image/jpeg,image/png,image/*;q=0.8,*/*;q=0.5',
    },
    signal: AbortSignal.timeout(15000),
  }).catch(() => {
    throw new BiliError('无法加载 Bilibili 图片')
  })
  if (!upstream.ok) throw new BiliError(`图片返回 HTTP ${upstream.status}`)
  const body = Buffer.from(await upstream.arrayBuffer())
  if (body.length > 8 * 1024 * 1024) throw new BiliError('图片过大')
  response.writeHead(200, {
    'Content-Type': upstream.headers.get('content-type') || 'image/jpeg',
    'Content-Length': body.length,
    'Cache-Control': 'public, max-age=3600',
  })
  response.end(body)
}

/**
 * Fallback transport for a live FLV URL. The CDN usually allows the browser's
 * origin, but a same-origin relay keeps playback working when a particular CDN
 * node rejects the page origin. Only Bilibili media hosts are accepted.
 */
async function proxyStream(request, response, target) {
  let parsed
  try {
    parsed = new URL(target)
  } catch {
    throw new BiliError('直播流地址无效')
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    throw new BiliError('直播流地址协议无效')
  }
  const hostname = parsed.hostname.toLowerCase()
  if (!STREAM_HOST_SUFFIXES.some((suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`))) {
    throw new BiliError('不支持的直播流主机')
  }
  const controller = new AbortController()
  const abort = () => controller.abort()
  request.on('aborted', abort)
  response.on('close', abort)
  const upstream = await fetch(parsed, {
    headers: {
      'User-Agent': USER_AGENT,
      Referer: LIVE_REFERER,
      Accept: '*/*',
    },
    signal: controller.signal,
  }).catch((error) => {
    if (controller.signal.aborted) return null
    throw new BiliError(String(error?.message || '无法连接直播流'))
  })
  if (!upstream) return
  if (!upstream.ok || !upstream.body) {
    throw new BiliError(`直播流返回 HTTP ${upstream.status}`)
  }
  response.writeHead(200, {
    'Content-Type': upstream.headers.get('content-type') || 'video/x-flv',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
  })
  try {
    await pipeline(Readable.fromWeb(upstream.body), response)
  } catch (error) {
    if (!response.destroyed) response.destroy()
    if (!controller.signal.aborted) throw error
  } finally {
    request.off('aborted', abort)
    response.off('close', abort)
  }
}

async function route(request, response) {
  const url = new URL(request.url || '/', 'http://127.0.0.1')
  const pathname = url.pathname
  const method = request.method || 'GET'

  if (pathname === `${ROUTE_PREFIX}/vendor/mpegts.js` && method === 'GET') {
    await serveVendor(response)
    return
  }

  if (pathname === `${ROUTE_PREFIX}/api/image` && method === 'GET') {
    const target = url.searchParams.get('u')
    if (!target) throw new BiliError('缺少图片地址')
    await proxyImage(response, target)
    return
  }

  if (pathname === `${ROUTE_PREFIX}/api/stream` && method === 'GET') {
    const target = url.searchParams.get('u')
    if (!target) throw new BiliError('缺少直播流地址')
    await proxyStream(request, response, target)
    return
  }

  if (pathname === `${ROUTE_PREFIX}/api/session`) {
    if (method === 'GET') {
      sendJson(response, 200, await sessionSummary())
      return
    }
    if (method === 'POST') {
      const body = await readJsonBody(request)
      const cookie = typeof body.cookie === 'string' ? body.cookie : ''
      if (cookie.trim()) {
        const nav = await biliJson(`${API_MAIN}/x/web-interface/nav`, {
          cookie: cookie.trim(),
          referer: MAIN_REFERER,
        })
        if (!(nav?.code === 0 && nav?.data?.isLogin)) {
          throw new BiliError(
            nav?.code === -101 ? 'Cookie 无效或已过期（未登录）' : String(nav?.message || 'Cookie 验证失败'),
          )
        }
      }
      await writeStoredCookie(cookie)
      sendJson(response, 200, await sessionSummary())
      return
    }
    if (method === 'DELETE') {
      await writeStoredCookie('')
      sendJson(response, 200, await sessionSummary())
      return
    }
  }

  if (pathname === `${ROUTE_PREFIX}/api/room` && method === 'POST') {
    const body = await readJsonBody(request)
    const room = await fetchRoom(body.id)
    sendJson(response, 200, { ok: true, room })
    return
  }

  if (pathname === `${ROUTE_PREFIX}/api/rooms` && method === 'POST') {
    const body = await readJsonBody(request)
    const ids = Array.isArray(body.ids) ? body.ids : []
    const rooms = await fetchRooms(ids)
    sendJson(response, 200, { ok: true, rooms })
    return
  }

  if (pathname === `${ROUTE_PREFIX}/api/play` && method === 'POST') {
    const body = await readJsonBody(request)
    const play = await fetchPlayInfo(body.id, body.qn)
    sendJson(response, 200, { ok: true, ...play })
    return
  }

  if (pathname === `${ROUTE_PREFIX}/api/danmu/events` && method === 'GET') {
    await streamDanmaku(request, response, url.searchParams.get('room') || '')
    return
  }

  if (pathname === `${ROUTE_PREFIX}/api/danmu` && method === 'POST') {
    const body = await readJsonBody(request)
    const danmu = await fetchDanmuInfo(body.id)
    sendJson(response, 200, { ok: true, ...danmu })
    return
  }

  sendJson(response, 404, { ok: false, error: 'Not found' })
}

export function apply(ctx) {
  ctx.effect(
    () =>
      ctx.webServer.register({
        kind: 'prefix',
        path: ROUTE_PREFIX,
        handler: async (request, response) => {
          try {
            await route(request, response)
          } catch (error) {
            const message = String(error?.message || '未知错误')
            if (response.headersSent) {
              response.destroy()
              return
            }
            const code = error instanceof BiliError ? error.code : undefined
            sendJson(response, error instanceof BiliError ? 200 : 500, {
              ok: false,
              error: message,
              code,
            })
          }
        },
      }),
    'bilibili-multiview: Bilibili facade routes',
  )
}
