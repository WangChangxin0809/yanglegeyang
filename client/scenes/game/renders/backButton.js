/**
 * 返回按钮渲染模块
 * 负责：返回按钮绘制与命中检测
 */

const BACK_SIZE_SCALE = 0.09   // 按钮尺寸 = 屏幕宽度 × 9%
const BACK_X_SCALE    = 0.03   // 按钮左边距 = 屏幕宽度 × 3%
const BACK_Y_SCALE    = 0.015  // 按钮顶边距 = 屏幕高度 × 1.5%

/**
 * 获取返回按钮矩形区域
 * @returns {{x:number,y:number,size:number}}
 */
function getRect(config) {
  const { width, height } = config
  return {
    x: width * BACK_X_SCALE,
    y: height * BACK_Y_SCALE,
    size: Math.round(width * BACK_SIZE_SCALE),
  }
}

/** 命中检测 */
function hit(x, y, config) {
  const r = getRect(config)
  return x >= r.x && x <= r.x + r.size && y >= r.y && y <= r.y + r.size
}

/** 渲染返回按钮（圆形底 + 箭头） */
function render(ctx, config) {
  const r = getRect(config)
  const { x: backX, y: backY, size: backSize } = r
  ctx.save()
  ctx.fillStyle = 'rgba(0,0,0,0.4)'
  ctx.beginPath()
  ctx.arc(backX + backSize / 2, backY + backSize / 2, backSize / 2, 0, Math.PI * 2)
  ctx.fill()
  // 箭头
  ctx.strokeStyle = '#ffffff'
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  const cx = backX + backSize / 2
  const cy = backY + backSize / 2
  const ar = backSize * 0.22
  ctx.beginPath()
  ctx.moveTo(cx + ar * 0.3, cy - ar)
  ctx.lineTo(cx - ar * 0.7, cy)
  ctx.lineTo(cx + ar * 0.3, cy + ar)
  ctx.stroke()
  ctx.restore()
}

module.exports = {
  render,
  hit,
  getRect,
}
