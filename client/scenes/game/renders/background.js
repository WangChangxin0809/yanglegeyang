/**
 * 背景渲染模块
 * 负责：背景图加载、背景绘制
 */

const { getImageUrl } = require('../../../utils/assets')

let BG_IMG = null

/** 加载背景图 */
function load() {
  const bg = wx.createImage()
  bg.src = getImageUrl('game/bgs/game_bg01.png')
  bg.onload = () => { BG_IMG = bg }
  bg.onerror = () => { BG_IMG = null }
}

/** 绘制背景：图片优先，未加载时回退纯色 */
function render(ctx, config) {
  const { width, height } = config
  if (BG_IMG) {
    ctx.drawImage(BG_IMG, 0, 0, width, height)
  } else {
    ctx.fillStyle = '#2d3436'
    ctx.fillRect(0, 0, width, height)
  }
}

module.exports = {
  load,
  render,
}
