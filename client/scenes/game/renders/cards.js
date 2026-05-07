/**
 * 卡牌渲染模块
 * 负责：卡牌图片预加载、棋盘卡牌绘制、图标查询
 *
 * 主题化：图标分主题存放于 images/game/cards/themes/<theme>/，
 * ICON_IMGS 缓存按主题二级索引，getIconImg 根据 themes.getCurrent() 动态取图。
 */

const { getImageUrl } = require('../../../utils/assets')
const { isBlocked } = require('../gameLogic')
const themes = require('./themes')

// ==================== 屏幕比例参数 ====================
const CARD_3D_DEPTH    = 0.1    // 3D厚度 = 卡牌尺寸 × 10%
const CARD_RADIUS      = 8      // 卡牌圆角半径（px）
const CARD_ICON_PAD    = 0.07   // 卡牌图标内边距 = 卡牌尺寸 × 7%
const CARD_FONT_SCALE  = 0.45   // 卡牌文字字号 = 卡牌尺寸 × 45%

// 卡牌图标缓存：{ themeName: { '1': Image, '2': Image, ... } }
const ICON_IMGS = {}

/** 加载指定主题的全部图标（已加载的跳过） */
function _loadTheme(theme) {
  if (!ICON_IMGS[theme.name]) ICON_IMGS[theme.name] = {}
  const map = ICON_IMGS[theme.name]
  for (let i = 1; i <= theme.iconCount; i++) {
    const key = String(i)
    if (map[key]) continue
    const img = wx.createImage()
    img.src = getImageUrl('game/cards/themes/' + theme.name + '/' + i + '.png')
    img.onload = () => { map[key] = img }
  }
}

/** 预加载所有主题（loading 场景调用，一次全部拉到本地缓存） */
function preloadAll() {
  for (const theme of themes.getAll()) {
    _loadTheme(theme)
  }
}

/** 预加载当前主题（关卡开始时兜底，正常 loading 已完成时 no-op） */
function preload() {
  _loadTheme(themes.getCurrent())
}

/** 获取当前主题下指定图标的图片 */
function getIconImg(icon) {
  const map = ICON_IMGS[themes.getCurrent().name]
  return map ? (map[icon] || null) : null
}

/** 绘制圆角矩形路径 */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/**
 * 绘制棋盘区所有卡牌
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array}  cards     - 所有卡牌
 * @param {Array}  [peekCards] - 透视中的卡牌引用
 * @param {number} [peekTimer] - 透视剩余时间 ms
 */
function renderCards(ctx, cards, peekCards, peekTimer) {
  const radius = CARD_RADIUS
  const peeking = peekCards && peekCards.length > 0 && peekTimer > 0
  // 透视透明度：前 300ms 淡出，中间保持透明，后 300ms 淡入
  let peekAlpha = 1
  if (peeking) {
    const FADE = 300  // 淡入淡出时长 ms
    const TOTAL = 3000
    const elapsed = TOTAL - peekTimer
    if (elapsed < FADE) {
      peekAlpha = 1 - 0.9 * (elapsed / FADE)
    } else if (peekTimer < FADE) {
      peekAlpha = 0.1 + 0.9 * (1 - peekTimer / FADE)
    } else {
      peekAlpha = 0.1
    }
  }
  const peekSet = peeking ? new Set(peekCards) : null

  for (const card of cards) {
    const depth = Math.round(card.width * CARD_3D_DEPTH)
    if (card.removed) continue
    const blocked = isBlocked(card, cards)
    const isPeek = peekSet && peekSet.has(card)

    if (isPeek) {
      ctx.globalAlpha = peekAlpha
    }

    // 卡牌侧面（底部厚度）
    ctx.fillStyle = blocked ? '#4a5354' : '#b8923a'
    roundRect(ctx, card.x + 1, card.y + depth, card.width, card.height, radius)
    ctx.fill()

    // 卡牌正面底色（blocked：黄白色；正常：米白）
    ctx.fillStyle = blocked ? '#d2cdb6ff' : '#fffdf5'
    roundRect(ctx, card.x, card.y, card.width, card.height, radius)
    ctx.fill()

    // 卡牌边框
    ctx.strokeStyle = blocked ? '#999' : '#c8a96e'
    ctx.lineWidth = 1.5
    roundRect(ctx, card.x, card.y, card.width, card.height, radius)
    ctx.stroke()

    // 图标（图片或文字兜底）
    const iconImg = getIconImg(card.icon)
    if (iconImg) {
      const pad = card.width * CARD_ICON_PAD
      if (blocked) { ctx.globalAlpha = 0.5 }
      ctx.save()
      roundRect(ctx, card.x, card.y, card.width, card.height, radius)
      ctx.clip()
      ctx.drawImage(iconImg, card.x + pad, card.y + pad, card.width - pad * 2, card.height - pad * 2)
      ctx.restore()
      if (blocked) { ctx.globalAlpha = 1.0 }
    } else {
      const fontSize = Math.round(card.width * CARD_FONT_SCALE)
      ctx.font = fontSize + 'px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = blocked ? '#999999' : '#000000'
      ctx.fillText(card.icon, card.x + card.width / 2, card.y + card.height / 2)
    }

    if (isPeek) {
      ctx.globalAlpha = 1.0
    }
  }
}

module.exports = {
  preload,
  preloadAll,
  renderCards,
  getIconImg,
  roundRect,
}
