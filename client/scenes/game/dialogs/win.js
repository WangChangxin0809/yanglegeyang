/**
 * 胜利弹窗（全屏）
 *
 * bg.png 铺满全屏，上叠三元素（从上到下）：
 *   1. 通关时间
 *   2. 主按钮：下一关（hasNext）或返回菜单（最后一关）
 *   3. 分享按钮：分享战绩
 *
 * dialog 数据结构：
 *   {
 *     type: 'win',
 *     clearTime: number,   // 通关用时（秒），用于渲染 + 分享文案
 *     hasNext: boolean,    // 是否还有下一关
 *     onConfirm: Function, // 点主按钮：下一关 或 返回菜单
 *     onShare: Function,   // 点分享战绩
 *   }
 */

const { getImageUrl } = require('../../../utils/assets')

// ==================== 布局参数（相对全屏） ====================
// 1. 通关时间文字
const TIME_Y_SCALE       = 0.35    // 时间 Y = 屏高 50%
const TIME_FONT_SCALE    = 0.06    // 字号  = 屏宽 6%
const TIME_COLOR         = '#ffffff'
const TIME_STROKE        = '#2d3436'

// 按钮通用
const BTN_W_SCALE        = 0.56    // 按钮宽 = 屏宽 56%（居中）
const BTN_X_SCALE        = 0.22    // 按钮 X = 屏宽 22%
const BTN_H_SCALE        = 0.078   // 按钮高 = 屏高 7.8%
const BTN_RADIUS         = 12
const BTN_FONT_SCALE     = 0.042   // 按钮字号 = 屏宽 4.2%

// 2. 主按钮
const BTN_CONFIRM_Y      = 0.44    // 主按钮 Y = 屏高 64%
const CONFIRM_BG         = '#00b894'
const CONFIRM_TEXT_COLOR = '#ffffff'

// 3. 分享按钮
const BTN_SHARE_Y        = 0.55    // 分享按钮 Y = 屏高 75%
const SHARE_BG           = '#fdcb6e'
const SHARE_TEXT_COLOR   = '#2d3436'

const FALLBACK_BG        = '#2d3436'
// ============================================================

// 背景图单例（首次 render 时懒加载）
let BG_IMG = null
let BG_LOADING = false
let BG_FAILED = false

function _loadBg() {
  if (BG_IMG || BG_LOADING || BG_FAILED) return
  BG_LOADING = true
  const img = wx.createImage()
  img.src = getImageUrl('game/dialogs/win/bg.png')
  img.onload = () => { BG_IMG = img; BG_LOADING = false }
  img.onerror = () => { BG_FAILED = true; BG_LOADING = false }
}

function _buttonLayout(config) {
  const { width, height } = config
  const btnW = width * BTN_W_SCALE
  const btnH = height * BTN_H_SCALE
  const btnX = width * BTN_X_SCALE
  return {
    confirm: { x: btnX, y: height * BTN_CONFIRM_Y, w: btnW, h: btnH },
    share:   { x: btnX, y: height * BTN_SHARE_Y,   w: btnW, h: btnH },
  }
}

function _roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function _drawButton(ctx, btn, text, bg, color, fontPx) {
  ctx.fillStyle = bg
  _roundRect(ctx, btn.x, btn.y, btn.w, btn.h, BTN_RADIUS)
  ctx.fill()
  ctx.fillStyle = color
  ctx.font = 'bold ' + fontPx + 'px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, btn.x + btn.w / 2, btn.y + btn.h / 2)
}

function render(ctx, config, dialog) {
  _loadBg()

  const { width, height } = config

  // 全屏背景：图片优先，失败时纯色兜底
  if (BG_IMG) {
    ctx.drawImage(BG_IMG, 0, 0, width, height)
  } else {
    ctx.fillStyle = FALLBACK_BG
    ctx.fillRect(0, 0, width, height)
  }

  // 1. 通关时间文字（白字 + 深色描边）
  const seconds = typeof dialog.clearTime === 'number' ? dialog.clearTime.toFixed(1) : '0.0'
  const timeFont = Math.round(width * TIME_FONT_SCALE)
  ctx.font = 'bold ' + timeFont + 'px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.lineWidth = Math.max(3, timeFont * 0.14)
  ctx.strokeStyle = TIME_STROKE
  ctx.strokeText('用时 ' + seconds + ' 秒', width / 2, height * TIME_Y_SCALE)
  ctx.fillStyle = TIME_COLOR
  ctx.fillText('用时 ' + seconds + ' 秒', width / 2, height * TIME_Y_SCALE)

  // 2 & 3. 按钮
  const L = _buttonLayout(config)
  const btnFont = Math.round(width * BTN_FONT_SCALE)
  const mainText = dialog.hasNext ? '下一关' : '返回菜单'
  _drawButton(ctx, L.confirm, mainText,    CONFIRM_BG, CONFIRM_TEXT_COLOR, btnFont)
  _drawButton(ctx, L.share,   '分享战绩',  SHARE_BG,   SHARE_TEXT_COLOR,   btnFont)
}

function _inRect(x, y, r) {
  return r && x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h
}

/**
 * 命中检测
 *   'confirm' - 主按钮（下一关 / 返回菜单）
 *   'share'   - 分享战绩按钮（点击后不关闭弹窗）
 *   null      - 其它区域
 */
function hit(x, y, config, dialog) {
  const L = _buttonLayout(config)
  if (_inRect(x, y, L.confirm)) return 'confirm'
  if (_inRect(x, y, L.share))   return 'share'
  return null
}

module.exports = { render, hit }
