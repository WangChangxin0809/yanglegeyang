/**
 * 屏幕提示（Toast）渲染模块
 */

const TOAST_FONT_SCALE = 0.04   // 字号 = 屏幕宽度 × 4%
const TOAST_Y_SCALE    = 0.4    // 显示位置 Y = 屏幕高度 × 40%

/**
 * 渲染 Toast
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} config - { width, height }
 * @param {Object} toast  - { text, progress, duration }
 */
function render(ctx, config, toast) {
  if (!toast) return
  const { width, height } = config
  const t = toast.progress / toast.duration
  // 前 20% 淡入，后 30% 淡出
  let alpha = 1
  if (t < 0.2) alpha = t / 0.2
  else if (t > 0.7) alpha = (1 - t) / 0.3

  const toastFont = Math.round(width * TOAST_FONT_SCALE)
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.font = 'bold ' + toastFont + 'px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  // 背景胶囊
  const txt = toast.text
  const tw = ctx.measureText(txt).width + toastFont * 1.5
  const th = toastFont * 2.2
  const tx = (width - tw) / 2
  const ty = height * TOAST_Y_SCALE - th / 2
  ctx.fillStyle = 'rgba(0,0,0,0.7)'
  ctx.beginPath()
  const tr = th / 2
  ctx.moveTo(tx + tr, ty)
  ctx.arcTo(tx + tw, ty, tx + tw, ty + th, tr)
  ctx.arcTo(tx + tw, ty + th, tx, ty + th, tr)
  ctx.arcTo(tx, ty + th, tx, ty, tr)
  ctx.arcTo(tx, ty, tx + tw, ty, tr)
  ctx.closePath()
  ctx.fill()
  // 文字
  ctx.fillStyle = '#ffffff'
  ctx.fillText(txt, width / 2, height * TOAST_Y_SCALE)
  ctx.restore()
}

module.exports = {
  render,
}
