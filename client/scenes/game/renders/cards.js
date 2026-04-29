/**
 * 卡牌渲染模块
 * 负责：卡牌图片预加载、棋盘卡牌绘制、图标查询
 */

const { getImageUrl } = require('../../../utils/assets')
const { isBlocked } = require('../gameLogic')

// ==================== 屏幕比例参数 ====================
const CARD_3D_DEPTH    = 0.1    // 3D厚度 = 卡牌尺寸 × 10%
const CARD_RADIUS      = 8      // 卡牌圆角半径（px）
const CARD_ICON_PAD    = 0.07   // 卡牌图标内边距 = 卡牌尺寸 × 7%
const CARD_FONT_SCALE  = 0.45   // 卡牌文字字号 = 卡牌尺寸 × 45%

// 卡牌图标（18种动物卡牌图片）
const ICON_COUNT = 18
const ICON_IMGS = {}  // { '1': Image, '2': Image, ... }

/** 预加载所有卡牌图标 */
function preload() {
  for (let i = 1; i <= ICON_COUNT; i++) {
    const img = wx.createImage()
    img.src = getImageUrl('game/cards/animals/' + i + '.png')
    img.onload = () => { ICON_IMGS[String(i)] = img }
  }
}

/** 获取卡牌图标图片 */
function getIconImg(icon) {
  return ICON_IMGS[icon] || null
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

    // 卡牌正面底色
    ctx.fillStyle = blocked ? '#636e72' : '#fffdf5'
    roundRect(ctx, card.x, card.y, card.width, card.height, radius)
    ctx.fill()

    // 卡牌边框
    ctx.strokeStyle = blocked ? '#999' : '#c8a96e'
    ctx.lineWidth = 1.5
    roundRect(ctx, card.x, card.y, card.width, card.height, radius)
    ctx.stroke()

    // 图标（图片或文字兄底）
    const iconImg = ICON_IMGS[card.icon]
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
  renderCards,
  getIconImg,
  ICON_COUNT,
  roundRect,
}
