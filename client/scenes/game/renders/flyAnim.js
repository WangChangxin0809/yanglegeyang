/**
 * 飞行动画渲染模块
 * 负责：绘制正在飞往槽位的卡牌
 */

const cardsRender = require('./cards')

/**
 * 渲染所有飞行动画
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} anims - 飞行动画队列（每项含 fromX/fromY/fromW/fromH/toX/toY/toW/toH/progress/duration/icon）
 */
function render(ctx, anims) {
  for (const anim of anims) {
    const t = Math.min(anim.progress / anim.duration, 1)
    // easeOutCubic 缓动
    const ease = 1 - Math.pow(1 - t, 3)
    const cx = anim.fromX + (anim.toX - anim.fromX) * ease
    const cy = anim.fromY + (anim.toY - anim.fromY) * ease
    const cw = anim.fromW + (anim.toW - anim.fromW) * ease
    const ch = anim.fromH + (anim.toH - anim.fromH) * ease

    // 卡牌背景
    ctx.fillStyle = '#fffdf5'
    ctx.fillRect(cx, cy, cw, ch)
    ctx.strokeStyle = '#c8a96e'
    ctx.lineWidth = 1.5
    ctx.strokeRect(cx, cy, cw, ch)

    // 图标
    const iconImg = cardsRender.getIconImg(anim.icon)
    if (iconImg) {
      const pad = cw * 0.07
      ctx.drawImage(iconImg, cx + pad, cy + pad, cw - pad * 2, ch - pad * 2)
    }
  }
}

module.exports = {
  render,
}
