window.__ModuleLoader__.load({
  id: 'dsh-bilibili-multiview',
  factory(require) {
    const React = require('react')
    const h = React.createElement
    const {
      useCallback,
      useEffect,
      useMemo,
      useRef,
      useState,
    } = React

    const NS = 'bilibili-multiview'
    const API_ROOT = '/bilibili-multiview/api'
    const VENDOR_PATH = '/bilibili-multiview/vendor/mpegts.js'
    const PROXY_PATH = '/bilibili-multiview/api/stream?u='
    const STORE_KEY = 'dsh.bilibili-multiview.v1'
    const LEGACY_STORE_KEY = 'dsh.bilibili-live.v1'
    const GAP = 18
    const STACK_GAP = 10
    const DUCK_FACTOR = 0.2
    const VOLUME_STEP = 5
    const DEFAULT_QN = 10000
    const DANMAKU_LIMIT = 18

    const zh = {
      panel: 'bilibili 直播',
      account_current: '当前账号',
      account_via_cookie: '通过 cookie 设置',
      account_anonymous: '匿名观看',
      account_stale: 'Cookie 已失效',
      account_loading: '正在读取账号…',
      account_error: '本地服务不可用',
      no_title: '未命名直播间',
      no_room: '未选择直播间',
      now_watching: '正在观看',
      room_list: '直播间列表',
      add_room: '添加直播间',
      add_room_title: '添加直播间',
      add_room_hint: '输入直播间号，或直接粘贴 live.bilibili.com 的直播间链接。',
      room_input_placeholder: '例如 6 或 https://live.bilibili.com/6',
      add: '添加',
      added: '已添加直播间',
      removed: '已从列表移除直播间',
      cancel: '取消',
      close: '关闭',
      stage_title: '直播播放区域',
      stage_hint: '滚轮 / ← → 列 · ↑ ↓ 窗口 · Shift+← → 分屏 · Shift+S Solo · +/- 音量',
      window_count: '个窗口',
      column_count: '列',
      sound_on: '开启声音',
      sound_off: '静音',
      danmaku: '弹幕',
      refresh: '刷新',
      refresh_all: '刷新全部直播间',
      solo: 'Solo',
      solo_hint: '独奏：只播放这个窗口的声音',
      volume: '音量',
      quality: '画质',
      live: '直播中',
      offline: '未开播',
      loading: '加载中…',
      loading_stream: '正在获取直播流…',
      reconnect: '重新连接',
      retry: '重试',
      play_error: '播放失败',
      stream_unsupported: '该直播间的流格式暂不受支持',
      need_tap: '点击继续播放',
      offline_hint: '该直播间当前未开播，开播后会自动开始播放。',
      empty_title: '还没有直播窗口',
      empty_hint: '从左侧直播间列表打开一个窗口，或先添加直播间。',
      empty_add: '添加第一个直播间',
      empty_open: '打开第一个直播间',
      no_rooms: '暂无直播间',
      cookie_title: '设置 Bilibili Cookie',
      cookie_hint: 'Cookie 只保存在本机 Host，页面和插件都拿不到它的内容。',
      cookie_warning:
        '需要包含 SESSDATA、bili_jct、DedeUserID 等字段。可在浏览器的开发者工具 → Application → Cookies → bilibili.com 中复制。',
      cookie_placeholder: 'SESSDATA=...; bili_jct=...; DedeUserID=...',
      cookie_save: '保存并验证',
      cookie_clear: '清除账号',
      cookie_saved: '账号已更新',
      cookie_cleared: '账号已清除',
      cookie_invalid: 'Cookie 验证失败',
      cookie_path: '存储位置',
      cookie_signed_out: '当前未设置 Cookie，正在匿名观看。',
      viewers: '人气',
      attention: '关注',
      room_id: '房间号',
      area: '分区',
      open_external: '在 Bilibili 打开',
      remove_room: '从列表移除',
      confirm_remove: '再次点击确认移除',
      fullscreen: '全屏',
      prev_window: '上一列',
      next_window: '下一列',
      move_window: '移动窗口',
      window_actions: '窗口操作',
      move_up: '上移',
      move_down: '下移',
      move_to_left: '移入左列（上下分屏）',
      move_to_right: '移入右列（上下分屏）',
      expel_left: '拆为左侧独立列',
      expel_right: '拆为右侧独立列',
      move_column_left: '整列左移',
      move_column_right: '整列右移',
      move_hint: 'Shift+← → 移入相邻列 · [ ] 拆分 · Alt+Shift+← → 整列移动',
      stack_title: '此列中的位置',
      show_list: '展开直播列表',
      hide_list: '收起直播列表',
      duck_hint: '非焦点窗口音量为 20%（降低 80%）',
      volume_shortcut: '+ / - 调整音量',
      next_window: '下一个窗口',
      scroll_hint: '拖动滚动条浏览窗口',
      unknown_user: '未知主播',
      elapsed: '已播',
      network_error: '网络请求失败',
      account_required: '更高清晰度需要登录 Cookie',
      added_hint: '点击左侧列表中的直播间即可打开窗口',
    }

    const en = {
      panel: 'Bilibili Live',
      account_current: 'Current account',
      account_via_cookie: 'Set with a cookie',
      account_anonymous: 'Anonymous',
      account_stale: 'Cookie expired',
      account_loading: 'Loading account…',
      account_error: 'Local service unavailable',
      no_title: 'Untitled room',
      no_room: 'No room selected',
      now_watching: 'Now watching',
      room_list: 'Live rooms',
      add_room: 'Add room',
      add_room_title: 'Add a live room',
      add_room_hint: 'Enter a room id, or paste a live.bilibili.com room link.',
      room_input_placeholder: 'e.g. 6 or https://live.bilibili.com/6',
      add: 'Add',
      added: 'Room added',
      removed: 'Room removed from the list',
      cancel: 'Cancel',
      close: 'Close',
      stage_title: 'Live stage',
      stage_hint: 'wheel / ← → columns · ↑ ↓ windows · Shift+← → split · Shift+S solo · +/- volume',
      window_count: 'windows',
      column_count: 'columns',
      sound_on: 'Enable sound',
      sound_off: 'Mute',
      danmaku: 'Danmaku',
      refresh: 'Refresh',
      refresh_all: 'Refresh every room',
      solo: 'Solo',
      solo_hint: 'Solo: only this window is audible',
      volume: 'Volume',
      quality: 'Quality',
      live: 'Live',
      offline: 'Offline',
      loading: 'Loading…',
      loading_stream: 'Resolving stream…',
      reconnect: 'Reconnect',
      retry: 'Retry',
      play_error: 'Playback failed',
      stream_unsupported: 'This room uses an unsupported stream format',
      need_tap: 'Click to resume playback',
      offline_hint: 'This room is offline. Playback starts automatically when it goes live.',
      empty_title: 'No live windows yet',
      empty_hint: 'Open a room from the list, or add a new room first.',
      empty_add: 'Add the first room',
      empty_open: 'Open the first room',
      no_rooms: 'No rooms',
      cookie_title: 'Set a Bilibili cookie',
      cookie_hint: 'The cookie stays on the local Host; the page and plugin never read it back.',
      cookie_warning:
        'It must include SESSDATA, bili_jct and DedeUserID. Copy it from DevTools → Application → Cookies → bilibili.com.',
      cookie_placeholder: 'SESSDATA=...; bili_jct=...; DedeUserID=...',
      cookie_save: 'Save and verify',
      cookie_clear: 'Forget account',
      cookie_saved: 'Account updated',
      cookie_cleared: 'Account cleared',
      cookie_invalid: 'Cookie verification failed',
      cookie_path: 'Stored at',
      cookie_signed_out: 'No cookie configured; watching anonymously.',
      viewers: 'Viewers',
      attention: 'Followers',
      room_id: 'Room',
      area: 'Category',
      open_external: 'Open on Bilibili',
      remove_room: 'Remove from list',
      confirm_remove: 'Click again to remove',
      fullscreen: 'Fullscreen',
      prev_window: 'Previous column',
      next_window: 'Next column',
      move_window: 'Move window',
      window_actions: 'Window actions',
      move_up: 'Move up',
      move_down: 'Move down',
      move_to_left: 'Move into left column (split)',
      move_to_right: 'Move into right column (split)',
      expel_left: 'Expel as a new left column',
      expel_right: 'Expel as a new right column',
      move_column_left: 'Move column left',
      move_column_right: 'Move column right',
      move_hint: 'Shift+← → adjacent column · [ ] expel · Alt+Shift+← → move column',
      stack_title: 'Position in column',
      show_list: 'Show live list',
      hide_list: 'Hide live list',
      duck_hint: 'Unfocused windows play at 20% (-80%)',
      volume_shortcut: '+ / - to adjust volume',
      next_window: 'Next window',
      scroll_hint: 'Drag to browse windows',
      unknown_user: 'Unknown streamer',
      elapsed: 'Live for',
      network_error: 'Network request failed',
      account_required: 'Higher quality needs a signed-in cookie',
      added_hint: 'Click a room in the list to open its window',
    }

    const numberFormat = (() => {
      try {
        return new Intl.NumberFormat(undefined, { notation: 'compact', maximumFractionDigits: 1 })
      } catch {
        return { format: (value) => String(value) }
      }
    })()

    function clamp(value, min, max) {
      return Math.min(max, Math.max(min, value))
    }

    function cx(...values) {
      return values.filter(Boolean).join(' ')
    }

    function formatCount(value) {
      const number = Number(value) || 0
      if (number <= 0) return '0'
      try {
        return numberFormat.format(number)
      } catch {
        return String(number)
      }
    }

    function formatElapsed(liveTime) {
      if (!liveTime || liveTime.startsWith('0000')) return ''
      const parsed = new Date(String(liveTime).replace(' ', 'T') + '+08:00')
      if (Number.isNaN(parsed.getTime())) return ''
      const seconds = Math.max(0, Math.floor((Date.now() - parsed.getTime()) / 1000))
      if (seconds < 60) return '<1m'
      const minutes = Math.floor(seconds / 60)
      if (minutes < 60) return `${minutes}m`
      const hours = Math.floor(minutes / 60)
      const rest = minutes % 60
      return rest ? `${hours}h ${rest}m` : `${hours}h`
    }

    function useLatest(value) {
      const ref = useRef(value)
      ref.current = value
      return ref
    }

    function useLocaleRefresh(locale) {
      const [, force] = React.useReducer((value) => value + 1, 0)
      useEffect(() => {
        if (!locale || typeof locale.subscribe !== 'function') return undefined
        return locale.subscribe(force)
      }, [locale])
    }

    async function api(path, body, method) {
      const verb = method || (body === undefined ? 'GET' : 'POST')
      try {
        const response = await fetch(`${API_ROOT}${path}`, {
          method: verb,
          cache: 'no-store',
          headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
          body: body === undefined ? undefined : JSON.stringify(body),
        })
        let data = null
        try {
          data = await response.json()
        } catch {
          data = null
        }
        if (!data || typeof data !== 'object') {
          return { ok: false, error: `HTTP ${response.status}` }
        }
        return data
      } catch {
        return { ok: false, error: 'LOCAL_SERVICE_UNAVAILABLE' }
      }
    }

    let mpegtsPromise = null
    function loadMpegts() {
      if (window.mpegts) {
        if (window.mpegts.LoggingControl) window.mpegts.LoggingControl.enableAll = false
        return Promise.resolve(window.mpegts)
      }
      if (mpegtsPromise) return mpegtsPromise
      mpegtsPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[data-bilibili-multiview-vendor="mpegts"]`)
        const script = existing || document.createElement('script')
        script.dataset.bilibiliLiveVendor = 'mpegts'
        script.async = true
        script.src = VENDOR_PATH
        script.addEventListener('load', () => {
          if (window.mpegts) {
            if (window.mpegts.LoggingControl) window.mpegts.LoggingControl.enableAll = false
            resolve(window.mpegts)
          } else reject(new Error('mpegts.js 加载失败'))
        })
        script.addEventListener('error', () => reject(new Error('mpegts.js 加载失败')))
        if (!existing) document.head.appendChild(script)
      })
      return mpegtsPromise
    }

    function proxyUrl(target) {
      return `${PROXY_PATH}${encodeURIComponent(target)}`
    }

    function imageUrl(target) {
      if (!target) return target
      try {
        const url = new URL(target, window.location.href)
        const host = url.hostname.toLowerCase()
        if (['hdslb.com', 'bilibili.com'].some((suffix) => host === suffix || host.endsWith(`.${suffix}`))) {
          return `/bilibili-multiview/api/image?u=${encodeURIComponent(target)}`
        }
      } catch {
        /* leave non-URL strings untouched */
      }
      return target
    }

    function useDanmaku(roomId, liveStatus, enabled) {
      const [messages, setMessages] = useState([])

      useEffect(() => {
        setMessages([])
        if (!enabled || liveStatus !== 1) return undefined
        let closed = false
        let source = null
        let retryTimer = null
        let counter = 0
        const pending = []

        const publish = () => {
          if (closed || !pending.length) return
          const batch = pending.splice(0, 6)
          setMessages((previous) => {
            const next = previous.concat(batch)
            return next.length > DANMAKU_LIMIT ? next.slice(next.length - DANMAKU_LIMIT) : next
          })
        }
        const flushTimer = window.setInterval(publish, 160)

        const open = () => {
          if (closed) return
          try {
            source = new EventSource(`/bilibili-multiview/api/danmu/events?room=${encodeURIComponent(roomId)}`)
          } catch {
            retryTimer = window.setTimeout(open, 3000)
            return
          }
          source.onmessage = (event) => {
            if (closed) return
            let payload
            try {
              payload = JSON.parse(event.data)
            } catch {
              return
            }
            if (!payload || typeof payload.text !== 'string') return
            const text = payload.text.replace(/[\r\n]+/g, ' ').trim().slice(0, 140)
            if (!text) return
            if (pending.length > 200) pending.shift()
            const kind = payload.kind === 'gift' || payload.kind === 'super' ? payload.kind : 'danmu'
            pending.push({
              id: `${counter++}`,
              kind,
              user: String(payload.user || '').slice(0, 24),
              text,
            })
          }
          source.onerror = () => {
            if (closed) return
            if (source && source.readyState === EventSource.CLOSED) {
              try {
                source.close()
              } catch {
                /* ignore */
              }
              source = null
              retryTimer = window.setTimeout(open, 2500)
            }
          }
        }

        open()
        return () => {
          closed = true
          window.clearInterval(flushTimer)
          if (retryTimer) window.clearTimeout(retryTimer)
          if (source) {
            try {
              source.close()
            } catch {
              /* ignore */
            }
          }
        }
      }, [roomId, liveStatus, enabled])

      return messages
    }

    function Glyph({ name, size = 16, strokeWidth = 1.7, className }) {
      const common = {
        width: size,
        height: size,
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
        focusable: 'false',
        className,
        style: { display: 'block', flex: 'none' },
      }
      switch (name) {
        case 'play':
          return h(
            'svg',
            { ...common, fill: 'currentColor', stroke: 'none' },
            h('path', { d: 'M8 5.1v13.8L19 12 8 5.1Z' }),
          )
        case 'plus':
          return h('svg', common, h('path', { d: 'M12 5v14M5 12h14' }))
        case 'x':
          return h('svg', common, h('path', { d: 'M6 6l12 12M18 6L6 18' }))
        case 'chevronLeft':
          return h('svg', common, h('path', { d: 'M15 5l-7 7 7 7' }))
        case 'chevronRight':
          return h('svg', common, h('path', { d: 'M9 5l7 7-7 7' }))
        case 'refresh':
          return h(
            'svg',
            common,
            h('path', { d: 'M20 11a8 8 0 1 0-2.3 5.7' }),
            h('path', { d: 'M20 4v7h-7' }),
          )
        case 'volume':
          return h(
            'svg',
            common,
            h('path', { d: 'M4 9.5h3.5L12 5.8v12.4L7.5 14.5H4z', fill: 'currentColor', stroke: 'none' }),
            h('path', { d: 'M15.5 9a4 4 0 0 1 0 6' }),
            h('path', { d: 'M18.3 6.4a8 8 0 0 1 0 11.2' }),
          )
        case 'volumeOff':
          return h(
            'svg',
            common,
            h('path', { d: 'M4 9.5h3.5L12 5.8v12.4L7.5 14.5H4z', fill: 'currentColor', stroke: 'none' }),
            h('path', { d: 'M16 9.5l5 5M21 9.5l-5 5' }),
          )
        case 'solo':
          return h(
            'svg',
            common,
            h('path', { d: 'M4 13a8 8 0 0 1 16 0' }),
            h('path', { d: 'M4 13v3a2 2 0 0 0 2 2h1v-7H6a2 2 0 0 0-2 2Z' }),
            h('path', { d: 'M20 13v3a2 2 0 0 1-2 2h-1v-7h1a2 2 0 0 1 2 2Z' }),
          )
        case 'fullscreen':
          return h(
            'svg',
            common,
            h('path', { d: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5' }),
          )
        case 'trash':
          return h(
            'svg',
            common,
            h('path', { d: 'M4 7h16M9 7V4.8h6V7M7 7l1 13h8l1-13M10 11v5M14 11v5' }),
          )
        case 'check':
          return h('svg', common, h('path', { d: 'M5 12.5l4.5 4.5L19 7' }))
        case 'external':
          return h(
            'svg',
            common,
            h('path', { d: 'M14 4h6v6M20 4l-9 9' }),
            h('path', { d: 'M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5' }),
          )
        case 'chat':
          return h(
            'svg',
            common,
            h('path', { d: 'M20 12.5c0 3.6-3.6 6.5-8 6.5-1 0-2-.15-2.9-.43L4 20l1.1-3.6A6.1 6.1 0 0 1 4 12.5C4 8.9 7.6 6 12 6s8 2.9 8 6.5Z' }),
            h('path', { d: 'M9 12.5h.01M12 12.5h.01M15 12.5h.01' }),
          )
        case 'user':
          return h(
            'svg',
            common,
            h('circle', { cx: 12, cy: 8.5, r: 3.5 }),
            h('path', { d: 'M5.5 20a6.5 6.5 0 0 1 13 0' }),
          )
        case 'key':
          return h(
            'svg',
            common,
            h('circle', { cx: 8, cy: 12, r: 3.5 }),
            h('path', { d: 'M11.5 12H21M18 12v3M15 12v2.5' }),
          )
        case 'move':
          return h(
            'svg',
            common,
            h('path', { d: 'M12 3v18M3 12h18' }),
            h('path', { d: 'M9 6l3-3 3 3M9 18l3 3 3-3M6 9l-3 3 3 3M18 9l3 3-3 3' }),
          )
        case 'arrowUp':
          return h('svg', common, h('path', { d: 'M12 19V5M6 11l6-6 6 6' }))
        case 'arrowDown':
          return h('svg', common, h('path', { d: 'M12 5v14M6 13l6 6 6-6' }))
        case 'splitLeft':
          return h(
            'svg',
            common,
            h('path', { d: 'M12 3v18M8 8L4 12l4 4M16 8l4 4-4 4' }),
          )
        case 'splitRight':
          return h(
            'svg',
            common,
            h('path', { d: 'M12 3v18M16 8l4 4-4 4M8 8l-4 4 4 4' }),
          )
        case 'chevronsLeft':
          return h('svg', common, h('path', { d: 'M11 5L4 12l7 7M19 5l-7 7 7 7' }))
        case 'chevronsRight':
          return h('svg', common, h('path', { d: 'M13 5l7 7-7 7M5 5l7 7-7 7' }))
        default:
          return null
      }
    }

    function Modal({ title, t, onClose, children, footer, width }) {
      useEffect(() => {
        const onKey = (event) => {
          if (event.key === 'Escape') {
            event.stopPropagation()
            onClose()
          }
        }
        window.addEventListener('keydown', onKey, true)
        return () => window.removeEventListener('keydown', onKey, true)
      }, [onClose])

      return h(
        'div',
        {
          className: 'bl-modal-layer',
          role: 'presentation',
          onMouseDown: (event) => {
            if (event.target === event.currentTarget) onClose()
          },
        },
        h(
          'div',
          {
            className: 'bl-modal',
            role: 'dialog',
            'aria-modal': 'true',
            'aria-label': title,
            style: width ? { width } : undefined,
          },
          h(
            'div',
            { className: 'bl-modal-head' },
            h('h2', { className: 'bl-modal-title' }, title),
            h(
              'button',
              { className: 'bl-icon-btn', type: 'button', onClick: onClose, 'aria-label': t('close'), title: t('close') },
              h(Glyph, { name: 'x', size: 16 }),
            ),
          ),
          h('div', { className: 'bl-modal-body' }, children),
          footer ? h('div', { className: 'bl-modal-foot' }, footer) : null,
        ),
      )
    }

    function CookieDialog({ t, session, onSession, onClose, onToast }) {
      const [value, setValue] = useState('')
      const [busy, setBusy] = useState(false)
      const [error, setError] = useState('')
      const account = session?.account

      const save = async () => {
        if (busy) return
        if (!value.trim()) {
          setError(t('cookie_invalid'))
          return
        }
        setBusy(true)
        setError('')
        const response = await api('/session', { cookie: value.trim() }, 'POST')
        setBusy(false)
        if (!response.ok) {
          setError(response.error === 'LOCAL_SERVICE_UNAVAILABLE' ? t('network_error') : response.error || t('cookie_invalid'))
          return
        }
        setValue('')
        onSession(response)
        onToast(t('cookie_saved'))
        onClose()
      }

      const clear = async () => {
        if (busy) return
        setBusy(true)
        setError('')
        const response = await api('/session', undefined, 'DELETE')
        setBusy(false)
        if (!response.ok) {
          setError(response.error === 'LOCAL_SERVICE_UNAVAILABLE' ? t('network_error') : response.error || t('network_error'))
          return
        }
        onSession(response)
        onToast(t('cookie_cleared'))
        onClose()
      }

      return h(
        Modal,
        {
          title: t('cookie_title'),
          t,
          onClose,
          footer: h(
            React.Fragment,
            null,
            h(
              'button',
              {
                className: 'bl-btn danger',
                type: 'button',
                onClick: clear,
                disabled: busy || !session?.hasCookie,
              },
              t('cookie_clear'),
            ),
            h('span', { className: 'bl-foot-spacer' }),
            h('button', { className: 'bl-btn', type: 'button', onClick: onClose, disabled: busy }, t('cancel')),
            h(
              'button',
              { className: 'bl-btn primary', type: 'button', onClick: save, disabled: busy },
              busy ? t('loading') : t('cookie_save'),
            ),
          ),
        },
        h(
          'div',
          { className: 'bl-session-card' },
          account?.authenticated && account.face
            ? h('img', {
                className: 'bl-avatar bl-avatar-lg',
                src: imageUrl(account.face),
                alt: '',
                referrerPolicy: 'no-referrer',
                onError: (event) => {
                  event.currentTarget.style.display = 'none'
                },
              })
            : h(
                'span',
                { className: 'bl-avatar bl-avatar-lg bl-avatar-fallback' },
                h(Glyph, { name: account?.authenticated ? 'user' : 'key', size: 20 }),
              ),
          h(
            'div',
            { className: 'bl-session-text' },
            h(
              'div',
              { className: 'bl-session-name' },
              account?.authenticated
                ? account.uname || t('account_current')
                : account?.stale
                  ? t('account_stale')
                  : t('account_anonymous'),
            ),
            h(
              'div',
              { className: 'bl-session-sub' },
              account?.authenticated ? `UID ${account.uid} · Lv${account.level || 0}` : t('cookie_signed_out'),
            ),
          ),
          h(
            'span',
            {
              className: cx(
                'bl-status-dot',
                account?.authenticated ? 'is-ok' : account?.stale ? 'is-error' : 'is-idle',
              ),
            },
          ),
        ),
        h('p', { className: 'bl-hint' }, t('cookie_hint')),
        h('p', { className: 'bl-hint bl-hint-warn' }, t('cookie_warning')),
        h('textarea', {
          className: 'bl-field',
          value,
          onChange: (event) => setValue(event.target.value),
          placeholder: t('cookie_placeholder'),
          spellCheck: false,
          autoFocus: true,
          onKeyDown: (event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') save()
          },
        }),
        error ? h('p', { className: 'bl-error' }, error) : null,
        session?.cookiePath
          ? h(
              'p',
              { className: 'bl-hint bl-path' },
              `${t('cookie_path')}：`,
              h('code', null, session.cookiePath.replace(/^\/Users\/[^/]+/, '~')),
            )
          : null,
      )
    }

    function AddRoomDialog({ t, onAdd, onClose }) {
      const [value, setValue] = useState('')
      const [busy, setBusy] = useState(false)
      const [error, setError] = useState('')

      const submit = async (event) => {
        if (event) event.preventDefault()
        if (busy) return
        const trimmed = value.trim()
        if (!trimmed) {
          setError(t('room_input_placeholder'))
          return
        }
        setBusy(true)
        setError('')
        const response = await onAdd(trimmed)
        setBusy(false)
        if (!response?.ok) {
          setError(response?.error === 'LOCAL_SERVICE_UNAVAILABLE' ? t('network_error') : response?.error || t('network_error'))
          return
        }
        onClose()
      }

      return h(
        Modal,
        {
          title: t('add_room_title'),
          t,
          onClose,
          footer: h(
            React.Fragment,
            null,
            h('span', { className: 'bl-foot-spacer' }),
            h('button', { className: 'bl-btn', type: 'button', onClick: onClose, disabled: busy }, t('cancel')),
            h(
              'button',
              { className: 'bl-btn primary', type: 'button', onClick: submit, disabled: busy },
              busy ? t('loading') : t('add'),
            ),
          ),
        },
        h(
          'form',
          { className: 'bl-form', onSubmit: submit },
          h('p', { className: 'bl-hint' }, t('add_room_hint')),
          h('input', {
            className: 'bl-field bl-field-single',
            value,
            onChange: (event) => setValue(event.target.value),
            placeholder: t('room_input_placeholder'),
            spellCheck: false,
            autoFocus: true,
            inputMode: 'text',
          }),
          error ? h('p', { className: 'bl-error' }, error) : null,
          h('button', { type: 'submit', style: { display: 'none' }, tabIndex: -1 }, t('add')),
        ),
      )
    }

    const LiveWindow = React.memo(function LiveWindow({
      room,
      stackIndex,
      stackCount,
      layoutX,
      layoutY,
      layoutW,
      layoutH,
      focused,
      volume,
      audioUnlocked,
      soloId,
      danmakuOn,
      quality,
      t,
      onFocus,
      onClose,
      onVolume,
      onSolo,
      onQuality,
      onOpenMoveMenu,
    }) {
      const rootRef = useRef(null)
      const videoRef = useRef(null)
      const playerRef = useRef(null)
      const retriesRef = useRef(0)
      const tRef = useLatest(t)
      const [play, setPlay] = useState(null)
      const [phase, setPhase] = useState('idle')
      const [error, setError] = useState('')
      const [candidate, setCandidate] = useState(0)
      const [attempt, setAttempt] = useState(0)
      const [needsTap, setNeedsTap] = useState(false)
      const [isFullscreen, setIsFullscreen] = useState(false)
      const messages = useDanmaku(room.id, room.liveStatus, danmakuOn)
      const cover = imageUrl(room.keyframe || room.cover)
      const fallbackCover = imageUrl(room.cover)
      const [ambientSrc, setAmbientSrc] = useState(cover)

      useEffect(() => {
        setAmbientSrc(cover)
      }, [cover])

      const sources = useMemo(() => {
        if (!play?.urls?.length) return []
        const list = []
        for (const url of play.urls) {
          list.push(proxyUrl(url))
          list.push(url)
        }
        return list
      }, [play])

      useEffect(() => {
        let cancelled = false
        if (room.liveStatus !== 1) {
          setPlay(null)
          setPhase('offline')
          setError('')
          return () => {
            cancelled = true
          }
        }
        setPhase('loading')
        setError('')
        setNeedsTap(false)
        api('/play', { id: room.id, qn: quality })
          .then((response) => {
            if (cancelled) return
            if (!response.ok) {
              setError(
                response.error === 'LOCAL_SERVICE_UNAVAILABLE'
                  ? tRef.current('network_error')
                  : response.error || tRef.current('play_error'),
              )
              setPhase('error')
              return
            }
            if (!response.live) {
              setPlay(null)
              setPhase('offline')
              return
            }
            if (response.unsupported) {
              setError(response.error || tRef.current('stream_unsupported'))
              setPhase('error')
              return
            }
            retriesRef.current = 0
            setCandidate(0)
            setPlay(response)
            setPhase('ready')
          })
          .catch(() => {
            if (!cancelled) {
              setError(tRef.current('play_error'))
              setPhase('error')
            }
          })
        return () => {
          cancelled = true
        }
      }, [room.id, room.liveStatus, quality, attempt])

      useEffect(() => {
        if (!play || !sources.length) return undefined
        const video = videoRef.current
        if (!video) return undefined
        let disposed = false
        let player = null
        const url = sources[Math.min(candidate, sources.length - 1)]

        loadMpegts()
          .then((mpegts) => {
            if (disposed) return
            if (typeof mpegts.isSupported === 'function' && !mpegts.isSupported()) {
              throw new Error('当前浏览器不支持 MSE 播放')
            }
            player = mpegts.createPlayer(
              { type: 'flv', isLive: true, url, hasAudio: true, hasVideo: true },
              {
                enableWorker: false,
                enableStashBuffer: false,
                stashInitialSize: 128,
                lazyLoad: false,
                autoCleanupSourceBuffer: true,
                autoCleanupMaxBackwardDuration: 30,
                autoCleanupMinBackwardDuration: 8,
                liveBufferLatencyChasing: true,
                liveBufferLatencyMaxLatency: 3.5,
                liveBufferLatencyMinRemain: 0.8,
              },
            )
            playerRef.current = player
            player.on(mpegts.Events.ERROR, (_type, detail) => {
              if (disposed) return
              const next = candidate + 1
              if (next < sources.length) {
                setCandidate(next)
                return
              }
              if (retriesRef.current < 2) {
                retriesRef.current += 1
                window.setTimeout(() => {
                  if (!disposed) setAttempt((value) => value + 1)
                }, 2200)
                return
              }
              setError(`${tRef.current('play_error')}${detail ? `：${detail}` : ''}`)
              setPhase('error')
            })
            player.attachMediaElement(video)
            player.load()
            setPhase('buffering')
            const started = player.play()
            if (started && typeof started.catch === 'function') {
              started.catch(() => {
                if (disposed) return
                try {
                  video.muted = true
                  const retry = video.play()
                  if (retry && typeof retry.catch === 'function') retry.catch(() => setNeedsTap(true))
                } catch {
                  setNeedsTap(true)
                }
              })
            }
          })
          .catch((loadError) => {
            if (disposed) return
            setError(String(loadError?.message || loadError))
            setPhase('error')
          })

        return () => {
          disposed = true
          if (player) {
            try {
              player.pause()
            } catch {
              /* ignore */
            }
            try {
              player.unload()
            } catch {
              /* ignore */
            }
            try {
              player.detachMediaElement()
            } catch {
              /* ignore */
            }
            try {
              player.destroy()
            } catch {
              /* ignore */
            }
          }
          playerRef.current = null
          try {
            video.removeAttribute('src')
            video.load()
          } catch {
            /* ignore */
          }
        }
      }, [play, sources, candidate])

      useEffect(() => {
        const video = videoRef.current
        if (!video) return
        const fullVolume = focused || soloId === room.id
        video.volume = clamp((Number(volume) / 100) * (fullVolume ? 1 : DUCK_FACTOR), 0, 1)
        const muted = !audioUnlocked || (soloId !== null && soloId !== room.id)
        video.muted = muted
        if (!muted && video.paused) {
          const started = video.play()
          if (started && typeof started.catch === 'function') {
            started.catch(() => setNeedsTap(true))
          }
        }
      }, [volume, audioUnlocked, soloId, room.id, phase, focused])

      useEffect(() => {
        const onChange = () => setIsFullscreen(document.fullscreenElement === rootRef.current)
        document.addEventListener('fullscreenchange', onChange)
        return () => document.removeEventListener('fullscreenchange', onChange)
      }, [])

      const toggleFullscreen = () => {
        if (document.fullscreenElement) {
          document.exitFullscreen?.().catch(() => {})
          return
        }
        rootRef.current?.requestFullscreen?.().catch(() => {})
      }

      const resume = () => {
        setNeedsTap(false)
        const video = videoRef.current
        if (video) {
          video.play().catch(() => setNeedsTap(true))
        }
      }

      const qualityOptions = play?.qualities?.length
        ? play.qualities.slice()
        : [{ qn: quality, label: t('quality') }]
      if (!qualityOptions.some((option) => option.qn === quality)) {
        qualityOptions.unshift({ qn: quality, label: `${t('quality')} ${quality}` })
      }
      const shownQuality = play?.qn || quality
      const ducked = !focused && soloId !== room.id

      return h(
        'article',
        {
          ref: rootRef,
          className: cx(
            'bl-window',
            focused ? 'is-focused' : 'is-unfocused',
            focused && soloId !== null ? 'is-solo-focus' : null,
            stackCount > 1 ? 'is-stacked' : null,
            isFullscreen ? 'is-fullscreen' : null,
          ),
          style: { left: layoutX, top: layoutY, width: layoutW, height: layoutH },
          'aria-label': room.title || t('no_title'),
          onClick: () => onFocus(room.id),
        },
        h(
          'header',
          { className: 'bl-win-head' },
          h('span', { className: cx('bl-live-dot', room.liveStatus === 1 ? 'is-live' : null), 'aria-hidden': true }),
          h(
            'span',
            { className: 'bl-win-titlewrap' },
            h(
              'span',
              { className: 'bl-win-title-row' },
              h('span', { className: 'bl-win-title', title: room.title }, room.title || t('no_title')),
              stackCount > 1
                ? h(
                    'span',
                    {
                      className: 'bl-stack-pill',
                      title: `${t('stack_title')} ${stackIndex + 1}/${stackCount}`,
                    },
                    `${stackIndex + 1}/${stackCount}`,
                  )
                : null,
            ),
            h(
              'span',
              { className: 'bl-win-user', title: room.uname },
              room.uname || t('unknown_user'),
              room.area ? ` · ${room.area}` : '',
            ),
          ),
          h(
            'div',
            { className: 'bl-controls' },
            h(
              'span',
              {
                className: cx('bl-vol', ducked ? 'is-ducked' : null),
                title: `${t('volume')} ${volume}% · ${t('volume_shortcut')}${ducked ? ` · ${t('duck_hint')}` : ''}`,
              },
              h(
                'button',
                {
                  className: cx('bl-icon-btn', volume === 0 ? 'is-muted' : null),
                  type: 'button',
                  onClick: () => onVolume(room.id, volume > 0 ? 0 : 60, false),
                  'aria-label': t('volume'),
                },
                h(Glyph, { name: volume === 0 ? 'volumeOff' : 'volume', size: 15 }),
              ),
              h('input', {
                type: 'range',
                min: 0,
                max: 100,
                step: 1,
                value: volume,
                onChange: (event) => onVolume(room.id, Number(event.target.value), true),
                'aria-label': t('volume'),
              }),
            ),
            h(
              'button',
              {
                className: cx('bl-solo', soloId === room.id ? 'is-on' : null),
                type: 'button',
                onClick: () => onSolo(room.id),
                title: `${t('solo_hint')} (Shift+S)`,
                'aria-pressed': soloId === room.id,
              },
              h(Glyph, { name: 'solo', size: 14 }),
              h('span', null, t('solo')),
            ),
            play?.qualities?.length
              ? h(
                  'select',
                  {
                    className: 'bl-quality',
                    value: shownQuality,
                    onChange: (event) => onQuality(room.id, Number(event.target.value)),
                    title: t('quality'),
                    'aria-label': t('quality'),
                  },
                  qualityOptions.map((option) =>
                    h('option', { key: option.qn, value: option.qn }, option.label),
                  ),
                )
              : null,
            h(
              'button',
              {
                className: 'bl-icon-btn',
                type: 'button',
                onClick: (event) => {
                  event.stopPropagation()
                  onOpenMoveMenu(room.id, event.currentTarget)
                },
                title: t('move_window'),
                'aria-label': t('move_window'),
                'aria-haspopup': 'menu',
              },
              h(Glyph, { name: 'move', size: 15 }),
            ),
            h(
              'button',
              {
                className: 'bl-icon-btn',
                type: 'button',
                onClick: toggleFullscreen,
                title: t('fullscreen'),
                'aria-label': t('fullscreen'),
              },
              h(Glyph, { name: 'fullscreen', size: 15 }),
            ),
            h(
              'button',
              {
                className: 'bl-icon-btn',
                type: 'button',
                onClick: () => setAttempt((value) => value + 1),
                title: t('refresh'),
                'aria-label': t('refresh'),
              },
              h(Glyph, { name: 'refresh', size: 15 }),
            ),
            h(
              'button',
              {
                className: 'bl-icon-btn',
                type: 'button',
                onClick: (event) => {
                  event.stopPropagation()
                  onClose(room.id)
                },
                title: t('close'),
                'aria-label': t('close'),
              },
              h(Glyph, { name: 'x', size: 15 }),
            ),
          ),
        ),
        h(
          'div',
          { className: 'bl-screen' },
          ambientSrc
            ? h('img', {
                className: 'bl-screen-bg',
                src: ambientSrc,
                alt: '',
                referrerPolicy: 'no-referrer',
                'aria-hidden': true,
                onError: (event) => {
                  if (fallbackCover && ambientSrc !== fallbackCover) setAmbientSrc(fallbackCover)
                  else event.currentTarget.style.display = 'none'
                },
              })
            : null,
          h('video', {
            ref: videoRef,
            className: 'bl-video',
            'data-room-id': room.id,
            poster: ambientSrc || undefined,
            playsInline: true,
            preload: 'none',
            onPlaying: () => {
              setPhase('playing')
              setNeedsTap(false)
            },
            onWaiting: () => setPhase((value) => (value === 'playing' ? 'buffering' : value)),
            onPause: () => setPhase((value) => (value === 'playing' ? 'buffering' : value)),
            onClick: () => {
              if (needsTap) resume()
            },
          }),
          phase !== 'playing' && !needsTap
            ? h(
                'div',
                { className: 'bl-overlay' },
                ambientSrc
                  ? h('img', {
                      className: 'bl-overlay-cover',
                      src: ambientSrc,
                      alt: '',
                      referrerPolicy: 'no-referrer',
                      onError: (event) => {
                        if (fallbackCover && ambientSrc !== fallbackCover) setAmbientSrc(fallbackCover)
                        else event.currentTarget.style.display = 'none'
                      },
                    })
                  : null,
                h(
                  'div',
                  { className: 'bl-overlay-content' },
                  phase === 'offline'
                    ? h(React.Fragment, null, h(Glyph, { name: 'chat', size: 26 }), h('p', null, t('offline_hint')))
                    : phase === 'error'
                      ? h(
                          React.Fragment,
                          null,
                          h('p', { className: 'bl-overlay-error' }, error || t('play_error')),
                          h(
                            'button',
                            {
                              className: 'bl-overlay-btn',
                              type: 'button',
                              onClick: () => setAttempt((value) => value + 1),
                            },
                            h(Glyph, { name: 'refresh', size: 15 }),
                            t('retry'),
                          ),
                        )
                      : h(
                          React.Fragment,
                          null,
                          h('span', { className: 'bl-spinner' }),
                          h('p', null, phase === 'loading' ? t('loading_stream') : t('loading')),
                        ),
                ),
              )
            : null,
          needsTap && phase !== 'offline' && phase !== 'error'
            ? h(
                'button',
                { className: 'bl-tap', type: 'button', onClick: resume },
                h(Glyph, { name: 'play', size: 20 }),
                t('need_tap'),
              )
            : null,
          danmakuOn && messages.length
            ? h(
                'div',
                { className: 'bl-dm-layer', 'aria-hidden': true },
                messages.map((message) =>
                  h(
                    'div',
                    { key: message.id, className: cx('bl-dm', message.kind === 'gift' ? 'is-gift' : null, message.kind === 'super' ? 'is-super' : null) },
                    message.user
                      ? h('span', { className: 'bl-dm-user' }, message.user)
                      : null,
                    h('span', { className: 'bl-dm-text' }, message.text),
                  ),
                ),
              )
            : null,
        ),
        h(
          'footer',
          { className: 'bl-win-foot' },
          h(
            'span',
            { className: cx('bl-pill', room.liveStatus === 1 ? 'is-live' : 'is-offline') },
            room.liveStatus === 1 ? t('live') : t('offline'),
          ),
          room.liveStatus === 1
            ? h('span', { className: 'bl-foot-item' }, `${t('viewers')} ${formatCount(room.online)}`)
            : null,
          play?.qn
            ? h(
                'span',
                { className: 'bl-foot-item' },
                `${t('quality')} ${play.qualities?.find((option) => option.qn === play.qn)?.label || play.qn}`,
              )
            : null,
          room.liveStatus === 1 && room.liveTime
            ? h('span', { className: 'bl-foot-item' }, `${t('elapsed')} ${formatElapsed(room.liveTime)}`)
            : null,
          h('span', { className: 'bl-foot-item' }, `${t('room_id')} ${room.shortId || room.id}`),
          h('span', { className: 'bl-foot-grow' }),
          h(
            'a',
            {
              className: 'bl-icon-btn',
              href: `https://live.bilibili.com/${room.id}`,
              target: '_blank',
              rel: 'noreferrer noopener',
              title: t('open_external'),
              'aria-label': t('open_external'),
              onClick: (event) => event.stopPropagation(),
            },
            h(Glyph, { name: 'external', size: 14 }),
          ),
        ),
      )
    })

    const CSS = `
.bl-page{position:relative;display:flex;width:100%;height:100%;min-height:min(520px,100vh);overflow:hidden;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:13px;line-height:1.45;container-type:inline-size}
.bl-page *{box-sizing:border-box}
.bl-page button{font:inherit;color:inherit;background:none;border:0;padding:0;cursor:pointer}
.bl-page button:disabled{opacity:.45;cursor:not-allowed}
.bl-page :focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}
.bl-page a{color:inherit;text-decoration:none}
.bl-rail{display:flex;flex-direction:column;gap:10px;width:252px;flex:0 0 252px;min-width:0;min-height:0;padding:14px 12px 12px;background:var(--dsw-alias-bg-layer-1);border-right:1px solid var(--dsw-alias-border-l1);overflow:hidden;transition:width .28s cubic-bezier(.22,1,.36,1),flex-basis .28s cubic-bezier(.22,1,.36,1),padding .28s cubic-bezier(.22,1,.36,1),opacity .2s ease,border-color .2s ease}
.bl-page.is-rail-collapsed .bl-rail{width:0;flex-basis:0;padding:0;border-right-width:0;opacity:0;pointer-events:none}
.bl-page.is-window-edge .bl-rail{padding-top:44px}
.bl-page.is-window-edge.is-rail-collapsed .bl-stagebar{padding-left:46px}
.bl-rail-toggle{flex:none;color:var(--dsw-alias-label-secondary)}
.bl-rail-toggle:hover{color:var(--dsw-alias-label-primary)}
.bl-account{display:flex;align-items:center;gap:10px;width:100%;padding:9px 10px;border-radius:12px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);text-align:left;transition:border-color .16s ease,background .16s ease}
.bl-account:hover{border-color:var(--dsw-alias-border-l2)}
.bl-avatar{width:32px;height:32px;border-radius:50%;object-fit:cover;background:var(--dsw-alias-bg-base);display:grid;place-items:center;overflow:hidden;flex:none;color:var(--dsw-alias-label-secondary)}
.bl-avatar-lg{width:42px;height:42px}
.bl-avatar-fallback{border:1px solid var(--dsw-alias-border-l1)}
.bl-account-text{display:flex;flex-direction:column;min-width:0;gap:1px}
.bl-account-title{font-size:12.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bl-account-sub{font-size:11px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bl-status-dot{width:7px;height:7px;border-radius:50%;margin-left:auto;flex:none;background:var(--dsw-alias-state-idle-primary)}
.bl-status-dot.is-ok{background:var(--dsw-alias-state-success-primary)}
.bl-status-dot.is-error{background:var(--dsw-alias-state-error-primary)}
.bl-now{position:relative;display:flex;align-items:flex-end;width:100%;min-height:96px;padding:10px;border-radius:12px;border:1px solid var(--dsw-alias-border-l1);overflow:hidden;text-align:left;background:var(--dsw-alias-bg-layer-2)}
.bl-now:hover{border-color:var(--dsw-alias-border-l2)}
.bl-now-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.55;filter:saturate(.85)}
.bl-now::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.06),rgba(0,0,0,.74));pointer-events:none}
.bl-now-body{position:relative;z-index:1;display:flex;flex-direction:column;gap:2px;min-width:0;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.5)}
.bl-now-kicker{display:flex;align-items:center;gap:5px;font-size:10.5px;letter-spacing:.04em;text-transform:uppercase;opacity:.86}
.bl-now-title{font-size:13px;font-weight:600;line-height:1.35;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;overflow-wrap:anywhere}
.bl-now-user{font-size:11px;opacity:.84;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bl-list-head{display:flex;align-items:center;justify-content:space-between;padding:6px 4px 0;font-size:11px;font-weight:600;letter-spacing:.04em;color:var(--dsw-alias-label-secondary);text-transform:uppercase}
.bl-list-count{font-weight:500;font-variant-numeric:tabular-nums}
.bl-rooms{display:flex;flex-direction:column;gap:3px;flex:1;min-height:0;overflow:auto;padding:1px 2px 2px 0;scrollbar-width:thin;scrollbar-color:var(--dsw-alias-border-l2) transparent}
.bl-rooms::-webkit-scrollbar{width:6px}
.bl-rooms::-webkit-scrollbar-thumb{background:var(--dsw-alias-border-l2);border-radius:3px}
.bl-room{position:relative;display:flex;align-items:center;gap:8px;padding:6px;border-radius:9px;border:1px solid transparent;cursor:pointer;transition:background .15s ease,border-color .15s ease}
.bl-room:hover{background:var(--dsw-alias-bg-layer-2)}
.bl-room.is-active{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-brand-primary)}
.bl-room-cover{position:relative;width:48px;height:30px;border-radius:6px;overflow:hidden;background:var(--dsw-alias-bg-base);flex:none;border:1px solid var(--dsw-alias-border-l1)}
.bl-room-cover img{width:100%;height:100%;object-fit:cover;display:block}
.bl-room-live{position:absolute;left:4px;bottom:3px;width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-state-idle-primary);box-shadow:0 0 0 2px rgba(0,0,0,.35)}
.bl-room-live.is-live{background:var(--dsw-alias-state-error-primary)}
.bl-room-text{display:flex;flex-direction:column;min-width:0;flex:1;gap:1px}
.bl-room-title{font-size:12px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bl-room-sub{font-size:10.5px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bl-room-side{display:flex;align-items:center;gap:2px;flex:none}
.bl-room-count{font-size:10px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}
.bl-room-remove{width:22px;height:22px;display:grid;place-items:center;border-radius:6px;color:var(--dsw-alias-label-secondary);opacity:0;transition:opacity .15s ease,color .15s ease,background .15s ease}
.bl-room:hover .bl-room-remove,.bl-room-remove.is-confirm{opacity:1}
.bl-room-remove:hover{background:var(--dsw-alias-bg-base);color:var(--dsw-alias-state-error-primary)}
.bl-room-remove.is-confirm{color:var(--dsw-alias-state-error-primary);background:var(--dsw-alias-bg-base)}
.bl-add{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;height:34px;border-radius:9px;border:1px dashed var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);font-size:12px;transition:border-color .15s ease,color .15s ease,background .15s ease}
.bl-add:hover{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-bg-layer-2)}
.bl-stage{position:relative;display:flex;flex-direction:column;flex:1;min-width:0;min-height:0}
.bl-stagebar{display:flex;align-items:center;gap:10px;padding:9px 16px;min-height:48px;border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base)}
.bl-stage-heading{display:flex;align-items:baseline;gap:9px;min-width:0}
.bl-stage-title{font-size:13px;font-weight:600;white-space:nowrap}
.bl-stage-sub{font-size:11px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bl-stage-actions{display:flex;align-items:center;gap:6px;margin-left:auto;flex:none}
.bl-action{display:inline-flex;align-items:center;gap:5px;height:28px;padding:0 9px;border-radius:8px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);font-size:12px;white-space:nowrap;transition:background .15s ease,border-color .15s ease,color .15s ease}
.bl-action:hover{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l2)}
.bl-action.is-on{color:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary)}
.bl-action.primary{background:var(--dsw-alias-brand-primary);border-color:transparent;color:var(--dsw-alias-bg-base)}
.bl-action.primary:hover{filter:brightness(1.05)}
.bl-dots{display:flex;align-items:center;gap:4px;margin:0 6px;max-width:170px;overflow:hidden}
.bl-dot{width:6px;height:6px;border-radius:3px;background:var(--dsw-alias-border-l2);transition:width .2s ease,background .2s ease}
.bl-dot.is-on{width:16px;background:var(--dsw-alias-brand-primary)}
.bl-dot.is-stack{height:9px;border-radius:2px;box-shadow:0 0 0 1px var(--dsw-alias-border-l2)}
.bl-viewport{position:relative;flex:1;min-height:0;overflow:hidden;padding:14px 16px 18px;overscroll-behavior:contain}
.bl-strip{position:relative;height:100%;will-change:transform}
.bl-strip.is-animated{transition:transform 460ms cubic-bezier(.22,1,.36,1)}
.bl-window{position:absolute;display:flex;flex-direction:column;min-width:0;min-height:0;border-radius:14px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);overflow:hidden;box-shadow:0 8px 28px rgba(0,0,0,.12);transition:left 340ms cubic-bezier(.22,1,.36,1),top 340ms cubic-bezier(.22,1,.36,1),width 460ms cubic-bezier(.22,1,.36,1),height 340ms cubic-bezier(.22,1,.36,1),opacity .25s ease,border-color .25s ease,box-shadow .25s ease}
.bl-window.is-unfocused{opacity:.8}
.bl-window.is-unfocused:hover{opacity:1}
.bl-window.is-focused{border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 0 1px var(--dsw-alias-brand-primary),0 14px 44px rgba(0,0,0,.18)}
.bl-window.is-focused.is-solo-focus{border-color:var(--dsw-alias-state-error-primary);box-shadow:0 0 0 1px var(--dsw-alias-state-error-primary),0 14px 44px rgba(0,0,0,.18)}
.bl-win-head{display:flex;align-items:center;gap:8px;min-height:42px;padding:7px 9px;border-bottom:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1)}
.bl-window.is-stacked .bl-win-head{min-height:38px;padding:5px 8px}
.bl-window.is-stacked .bl-win-foot{min-height:28px;padding:3px 8px}
.bl-window.is-stacked .bl-win-user{display:none}
.bl-live-dot{width:7px;height:7px;border-radius:50%;background:var(--dsw-alias-state-idle-primary);flex:none}
.bl-live-dot.is-live{background:var(--dsw-alias-state-error-primary);animation:bl-pulse 2.4s ease-out infinite}
.bl-win-titlewrap{display:flex;flex-direction:column;min-width:0;flex:1;gap:0}
.bl-win-title-row{display:flex;align-items:center;gap:6px;min-width:0}
.bl-win-title{font-size:12.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.bl-stack-pill{display:inline-flex;align-items:center;justify-content:center;flex:none;height:15px;padding:0 4px;border-radius:4px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-2);font-size:9px;line-height:1;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}
.bl-win-user{font-size:10.5px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bl-controls{display:flex;align-items:center;gap:4px;flex:none}
.bl-icon-btn{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:7px;color:var(--dsw-alias-label-secondary);transition:background .15s ease,color .15s ease}
.bl-icon-btn:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.bl-icon-btn.is-muted{color:var(--dsw-alias-state-warn-primary)}
.bl-vol{display:flex;align-items:center;gap:2px}
.bl-vol input[type=range]{width:58px;height:14px;accent-color:var(--dsw-alias-brand-primary);cursor:pointer;margin:0}
.bl-vol.is-ducked input[type=range]{opacity:.62}
.bl-solo{display:inline-flex;align-items:center;gap:3px;height:24px;padding:0 6px;border-radius:6px;border:1px solid var(--dsw-alias-border-l1);font-size:10.5px;color:var(--dsw-alias-label-secondary)}
.bl-solo:hover{background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}
.bl-solo.is-on{color:var(--dsw-alias-brand-primary);border-color:var(--dsw-alias-brand-primary);background:var(--dsw-alias-bg-layer-2)}
.bl-quality{height:24px;max-width:88px;padding:0 3px;border-radius:6px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);font-size:10.5px}
.bl-screen{position:relative;display:flex;align-items:center;justify-content:center;flex:1;min-height:0;overflow:hidden;background:#000}
.bl-screen-bg{position:absolute;inset:-30px;width:calc(100% + 60px);height:calc(100% + 60px);object-fit:cover;filter:blur(28px) brightness(.46) saturate(.9);transform:scale(1.04);opacity:.82;pointer-events:none}
.bl-video{position:relative;z-index:1;display:block;width:auto;height:auto;max-width:100%;max-height:100%;object-fit:contain;background:transparent}
.bl-overlay{position:absolute;inset:0;z-index:3;display:flex;align-items:center;justify-content:center;overflow:hidden}
.bl-overlay-cover{position:absolute;inset:-12px;width:calc(100% + 24px);height:calc(100% + 24px);object-fit:cover;filter:blur(2px) brightness(.52);transform:scale(1.04)}
.bl-overlay::after{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(0,0,0,.1),rgba(0,0,0,.62))}
.bl-overlay-content{position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;gap:10px;max-width:340px;padding:24px;text-align:center;color:#fff}
.bl-overlay-content p{margin:0;font-size:12px;line-height:1.55;color:rgba(255,255,255,.82)}
.bl-overlay-error{color:#ffb4b4!important;font-weight:500}
.bl-overlay-btn{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 12px;border-radius:8px;background:rgba(255,255,255,.14);border:1px solid rgba(255,255,255,.24);color:#fff;font-size:12px}
.bl-overlay-btn:hover{background:rgba(255,255,255,.22)}
.bl-spinner{width:22px;height:22px;border-radius:50%;border:2px solid rgba(255,255,255,.25);border-top-color:#fff;animation:bl-spin .9s linear infinite}
.bl-tap{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;background:rgba(0,0,0,.42);color:#fff;font-size:12px;z-index:4}
.bl-tap:hover{background:rgba(0,0,0,.32)}
.bl-dm-layer{position:absolute;left:0;right:0;bottom:0;z-index:2;display:flex;flex-direction:column;justify-content:flex-end;max-height:52%;padding:30px 14px 12px;overflow:hidden;pointer-events:none;-webkit-mask-image:linear-gradient(180deg,transparent,#000 26%);mask-image:linear-gradient(180deg,transparent,#000 26%)}
.bl-dm{font-size:12px;line-height:1.5;color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.9);margin-top:3px;overflow-wrap:anywhere;animation:bl-dm-in .18s ease-out}
.bl-dm-user{color:#93d6ff;font-weight:600;margin-right:4px}
.bl-dm.is-gift .bl-dm-user,.bl-dm.is-gift .bl-dm-text{color:#ffd479}
.bl-dm.is-super{color:#ffd479;font-weight:600}
.bl-win-foot{display:flex;align-items:center;gap:10px;min-height:32px;padding:5px 10px;border-top:1px solid var(--dsw-alias-border-l1);font-size:10.5px;color:var(--dsw-alias-label-secondary);white-space:nowrap;overflow:hidden}
.bl-pill{display:inline-flex;align-items:center;height:17px;padding:0 6px;border-radius:5px;font-size:10px;border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary)}
.bl-pill.is-live{color:var(--dsw-alias-state-error-primary);border-color:currentColor}
.bl-foot-item{overflow:hidden;text-overflow:ellipsis;min-width:0}
.bl-foot-grow{flex:1}
.bl-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;height:100%;padding:36px;text-align:center;color:var(--dsw-alias-label-secondary)}
.bl-empty svg{opacity:.55}
.bl-empty h3{margin:0;font-size:15px;font-weight:600;color:var(--dsw-alias-label-primary)}
.bl-empty p{margin:0;max-width:380px;font-size:12px;line-height:1.6}
.bl-arrow{position:absolute;top:50%;z-index:5;display:grid;place-items:center;width:34px;height:58px;border-radius:10px;transform:translateY(-50%);background:var(--dsw-alias-bg-overlay);border:1px solid var(--dsw-alias-border-l1);box-shadow:0 6px 20px rgba(0,0,0,.18);color:var(--dsw-alias-label-primary);opacity:0;transition:opacity .18s ease,background .18s ease}
.bl-viewport:hover .bl-arrow{opacity:1}
.bl-arrow:hover{background:var(--dsw-alias-bg-layer-2)}
.bl-arrow.is-left{left:22px}
.bl-arrow.is-right{right:22px}
.bl-arrow:disabled{display:none}
.bl-scroll{position:absolute;left:16px;right:16px;bottom:5px;width:calc(100% - 32px);height:3px;margin:0;appearance:none;-webkit-appearance:none;background:var(--dsw-alias-border-l1);border-radius:2px;opacity:.55;cursor:pointer;z-index:4;transition:opacity .18s ease}
.bl-scroll:hover{opacity:1}
.bl-scroll::-webkit-slider-thumb{appearance:none;-webkit-appearance:none;width:var(--bl-thumb,22%);height:3px;border-radius:2px;background:var(--dsw-alias-label-secondary);border:0}
.bl-scroll::-moz-range-thumb{width:22%;height:3px;border-radius:2px;background:var(--dsw-alias-label-secondary);border:0}
.bl-scroll::-moz-range-track{height:3px;background:var(--dsw-alias-border-l1)}
.bl-menu-layer{position:fixed;inset:0;z-index:70;background:transparent}
.bl-move-menu{position:absolute;display:flex;flex-direction:column;gap:1px;width:252px;max-height:calc(100vh - 24px);overflow:auto;padding:5px;border-radius:12px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-overlay);box-shadow:0 18px 54px rgba(0,0,0,.34);animation:bl-rise .14s ease-out}
.bl-move-head{display:flex;align-items:center;gap:6px;padding:6px 8px 7px;margin-bottom:3px;border-bottom:1px solid var(--dsw-alias-border-l1);min-width:0}
.bl-move-kicker{font-size:9.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--dsw-alias-label-secondary);flex:none}
.bl-move-room{font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;flex:1}
.bl-move-stack{font-size:9.5px;color:var(--dsw-alias-label-secondary);flex:none;font-variant-numeric:tabular-nums}
.bl-move-item{display:flex;align-items:center;gap:8px;width:100%;padding:6px 8px;border-radius:7px;font-size:12px;text-align:left;color:var(--dsw-alias-label-primary)}
.bl-move-item svg{color:var(--dsw-alias-label-secondary);flex:none}
.bl-move-item:hover:not(:disabled){background:var(--dsw-alias-bg-layer-2)}
.bl-move-item:disabled{opacity:.38;cursor:not-allowed}
.bl-move-sep{height:1px;margin:3px 4px;background:var(--dsw-alias-border-l1)}
.bl-move-hint{padding:7px 8px 2px;margin-top:4px;border-top:1px solid var(--dsw-alias-border-l1);font-size:9.5px;line-height:1.55;color:var(--dsw-alias-label-secondary)}
.bl-modal-layer{position:fixed;inset:0;z-index:90;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(0,0,0,.42);backdrop-filter:blur(3px);animation:bl-fade .16s ease-out}
.bl-modal{display:flex;flex-direction:column;width:min(520px,100%);max-height:min(82vh,660px);border-radius:16px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-overlay);box-shadow:0 26px 90px rgba(0,0,0,.38);overflow:hidden;animation:bl-rise .18s ease-out}
.bl-modal-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px 10px}
.bl-modal-title{margin:0;font-size:14px;font-weight:600}
.bl-modal-body{display:flex;flex-direction:column;gap:10px;padding:4px 16px 16px;overflow:auto}
.bl-modal-foot{display:flex;align-items:center;gap:8px;padding:12px 16px;border-top:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1)}
.bl-foot-spacer{flex:1}
.bl-btn{display:inline-flex;align-items:center;justify-content:center;height:32px;padding:0 14px;border-radius:9px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1);font-size:12px;transition:background .15s ease,border-color .15s ease,filter .15s ease}
.bl-btn:hover{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-border-l2)}
.bl-btn.primary{background:var(--dsw-alias-brand-primary);border-color:transparent;color:var(--dsw-alias-bg-base)}
.bl-btn.primary:hover{filter:brightness(1.06)}
.bl-btn.danger{color:var(--dsw-alias-state-error-primary);border-color:var(--dsw-alias-border-l1)}
.bl-btn.danger:hover{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-state-error-primary)}
.bl-session-card{display:flex;align-items:center;gap:11px;padding:10px 12px;border-radius:12px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-layer-1)}
.bl-session-text{display:flex;flex-direction:column;min-width:0;gap:1px}
.bl-session-name{font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bl-session-sub{font-size:11px;color:var(--dsw-alias-label-secondary)}
.bl-hint{margin:0;font-size:11.5px;line-height:1.6;color:var(--dsw-alias-label-secondary)}
.bl-hint-warn{color:var(--dsw-alias-state-warn-primary)}
.bl-path{margin-top:2px;overflow-wrap:anywhere}
.bl-path code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;padding:1px 4px;border-radius:4px;background:var(--dsw-alias-bg-base)}
.bl-field{width:100%;min-height:94px;resize:vertical;padding:9px 10px;border-radius:10px;border:1px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;line-height:1.55}
.bl-field:focus{outline:none;border-color:var(--dsw-alias-brand-primary);box-shadow:0 0 0 2px color-mix(in srgb,var(--dsw-alias-brand-primary) 22%,transparent)}
.bl-field-single{min-height:0;height:34px;font-family:inherit;font-size:12.5px;resize:none}
.bl-error{margin:0;font-size:11.5px;color:var(--dsw-alias-state-error-primary);line-height:1.5}
.bl-form{display:flex;flex-direction:column;gap:10px}
.bl-toast{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:120;padding:8px 14px;border-radius:9px;background:var(--dsw-alias-bg-overlay);border:1px solid var(--dsw-alias-border-l1);box-shadow:0 10px 34px rgba(0,0,0,.26);font-size:12px;animation:bl-rise .18s ease-out;pointer-events:none}
.bl-spin{animation:bl-spin .9s linear infinite}
.bl-window:fullscreen{left:0!important;top:0!important;width:100vw!important;height:100vh!important;border-radius:0;border:0;background:#000}
.bl-window:fullscreen .bl-screen{background:#000}
@keyframes bl-spin{to{transform:rotate(360deg)}}
@keyframes bl-pulse{0%{box-shadow:0 0 0 0 color-mix(in srgb,var(--dsw-alias-state-error-primary) 55%,transparent)}70%{box-shadow:0 0 0 5px transparent}100%{box-shadow:0 0 0 0 transparent}}
@keyframes bl-dm-in{from{opacity:0;transform:translateY(3px)}to{opacity:1;transform:none}}
@keyframes bl-fade{from{opacity:0}to{opacity:1}}
@keyframes bl-rise{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
@container (max-width:980px){.bl-rail{width:208px;flex-basis:208px}.bl-stage-sub{display:none}.bl-action .bl-action-label{display:none}.bl-dots{max-width:110px}}
@container (max-width:720px){.bl-vol input[type=range],.bl-quality{display:none}.bl-win-user{display:none}.bl-solo span{display:none}.bl-now{min-height:78px}}
@media (max-width:1120px){.bl-rail{width:224px;flex-basis:224px}.bl-stage-sub{display:none}.bl-action .bl-action-label{display:none}.bl-dots{max-width:110px}}
@media (max-width:860px){.bl-page{flex-direction:column}.bl-rail{width:100%;flex:0 0 auto;max-height:44%;border-right:0;border-bottom:1px solid var(--dsw-alias-border-l1)}.bl-now{min-height:74px}.bl-stage{min-height:0}.bl-vol input[type=range]{width:46px}.bl-solo span{display:none}}
@media (prefers-reduced-motion:reduce){.bl-strip.is-animated{transition:none}.bl-window{transition:none}.bl-rail{transition:none}.bl-live-dot.is-live,.bl-spinner,.bl-spin,.bl-dm,.bl-modal,.bl-modal-layer,.bl-toast,.bl-move-menu{animation:none}}
`

    let columnSequence = 0

    function newColumnId() {
      columnSequence += 1
      return `col-${Date.now().toString(36)}-${columnSequence.toString(36)}`
    }

    function cloneColumns(columns) {
      return columns.map((column) => ({ id: column.id, windows: column.windows.slice() }))
    }

    function locateRoom(columns, roomId) {
      for (let columnIndex = 0; columnIndex < columns.length; columnIndex += 1) {
        const windowIndex = columns[columnIndex].windows.indexOf(roomId)
        if (windowIndex >= 0) {
          return { columnIndex, windowIndex, column: columns[columnIndex] }
        }
      }
      return null
    }

    function normalizeColumns(rawColumns, validIds) {
      if (!Array.isArray(rawColumns)) return []
      const usedRooms = new Set()
      const usedColumns = new Set()
      const columns = []
      for (const raw of rawColumns) {
        if (!raw || typeof raw !== 'object' || !Array.isArray(raw.windows)) continue
        const windows = []
        for (const id of raw.windows) {
          if (typeof id !== 'string' || !validIds.has(id) || usedRooms.has(id)) continue
          usedRooms.add(id)
          windows.push(id)
        }
        if (!windows.length) continue
        const id =
          typeof raw.id === 'string' && raw.id && !usedColumns.has(raw.id) ? raw.id : newColumnId()
        usedColumns.add(id)
        columns.push({ id, windows })
      }
      return columns
    }

    function removeRoomFromColumns(columns, roomId) {
      const columnIndex = columns.findIndex((column) => column.windows.includes(roomId))
      if (columnIndex < 0) return { columns, nextFocus: null }
      const windowIndex = columns[columnIndex].windows.indexOf(roomId)
      const next = cloneColumns(columns)
      next[columnIndex].windows.splice(windowIndex, 1)
      let nextFocus = null
      if (next[columnIndex].windows.length) {
        nextFocus = next[columnIndex].windows[Math.min(windowIndex, next[columnIndex].windows.length - 1)]
      } else {
        next.splice(columnIndex, 1)
        const target = next[Math.min(columnIndex, next.length - 1)]
        nextFocus = target ? target.windows[0] : null
      }
      return { columns: next, nextFocus }
    }

    function flattenColumns(columns) {
      const ids = []
      for (const column of columns) ids.push(...column.windows)
      return ids
    }

    function readStore() {
      const fallback = {
        rooms: [],
        columns: [],
        focusedId: null,
        volumes: {},
        quality: {},
        danmaku: true,
        railCollapsed: false,
      }
      try {
        const rawStore = localStorage.getItem(STORE_KEY) || localStorage.getItem(LEGACY_STORE_KEY)
        const parsed = JSON.parse(rawStore || 'null')
        if (!parsed || typeof parsed !== 'object') return fallback
        const rooms = Array.isArray(parsed.rooms)
          ? parsed.rooms.filter((room) => room && typeof room.id === 'string' && /^\d+$/.test(room.id))
          : []
        const ids = new Set(rooms.map((room) => room.id))
        let columns = normalizeColumns(parsed.columns, ids)
        if (!Array.isArray(parsed.columns) && Array.isArray(parsed.openIds)) {
          columns = normalizeColumns(
            parsed.openIds.map((id) => ({ id: newColumnId(), windows: [id] })),
            ids,
          )
        }
        const openIds = new Set(flattenColumns(columns))
        return {
          rooms,
          columns,
          focusedId:
            typeof parsed.focusedId === 'string' && openIds.has(parsed.focusedId)
              ? parsed.focusedId
              : null,
          volumes: parsed.volumes && typeof parsed.volumes === 'object' ? parsed.volumes : {},
          quality: parsed.quality && typeof parsed.quality === 'object' ? parsed.quality : {},
          danmaku: parsed.danmaku !== false,
          railCollapsed: parsed.railCollapsed === true,
        }
      } catch {
        return fallback
      }
    }

    function BilibiliLivePage({ t, locale }) {
      useLocaleRefresh(locale)
      const stored = useMemo(readStore, [])
      const [rooms, setRooms] = useState(stored.rooms)
      const [columns, setColumns] = useState(stored.columns)
      const [focusedId, setFocusedId] = useState(stored.focusedId)
      const [volumes, setVolumes] = useState(stored.volumes)
      const [quality, setQuality] = useState(stored.quality)
      const [danmakuOn, setDanmakuOn] = useState(stored.danmaku)
      const [soloId, setSoloId] = useState(null)
      const [audioUnlocked, setAudioUnlocked] = useState(false)
      const [session, setSession] = useState(null)
      const [sessionError, setSessionError] = useState('')
      const [cookieOpen, setCookieOpen] = useState(false)
      const [addOpen, setAddOpen] = useState(false)
      const [toast, setToast] = useState('')
      const [confirmRemove, setConfirmRemove] = useState('')
      const [refreshing, setRefreshing] = useState(false)
      const [viewportW, setViewportW] = useState(0)
      const [viewportH, setViewportH] = useState(0)
      const [offset, setOffset] = useState(0)
      const [animating, setAnimating] = useState(true)
      const [moveMenu, setMoveMenu] = useState(null)
      const [railCollapsed, setRailCollapsed] = useState(stored.railCollapsed)
      const [windowEdge, setWindowEdge] = useState(false)

      const pageRef = useRef(null)
      const viewportRef = useRef(null)
      const offsetRef = useRef(0)
      const rafRef = useRef(0)
      const snapTimerRef = useRef(0)
      const soloToggleRef = useRef(null)
      const setVolumeRef = useRef(null)

      const columnRooms = useMemo(() => {
        const map = new Map(rooms.map((room) => [room.id, room]))
        return columns
          .map((column) => ({
            id: column.id,
            windows: column.windows,
            rooms: column.windows.map((id) => map.get(id)).filter(Boolean),
          }))
          .filter((column) => column.rooms.length)
      }, [columns, rooms])

      const openRooms = useMemo(
        () => columnRooms.flatMap((column) => column.rooms),
        [columnRooms],
      )
      const openIds = useMemo(() => new Set(flattenColumns(columns)), [columns])
      const columnKey = columnRooms.map((column) => `${column.id}:${column.windows.join(',')}`).join('|')
      const columnCount = columnRooms.length
      const windowCount = openRooms.length
      const focusedColumnIndex = Math.max(
        0,
        columnRooms.findIndex((column) => column.windows.includes(focusedId)),
      )
      const focusedColumn = columnRooms[focusedColumnIndex] || null
      const focusedWindowIndex = focusedColumn
        ? Math.max(0, focusedColumn.windows.indexOf(focusedId))
        : 0

      const stateRef = useLatest({ rooms, columns, focusedId, soloId, audioUnlocked, volumes })
      const roomsRef = useLatest(rooms)
      const columnsRef = useLatest(columns)
      const visibleColumnsRef = useLatest(columnRooms)
      const focusedIdRef = useLatest(focusedId)
      const moveMenuRef = useLatest(moveMenu)

      const effectiveViewport = viewportW > 0 ? viewportW : 960
      const multi = columnCount > 1
      const winW = multi
        ? Math.max(280, Math.min(effectiveViewport, effectiveViewport * 0.82, 1240))
        : Math.max(280, effectiveViewport)
      const step = winW + GAP
      const contentW = columnCount ? columnCount * winW + (columnCount - 1) * GAP : 0
      const maxOffset = Math.max(0, contentW - effectiveViewport)
      const winWRef = useLatest(winW)
      const viewportRefValue = useLatest(effectiveViewport)
      const maxOffsetRef = useLatest(maxOffset)

      const columnH = viewportH > 0 ? viewportH : 780
      const windowHeightFor = (count) =>
        count > 0 ? Math.max(0, (columnH - (count - 1) * STACK_GAP) / count) : columnH
      const windowLayouts = useMemo(() => {
        const layouts = []
        columnRooms.forEach((column, columnIndex) => {
          const count = column.rooms.length
          const height = windowHeightFor(count)
          column.rooms.forEach((room, windowIndex) => {
            layouts.push({
              room,
              columnIndex,
              windowIndex,
              count,
              x: columnIndex * step,
              y: windowIndex * (height + STACK_GAP),
              width: winW,
              height,
            })
          })
        })
        return layouts
      }, [columnRooms, step, winW, columnH])

      useEffect(() => {
        try {
          localStorage.setItem(
            STORE_KEY,
            JSON.stringify({
              version: 2,
              rooms,
              columns,
              focusedId,
              volumes,
              quality,
              danmaku: danmakuOn,
              railCollapsed,
            }),
          )
        } catch {
          /* storage may be unavailable in a private window */
        }
      }, [rooms, columns, focusedId, volumes, quality, danmakuOn, railCollapsed])

      useEffect(() => {
        let cancelled = false
        api('/session').then((response) => {
          if (cancelled) return
          if (response.ok) {
            setSession(response)
            setSessionError('')
          } else {
            setSessionError(response.error === 'LOCAL_SERVICE_UNAVAILABLE' ? 'LOCAL_SERVICE_UNAVAILABLE' : response.error || '')
          }
        })
        return () => {
          cancelled = true
        }
      }, [])

      useEffect(() => {
        const element = viewportRef.current
        if (!element) return undefined
        const observer = new ResizeObserver((entries) => {
          const rect = entries[0]?.contentRect
          setViewportW(Math.max(0, Math.round(rect?.width || 0)))
          setViewportH(Math.max(0, Math.round(rect?.height || 0)))
        })
        observer.observe(element)
        return () => observer.disconnect()
      }, [])

      // The desktop shell draws the native window buttons over the top-left.
      // When the DSH sidebar is collapsed the main column reaches x=56, so the
      // live rail's account card would sit underneath those buttons. Only the
      // desktop shell needs the safe inset; the browser web UI has no buttons.
      useEffect(() => {
        const desktopShell = /Electron/i.test(navigator.userAgent)
        const element = pageRef.current
        if (!desktopShell || !element) return undefined
        const update = () => {
          const left = element.getBoundingClientRect().left
          setWindowEdge(left < 100)
        }
        const observer = new ResizeObserver(update)
        observer.observe(element)
        window.addEventListener('resize', update)
        update()
        return () => {
          observer.disconnect()
          window.removeEventListener('resize', update)
        }
      }, [])

      useEffect(() => {
        if (!columnCount) {
          setOffset(0)
          offsetRef.current = 0
          if (focusedId !== null) setFocusedId(null)
          return
        }
        if (!columns.some((column) => column.windows.includes(focusedId))) {
          const first = columns.find((column) => column.windows.length)
          setFocusedId(first ? first.windows[0] : null)
        }
      }, [columnKey, focusedId, columnCount])

      useEffect(() => {
        if (!columnCount) return
        const target = clamp(
          focusedColumnIndex * step + winW / 2 - effectiveViewport / 2,
          0,
          maxOffset,
        )
        offsetRef.current = target
        setAnimating(true)
        setOffset(target)
      }, [focusedId, columnKey, focusedColumnIndex, winW, step, effectiveViewport, maxOffset])

      useEffect(() => {
        const element = viewportRef.current
        if (!element) return undefined
        const onWheel = (event) => {
          if (event.ctrlKey || event.metaKey) return
          if (!columnsRef.current.length) return
          const raw = event.deltaX !== 0 ? event.deltaX : event.deltaY
          if (!raw) return
          event.preventDefault()
          const delta =
            event.deltaMode === 1
              ? raw * 16
              : event.deltaMode === 2
                ? raw * viewportRefValue.current
                : raw
          setAnimating(false)
          const next = clamp(offsetRef.current + delta * 1.15, 0, maxOffsetRef.current)
          offsetRef.current = next
          if (!rafRef.current) {
            rafRef.current = window.requestAnimationFrame(() => {
              rafRef.current = 0
              setOffset(offsetRef.current)
            })
          }
          window.clearTimeout(snapTimerRef.current)
          snapTimerRef.current = window.setTimeout(() => {
            const list = columnsRef.current
            const width = winWRef.current
            const viewport = viewportRefValue.current
            if (!list.length) return
            const currentStep = width + GAP
            const max = maxOffsetRef.current
            const index = clamp(
              Math.round((offsetRef.current + viewport / 2 - width / 2) / currentStep),
              0,
              list.length - 1,
            )
            const target = clamp(index * currentStep + width / 2 - viewport / 2, 0, max)
            offsetRef.current = target
            setAnimating(true)
            setOffset(target)
            const current = locateRoom(list, focusedIdRef.current)
            const destination = list[index]
            const windowIndex = current
              ? Math.min(current.windowIndex, destination.windows.length - 1)
              : 0
            setFocusedId(destination.windows[Math.max(0, windowIndex)])
          }, 170)
        }
        element.addEventListener('wheel', onWheel, { passive: false })
        return () => {
          element.removeEventListener('wheel', onWheel)
          window.clearTimeout(snapTimerRef.current)
          if (rafRef.current) {
            window.cancelAnimationFrame(rafRef.current)
            rafRef.current = 0
          }
        }
      }, [columnsRef, focusedIdRef, viewportRefValue, winWRef, maxOffsetRef])

      useEffect(() => {
        if (!toast) return undefined
        const timer = window.setTimeout(() => setToast(''), 3200)
        return () => window.clearTimeout(timer)
      }, [toast])

      useEffect(() => {
        if (!confirmRemove) return undefined
        const timer = window.setTimeout(() => setConfirmRemove(''), 2600)
        return () => window.clearTimeout(timer)
      }, [confirmRemove])

      useEffect(() => {
        if (!soloId) return
        if (focusedId && openIds.has(focusedId)) {
          if (soloId !== focusedId) setSoloId(focusedId)
        } else {
          setSoloId(null)
        }
      }, [focusedId, soloId, openIds])

      const focusColumnAt = useCallback((targetIndex) => {
        const columnsNow = columnsRef.current
        if (!columnsNow.length) return
        const current = locateRoom(columnsNow, focusedIdRef.current)
        const index = clamp(targetIndex, 0, columnsNow.length - 1)
        const target = columnsNow[index]
        if (!target || !target.windows.length) return
        const preferred = current
          ? Math.min(current.windowIndex, target.windows.length - 1)
          : 0
        setFocusedId(target.windows[Math.max(0, preferred)])
      }, [columnsRef, focusedIdRef])

      const focusColumnDelta = useCallback((delta) => {
        const columnsNow = columnsRef.current
        if (!columnsNow.length) return
        const current = locateRoom(columnsNow, focusedIdRef.current)
        if (!current) {
          focusColumnAt(delta > 0 ? 0 : columnsNow.length - 1)
          return
        }
        focusColumnAt(current.columnIndex + delta)
      }, [columnsRef, focusedIdRef, focusColumnAt])

      const focusWindowDelta = useCallback((delta) => {
        const columnsNow = columnsRef.current
        const current = locateRoom(columnsNow, focusedIdRef.current)
        if (!current) return
        const next = clamp(current.windowIndex + delta, 0, current.column.windows.length - 1)
        setFocusedId(current.column.windows[next])
      }, [columnsRef, focusedIdRef])

      const handleMove = useCallback((roomId, action) => {
        const current = stateRef.current
        const columnsNow = cloneColumns(current.columns)
        const location = locateRoom(columnsNow, roomId)
        if (!location) return
        const { columnIndex, windowIndex } = location
        const column = columnsNow[columnIndex]

        if (action === 'up' || action === 'down') {
          const targetIndex = windowIndex + (action === 'up' ? -1 : 1)
          if (targetIndex < 0 || targetIndex >= column.windows.length) return
          column.windows.splice(windowIndex, 1)
          column.windows.splice(targetIndex, 0, roomId)
          setColumns(columnsNow)
          setFocusedId(roomId)
          return
        }

        if (action === 'left' || action === 'right') {
          const direction = action === 'left' ? -1 : 1
          column.windows.splice(windowIndex, 1)
          const targetIndex = columnIndex + direction
          const target =
            columnsNow[targetIndex] && columnsNow[targetIndex] !== column
              ? columnsNow[targetIndex]
              : null
          if (target) {
            target.windows.push(roomId)
            if (!column.windows.length) {
              const emptyIndex = columnsNow.indexOf(column)
              if (emptyIndex >= 0) columnsNow.splice(emptyIndex, 1)
            }
          } else {
            if (!column.windows.length) {
              const emptyIndex = columnsNow.indexOf(column)
              if (emptyIndex >= 0) columnsNow.splice(emptyIndex, 1)
            }
            const insertAt = direction < 0 ? 0 : columnsNow.length
            columnsNow.splice(insertAt, 0, { id: newColumnId(), windows: [roomId] })
          }
          setColumns(columnsNow)
          setFocusedId(roomId)
          return
        }

        if (action === 'expel-left' || action === 'expel-right') {
          if (column.windows.length <= 1) return
          column.windows.splice(windowIndex, 1)
          const insertAt = columnIndex + (action === 'expel-left' ? 0 : 1)
          columnsNow.splice(insertAt, 0, { id: newColumnId(), windows: [roomId] })
          setColumns(columnsNow)
          setFocusedId(roomId)
          return
        }

        if (action === 'column-left' || action === 'column-right') {
          const direction = action === 'column-left' ? -1 : 1
          const targetIndex = columnIndex + direction
          if (targetIndex < 0 || targetIndex >= columnsNow.length) return
          const swap = columnsNow[columnIndex]
          columnsNow[columnIndex] = columnsNow[targetIndex]
          columnsNow[targetIndex] = swap
          setColumns(columnsNow)
          setFocusedId(roomId)
        }
      }, [stateRef])

      const openMoveMenu = useCallback((roomId, element) => {
        if (!element) return
        const rect = element.getBoundingClientRect()
        const width = 252
        const height = 374
        const margin = 12
        let left = clamp(rect.right - width, margin, Math.max(margin, window.innerWidth - width - margin))
        let top = rect.bottom + 6
        if (top + height > window.innerHeight - margin) {
          top = Math.max(margin, rect.top - height - 6)
        }
        setMoveMenu({ roomId, left, top })
      }, [])

      useEffect(() => {
        if (!moveMenu) return undefined
        const onKey = (event) => {
          if (event.key === 'Escape') {
            event.preventDefault()
            event.stopPropagation()
            setMoveMenu(null)
          }
        }
        window.addEventListener('keydown', onKey, true)
        return () => window.removeEventListener('keydown', onKey, true)
      }, [moveMenu])

      useEffect(() => {
        if (moveMenu && !columns.some((column) => column.windows.includes(moveMenu.roomId))) {
          setMoveMenu(null)
        }
      }, [columnKey, moveMenu])

      useEffect(() => {
        const onKey = (event) => {
          if (event.defaultPrevented || event.metaKey || event.ctrlKey) return
          if (moveMenuRef.current) return
          const target = event.target
          if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) {
            return
          }
          const columnsNow = columnsRef.current
          if (!columnsNow.length) return
          const current = locateRoom(columnsNow, focusedIdRef.current)
          if (!current) return
          const roomId = current.column.windows[current.windowIndex]
          const key = event.key

          if (event.altKey && event.shiftKey && (key === 'ArrowLeft' || key === 'ArrowRight')) {
            event.preventDefault()
            setRailCollapsed(true)
            handleMove(roomId, key === 'ArrowLeft' ? 'column-left' : 'column-right')
            return
          }
          if (event.altKey) return

          const volumeDirection =
            key === '+' || key === '=' || event.code === 'NumpadAdd'
              ? 1
              : key === '-' || key === '_' || event.code === 'NumpadSubtract'
                ? -1
                : 0
          if (volumeDirection) {
            event.preventDefault()
            const volumeTarget = focusedIdRef.current
            if (volumeTarget) {
              const current = Number(stateRef.current.volumes[volumeTarget])
              const base = Number.isFinite(current) ? current : 60
              setVolumeRef.current?.(volumeTarget, clamp(base + volumeDirection * VOLUME_STEP, 0, 100), true)
            }
            return
          }

          if (event.shiftKey && key.toLowerCase() === 's') {
            event.preventDefault()
            const soloTarget = focusedIdRef.current
            if (soloTarget) soloToggleRef.current?.(soloTarget)
            return
          }

          if (event.shiftKey && (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'ArrowUp' || key === 'ArrowDown')) {
            event.preventDefault()
            setRailCollapsed(true)
            const action =
              key === 'ArrowLeft' ? 'left' : key === 'ArrowRight' ? 'right' : key === 'ArrowUp' ? 'up' : 'down'
            handleMove(roomId, action)
            return
          }
          if (event.shiftKey) return

          if (key === 'ArrowRight') {
            event.preventDefault()
            setRailCollapsed(true)
            focusColumnDelta(1)
          } else if (key === 'ArrowLeft') {
            event.preventDefault()
            setRailCollapsed(true)
            focusColumnDelta(-1)
          } else if (key === 'ArrowDown') {
            event.preventDefault()
            setRailCollapsed(true)
            focusWindowDelta(1)
          } else if (key === 'ArrowUp') {
            event.preventDefault()
            setRailCollapsed(true)
            focusWindowDelta(-1)
          } else if (key === 'Home') {
            event.preventDefault()
            setRailCollapsed(true)
            focusColumnAt(0)
          } else if (key === 'End') {
            event.preventDefault()
            setRailCollapsed(true)
            focusColumnAt(columnsNow.length - 1)
          } else if (key === '[') {
            event.preventDefault()
            setRailCollapsed(true)
            handleMove(roomId, 'expel-left')
          } else if (key === ']') {
            event.preventDefault()
            setRailCollapsed(true)
            handleMove(roomId, 'expel-right')
          }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
      }, [handleMove, focusColumnAt, focusColumnDelta, focusWindowDelta, columnsRef, focusedIdRef, moveMenuRef, setRailCollapsed])

      const focusRoom = useCallback((id) => {
        const current = stateRef.current
        if (!current.rooms.some((room) => room.id === id)) return
        if (locateRoom(current.columns, id)) {
          setFocusedId(id)
          return
        }
        setColumns([...current.columns, { id: newColumnId(), windows: [id] }])
        setFocusedId(id)
      }, [stateRef])

      const closeWindow = useCallback((id) => {
        const current = stateRef.current
        const result = removeRoomFromColumns(current.columns, id)
        if (result.columns === current.columns) return
        setColumns(result.columns)
        if (current.focusedId === id) setFocusedId(result.nextFocus)
        setMoveMenu((open) => (open && open.roomId === id ? null : open))
      }, [stateRef])

      const removeRoom = useCallback((id) => {
        const current = stateRef.current
        const result = removeRoomFromColumns(current.columns, id)
        setRooms((previous) => previous.filter((room) => room.id !== id))
        setColumns(result.columns)
        if (current.focusedId === id) setFocusedId(result.nextFocus)
        setMoveMenu((open) => (open && open.roomId === id ? null : open))
      }, [stateRef])

      const applyAudioNow = useCallback((nextSolo, nextUnlocked) => {
        const root = viewportRef.current
        if (!root) return
        for (const video of root.querySelectorAll('video[data-room-id]')) {
          const id = video.getAttribute('data-room-id')
          const shouldMute = !nextUnlocked || (nextSolo !== null && nextSolo !== id)
          video.muted = shouldMute
          if (!shouldMute) {
            const started = video.play()
            if (started && typeof started.catch === 'function') started.catch(() => {})
          }
        }
      }, [])

      const toggleAudio = useCallback(() => {
        const next = !stateRef.current.audioUnlocked
        setAudioUnlocked(next)
        applyAudioNow(stateRef.current.soloId, next)
      }, [applyAudioNow, stateRef])

      const setVolume = useCallback((id, value, unlock) => {
        const numeric = clamp(Number(value) || 0, 0, 100)
        setVolumes((previous) => ({ ...previous, [id]: numeric }))
        const nextUnlocked = unlock !== false && numeric > 0 ? true : stateRef.current.audioUnlocked
        if (nextUnlocked && !stateRef.current.audioUnlocked) setAudioUnlocked(true)
        const root = viewportRef.current
        const video = root ? root.querySelector(`video[data-room-id="${id}"]`) : null
        if (video) {
          const fullVolume = stateRef.current.focusedId === id || stateRef.current.soloId === id
          video.volume = clamp((numeric / 100) * (fullVolume ? 1 : DUCK_FACTOR), 0, 1)
          const shouldMute = !nextUnlocked || (stateRef.current.soloId !== null && stateRef.current.soloId !== id)
          video.muted = shouldMute
          if (!shouldMute) {
            const started = video.play()
            if (started && typeof started.catch === 'function') started.catch(() => {})
          }
        }
      }, [stateRef])
      setVolumeRef.current = setVolume

      const toggleSolo = useCallback((id) => {
        const nextSolo = stateRef.current.soloId === id ? null : id
        setSoloId(nextSolo)
        setAudioUnlocked(true)
        applyAudioNow(nextSolo, true)
      }, [applyAudioNow, stateRef])
      soloToggleRef.current = toggleSolo

      const setQualityFor = useCallback((id, value) => {
        setQuality((previous) => ({ ...previous, [id]: value }))
      }, [])

      const refreshNow = useCallback(async (silent) => {
        const ids = roomsRef.current.map((room) => room.id)
        if (!ids.length) return
        if (!silent) setRefreshing(true)
        try {
          const response = await api('/rooms', { ids })
          if (response.ok && Array.isArray(response.rooms)) {
            setRooms((previous) =>
              previous.map((room) => {
                const hit = response.rooms.find((entry) => entry.ok && entry.room.id === room.id)
                if (!hit) return room
                const merged = { ...room, ...hit.room }
                if (!merged.uname && room.uname) merged.uname = room.uname
                if (!merged.face && room.face) merged.face = room.face
                return merged
              }),
            )
          }
        } finally {
          if (!silent) setRefreshing(false)
        }
      }, [roomsRef])

      useEffect(() => {
        refreshNow(true)
        const timer = window.setInterval(() => {
          if (document.visibilityState === 'visible') refreshNow(true)
        }, 30000)
        const onVisible = () => {
          if (document.visibilityState === 'visible') refreshNow(true)
        }
        document.addEventListener('visibilitychange', onVisible)
        return () => {
          window.clearInterval(timer)
          document.removeEventListener('visibilitychange', onVisible)
        }
      }, [refreshNow])

      const handleAdd = useCallback(async (value) => {
        const response = await api('/room', { id: value })
        if (!response.ok) return response
        const room = response.room
        setRooms((previous) => {
          const index = previous.findIndex((entry) => entry.id === room.id)
          if (index < 0) return [...previous, room]
          const next = previous.slice()
          next[index] = { ...next[index], ...room }
          return next
        })
        setColumns((previous) =>
          previous.some((column) => column.windows.includes(room.id))
            ? previous
            : [...previous, { id: newColumnId(), windows: [room.id] }],
        )
        setFocusedId(room.id)
        setToast(t('added'))
        return { ok: true }
      }, [t])

      const handleRemove = (id) => {
        if (confirmRemove !== id) {
          setConfirmRemove(id)
          return
        }
        setConfirmRemove('')
        removeRoom(id)
        setToast(t('removed'))
      }

      const focusedRoom = openRooms.find((room) => room.id === focusedId) || null
      const heroRoom = focusedRoom || rooms[0] || null
      const account = session?.account || null
      const accountSub = session
        ? account?.authenticated
          ? `Lv${account.level || 0} · UID ${account.uid}`
          : account?.stale
            ? t('account_stale')
            : t('account_anonymous')
        : sessionError
          ? t('account_error')
          : t('account_loading')
      const thumbPercent = contentW > 0 ? clamp((effectiveViewport / contentW) * 100, 6, 100) : 100
      const accountStatus = account?.authenticated ? 'is-ok' : account?.stale ? 'is-error' : 'is-idle'
      const moveMenuLocation = moveMenu ? locateRoom(columnRooms, moveMenu.roomId) : null
      const moveMenuRoom = moveMenu ? openRooms.find((room) => room.id === moveMenu.roomId) : null
      const moveMenuStackCount = moveMenuLocation ? moveMenuLocation.column.windows.length : 0
      const moveMenuIndex = moveMenuLocation ? moveMenuLocation.windowIndex : 0
      const moveMenuColumnIndex = moveMenuLocation ? moveMenuLocation.columnIndex : 0
      const moveMenuItem = (key, label, icon, disabled, action) =>
        h(
          'button',
          {
            key,
            className: 'bl-move-item',
            type: 'button',
            role: 'menuitem',
            disabled: Boolean(disabled),
            onClick: () => {
              if (!moveMenu) return
              handleMove(moveMenu.roomId, action)
              setMoveMenu(null)
            },
          },
          h(Glyph, { name: icon, size: 15 }),
          h('span', null, label),
        )

      return h(
        React.Fragment,
        null,
        h('style', { key: 'bilibili-multiview-style' }, CSS),
        h(
          'div',
          {
            className: cx(
              'bl-page',
              railCollapsed ? 'is-rail-collapsed' : null,
              windowEdge ? 'is-window-edge' : null,
            ),
            ref: pageRef,
          },
          h(
            'aside',
            {
              className: 'bl-rail',
              id: 'bl-rail',
              'aria-hidden': railCollapsed ? 'true' : undefined,
              inert: railCollapsed ? '' : undefined,
            },
            h(
              'button',
              {
                className: 'bl-account',
                type: 'button',
                onClick: () => setCookieOpen(true),
                title: t('cookie_title'),
              },
              account?.authenticated && account.face
                ? h('img', {
                    className: 'bl-avatar',
                    src: imageUrl(account.face),
                    alt: '',
                    referrerPolicy: 'no-referrer',
                    onError: (event) => {
                      event.currentTarget.style.display = 'none'
                    },
                  })
                : h(
                    'span',
                    { className: 'bl-avatar bl-avatar-fallback' },
                    h(Glyph, { name: account?.authenticated ? 'user' : 'key', size: 15 }),
                  ),
              h(
                'span',
                { className: 'bl-account-text' },
                h('span', { className: 'bl-account-title' }, account?.authenticated ? account.uname || t('account_current') : t('account_current')),
                h('span', { className: 'bl-account-sub' }, accountSub),
              ),
              h('span', { className: cx('bl-status-dot', accountStatus) }),
            ),
            h(
              'button',
              {
                className: 'bl-now',
                type: 'button',
                onClick: () => {
                  if (heroRoom) focusRoom(heroRoom.id)
                  else setAddOpen(true)
                },
                title: heroRoom?.title || t('add_room'),
              },
              heroRoom && (heroRoom.keyframe || heroRoom.cover)
                ? h('img', {
                    className: 'bl-now-bg',
                    src: imageUrl(heroRoom.keyframe || heroRoom.cover),
                    alt: '',
                    referrerPolicy: 'no-referrer',
                    onError: (event) => {
                      const img = event.currentTarget
                      const fallback = imageUrl(heroRoom.cover)
                      if (fallback && img.getAttribute('src') !== fallback) img.src = fallback
                      else img.style.display = 'none'
                    },
                  })
                : null,
              h(
                'span',
                { className: 'bl-now-body' },
                h(
                  'span',
                  { className: 'bl-now-kicker' },
                  h('span', {
                    className: cx('bl-live-dot', heroRoom?.liveStatus === 1 ? 'is-live' : null),
                    'aria-hidden': true,
                  }),
                  heroRoom ? (heroRoom.liveStatus === 1 ? t('live') : t('offline')) : t('now_watching'),
                ),
                h('span', { className: 'bl-now-title' }, heroRoom?.title || t('no_room')),
                h('span', { className: 'bl-now-user' }, heroRoom?.uname || t('unknown_user')),
              ),
            ),
            h(
              'div',
              { className: 'bl-list-head' },
              h('span', null, t('room_list')),
              h('span', { className: 'bl-list-count' }, rooms.length),
            ),
            h(
              'div',
              { className: 'bl-rooms', role: 'list' },
              rooms.length
                ? rooms.map((room) =>
                    h(
                      'div',
                      {
                        key: room.id,
                        className: cx('bl-room', room.id === focusedId ? 'is-active' : null),
                        role: 'listitem',
                        tabIndex: 0,
                        onClick: () => focusRoom(room.id),
                        onKeyDown: (event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            focusRoom(room.id)
                          }
                        },
                      },
                      h(
                        'span',
                        { className: 'bl-room-cover' },
                        room.keyframe || room.cover
                          ? h('img', {
                              src: imageUrl(room.keyframe || room.cover),
                              alt: '',
                              referrerPolicy: 'no-referrer',
                              onError: (event) => {
                                const img = event.currentTarget
                                const fallback = imageUrl(room.cover)
                                if (fallback && img.getAttribute('src') !== fallback) img.src = fallback
                                else img.style.display = 'none'
                              },
                            })
                          : null,
                        h('span', { className: cx('bl-room-live', room.liveStatus === 1 ? 'is-live' : null) }),
                      ),
                      h(
                        'span',
                        { className: 'bl-room-text' },
                        h('span', { className: 'bl-room-title', title: room.title }, room.title || t('no_title')),
                        h('span', { className: 'bl-room-sub', title: room.uname }, room.uname || t('unknown_user')),
                      ),
                      h(
                        'span',
                        { className: 'bl-room-side' },
                        room.liveStatus === 1
                          ? h('span', { className: 'bl-room-count' }, formatCount(room.online))
                          : null,
                        h(
                          'button',
                          {
                            className: cx('bl-room-remove', confirmRemove === room.id ? 'is-confirm' : null),
                            type: 'button',
                            onClick: (event) => {
                              event.stopPropagation()
                              handleRemove(room.id)
                            },
                            title: confirmRemove === room.id ? t('confirm_remove') : t('remove_room'),
                            'aria-label': confirmRemove === room.id ? t('confirm_remove') : t('remove_room'),
                          },
                          h(Glyph, { name: confirmRemove === room.id ? 'check' : 'trash', size: 13 }),
                        ),
                      ),
                    ),
                  )
                : h('div', { className: 'bl-hint', style: { padding: '10px 6px' } }, t('no_rooms')),
            ),
            h(
              'button',
              { className: 'bl-add', type: 'button', onClick: () => setAddOpen(true) },
              h(Glyph, { name: 'plus', size: 15 }),
              h('span', null, t('add_room')),
            ),
          ),
          h(
            'section',
            { className: 'bl-stage', 'aria-label': t('stage_title') },
            h(
              'header',
              { className: 'bl-stagebar' },
              h(
                'button',
                {
                  className: 'bl-icon-btn bl-rail-toggle',
                  type: 'button',
                  onClick: () => setRailCollapsed((value) => !value),
                  title: railCollapsed ? t('show_list') : t('hide_list'),
                  'aria-label': railCollapsed ? t('show_list') : t('hide_list'),
                  'aria-expanded': !railCollapsed,
                  'aria-controls': 'bl-rail',
                },
                h(Glyph, { name: railCollapsed ? 'chevronRight' : 'chevronLeft', size: 17 }),
              ),
              h(
                'div',
                { className: 'bl-stage-heading' },
                h('span', { className: 'bl-stage-title' }, t('stage_title')),
                h(
                  'span',
                  { className: 'bl-stage-sub' },
                  windowCount
                    ? `${windowCount} ${t('window_count')} · ${columnCount} ${t('column_count')} · ${t('stage_hint')}`
                    : t('stage_hint'),
                ),
              ),
              h(
                'div',
                { className: 'bl-stage-actions' },
                columnCount > 1
                  ? h(
                      'div',
                      { className: 'bl-dots', role: 'presentation' },
                      columnRooms.map((column, index) => {
                        const label = column.rooms
                          .map((room) => room.title || room.id)
                          .join(' / ')
                        return h('button', {
                          key: column.id,
                          type: 'button',
                          className: cx(
                            'bl-dot',
                            index === focusedColumnIndex ? 'is-on' : null,
                            column.rooms.length > 1 ? 'is-stack' : null,
                          ),
                          onClick: () => focusColumnAt(index),
                          title: label || column.id,
                          'aria-label': label || column.id,
                        })
                      }),
                    )
                  : null,
                h(
                  'button',
                  {
                    className: cx('bl-action', audioUnlocked ? 'is-on' : null),
                    type: 'button',
                    onClick: toggleAudio,
                    title: audioUnlocked ? t('sound_off') : t('sound_on'),
                  },
                  h(Glyph, { name: audioUnlocked ? 'volume' : 'volumeOff', size: 15 }),
                  h('span', { className: 'bl-action-label' }, audioUnlocked ? t('sound_off') : t('sound_on')),
                ),
                h(
                  'button',
                  {
                    className: cx('bl-action', danmakuOn ? 'is-on' : null),
                    type: 'button',
                    onClick: () => setDanmakuOn((value) => !value),
                    title: t('danmaku'),
                  },
                  h(Glyph, { name: 'chat', size: 15 }),
                  h('span', { className: 'bl-action-label' }, t('danmaku')),
                ),
                h(
                  'button',
                  {
                    className: 'bl-action',
                    type: 'button',
                    onClick: () => refreshNow(false),
                    disabled: refreshing,
                    title: t('refresh_all'),
                  },
                  h(Glyph, { name: 'refresh', size: 15, className: refreshing ? 'bl-spin' : null }),
                  h('span', { className: 'bl-action-label' }, t('refresh')),
                ),
                h(
                  'button',
                  { className: 'bl-action primary', type: 'button', onClick: () => setAddOpen(true) },
                  h(Glyph, { name: 'plus', size: 15 }),
                  h('span', null, t('add_room')),
                ),
              ),
            ),
            h(
              'div',
              { className: 'bl-viewport', ref: viewportRef },
              windowCount
                ? h(
                    'div',
                    {
                      className: cx('bl-strip', animating ? 'is-animated' : null),
                      style: {
                        transform: `translate3d(${-offset}px,0,0)`,
                        width: `${contentW}px`,
                      },
                    },
                    windowLayouts.map((layout) =>
                      h(LiveWindow, {
                        key: layout.room.id,
                        room: layout.room,
                        stackIndex: layout.windowIndex,
                        stackCount: layout.count,
                        layoutX: layout.x,
                        layoutY: layout.y,
                        layoutW: layout.width,
                        layoutH: layout.height,
                        focused: layout.room.id === focusedId,
                        volume: Number.isFinite(Number(volumes[layout.room.id]))
                          ? Number(volumes[layout.room.id])
                          : 60,
                        audioUnlocked,
                        soloId,
                        danmakuOn,
                        quality: Number(quality[layout.room.id]) || DEFAULT_QN,
                        t,
                        onFocus: focusRoom,
                        onClose: closeWindow,
                        onVolume: setVolume,
                        onSolo: toggleSolo,
                        onQuality: setQualityFor,
                        onOpenMoveMenu: openMoveMenu,
                      }),
                    ),
                  )
                : h(
                    'div',
                    { className: 'bl-empty' },
                    h(
                      'svg',
                      { width: 250, height: 126, viewBox: '0 0 250 126', fill: 'none', 'aria-hidden': true },
                      h('rect', { x: 6, y: 24, width: 104, height: 72, rx: 11, stroke: 'currentColor', strokeWidth: 1.5, opacity: 0.28 }),
                      h('rect', { x: 126, y: 10, width: 118, height: 94, rx: 13, stroke: 'currentColor', strokeWidth: 1.6, opacity: 0.72 }),
                      h('path', { d: 'M170 44v25l22-12.5L170 44Z', fill: 'currentColor', opacity: 0.72 }),
                      h('path', { d: 'M6 112h238', stroke: 'currentColor', strokeDasharray: '3 7', opacity: 0.35 }),
                      h('circle', { cx: 32, cy: 60, r: 3, fill: 'currentColor', opacity: 0.4 }),
                      h('circle', { cx: 48, cy: 60, r: 3, fill: 'currentColor', opacity: 0.55 }),
                      h('circle', { cx: 64, cy: 60, r: 3, fill: 'currentColor', opacity: 0.7 }),
                    ),
                    h('h3', null, t('empty_title')),
                    h('p', null, t('empty_hint')),
                    h(
                      'button',
                      {
                        className: 'bl-action primary',
                        type: 'button',
                        onClick: () => (rooms.length ? focusRoom(rooms[0].id) : setAddOpen(true)),
                      },
                      h(Glyph, { name: rooms.length ? 'play' : 'plus', size: 15 }),
                      h('span', null, rooms.length ? t('empty_open') : t('empty_add')),
                    ),
                  ),
              columnCount > 1
                ? h(
                    React.Fragment,
                    null,
                    h(
                      'button',
                      {
                        className: 'bl-arrow is-left',
                        type: 'button',
                        onClick: () => focusColumnDelta(-1),
                        disabled: focusedColumnIndex <= 0,
                        'aria-label': t('prev_window'),
                        title: t('prev_window'),
                      },
                      h(Glyph, { name: 'chevronLeft', size: 22 }),
                    ),
                    h(
                      'button',
                      {
                        className: 'bl-arrow is-right',
                        type: 'button',
                        onClick: () => focusColumnDelta(1),
                        disabled: focusedColumnIndex >= columnCount - 1,
                        'aria-label': t('next_window'),
                        title: t('next_window'),
                      },
                      h(Glyph, { name: 'chevronRight', size: 22 }),
                    ),
                    maxOffset > 0
                      ? h('input', {
                          className: 'bl-scroll',
                          type: 'range',
                          min: 0,
                          max: Math.round(maxOffset),
                          step: 1,
                          value: Math.round(offset),
                          style: { '--bl-thumb': `${thumbPercent}%` },
                          'aria-label': t('scroll_hint'),
                          title: t('scroll_hint'),
                          onChange: (event) => {
                            const next = Number(event.target.value)
                            setAnimating(false)
                            offsetRef.current = next
                            setOffset(next)
                          },
                          onPointerUp: () => {
                            const list = columnsRef.current
                            if (!list.length) return
                            const currentStep = winWRef.current + GAP
                            const viewport = viewportRefValue.current
                            const max = maxOffsetRef.current
                            const index = clamp(
                              Math.round((offsetRef.current + viewport / 2 - winWRef.current / 2) / currentStep),
                              0,
                              list.length - 1,
                            )
                            const target = clamp(index * currentStep + winWRef.current / 2 - viewport / 2, 0, max)
                            offsetRef.current = target
                            setAnimating(true)
                            setOffset(target)
                            focusColumnAt(index)
                          },
                          onKeyUp: () => {
                            const list = columnsRef.current
                            if (!list.length) return
                            const currentStep = winWRef.current + GAP
                            const viewport = viewportRefValue.current
                            const max = maxOffsetRef.current
                            const index = clamp(
                              Math.round((offsetRef.current + viewport / 2 - winWRef.current / 2) / currentStep),
                              0,
                              list.length - 1,
                            )
                            const target = clamp(index * currentStep + winWRef.current / 2 - viewport / 2, 0, max)
                            offsetRef.current = target
                            setAnimating(true)
                            setOffset(target)
                            focusColumnAt(index)
                          },
                        })
                      : null,
                  )
                : null,
            ),
          ),
          moveMenu && moveMenuLocation
            ? h(
                'div',
                { className: 'bl-menu-layer', onClick: () => setMoveMenu(null) },
                h(
                  'div',
                  {
                    className: 'bl-move-menu',
                    style: { left: moveMenu.left, top: moveMenu.top },
                    role: 'menu',
                    'aria-label': t('move_window'),
                    onClick: (event) => event.stopPropagation(),
                  },
                  h(
                    'div',
                    { className: 'bl-move-head' },
                    h('span', { className: 'bl-move-kicker' }, t('window_actions')),
                    h('span', { className: 'bl-move-room' }, moveMenuRoom?.title || t('no_title')),
                    h(
                      'span',
                      { className: 'bl-move-stack' },
                      `${moveMenuIndex + 1}/${moveMenuStackCount}`,
                    ),
                  ),
                  moveMenuItem('up', t('move_up'), 'arrowUp', moveMenuIndex <= 0, 'up'),
                  moveMenuItem(
                    'down',
                    t('move_down'),
                    'arrowDown',
                    moveMenuIndex >= moveMenuStackCount - 1,
                    'down',
                  ),
                  h('div', { className: 'bl-move-sep' }),
                  moveMenuItem('left', t('move_to_left'), 'splitLeft', false, 'left'),
                  moveMenuItem('right', t('move_to_right'), 'splitRight', false, 'right'),
                  h('div', { className: 'bl-move-sep' }),
                  moveMenuItem(
                    'expel-left',
                    t('expel_left'),
                    'chevronsLeft',
                    moveMenuStackCount <= 1,
                    'expel-left',
                  ),
                  moveMenuItem(
                    'expel-right',
                    t('expel_right'),
                    'chevronsRight',
                    moveMenuStackCount <= 1,
                    'expel-right',
                  ),
                  h('div', { className: 'bl-move-sep' }),
                  moveMenuItem(
                    'column-left',
                    t('move_column_left'),
                    'chevronLeft',
                    moveMenuColumnIndex <= 0,
                    'column-left',
                  ),
                  moveMenuItem(
                    'column-right',
                    t('move_column_right'),
                    'chevronRight',
                    moveMenuColumnIndex >= columnCount - 1,
                    'column-right',
                  ),
                  h('div', { className: 'bl-move-hint' }, t('move_hint')),
                ),
              )
            : null,
          cookieOpen
            ? h(CookieDialog, {
                t,
                session,
                onSession: (response) => {
                  setSession(response)
                  setSessionError('')
                },
                onClose: () => setCookieOpen(false),
                onToast: setToast,
              })
            : null,
          addOpen
            ? h(AddRoomDialog, {
                t,
                onAdd: handleAdd,
                onClose: () => setAddOpen(false),
              })
            : null,
          toast ? h('div', { className: 'bl-toast', role: 'status' }, toast) : null,
        ),
      )
    }

    function BilibiliLiveIcon({ size = 18, active }) {
      return h(
        'svg',
        {
          width: size,
          height: size,
          viewBox: '0 0 24 24',
          fill: 'none',
          'aria-hidden': true,
          focusable: 'false',
          style: { display: 'block' },
        },
        h('rect', {
          x: 2.6,
          y: 4.2,
          width: 18.8,
          height: 13.4,
          rx: 3,
          stroke: 'currentColor',
          strokeWidth: 1.6,
          fill: active ? 'currentColor' : 'none',
          fillOpacity: active ? 0.12 : 0,
        }),
        h('path', { d: 'M10 8.2v5.6l4.8-2.8L10 8.2Z', fill: 'currentColor' }),
        h('path', { d: 'M8 20.6h8', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round' }),
      )
    }

    function apply(ctx) {
      ctx.effect(
        () =>
          ctx.locale.register(NS, {
            zh,
            en,
          }),
        'bilibili-multiview: dictionaries',
      )
      const t = ctx.locale.bind(NS)

      ctx.slots.inject('sidebar.panellist', () =>
        ctx.slots.register(
          {
            name: 'sidebar.panellist',
            id: 'bilibili-multiview',
            order: 11,
            locale: NS,
            label: () => t('panel'),
          },
          BilibiliLiveIcon,
        ),
      )

      ctx.slots.inject('main', () =>
        ctx.slots.register(
          {
            name: 'main',
            key: 'bilibili-multiview',
            locale: NS,
            inject: () => ({ t, locale: ctx.locale }),
          },
          BilibiliLivePage,
        ),
      )
    }

    return {
      inject: ['slots', 'locale'],
      apply,
    }
  },
})
