/**
 * 结算全屏特效渲染模块
 * 负责：胜利/失败的全屏蒙层 + 标题 + 副标题
 * 失败：lose.png 铺满全屏（无文字蒙层）
 */

const { getImageUrl } = require('../../../utils/assets')

const END_FX_TITLE_Y       = 0.38    // 结算标题 Y 位置（屏幕高度比例）
const END_FX_TITLE_FONT    = 0.1     // 结算标题字号（屏幕宽度比例）
const END_FX_SUB_FONT      = 0.055   // 结算副标题字号（屏幕宽度比例）
const END_FX_SUB_OFFSET    = 1.2     // 副标题与标题的间距（标题字号的倍数）

// 失败图片单例（首次 render 时懒加载）
let LOSE_IMG = null
let LOSE_LOADING = false
let LOSE_FAILED = false

function _loadLoseImg() {
  if (LOSE_IMG || LOSE_LOADING || LOSE_FAILED) return
  LOSE_LOADING = true
  const img = wx.createImage()
  img.src = getImageUrl('game/over/lose.png')
  img.onload = () => { LOSE_IMG = img; LOSE_LOADING = false }
  img.onerror = () => { LOSE_FAILED = true; LOSE_LOADING = false }
}

/**
 * 渲染结算全屏特效
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} config - { width, height }
 * @param {Object} endFx  - { type:'win'|'lose', progress, duration, clearTime }
 */
function render(ctx, config, endFx) {
  if (!endFx) return
  const { width, height } = config
  const fx = endFx
  const t = Math.min(fx.progress / fx.duration, 1)
  // 蒙层渐入（前 30% 渐入到 0.7 透明度）
  const maskAlpha = t < 0.3 ? (t / 0.3) * 0.7 : 0.7

  ctx.save()

  if (fx.type === 'lose') {
    // 失败：场景上叠一层半透明深灰蒙层 + 图片渐入（图片加载失败时仅保留蒙层）
    _loadLoseImg()
    const imgAlpha = Math.min(t / 0.3, 1) // 前 30% 渐入

    // 半透明深灰蒙层：与渐入同步，最终停在 0.7 透明度
    ctx.fillStyle = 'rgba(45,52,54,' + maskAlpha + ')'
    ctx.fillRect(0, 0, width, height)

    if (LOSE_IMG) {
      ctx.globalAlpha = imgAlpha
      ctx.drawImage(LOSE_IMG, 0, 0, width, height)
      ctx.globalAlpha = 1
    }
    ctx.restore()
    return
  }

  // 胜利：原有的黑色蒙层 + 文字动画
  ctx.fillStyle = 'rgba(0,0,0,' + maskAlpha + ')'
  ctx.fillRect(0, 0, width, height)

  // 文字缩放+淡入（前 40% 从 2x 缩到 1x）
  const textT = Math.min(t / 0.4, 1)
  const scale = 1 + (1 - textT) * 1  // 2x -> 1x
  const textAlpha = textT
  ctx.globalAlpha = textAlpha

  // 标题
  const titleFont = Math.round(width * END_FX_TITLE_FONT)
  ctx.save()
  ctx.globalAlpha = textAlpha
  ctx.font = 'bold ' + titleFont + 'px sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.translate(width / 2, height * END_FX_TITLE_Y)
  ctx.scale(scale, scale)
  ctx.fillStyle = '#00b894'
  ctx.fillText('恭喜通关！', 0, 0)
  ctx.restore()

  // 副标题（通关显示用时）
  if (textT > 0.5) {
    const subAlpha = (textT - 0.5) / 0.5
    ctx.globalAlpha = subAlpha
    const subFont = Math.round(width * END_FX_SUB_FONT)
    ctx.font = subFont + 'px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#ffffff'
    ctx.fillText('用时 ' + fx.clearTime.toFixed(1) + ' 秒', width / 2, height * END_FX_TITLE_Y + titleFont * END_FX_SUB_OFFSET)
  }

  ctx.restore()
}

module.exports = {
  render,
}
