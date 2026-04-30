/**
 * 音频资源 + BGM 播放管理
 *
 * 资源路径：
 *   getAudioUrl('bg_home.mp3')   →  本地 'audio/bg_home.mp3' 或 OSS URL
 *
 * BGM 播放：
 *   const { playBgm, playBgmGroup, stopBgm } = require('../utils/audio')
 *   playBgm('bg_home.mp3')     // 直接指定曲目
 *   playBgmGroup('game')       // 从 BGM_GROUPS.game 中随机抽一首
 *   stopBgm()                  // 停止
 *
 * 新增同类 BGM：
 *   1) 把 mp3 放进 client/audio/<group>/ 目录
 *   2) 在下方 BGM_GROUPS 数组中增加一行相对路径
 *
 * 设置开关：
 *   GameGlobal.settings.music === false 时不会发声（已切换则停止）。
 *
 * 远程开关：
 *   USE_REMOTE_AUDIO 上线前同步音频到 OSS 后改 true。
 */

// 是否使用远程 OSS 音频（false 则读本地 client/audio/）
const USE_REMOTE_AUDIO = true

// OSS 资源 CDN 根（与 OSS 目录约定 v1/audio 一致）
const REMOTE_BASE = 'https://yanglegeyang-assets.oss-cn-shanghai.aliyuncs.com/v1/audio'

// 本地资源根（相对小游戏包根目录）
const LOCAL_BASE = 'audio'

// BGM 分组（微信小游戏无法扫描目录，新增文件后需手动在这里加一行）
const BGM_GROUPS = {
  // 菜单 BGM
  home: ['bg_home.mp3'],
  // 游戏 BGM：新增同类直接追加 'bg_game/xxx.mp3'
  game: [
    'bg_game/bg_game.mp3',
    'bg_game/bg_game_2.mp3',
    'bg_game/bg_game_3.mp3',
  ],
}

// 音效键 → 相对路径（调用处用 key，避免硬编码路径散落各处）
const SFX_KEYS = {
  click:   'game/click.mp3',    // 卡牌/按钮点击
  merge:   'game/merge.mp3',    // 三消合成
  defeat:  'game/defeat.mp3',   // 失败
  success: 'game/success.mp3',  // 胜利通关
}

/**
 * 根据相对路径生成可直接赋给 InnerAudioContext.src 的完整 URL
 * @param {string} relPath  相对 audio/ 的路径，如 'bg_home.mp3'
 * @returns {string}
 */
function getAudioUrl(relPath) {
  const base = USE_REMOTE_AUDIO ? REMOTE_BASE : LOCAL_BASE
  return base + '/' + relPath
}

// ==================== BGM 单例 ====================
// 同一时刻只有一首背景音乐
let _audio = null
let _curKey = ''

function _musicEnabled() {
  return !(GameGlobal.settings && GameGlobal.settings.music === false)
}

/**
 * 播放（或切换）背景音乐
 * @param {string} relPath  如 'bg_home.mp3'
 * @param {Object} [opts]   { volume: 0~1, loop: bool }
 */
function playBgm(relPath, opts) {
  const o = opts || {}
  // 用户关闭了音乐，确保停止当前
  if (!_musicEnabled()) {
    stopBgm()
    return
  }
  // 同一首已在播则不重置（避免每次切场景重新加载）
  if (_curKey === relPath && _audio) return

  stopBgm()

  const ctx = wx.createInnerAudioContext()
  ctx.src = getAudioUrl(relPath)
  ctx.loop = o.loop !== false   // 默认循环
  ctx.volume = o.volume == null ? 0.5 : o.volume

  // 不用 autoplay：前一个实例刚 destroy 时，autoplay 时序不稳会静音
  // 改为在资源就绪后主动 play()，更可靠
  ctx.onCanplay(() => {
    try { ctx.play() } catch (e) {}
  })
  ctx.onError((err) => {
    console.warn('[bgm] 播放失败:', relPath, err)
  })
  ctx.onPlay(() => {
    console.log('[bgm] 开始播放:', relPath)
  })

  _audio = ctx
  _curKey = relPath
}

/** 停止并销毁当前 BGM */
function stopBgm() {
  if (_audio) {
    try { _audio.stop() } catch (e) {}
    try { _audio.destroy() } catch (e) {}
    _audio = null
    _curKey = ''
  }
}

/** 暂停当前 BGM（保留实例，可 resume） */
function pauseBgm() {
  if (_audio) {
    try { _audio.pause() } catch (e) {}
  }
}

/** 恢复播放（在用户开启音乐设置时） */
function resumeBgm() {
  if (_audio && _musicEnabled()) {
    try { _audio.play() } catch (e) {}
  }
}

/** 当前正在播放的 BGM key（无则空串） */
function currentBgm() {
  return _curKey
}

/**
 * 从分组中随机抽一首播放
 * - 若当前 _curKey 已在该组内，保持不切（同场景重入不换曲）
 * - 否则从候选里随机选一首调用 playBgm
 * @param {string} groupName  'home' / 'game' 等 BGM_GROUPS 的 key
 * @param {Object} [opts]     { volume, loop }
 */
function playBgmGroup(groupName, opts) {
  const list = BGM_GROUPS[groupName]
  if (!list || list.length === 0) {
    console.warn('[bgm] 未找到分组:', groupName)
    return
  }
  // 当前 BGM 已在该组内，保持不切（避免同场景重入时翻来覆去换曲）
  if (_curKey && list.indexOf(_curKey) >= 0) return
  const pick = list[Math.floor(Math.random() * list.length)]
  console.log('[bgm] 分组随机选曲: group=' + groupName + ' pick=' + pick)
  playBgm(pick, opts)
}

// ==================== SFX 音效 ====================
// 对每个 key 缓存一个 InnerAudioContext，重复播放时 stop 后再 play
// 避免频繁 create/destroy 带来的性能抽涋与延迟
const _sfxCache = {}

function _soundEnabled() {
  return !(GameGlobal.settings && GameGlobal.settings.sound === false)
}

/**
 * 播放一个短音效
 * @param {string} key    SFX_KEYS 的 key，如 'click' / 'merge' / 'defeat'
 * @param {Object} [opts] { volume: 0~1 }
 */
function playSfx(key, opts) {
  if (!_soundEnabled()) return
  const relPath = SFX_KEYS[key]
  if (!relPath) {
    console.warn('[sfx] 未注册音效:', key)
    return
  }
  const o = opts || {}
  let ctx = _sfxCache[key]
  if (!ctx) {
    ctx = wx.createInnerAudioContext()
    ctx.src = getAudioUrl(relPath)
    ctx.volume = o.volume == null ? 0.6 : o.volume
    ctx.onError((err) => {
      console.warn('[sfx] 播放失败:', key, err)
    })
    _sfxCache[key] = ctx
  } else if (o.volume != null) {
    ctx.volume = o.volume
  }
  // 重复触发时从头播：微信 InnerAudioContext 直接 play() 在未结束时不会重置，需先 stop
  try { ctx.stop() } catch (e) {}
  try { ctx.play() } catch (e) {}
}

/** 停止所有正在播放的音效 */
function stopAllSfx() {
  for (const k in _sfxCache) {
    try { _sfxCache[k].stop() } catch (e) {}
  }
}

/**
 * 预热所有 SFX（在 loading 场景调用）
 *
 * 对每个 key 预先创建 InnerAudioContext 并设 src，微信会启动 CDN 后台下载。
 * 返回 Promise，resolve 时所有音效 canplay 或触发 error （视为加载完毕），
 * 供 loading 进度条计数。
 *
 * @param {(key: string) => void} [onEach]  每加载完成一项回调（成功或失败都算）
 * @returns {Promise<number>}  resolve 成功加载的音效数
 */
function preloadSfx(onEach) {
  const keys = Object.keys(SFX_KEYS)
  if (keys.length === 0) return Promise.resolve(0)
  let succeed = 0
  return new Promise((resolve) => {
    let remain = keys.length
    keys.forEach((key) => {
      const relPath = SFX_KEYS[key]
      const ctx = wx.createInnerAudioContext()
      ctx.src = getAudioUrl(relPath)
      ctx.volume = 0.6
      _sfxCache[key] = ctx
      const done = (ok) => {
        if (ok) succeed++
        if (onEach) { try { onEach(key) } catch (e) {} }
        remain--
        if (remain <= 0) resolve(succeed)
      }
      ctx.onCanplay(() => done(true))
      ctx.onError((err) => {
        console.warn('[sfx] 预加载失败:', key, err)
        done(false)
      })
    })
  })
}

module.exports = {
  getAudioUrl,
  playBgm,
  playBgmGroup,
  stopBgm,
  pauseBgm,
  resumeBgm,
  currentBgm,
  playSfx,
  stopAllSfx,
  preloadSfx,
  USE_REMOTE_AUDIO,
  BGM_GROUPS,
  SFX_KEYS,
}
