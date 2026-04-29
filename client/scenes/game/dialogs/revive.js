/**
 * 复活弹窗
 *
 * 首次失败时弹出，给玩家一次复活机会。
 *
 * dialog 数据结构：
 *   {
 *     type: 'revive',
 *     onConfirm: Function, // 复活（清空槽位继续游戏）
 *     onCancel: Function,  // 放弃（返回主菜单）
 *   }
 */

// ==================== 弹窗尺寸/样式参数 ====================
const DLG_W_SCALE       = 0.75
const DLG_H_SCALE       = 0.35
const DLG_RADIUS        = 16

const TITLE_FONT_SCALE  = 0.065
const TITLE_Y_RATIO     = 0.22

const SUB_FONT_SCALE    = 0.038
const SUB_Y_RATIO       = 0.44

const BTN_W_SCALE       = 0.38
const BTN_H_SCALE       = 0.18
const BTN_Y_RATIO       = 0.70
const BTN_RADIUS        = 8
const BTN_FONT_SCALE    = 0.035
const CANCEL_X_RATIO    = 0.08
const CONFIRM_X_RATIO   = 0.54

const TITLE_COLOR       = '#e17055'
const SUB_COLOR         = '#666666'
const CANCEL_BG         = '#e0e0e0'
const CANCEL_TEXT_COLOR  = '#333333'
const CONFIRM_BG        = '#00b894'
const CONFIRM_TEXT_COLOR = '#ffffff'
const MASK_COLOR         = 'rgba(0,0,0,0.6)'
const DIALOG_BG          = '#ffffff'
// ==========================================================

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

function _roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

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
  ctx.fillText('槽位已满！', width / 2, L.dlgY + L.dlgH * TITLE_Y_RATIO)

  // 副标题
  ctx.fillStyle = SUB_COLOR
  const subFont = Math.round(width * SUB_FONT_SCALE)
  ctx.font = subFont + 'px sans-serif'
  ctx.fillText('是否使用复活机会？（清空槽位）', width / 2, L.dlgY + L.dlgH * SUB_Y_RATIO)

  // 按钮字号
  const btnFont = Math.round(width * BTN_FONT_SCALE)
  ctx.font = 'bold ' + btnFont + 'px sans-serif'

  // 左按钮：放弃
  ctx.fillStyle = CANCEL_BG
  _roundRect(ctx, L.cancelX, L.btnY, L.btnW, L.btnH, BTN_RADIUS)
  ctx.fill()
  ctx.fillStyle = CANCEL_TEXT_COLOR
  ctx.fillText('放弃', L.cancelX + L.btnW / 2, L.btnY + L.btnH / 2)

  // 右按钮：复活
  ctx.fillStyle = CONFIRM_BG
  _roundRect(ctx, L.confirmX, L.btnY, L.btnW, L.btnH, BTN_RADIUS)
  ctx.fill()
  ctx.fillStyle = CONFIRM_TEXT_COLOR
  ctx.fillText('复活', L.confirmX + L.btnW / 2, L.btnY + L.btnH / 2)
}

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
