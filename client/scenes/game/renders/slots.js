/**
 * 槽位渲染模块
 * 负责：槽位底图预加载、槽位绘制、槽位位置计算
 */

const { getImageUrl } = require('../../../utils/assets')
const cardsRender = require('./cards')

// ==================== 屏幕比例参数 ====================
const SLOT_TOP         = 0.82   // 槽位区顶部 = 屏幕高度 × 82%
const SLOT_SIZE_SCALE  = 0.11   // 槽位卡牌尺寸 = 屏幕宽度 × 11%
const SLOT_GAP_SCALE   = 0.014  // 槽位间距   = 屏幕宽度 × 1.5%
const SLOT_PAD_SCALE   = 0.02   // 槽位背景内边距 = 屏幕宽度 × 2%
const SLOT_ICON_PAD    = 0.06   // 槽位图标内边距 = 槽位尺寸 × 6%
const SLOT_FONT_SCALE  = 0.45   // 槽位文字字号 = 槽位尺寸 × 45%

// 卡槽整体底图（含 7 个槽位）
let SLOTS_IMG = null

/** 预加载槽位底图 */
function preload() {
  const slotsImg = wx.createImage()
  slotsImg.src = getImageUrl('game/cards/slots.png')
  slotsImg.onload = () => { SLOTS_IMG = slotsImg }
  slotsImg.onerror = () => { SLOTS_IMG = null }
}

/**
 * 绘制底部槽位
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array}  slots     - 当前槽位数据
 * @param {Object} config    - { width, height, maxSlots }
 */
function renderSlots(ctx, slots, config) {
  const { width, height, maxSlots } = config

  const slotSize = Math.round(width * SLOT_SIZE_SCALE)
  const slotGap = Math.round(width * SLOT_GAP_SCALE)
  const padding = Math.round(width * SLOT_PAD_SCALE)

  const totalSlotWidth = maxSlots * (slotSize + slotGap)
  const slotStartX = (width - totalSlotWidth) / 2
  const slotY = Math.round(height * SLOT_TOP)

  // 槽位背景：优先使用整图 slots.png，未加载完成则回退到黑底+7个灰方格
  const bgX = slotStartX - padding
  const bgY = slotY - padding
  const bgW = totalSlotWidth + padding * 2
  const bgH = slotSize + padding * 2

  if (SLOTS_IMG && SLOTS_IMG.width > 0) {
    ctx.drawImage(SLOTS_IMG, bgX, bgY, bgW, bgH)
  } else {
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.fillRect(bgX, bgY, bgW, bgH)

    for (let i = 0; i < maxSlots; i++) {
      const sx = slotStartX + i * (slotSize + slotGap)
      ctx.fillStyle = '#44555566'
      ctx.fillRect(sx, slotY, slotSize, slotSize)
      ctx.strokeStyle = '#ffffff33'
      ctx.lineWidth = 1
      ctx.strokeRect(sx, slotY, slotSize, slotSize)
    }
  }

  // 卡槽外框（圆角金色边框，图片/回退模式都叠加）
  const borderPad = Math.max(2, Math.round(padding * 0.3))
  const bX = bgX - borderPad
  const bY = bgY - borderPad
  const bW = bgW + borderPad * 2
  const bH = bgH + borderPad * 2
  const borderR = Math.max(6, Math.round(slotSize * 0.18))
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.35)'
  ctx.shadowBlur = 6
  ctx.shadowOffsetY = 2
  ctx.strokeStyle = '#c8a96e'
  ctx.lineWidth = 3
  cardsRender.roundRect(ctx, bX, bY, bW, bH, borderR)
  ctx.stroke()
  ctx.restore()

  // 内侧细高光线，增加立体感
  ctx.save()
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'
  ctx.lineWidth = 1
  cardsRender.roundRect(ctx, bX + 2, bY + 2, bW - 4, bH - 4, Math.max(4, borderR - 2))
  ctx.stroke()
  ctx.restore()

  // 画已放入的卡牌
  for (let i = 0; i < slots.length; i++) {
    const sx = slotStartX + i * (slotSize + slotGap)
    const iconImg = cardsRender.getIconImg(slots[i].icon)
    ctx.fillStyle = '#fffdf5'
    ctx.fillRect(sx, slotY, slotSize, slotSize)
    ctx.strokeStyle = '#c8a96e'
    ctx.lineWidth = 1
    ctx.strokeRect(sx, slotY, slotSize, slotSize)
    if (iconImg) {
      const pad = slotSize * SLOT_ICON_PAD
      ctx.drawImage(iconImg, sx + pad, slotY + pad, slotSize - pad * 2, slotSize - pad * 2)
    } else {
      const fontSize = Math.round(slotSize * SLOT_FONT_SCALE)
      ctx.font = fontSize + 'px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#000000'
      ctx.fillText(slots[i].icon, sx + slotSize / 2, slotY + slotSize / 2)
    }
  }
}

/**
 * 计算某个槽位索引的屏幕位置
 * @param {number} index    - 槽位索引
 * @param {Object} config   - { width, height }
 * @returns {{ x, y, size }}
 */
function getSlotPosition(index, config) {
  const { width, height } = config
  const slotSize = Math.round(width * SLOT_SIZE_SCALE)
  const slotGap = Math.round(width * SLOT_GAP_SCALE)
  const maxSlots = 7
  const totalSlotWidth = maxSlots * (slotSize + slotGap)
  const slotStartX = (width - totalSlotWidth) / 2
  const slotY = Math.round(height * SLOT_TOP)
  return {
    x: slotStartX + index * (slotSize + slotGap),
    y: slotY,
    size: slotSize
  }
}

module.exports = {
  preload,
  renderSlots,
  getSlotPosition,
}
