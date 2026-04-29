/**
 * 消除特效渲染模块
 * 负责：绘制三消时的闪光缩放特效
 */

const cardsRender = require('./cards')

/**
 * 渲染所有消除特效
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array} matchFx - 特效队列（每项含 x/y/size/icon/progress/duration）
 */
function render(ctx, matchFx) {
  for (const fx of matchFx) {
    const t = fx.progress / fx.duration
    const scale = 1 + t * 0.4          // 放大到 1.4 倍
    const alpha = 1 - t                 // 淡出
    const cx = fx.x + fx.size / 2
    const cy = fx.y + fx.size / 2
    const sw = fx.size * scale
    const sh = fx.size * scale

    ctx.save()
    ctx.globalAlpha = alpha
    // 白色闪光底
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(cx - sw / 2, cy - sh / 2, sw, sh)
    // 卡牌图标
    const iconImg = cardsRender.getIconImg(fx.icon)
    if (iconImg) {
      const pad = sw * 0.07
      ctx.drawImage(iconImg, cx - sw / 2 + pad, cy - sh / 2 + pad, sw - pad * 2, sh - pad * 2)
    }
    ctx.restore()
  }
}

module.exports = {
  render,
}
