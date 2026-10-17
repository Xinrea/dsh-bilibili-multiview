import { createServer } from 'node:http'
import { apply } from '../index.js'

let route
const ctx = {
  webServer: {
    register(value) {
      route = value
      return () => {}
    },
  },
  effect(fn) {
    return fn()
  },
}
apply(ctx)
if (!route) throw new Error('route not registered')

const server = createServer((request, response) => route.handler(request, response))
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
const base = `http://127.0.0.1:${server.address().port}`

async function post(path, body) {
  const response = await fetch(base + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return response.json()
}

try {
  const session = await fetch(`${base}/bilibili-live/api/session`).then((r) => r.json())
  console.log('session:', session.ok, session.hasCookie, session.account?.authenticated, session.account?.uname, session.account?.uid)

  const add = await post('/bilibili-live/api/room', { id: '6' })
  console.log('room:', add.ok, add.room?.id, add.room?.liveStatus, add.room?.uname, add.room?.title?.slice(0, 20))

  const rooms = await post('/bilibili-live/api/rooms', { ids: [add.room.id] })
  console.log('rooms:', rooms.ok, rooms.rooms?.[0]?.ok, rooms.rooms?.[0]?.room?.liveStatus)

  const play = await post('/bilibili-live/api/play', { id: add.room.id, qn: 10000 })
  console.log('play:', play.ok, play.live, play.qn, play.unsupported, play.urls?.length, play.qualities?.slice(0, 3))

  const danmu = await post('/bilibili-live/api/danmu', { id: add.room.id })
  console.log('danmu:', danmu.ok, danmu.hosts?.length, Boolean(danmu.token), danmu.uid, danmu.roomId)

  const vendor = await fetch(`${base}/bilibili-live/vendor/mpegts.js`)
  console.log('vendor:', vendor.status, vendor.headers.get('content-type'), (await vendor.text()).length)

  if (play.urls?.length) {
    const controller = new AbortController()
    const response = await fetch(`${base}/bilibili-live/api/stream?u=${encodeURIComponent(play.urls[0])}`, {
      signal: controller.signal,
    })
    const reader = response.body.getReader()
    const chunk = await reader.read()
    console.log('stream:', response.status, response.headers.get('content-type'), chunk.value?.byteLength)
    controller.abort()
    await reader.cancel().catch(() => {})
  }

  const bad = await post('/bilibili-live/api/room', { id: 'https://example.com/not-a-room' })
  console.log('bad:', bad.ok, bad.error)
} finally {
  await new Promise((resolve) => server.close(resolve))
}
