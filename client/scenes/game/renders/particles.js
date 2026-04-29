/**
 * 粒子渲染模块
 * 负责：绘制粒子（爆发效果 / 结算礼花）
 */

/**
 * 渲染所有粒子
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} particles - 粒子队列（每项含 x/y/radius/color/progress/duration）
 */
function render(ctx, particles) {
  for (const p of particles) {
    const t = p.progress / p.duration
    const alpha = 1 - t
    ctx.save()
    ctx.globalAlpha = alpha
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.radius * (1 - t * 0.5), 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
}

module.exports = {
  render,
}
