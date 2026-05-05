/**
 * 关卡计时器渲染模块
 * 负责：实时显示当关卡已经用去的时间（秒，保留 1 位小数）
 */

const TIMER_FONT_SCALE = 0.04   // 字号 = 屏幕宽度 × 8%
const TIMER_TOP        = 0.11   // 顶部 = 屏幕高度 × 11%
const TIMER_COLOR      = '#0a0a0a'  // 主字色
const TIMER_PREFIX     = '已用时 '
const TIMER_SUFFIX     = ' 秒'

/**
 * 绘制关卡计时器
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} config            - { width, height }
 * @param {number} levelStartTime    - 关卡开始时间戳（Date.now()）
 */
function render(ctx, config, levelStartTime) {
  if (!levelStartTime) return   // 未初始化时不绘制，避免显示 NaN

  const { width, height } = config
  const elapsedSec = ((Date.now() - levelStartTime) / 1000).toFixed(1)
  const fontSize = Math.round(width * TIMER_FONT_SCALE)

  ctx.save()
  ctx.font = 'bold ' + fontSize + 'px sans-serif'
  ctx.fillStyle = TIMER_COLOR
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(TIMER_PREFIX + elapsedSec + TIMER_SUFFIX, width / 2, height * TIMER_TOP)
  ctx.restore()
}

module.exports = { render }
