/**
 * 道具渲染模块
 * 负责：道具图片预加载、道具按钮绘制、位置计算
 */

const { getImageUrl } = require('../../../utils/assets')

// ==================== 屏幕比例参数 ====================
const PROP_TOP         = 0.90   // 道具区顶部 = 屏幕高度 × 90%
const PROP_SIZE_SCALE  = 0.16   // 道具按钮尺寸 = 屏幕宽度 × 16%
const PROP_GAP_SCALE   = 0.05   // 道具按钮间距 = 屏幕宽度 × 5%
const PROP_COUNT       = 4      // 道具数量（移出 / 撤回 / 洗牌 / 透视）
const PROP_RADIUS      = 10     // 道具按钮圆角半径（px）
const PROP_FONT_SCALE  = 0.28   // 道具按钮文字字号 = 按钮尺寸 × 28%
const PROP_LABEL_Y     = 0.72   // 道具文字纵向位置 = 按钮顶部 + 按钮尺寸 × 72%

// 道具图（4 个，顺序与 PROP_LABELS 一致）
const PROP_IMG_NAMES = ['moveOut', 'undo', 'shuffle', 'peek']
const PROP_LABELS = ['移出', '撤回', '洗牌', '透视']
const PROP_IMGS = []

/** 预加载道具图片 */
function preload() {
  for (let i = 0; i < PROP_IMG_NAMES.length; i++) {
    const img = wx.createImage()
    img.src = getImageUrl('game/props/' + PROP_IMG_NAMES[i] + '.png')
    img.onload = ((idx) => () => { PROP_IMGS[idx] = img })(i)
  }
}

/**
 * 渲染道具区（4 个按钮水平居中）
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} config - { width, height }
 * @param {number[]} [counts] - 可选，各道具剩余次数；传入后会在右上角绘制角标，0 次时整按钮罩灰
 */
function renderProps(ctx, config, counts) {
  const { width, height } = config
  const btnSize = Math.round(width * PROP_SIZE_SCALE)
  const btnGap = Math.round(width * PROP_GAP_SCALE)
  const topY = Math.round(height * PROP_TOP)

  const totalW = PROP_COUNT * btnSize + (PROP_COUNT - 1) * btnGap
  const startX = (width - totalW) / 2

  const radius = PROP_RADIUS
  const fontSize = Math.round(btnSize * PROP_FONT_SCALE)

  for (let i = 0; i < PROP_COUNT; i++) {
    const bx = startX + i * (btnSize + btnGap)
    const by = topY
    const cnt = counts ? (counts[i] == null ? -1 : counts[i]) : -1
    const depleted = cnt === 0
    const img = PROP_IMGS[i]

    if (img) {
      if (depleted) {
        ctx.save()
        ctx.globalAlpha = 0.4
        ctx.drawImage(img, bx, by, btnSize, btnSize)
        ctx.restore()
      } else {
        ctx.drawImage(img, bx, by, btnSize, btnSize)
      }
    } else {
      // 图未加载完毕：回落到圆角矩形 + 文字标签
      ctx.fillStyle = depleted ? 'rgba(120,120,120,0.75)' : 'rgba(50,130,220,0.85)'
      ctx.beginPath()
      ctx.moveTo(bx + radius, by)
      ctx.arcTo(bx + btnSize, by, bx + btnSize, by + btnSize, radius)
      ctx.arcTo(bx + btnSize, by + btnSize, bx, by + btnSize, radius)
      ctx.arcTo(bx, by + btnSize, bx, by, radius)
      ctx.arcTo(bx, by, bx + btnSize, by, radius)
      ctx.closePath()
      ctx.fill()

      ctx.strokeStyle = 'rgba(255,255,255,0.4)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold ' + fontSize + 'px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(PROP_LABELS[i], bx + btnSize / 2, by + btnSize * PROP_LABEL_Y)
    }

    // 右上角次数角标
    if (cnt >= 0) {
      const badgeR = Math.round(btnSize * 0.18)
      const bcx = bx + btnSize - badgeR * 0.4
      const bcy = by + badgeR * 0.4
      ctx.beginPath()
      ctx.arc(bcx, bcy, badgeR, 0, Math.PI * 2)
      ctx.fillStyle = depleted ? '#888888' : '#ff5252'
      ctx.fill()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 1.2
      ctx.stroke()

      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold ' + Math.round(badgeR * 1.3) + 'px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(String(cnt), bcx, bcy + 1)
    }
  }
}

/**
 * 获取道具按钮的位置信息（用于点击检测）
 * @param {number} index   - 按钮索引 0/1/2/3
 * @param {Object} config  - { width, height }
 * @returns {{ x, y, size }}
 */
function getPropPosition(index, config) {
  const { width, height } = config
  const btnSize = Math.round(width * PROP_SIZE_SCALE)
  const btnGap = Math.round(width * PROP_GAP_SCALE)
  const topY = Math.round(height * PROP_TOP)
  const totalW = PROP_COUNT * btnSize + (PROP_COUNT - 1) * btnGap
  const startX = (width - totalW) / 2
  return {
    x: startX + index * (btnSize + btnGap),
    y: topY,
    size: btnSize
  }
}

module.exports = {
  preload,
  renderProps,
  getPropPosition,
}
