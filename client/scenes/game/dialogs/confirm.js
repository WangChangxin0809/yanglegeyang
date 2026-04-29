/**
 * 确认弹窗
 *
 * 通用二次确认（退出游戏等场景）
 *
 * dialog 数据结构：
 *   { type:'confirm', title, confirmText, cancelText, onConfirm, onCancel, confirmColor, cancelColor }
 */

// ==================== 弹窗尺寸/样式参数 ====================
const DLG_W_SCALE       = 0.70   // 弹窗宽度 = 屏幕宽度 × 70%
const DLG_H_SCALE       = 0.22   // 弹窗高度 = 屏幕高度 × 22%
const DLG_RADIUS        = 12     // 弹窗圆角

const TITLE_FONT_SCALE  = 0.045  // 标题字号 = 屏幕宽度 × 4.5%
const TITLE_Y_RATIO     = 0.30   // 标题 Y = 弹窗高度 × 30%

const BTN_W_SCALE       = 0.35   // 按钮宽度 = 弹窗宽度 × 35%
const BTN_H_SCALE       = 0.28   // 按钮高度 = 弹窗高度 × 28%
const BTN_Y_RATIO       = 0.62   // 按钮 Y   = 弹窗高度 × 62%
const BTN_RADIUS        = 8
const BTN_FONT_SCALE    = 0.035  // 按钮字号 = 屏幕宽度 × 3.5%
const CANCEL_X_RATIO    = 0.12   // 取消按钮 X = 弹窗宽度 × 12%
const CONFIRM_X_RATIO   = 0.53   // 确认按钮 X = 弹窗宽度 × 53%

const CANCEL_BG         = '#e0e0e0'
const CANCEL_TEXT_COLOR  = '#333333'
const CONFIRM_BG        = '#ff6b6b'
const CONFIRM_TEXT_COLOR = '#ffffff'
const TITLE_COLOR        = '#333333'
const MASK_COLOR         = 'rgba(0,0,0,0.5)'
const DIALOG_BG          = '#ffffff'
// ==========================================================

/** 计算弹窗各几何区域 */
function _layout(config) {
  const { width, height } = config
  const dlgW = width * DLG_W_SCALE
  const dlgH = height * DLG_H_SCALE
  const dlgX = (width - dlgW) / 2
  const dlgY = (height - dlgH) / 2
  const btnW = dlgW * BTN_W_SCALE
  const btnH = dlgH * BTN_H_SCALE
  const btnY = dlgY + dlgH * BTN_Y_RATIO
  const cancelX = dlgX + dlgW * CANCEL_X_RATIO
  const confirmX = dlgX + dlgW * CONFIRM_X_RATIO
  return { dlgX, dlgY, dlgW, dlgH, btnW, btnH, btnY, cancelX, confirmX }
}

/** 绘制圆角矩形路径 */
function _roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/**
 * 绘制确认弹窗
 * @param {CanvasRenderingContext2D} ctx
 * @param {{width:number,height:number}} config
 * @param {Object} dialog
 */
function render(ctx, config, dialog) {
  const { width, height } = config
  const L = _layout(config)

  // 蒙层
  ctx.fillStyle = MASK_COLOR
  ctx.fillRect(0, 0, width, height)

  // 弹窗白底
  ctx.fillStyle = DIALOG_BG
  _roundRect(ctx, L.dlgX, L.dlgY, L.dlgW, L.dlgH, DLG_RADIUS)
  ctx.fill()

  // 标题
  ctx.fillStyle = TITLE_COLOR
  const titleFont = Math.round(width * TITLE_FONT_SCALE)
  ctx.font = 'bold ' + titleFont + 'px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(dialog.title || '', width / 2, L.dlgY + L.dlgH * TITLE_Y_RATIO)

  // 按钮字号
  const btnFont = Math.round(width * BTN_FONT_SCALE)
  ctx.font = btnFont + 'px sans-serif'

  // 取消按钮（左）
  ctx.fillStyle = dialog.cancelColor || CANCEL_BG
  _roundRect(ctx, L.cancelX, L.btnY, L.btnW, L.btnH, BTN_RADIUS)
  ctx.fill()
  ctx.fillStyle = CANCEL_TEXT_COLOR
  ctx.fillText(dialog.cancelText || '取消', L.cancelX + L.btnW / 2, L.btnY + L.btnH / 2)

  // 确认按钮（右）
  ctx.fillStyle = dialog.confirmColor || CONFIRM_BG
  _roundRect(ctx, L.confirmX, L.btnY, L.btnW, L.btnH, BTN_RADIUS)
  ctx.fill()
  ctx.fillStyle = CONFIRM_TEXT_COLOR
  ctx.fillText(dialog.confirmText || '确认', L.confirmX + L.btnW / 2, L.btnY + L.btnH / 2)
}

/**
 * 命中检测
 * @returns {'confirm'|'cancel'|'outside'|null}
 */
function hit(x, y, config) {
  const L = _layout(config)

  if (x >= L.confirmX && x <= L.confirmX + L.btnW &&
      y >= L.btnY && y <= L.btnY + L.btnH) {
    return 'confirm'
  }
  if (x >= L.cancelX && x <= L.cancelX + L.btnW &&
      y >= L.btnY && y <= L.btnY + L.btnH) {
    return 'cancel'
  }
  if (x < L.dlgX || x > L.dlgX + L.dlgW ||
      y < L.dlgY || y > L.dlgY + L.dlgH) {
    return 'outside'
  }
  return null
}

module.exports = { render, hit }
