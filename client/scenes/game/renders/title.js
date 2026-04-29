/**
 * 关卡标题渲染模块
 */

const TITLE_FONT_SCALE = 0.055   // 标题字号 = 屏幕宽度 × 5.5%
const TITLE_TOP        = 0.02    // 标题顶部 = 屏幕高度 × 2%

/**
 * 绘制关卡标题
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} config - { width, height }
 * @param {string} text   - 标题文字
 */
function render(ctx, config, text) {
  const { width, height } = config
  const titleSize = Math.round(width * TITLE_FONT_SCALE)
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold ' + titleSize + 'px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  ctx.fillText(text, width / 2, height * TITLE_TOP)
}

module.exports = {
  render,
}
